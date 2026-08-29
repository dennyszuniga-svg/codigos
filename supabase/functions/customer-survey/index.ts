import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

const validSites = new Set(['puruchuco', 'salaverry', 'primavera', 'civico', 'gama']);
const surveyRoles = ['anfitrion', 'supervisor', 'admin', 'fortaleza'];

function cleanText(value: unknown, maxLength: number) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function answer(value: unknown) {
  const number = Number(value);
  if (![0, 1, 2].includes(number)) throw new Error('Completa todas las preguntas.');
  return number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Metodo no permitido.' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !serviceKey) return json({ error: 'Servicio no configurado.' }, 500);
    const admin = createClient(url, serviceKey);
    const body = await req.json();
    const action = String(body.action || 'submit');
    const site = cleanText(body.site, 20).toLowerCase();
    if (!validSites.has(site)) return json({ error: 'Sede no valida.' }, 400);

    if (action === 'staff') {
      const { data, error } = await admin.from('profiles')
        .select('id,apellidos_nombres,nombre,rol')
        .eq('sede', site).eq('activo', true).in('rol', surveyRoles)
        .order('apellidos_nombres');
      if (error) throw error;
      return json({ staff: (data || []).map(item => ({
        id: item.id,
        name: item.apellidos_nombres || item.nombre,
        role: item.rol,
      })) });
    }

    if (action !== 'submit') return json({ error: 'Accion no valida.' }, 400);
    if (cleanText(body.website, 40)) return json({ ok: true });
    const startedAt = Number(body.startedAt || 0);
    if (!startedAt || Date.now() - startedAt < 3000) return json({ error: 'Espera unos segundos y revisa tus respuestas.' }, 429);
    const collaboratorId = cleanText(body.collaboratorId, 36);
    const { data: collaborator } = await admin.from('profiles')
      .select('id,apellidos_nombres,nombre,rol,sede,activo')
      .eq('id', collaboratorId).eq('sede', site).eq('activo', true).in('rol', surveyRoles)
      .maybeSingle();
    if (!collaborator) return json({ error: 'Selecciona a la persona que te atendio.' }, 400);

    const row = {
      sede: site,
      colaborador_id: collaborator.id,
      colaborador_nombre: cleanText(collaborator.apellidos_nombres || collaborator.nombre, 90),
      atencion: answer(body.answers?.atencion),
      uniforme: answer(body.answers?.uniforme),
      saludo: answer(body.answers?.saludo),
      informacion: answer(body.answers?.informacion),
      solucion: answer(body.answers?.solucion),
      observacion: cleanText(body.observation, 300),
    };
    const { data, error } = await admin.from('encuestas_satisfaccion').insert(row)
      .select('id,fecha,created_at').single();
    if (error) throw error;
    return json({ ok: true, survey: data });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'No se pudo guardar la encuesta.' }, 400);
  }
});
