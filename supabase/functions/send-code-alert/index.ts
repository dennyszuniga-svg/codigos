import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const nombresCodigo: Record<string, string> = {
  rojo: 'Codigo Rojo',
  naranja: 'Codigo Naranja',
  'verde-oscuro': 'Codigo 3D',
  azul: 'Codigo CAT',
  verde: 'Codigo Verde',
  croc: 'Codigo CROC',
  adam: 'Codigo ADAM',
  calma: 'Codigo CALMA',
  capta: 'Codigo CAPTA',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Metodo no permitido' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
  const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:operaciones@urbapark.local';

  if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey) {
    return new Response(JSON.stringify({ error: 'Faltan secretos de funcion' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const authorization = req.headers.get('Authorization') || '';
  const token = authorization.replace(/^Bearer\s+/i, '');
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: senderProfile, error: senderProfileError } = await supabase
    .from('profiles')
    .select('nombre,sede,rol,activo')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (senderProfileError || !senderProfile?.sede || senderProfile.activo !== true) {
    return new Response(JSON.stringify({ error: 'Usuario sin sede operativa activa' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const body = await req.json().catch(() => ({}));
  const evento = body.evento === 'nuevo_abonado' ? 'nuevo_abonado' : 'codigo';
  const codigo = typeof body.codigo === 'string' ? body.codigo : '';
  const nombre = typeof body.nombre === 'string' ? body.nombre : nombresCodigo[codigo] || 'Codigo activado';
  const sedeSolicitada = typeof body.sede === 'string' ? body.sede : senderProfile.sede;
  const sedeDestino = ['encargado_ti', 'comercial_abonados'].includes(senderProfile.rol)
    ? sedeSolicitada
    : senderProfile.sede;

  if (evento === 'codigo' && (!codigo || !nombresCodigo[codigo])) {
    return new Response(JSON.stringify({ error: 'Codigo invalido' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (evento === 'nuevo_abonado' && !['encargado_ti', 'admin', 'comercial_abonados'].includes(senderProfile.rol)) {
    return new Response(JSON.stringify({ error: 'Rol no autorizado para registrar abonados' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: siteUsers, error: siteUsersError } = await supabase
    .from('profiles')
    .select('id,sede,rol')
    .eq('activo', true);

  if (siteUsersError) {
    return new Response(JSON.stringify({ error: siteUsersError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const recipientIds = (siteUsers || [])
    .filter((item) => item.id !== userData.user.id)
    .filter((item) => evento === 'nuevo_abonado'
      ? item.rol === 'encargado_ti' || (item.rol === 'admin' && item.sede === sedeDestino)
      : item.sede === sedeDestino)
    .map((item) => item.id);
  if (!recipientIds.length) {
    await supabase.from('push_delivery_logs').insert({
      evento, sede: sedeDestino, remitente: userData.user.id,
      destinatarios: 0, enviados: 0, fallidos: 0,
      detalle: [{ motivo: 'No hay destinatarios activos para la sede' }],
    });
    return new Response(JSON.stringify({ sent: 0, sede: sedeDestino }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from('push_subscriptions')
    .select('id,user_id,endpoint,p256dh,auth')
    .in('user_id', recipientIds);

  if (subscriptionsError) {
    return new Response(JSON.stringify({ error: subscriptionsError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const payload = JSON.stringify(evento === 'nuevo_abonado' ? {
    title: 'Nuevo abonado registrado',
    body: `Hay una nueva solicitud de abonado en ${sedeDestino}. Ingresa a la app para atenderla.`,
    tag: `nuevo-abonado-${sedeDestino}`,
    data: { tipo: 'nuevo_abonado', module: 'abonados', sede: sedeDestino },
  } : {
    title: `${nombre} activado`,
    body: `${senderProfile.nombre || 'Un usuario'} activo ${nombre}. Revisa el checklist operativo.`,
    tag: `codigo-activo-${sedeDestino}-${codigo}`,
    data: { codigo, sede: sedeDestino },
  });

  const results = await Promise.allSettled(
    (subscriptions || []).map(async (subscription) => {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, payload);
        return { id: subscription.id, ok: true };
      } catch (error) {
        const statusCode = typeof error === 'object' && error && 'statusCode' in error
          ? Number((error as { statusCode?: number }).statusCode)
          : 0;

        if (statusCode === 404 || statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', subscription.id);
        }

        return { id: subscription.id, ok: false, statusCode };
      }
    }),
  );

  const deliveryDetails = results.map((result) => result.status === 'fulfilled'
    ? result.value
    : { ok: false, statusCode: 0, error: String(result.reason || 'Error desconocido') });
  const sent = deliveryDetails.filter((result) => result.ok).length;
  const failed = deliveryDetails.length - sent;

  await supabase.from('push_delivery_logs').insert({
    evento, sede: sedeDestino, remitente: userData.user.id,
    destinatarios: recipientIds.length, enviados: sent, fallidos: failed,
    detalle: deliveryDetails,
  });

  return new Response(JSON.stringify({ sent, failed, recipients: recipientIds.length, sede: sedeDestino, evento }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
