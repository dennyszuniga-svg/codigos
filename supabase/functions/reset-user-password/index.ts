import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const rolesRestableciblesPorGdh = new Set([
  'comercial_abonados',
  'tecnico',
  'supervisor',
  'fortaleza',
  'eco',
  'charly',
  'anfitrion',
]);

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function generarPasswordTemporal(dni: string) {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  const codigo = Array.from(bytes, (item) => (item % 36).toString(36).toUpperCase()).join('');
  return `UP-${dni.slice(-4)}-${codigo}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Metodo no permitido' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: 'Faltan secretos de funcion' }, 500);
  }

  const authorization = req.headers.get('Authorization') || '';
  const token = authorization.replace(/^Bearer\s+/i, '');
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) return jsonResponse({ error: 'No autorizado' }, 401);

  const { data: requester, error: requesterError } = await supabase
    .from('profiles')
    .select('rol,activo')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (requesterError || requester?.activo !== true || !['encargado_ti', 'gdh'].includes(requester?.rol || '')) {
    return jsonResponse({ error: 'Solo GDH o el Encargado de Mantenimiento y TI pueden restablecer contrasenas' }, 403);
  }

  const body = await req.json().catch(() => ({}));
  if (body.action === 'list' && requester.rol === 'gdh') {
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id,email,nombre,apellidos_nombres,dni,rol,activo,sede,debe_cambiar_password,created_at')
      .eq('activo', true)
      .in('rol', Array.from(rolesRestableciblesPorGdh))
      .order('apellidos_nombres', { ascending: true, nullsFirst: false });
    if (usersError) return jsonResponse({ error: usersError.message }, 500);
    return jsonResponse({ users: users || [] });
  }

  const userId = typeof body.userId === 'string' ? body.userId.trim() : '';
  if (!userId || userId === userData.user.id) {
    return jsonResponse({ error: 'Para tu propia cuenta usa Cambiar contrasena' }, 400);
  }

  const { data: target, error: targetError } = await supabase
    .from('profiles')
    .select('id,nombre,apellidos_nombres,dni,rol,activo')
    .eq('id', userId)
    .maybeSingle();
  if (targetError || !target || target.activo !== true) {
    return jsonResponse({ error: 'El usuario no existe o esta inactivo' }, 404);
  }
  if (!/^\d{8}$/.test(target.dni || '')) {
    return jsonResponse({ error: 'El usuario debe tener un DNI valido antes de restablecer su contrasena' }, 400);
  }
  if (requester.rol === 'gdh' && !rolesRestableciblesPorGdh.has(target.rol)) {
    return jsonResponse({ error: 'GDH no puede restablecer cuentas administrativas o globales' }, 403);
  }

  const temporaryPassword = generarPasswordTemporal(target.dni);
  const { error: passwordError } = await supabase.auth.admin.updateUserById(userId, {
    password: temporaryPassword,
  });
  if (passwordError) return jsonResponse({ error: passwordError.message }, 400);

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      debe_cambiar_password: true,
      password_actualizada_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  return jsonResponse({
    userId,
    dni: target.dni,
    nombre: target.apellidos_nombres || target.nombre,
    temporaryPassword,
    warning: profileError ? 'La contrasena cambio, pero no se pudo marcar el cambio obligatorio' : null,
  });
});
