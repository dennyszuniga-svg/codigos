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

  const body = await req.json().catch(() => ({}));
  const codigo = typeof body.codigo === 'string' ? body.codigo : '';
  const nombre = typeof body.nombre === 'string' ? body.nombre : nombresCodigo[codigo] || 'Codigo activado';

  if (!codigo || !nombresCodigo[codigo]) {
    return new Response(JSON.stringify({ error: 'Codigo invalido' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from('push_subscriptions')
    .select('id,user_id,endpoint,p256dh,auth')
    .neq('user_id', userData.user.id);

  if (subscriptionsError) {
    return new Response(JSON.stringify({ error: subscriptionsError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const payload = JSON.stringify({
    title: `${nombre} activado`,
    body: `${userData.user.email || 'Un usuario'} activo ${nombre}. Revisa el checklist operativo.`,
    tag: `codigo-activo-${codigo}`,
    data: { codigo },
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

  return new Response(JSON.stringify({ sent: results.length }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
