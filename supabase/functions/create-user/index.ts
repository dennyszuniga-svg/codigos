import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const rolesPermitidos = new Set([
  'admin',
  'comercial_abonados',
  'jefe_operaciones',
  'coordinador_operaciones',
  'gdh',
  'tecnico',
  'supervisor',
  'fortaleza',
  'eco',
  'charly',
  'anfitrion',
  'marcador',
]);
const rolesGlobales = new Set(['comercial_abonados', 'jefe_operaciones', 'coordinador_operaciones', 'gdh']);
const rolesCreablesPorAdmin = new Set(['tecnico', 'supervisor', 'fortaleza', 'eco', 'charly', 'anfitrion', 'marcador']);
const sedesPermitidas = new Set(['general', 'puruchuco', 'salaverry', 'primavera', 'civico', 'gama']);
const dominioInterno = 'usuarios.urbapark.pe';

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function generarPasswordTemporal(dni: string) {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const codigo = Array.from(bytes, (item) => (item % 36).toString(36).toUpperCase()).join('');
  return `UP-${dni.slice(-4)}-${codigo}`;
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
    .select('rol,activo,sede')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (profileError || !['encargado_ti', 'admin', 'jefe_operaciones', 'coordinador_operaciones', 'gdh'].includes(profile?.rol || '') || profile?.activo !== true) {
    return jsonResponse({ error: 'Solo administradores autorizados pueden crear usuarios' }, 403);
  }

  const body = await req.json().catch(() => ({}));
  const nombre = typeof body.apellidosNombres === 'string'
    ? body.apellidosNombres.trim().replace(/\s+/g, ' ')
    : typeof body.nombre === 'string'
      ? body.nombre.trim().replace(/\s+/g, ' ')
      : '';
  const dni = typeof body.dni === 'string' ? body.dni.replace(/\D/g, '') : '';
  const rol = typeof body.rol === 'string' ? body.rol : 'anfitrion';
  const sede = typeof body.sede === 'string' ? body.sede.trim().toLowerCase() : '';
  const password = generarPasswordTemporal(dni);
  const email = `${dni}@${dominioInterno}`;

  if (nombre.length < 5) {
    return jsonResponse({ error: 'Ingresa los apellidos y nombres completos' }, 400);
  }

  if (!/^\d{8}$/.test(dni)) {
    return jsonResponse({ error: 'El DNI debe contener exactamente 8 numeros' }, 400);
  }

  if (!rolesPermitidos.has(rol)) {
    return jsonResponse({ error: 'Rol invalido' }, 400);
  }

  if (!sedesPermitidas.has(sede)) {
    return jsonResponse({ error: 'Sede invalida' }, 400);
  }

  if (profile.rol === 'admin' && (sede !== profile.sede || !rolesCreablesPorAdmin.has(rol))) {
    return jsonResponse({ error: 'El administrador solo puede crear cuentas operativas para su propia sede' }, 403);
  }

  if (sede === 'general' && !rolesGlobales.has(rol)) {
    return jsonResponse({ error: 'La sede General solo corresponde a roles globales' }, 400);
  }

  const { data: existingProfiles, error: existingError } = await supabase
    .from('profiles')
    .select('dni,email');

  if (existingError) {
    return jsonResponse({ error: 'No se pudo validar el nombre de usuario' }, 500);
  }

  const yaExiste = (existingProfiles || []).some((item) => item.dni === dni || item.email === email);

  if (yaExiste) {
    return jsonResponse({ error: 'Ese DNI ya esta registrado' }, 409);
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      nombre,
      apellidos_nombres: nombre,
      dni,
      sede,
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
      nombre,
      apellidos_nombres: nombre,
      dni,
      rol,
      sede,
      activo: true,
      debe_cambiar_password: true,
    });

  if (profileUpsertError) {
    await supabase.auth.admin.deleteUser(created.user.id);
    return jsonResponse({ error: profileUpsertError.message }, 500);
  }

  return jsonResponse({
    id: created.user.id,
    usuario: dni,
    dni,
    nombre,
    rol,
    sede,
    temporaryPassword: password,
  });
});
