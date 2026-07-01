import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const rolesPermitidos = new Set(['admin', 'comercial_abonados', 'tecnico', 'supervisor', 'eco', 'charly', 'anfitrion']);
const sedesPermitidas = new Set(['general', 'puruchuco', 'salaverry', 'primavera', 'civico', 'gama']);
const dominioInterno = 'usuarios.urbapark.pe';

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function normalizarNombre(valor: string) {
  return valor.trim().replace(/\s+/g, ' ').toLowerCase();
}

function crearAlias(valor: string) {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
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

  if (profileError || profile?.rol !== 'encargado_ti' || profile?.activo !== true) {
    return jsonResponse({ error: 'Solo el Encargado de Mantenimiento y TI puede crear usuarios' }, 403);
  }

  const body = await req.json().catch(() => ({}));
  const password = typeof body.password === 'string' ? body.password : '';
  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
  const rol = typeof body.rol === 'string' ? body.rol : 'anfitrion';
  const sede = typeof body.sede === 'string' ? body.sede.trim().toLowerCase() : '';
  const alias = crearAlias(nombre);
  const email = `${alias}@${dominioInterno}`;

  if (nombre.length < 3 || alias.length < 3) {
    return jsonResponse({ error: 'El nombre de usuario debe tener al menos 3 letras o numeros' }, 400);
  }

  if (!password || password.length < 6) {
    return jsonResponse({ error: 'La contrasena debe tener al menos 6 caracteres' }, 400);
  }

  if (!rolesPermitidos.has(rol)) {
    return jsonResponse({ error: 'Rol invalido' }, 400);
  }

  if (!sedesPermitidas.has(sede)) {
    return jsonResponse({ error: 'Sede invalida' }, 400);
  }

  if (sede === 'general' && rol !== 'comercial_abonados') {
    return jsonResponse({ error: 'La sede General solo corresponde a roles globales' }, 400);
  }

  const { data: existingProfiles, error: existingError } = await supabase
    .from('profiles')
    .select('nombre,email');

  if (existingError) {
    return jsonResponse({ error: 'No se pudo validar el nombre de usuario' }, 500);
  }

  const nombreNormalizado = normalizarNombre(nombre);
  const yaExiste = (existingProfiles || []).some((item) => {
    const nombreExistente = normalizarNombre(String(item.nombre || ''));
    const aliasExistente = String(item.email || '').split('@')[0].toLowerCase();
    return nombreExistente === nombreNormalizado || aliasExistente === alias;
  });

  if (yaExiste) {
    return jsonResponse({ error: 'Ese nombre de usuario ya esta registrado' }, 409);
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      nombre,
      usuario: alias,
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
      rol,
      sede,
      activo: true,
    });

  if (profileUpsertError) {
    await supabase.auth.admin.deleteUser(created.user.id);
    return jsonResponse({ error: profileUpsertError.message }, 500);
  }

  return jsonResponse({
    id: created.user.id,
    usuario: alias,
    nombre,
    rol,
    sede,
  });
});
