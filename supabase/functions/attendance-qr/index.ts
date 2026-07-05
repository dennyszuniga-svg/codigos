import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

const encoder = new TextEncoder();
const base64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
const decodeBase64url = (value: string) => {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return Uint8Array.from(atob(normalized), char => char.charCodeAt(0));
};

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return base64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))));
}

async function createQrToken(site: string, secret: string) {
  const payload = base64url(encoder.encode(JSON.stringify({ site, exp: Date.now() + 75000, nonce: crypto.randomUUID() })));
  return `${payload}.${await hmac(payload, secret)}`;
}

async function verifyQrToken(rawToken: string, secret: string) {
  const token = rawToken.replace(/^URBAPARK_ATTENDANCE:/, '');
  const [payload, signature] = token.split('.');
  if (!payload || !signature || await hmac(payload, secret) !== signature) throw new Error('QR no valido');
  const data = JSON.parse(new TextDecoder().decode(decodeBase64url(payload)));
  if (!data.site || !data.exp || Date.now() > Number(data.exp)) throw new Error('El QR vencio. Escanea el nuevo codigo.');
  return data as { site: string; exp: number };
}

function limaDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

function previousDate(value: string) {
  const date = new Date(`${value}T12:00:00-05:00`);
  date.setDate(date.getDate() - 1);
  return limaDate(date);
}

function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radius = 6371000;
  const toRad = (degree: number) => degree * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function scheduledDate(date: string, time: string) {
  return new Date(`${date}T${time.slice(0, 8)}-05:00`);
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const qrSecret = Deno.env.get('ATTENDANCE_QR_SECRET');
    if (!qrSecret) return json({ error: 'Falta configurar el secreto QR.' }, 500);
    const authorization = req.headers.get('Authorization') || '';
    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
    const admin = createClient(url, serviceKey);
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: 'Sesion no valida.' }, 401);
    const { data: profile } = await admin.from('profiles').select('id,nombre,rol,sede,activo').eq('id', user.id).single();
    if (!profile?.activo) return json({ error: 'Usuario inactivo.' }, 403);
    const body = await req.json();

    if (body.action === 'generate') {
      const site = String(body.site || '');
      const allowed = profile.rol === 'encargado_ti' || (profile.rol === 'admin' && profile.sede === site);
      if (!allowed) return json({ error: 'No autorizado para mostrar este QR.' }, 403);
      const { data: siteRow } = await admin.from('asistencia_sedes').select('codigo,nombre').eq('codigo', site).eq('activa', true).single();
      if (!siteRow) return json({ error: 'Sede no configurada.' }, 404);
      return json({ token: `URBAPARK_ATTENDANCE:${await createQrToken(site, qrSecret)}`, site: siteRow, expiresIn: 75 });
    }

    if (body.action !== 'mark') return json({ error: 'Accion no valida.' }, 400);
    if (!['anfitrion', 'tecnico'].includes(profile.rol)) return json({ error: 'Tu rol no registra asistencia.' }, 403);
    const qr = await verifyQrToken(String(body.token || ''), qrSecret);
    const lat = Number(body.latitude);
    const lon = Number(body.longitude);
    const accuracy = Number(body.accuracy || 9999);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return json({ error: 'Ubicacion no valida.' }, 400);
    if (accuracy > 100) return json({ error: 'La precision del GPS es insuficiente. Acercate a una zona abierta.' }, 400);
    const { data: site } = await admin.from('asistencia_sedes').select('*').eq('codigo', qr.site).eq('activa', true).single();
    if (!site) return json({ error: 'Sede no configurada.' }, 404);
    const distance = distanceMeters(lat, lon, site.latitud, site.longitud);
    if (distance > site.radio_metros) return json({ error: `Estas a ${Math.round(distance)} m de la sede. El limite es ${site.radio_metros} m.` }, 403);
    const now = new Date();
    const type = String(body.type || 'entrada');

    if (type === 'entrada') {
      const date = limaDate(now);
      const { data: schedules } = await admin.from('asistencia_programacion')
        .select('id,user_id,sede,fecha,estado,asistencia_turnos(id,nombre,hora_inicio,hora_fin,refrigerio_minutos,minutos_jornada,es_nocturno)')
        .eq('user_id', user.id).in('fecha', [date, previousDate(date)]).eq('sede', qr.site);
      const schedule = schedules?.find(item => item.fecha === date)
        || schedules?.find(item => item.fecha === previousDate(date) && item.asistencia_turnos?.es_nocturno);
      if (!schedule || schedule.estado !== 'programado' || !schedule.asistencia_turnos) return json({ error: 'No tienes un turno programado hoy en esta sede.' }, 409);
      const { data: existing } = await admin.from('asistencia_registros').select('id').eq('programacion_id', schedule.id).maybeSingle();
      if (existing) return json({ error: 'La entrada de este turno ya fue registrada.' }, 409);
      const workDate = schedule.fecha;
      const start = scheduledDate(workDate, schedule.asistencia_turnos.hora_inicio);
      const late = Math.max(0, Math.ceil((now.getTime() - start.getTime()) / 60000));
      const { data: record, error } = await admin.from('asistencia_registros').insert({
        programacion_id: schedule.id, user_id: user.id, sede: qr.site, fecha_laboral: workDate,
        entrada_at: now.toISOString(), entrada_lat: lat, entrada_lon: lon, entrada_precision_m: accuracy,
        distancia_entrada_m: Math.round(distance * 100) / 100, minutos_tardanza: late,
      }).select('id,entrada_at').single();
      if (error) throw error;
      return json({ ok: true, type, record, distance: Math.round(distance), lateMinutes: late });
    }

    if (type === 'salida') {
      const { data: record } = await admin.from('asistencia_registros')
        .select('*,asistencia_programacion(fecha,asistencia_turnos(hora_inicio,hora_fin,refrigerio_minutos,minutos_jornada))')
        .eq('user_id', user.id).eq('sede', qr.site).is('salida_at', null).order('entrada_at', { ascending: false }).limit(1).maybeSingle();
      if (!record) return json({ error: 'No existe una entrada abierta para registrar salida.' }, 409);
      const shift = record.asistencia_programacion?.asistencia_turnos;
      const worked = Math.max(0, Math.floor((now.getTime() - new Date(record.entrada_at).getTime()) / 60000) - Number(shift?.refrigerio_minutos || 60));
      const extraHours = Math.floor(Math.max(0, worked - Number(shift?.minutos_jornada || 480)) / 60);
      const { data: updated, error } = await admin.from('asistencia_registros').update({
        salida_at: now.toISOString(), salida_lat: lat, salida_lon: lon, salida_precision_m: accuracy,
        distancia_salida_m: Math.round(distance * 100) / 100, minutos_trabajados: worked,
        horas_extra_solicitadas: extraHours, estado_extra: extraHours > 0 ? 'pendiente' : 'sin_extra', updated_at: now.toISOString(),
      }).eq('id', record.id).select('id,salida_at,minutos_trabajados,horas_extra_solicitadas,estado_extra').single();
      if (error) throw error;
      return json({ ok: true, type, record: updated, distance: Math.round(distance) });
    }
    return json({ error: 'Tipo de marcacion no valido.' }, 400);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Error inesperado.' }, 400);
  }
});
