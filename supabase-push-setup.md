# Activar Push Real

Esta configuracion permite que la notificacion llegue al celular aunque la app este en segundo plano o cerrada, siempre que el usuario haya instalado/permitido notificaciones de la PWA.

## 1. Ejecutar SQL actualizado

En Supabase:

1. SQL Editor
2. New query
3. Pegar todo `supabase-setup.sql`
4. Run

Esto crea la tabla `push_subscriptions`.

## 2. Configurar secretos de Edge Function

En Supabase, agrega estos secretos en Functions/Secrets o con Supabase CLI usando estos valores:

```txt
VAPID_PUBLIC_KEY=BPA1HvZlxREjSH6MTsm1lK150EAsO-rk6v_ANrYesBXgnCDfBpFQ5HrHnvvGUvvT7ObMR21kRIpD98uwXIBFbjE
VAPID_PRIVATE_KEY=P3_U51orCstqs8qoRJMGufymdKdlQNkVBe6pN_MznKw
VAPID_SUBJECT=mailto:operaciones@urbapark.pe
```

Con CLI seria:

```bash
supabase secrets set VAPID_PUBLIC_KEY="BPA1HvZlxREjSH6MTsm1lK150EAsO-rk6v_ANrYesBXgnCDfBpFQ5HrHnvvGUvvT7ObMR21kRIpD98uwXIBFbjE" VAPID_PRIVATE_KEY="P3_U51orCstqs8qoRJMGufymdKdlQNkVBe6pN_MznKw" VAPID_SUBJECT="mailto:operaciones@urbapark.pe"
```

No pongas `VAPID_PRIVATE_KEY` dentro de `script.js`.

## 3. Desplegar la funcion

Desde este repositorio:

```bash
supabase functions deploy send-code-alert
```

## 4. Probar

1. En el celular del anfitrion, instala o abre la app.
2. Inicia sesion.
3. Pulsa `Activar alertas` y acepta permisos.
4. Desde otra cuenta, activa un codigo.
5. Debe llegar una notificacion del sistema al celular del anfitrion.
