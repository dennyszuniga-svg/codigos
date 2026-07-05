import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

Deno.serve(async (req) => {
  const cronSecret = Deno.env.get('REMINDER_CRON_SECRET');
  if (!cronSecret || req.headers.get('x-cron-secret') !== cronSecret) return json({ error: 'No autorizado' }, 401);

  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const vapidPublic = Deno.env.get('VAPID_PUBLIC_KEY');
  const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY');
  const subject = Deno.env.get('VAPID_SUBJECT') || 'mailto:operaciones@urbapark.local';
  if (!url || !key || !vapidPublic || !vapidPrivate) return json({ error: 'Configuracion incompleta' }, 500);

  const supabase = createClient(url, key);
  const today = new Date();
  const todayText = today.toISOString().slice(0, 10);
  const threeDays = new Date(today);
  threeDays.setDate(threeDays.getDate() + 3);
  const threeDaysText = threeDays.toISOString().slice(0, 10);

  const { data: tasks, error } = await supabase
    .from('tareas_mantenimiento')
    .select('id,titulo,fecha_limite,asignado_a,recordatorio_tres_dias_at,recordatorio_dia_at,recordatorio_vencido_at')
    .neq('estado', 'completada')
    .lte('fecha_limite', threeDaysText);
  if (error) return json({ error: error.message }, 500);

  webpush.setVapidDetails(subject, vapidPublic, vapidPrivate);
  let sent = 0;
  for (const task of tasks || []) {
    let field = '';
    let message = '';
    if (task.fecha_limite < todayText && !task.recordatorio_vencido_at) {
      field = 'recordatorio_vencido_at'; message = `La tarea ${task.titulo} esta vencida.`;
    } else if (task.fecha_limite === todayText && !task.recordatorio_dia_at) {
      field = 'recordatorio_dia_at'; message = `La tarea ${task.titulo} vence hoy.`;
    } else if (task.fecha_limite === threeDaysText && !task.recordatorio_tres_dias_at) {
      field = 'recordatorio_tres_dias_at'; message = `La tarea ${task.titulo} vence en 3 dias.`;
    }
    if (!field) continue;

    const { data: subscriptions } = await supabase.from('push_subscriptions')
      .select('id,endpoint,p256dh,auth').eq('user_id', task.asignado_a);
    const payload = JSON.stringify({
      title: 'Recordatorio de mantenimiento', body: message,
      tag: `recordatorio-${task.id}-${field}`,
      data: { tipo: 'recordatorio_mantenimiento', module: 'mantenimiento', tareaId: task.id },
    });
    for (const subscription of subscriptions || []) {
      try {
        await webpush.sendNotification({
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        }, payload);
        sent += 1;
      } catch (pushError) {
        const statusCode = Number((pushError as { statusCode?: number })?.statusCode || 0);
        if ([404, 410].includes(statusCode)) await supabase.from('push_subscriptions').delete().eq('id', subscription.id);
      }
    }
    await supabase.from('tareas_mantenimiento').update({ [field]: new Date().toISOString() }).eq('id', task.id);
  }
  return json({ processed: tasks?.length || 0, sent });
});
