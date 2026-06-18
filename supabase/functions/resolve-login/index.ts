import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function normalizarUsuario(valor: string) {
  return valor.trim().replace(/\s+/g, ' ').toLowerCase();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Metodo no permitido' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: 'Faltan secretos de funcion' }, 500);
  }

  const body = await req.json().catch(() => ({}));
  const usuario = typeof body.usuario === 'string' ? normalizarUsuario(body.usuario) : '';

  if (!usuario) {
    return jsonResponse({ error: 'Usuario requerido' }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase
    .from('profiles')
    .select('email,nombre,activo')
    .eq('activo', true)
    .limit(100);

  if (error) {
    return jsonResponse({ error: 'No se pudo buscar el usuario' }, 500);
  }

  const coincidencias = (data || []).filter((perfil) => {
    const nombre = normalizarUsuario(String(perfil.nombre || ''));
    const email = normalizarUsuario(String(perfil.email || ''));
    const alias = email.includes('@') ? email.split('@')[0] : email;

    return nombre === usuario || alias === usuario || email === usuario;
  });

  if (coincidencias.length !== 1) {
    return jsonResponse({ error: 'Usuario no encontrado' }, 404);
  }

  return jsonResponse({ email: coincidencias[0].email });
});
