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

  const authorization = req.headers.get('Authorization') || '';
  const token = authorization.replace(/^Bearer\s+/i, '');
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError || !userData.user) {
    return jsonResponse({ error: 'No autorizado' }, 401);
  }

  const { data: requesterProfile, error: requesterError } = await supabase
    .from('profiles')
    .select('rol,activo')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (requesterError || requesterProfile?.rol !== 'admin' || requesterProfile?.activo !== true) {
    return jsonResponse({ error: 'Solo administradores pueden eliminar usuarios' }, 403);
  }

  const body = await req.json().catch(() => ({}));
  const userId = typeof body.userId === 'string' ? body.userId.trim() : '';
  if (!userId) {
    return jsonResponse({ error: 'Usuario invalido' }, 400);
  }

  if (userId === userData.user.id) {
    return jsonResponse({ error: 'No puedes eliminar tu propia cuenta' }, 400);
  }

  const { data: targetProfile, error: targetError } = await supabase
    .from('profiles')
    .select('id,email,nombre,rol,activo')
    .eq('id', userId)
    .maybeSingle();

  if (targetError || !targetProfile) {
    return jsonResponse({ error: 'El usuario ya no existe' }, 404);
  }

  if (targetProfile.rol === 'admin' && targetProfile.activo === true) {
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('rol', 'admin')
      .eq('activo', true);

    if (countError) {
      return jsonResponse({ error: 'No se pudo validar el numero de administradores' }, 500);
    }

    if ((count || 0) <= 1) {
      return jsonResponse({ error: 'No se puede eliminar el ultimo administrador activo' }, 400);
    }
  }

  const referencias = [
    ['registros_codigos', 'creado_por'],
    ['estado_operativo', 'actualizado_por'],
    ['guias_operativas', 'creado_por'],
  ] as const;

  for (const [tabla, columna] of referencias) {
    const { error } = await supabase
      .from(tabla)
      .update({ [columna]: null })
      .eq(columna, userId);

    if (error && error.code !== '42P01') {
      return jsonResponse({ error: `No se pudo conservar el historial de ${tabla}` }, 500);
    }
  }

  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
  if (deleteError) {
    return jsonResponse({ error: deleteError.message || 'No se pudo eliminar el usuario' }, 400);
  }

  return jsonResponse({
    deleted: true,
    id: userId,
    email: targetProfile.email,
    nombre: targetProfile.nombre,
  });
});
