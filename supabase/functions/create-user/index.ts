import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const rolesPermitidos = new Set(['admin', 'supervisor', 'eco', 'charly', 'anfitrion']);

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

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('rol,activo')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (profileError || profile?.rol !== 'admin' || profile?.activo !== true) {
    return jsonResponse({ error: 'Solo administradores pueden crear usuarios' }, 403);
  }

  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
  const rol = typeof body.rol === 'string' ? body.rol : 'anfitrion';

  if (!email || !email.includes('@')) {
    return jsonResponse({ error: 'Correo invalido' }, 400);
  }

  if (!password || password.length < 6) {
    return jsonResponse({ error: 'La contrasena debe tener al menos 6 caracteres' }, 400);
  }

  if (!rolesPermitidos.has(rol)) {
    return jsonResponse({ error: 'Rol invalido' }, 400);
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      nombre: nombre || email.split('@')[0],
    },
  });

  if (createError || !created.user) {
    return jsonResponse({ error: createError?.message || 'No se pudo crear usuario' }, 400);
  }

  const { error: profileUpsertError } = await supabase
    .from('profiles')
    .upsert({
      id: created.user.id,
      email,
      nombre: nombre || email.split('@')[0],
      rol,
      activo: true,
    });

  if (profileUpsertError) {
    return jsonResponse({ error: profileUpsertError.message }, 500);
  }

  return jsonResponse({
    id: created.user.id,
    email,
    nombre: nombre || email.split('@')[0],
    rol,
  });
});
