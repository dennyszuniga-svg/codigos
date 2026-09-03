import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const BUCKET = 'operations-checklist-images';

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function limaNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const value = (type: string) => parts.find((part) => part.type === type)?.value || '';
  return {
    date: `${value('year')}-${value('month')}-${value('day')}`,
    hour: Number(value('hour')),
    minute: Number(value('minute')),
  };
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function evidenceExpiresAt(date: string, turno: string | null) {
  if (turno === 'apertura') return `${date}T13:00`;
  if (turno === 'intermedio') return `${date}T17:00`;
  return `${addDays(date, 1)}T04:00`;
}

function evidencePaths(evidencias: Record<string, unknown> | null) {
  return Object.values(evidencias || {}).flatMap((items) => Array.isArray(items) ? items : [])
    .map((item) => typeof item === 'object' && item ? String((item as { path?: string }).path || '') : '')
    .filter(Boolean);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Metodo no permitido' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) return jsonResponse({ error: 'Faltan secretos de funcion' }, 500);

  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) return jsonResponse({ error: 'No autorizado' }, 401);

  const now = limaNow();
  const nowStamp = `${now.date}T${String(now.hour).padStart(2, '0')}:${String(now.minute).padStart(2, '0')}`;

  const { data: registros, error: selectError } = await supabase
    .from('operaciones_checklists')
    .select('id,fecha,turno,evidencias,observaciones,respuestas')
    .lte('fecha', now.date)
    .order('fecha', { ascending: true })
    .limit(1000);

  if (selectError) return jsonResponse({ error: selectError.message }, 500);

  let cleanedRecords = 0;
  let removedImages = 0;
  for (const registro of registros || []) {
    const hasResponses = Object.keys(registro.respuestas || {}).length > 0;
    const hasObservations = Object.keys(registro.observaciones || {}).some((key) => key !== '__estado_horario');
    const paths = evidencePaths(registro.evidencias);
    const removeEvidence = paths.length > 0 && nowStamp >= evidenceExpiresAt(registro.fecha, registro.turno);
    const compactDetails = (hasResponses || hasObservations)
      && nowStamp >= `${addDays(registro.fecha, 1)}T03:00`;
    if (!removeEvidence && !compactDetails) continue;

    if (removeEvidence) {
      const { error: storageError } = await supabase.storage.from(BUCKET).remove(paths);
      if (storageError) return jsonResponse({ error: storageError.message, checklistId: registro.id }, 500);
      removedImages += paths.length;
    }

    const updates: Record<string, unknown> = {};
    if (removeEvidence) updates.evidencias = {};
    if (compactDetails) {
      const estadoHorario = registro.observaciones?.__estado_horario;
      updates.respuestas = {};
      updates.observaciones = estadoHorario ? { __estado_horario: estadoHorario } : {};
    }
    const { error: updateError } = await supabase
      .from('operaciones_checklists')
      .update(updates)
      .eq('id', registro.id);
    if (updateError) return jsonResponse({ error: updateError.message, checklistId: registro.id }, 500);
    cleanedRecords += 1;
  }

  return jsonResponse({
    cleaned: true,
    checkedAt: nowStamp,
    cleanedRecords,
    removedImages,
    imageRetention: { apertura: '13:00', intermedio: '17:00', cierre: '04:00 del dia siguiente' },
    preserved: ['sede', 'responsable', 'turno', 'inicio', 'fin', 'tardanza', 'totales', 'cumplimiento'],
  });
});
