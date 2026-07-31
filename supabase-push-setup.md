# Activar Push Real

Esta configuracion permite que la notificacion llegue al celular aunque la app este en segundo plano o cerrada, siempre que el usuario haya instalado/permitido notificaciones de la PWA.

> **Nunca commitees la clave privada VAPID.** Vive unicamente en los secretos de la Edge Function. Este archivo solo documenta los nombres de las variables.

## 1. Ejecutar SQL actualizado

En Supabase:

1. SQL Editor
2. New query
3. Pegar todo `supabase-setup.sql`
4. Run

Esto crea la tabla `push_subscriptions`.

## 2. Generar el par de claves VAPID

Si necesitas un par nuevo (alta inicial o rotacion), con Node:

```bash
npx web-push generate-vapid-keys
```

O sin dependencias, con PowerShell:

```bash
powershell -Command "$ec=[System.Security.Cryptography.ECDsa]::Create([System.Security.Cryptography.ECCurve]::CreateFromFriendlyName('nistP256'));$p=$ec.ExportParameters($true);function B64U($b){[Convert]::ToBase64String($b).TrimEnd('=').Replace('+','-').Replace('/','_')};Write-Output ('PUBLIC=' + (B64U ([byte[]]@(4)+$p.Q.X+$p.Q.Y)));Write-Output ('PRIVATE=' + (B64U $p.D))"
```

La clave publica va en `VAPID_PUBLIC_KEY` dentro de `script.js` (es publica por diseno, el navegador la necesita). La privada **solo** va a los secretos de Supabase.

## 3. Configurar secretos de Edge Function

En Supabase, agrega estos secretos en Functions/Secrets o con la CLI:

```txt
VAPID_PUBLIC_KEY=<clave publica generada>
VAPID_PRIVATE_KEY=<clave privada generada>
VAPID_SUBJECT=mailto:operaciones@urbapark.pe
```

Con CLI seria:

```bash
supabase secrets set VAPID_PUBLIC_KEY="<clave publica>" VAPID_PRIVATE_KEY="<clave privada>" VAPID_SUBJECT="mailto:operaciones@urbapark.pe"
```

## 4. Desplegar la funcion

Desde este repositorio:

```bash
supabase functions deploy send-code-alert
```

## 5. Probar

1. En el celular del anfitrion, instala o abre la app.
2. Inicia sesion.
3. Pulsa `Activar alertas` y acepta permisos.
4. Desde otra cuenta, activa un codigo.
5. Debe llegar una notificacion del sistema al celular del anfitrion.

## Rotar las claves

Al cambiar el par VAPID, las suscripciones existentes quedan invalidas porque fueron creadas con la clave anterior.

1. Genera el par nuevo (paso 2) y actualiza los secretos (paso 3).
2. Actualiza `VAPID_PUBLIC_KEY` en `script.js`.
3. Sube la version de `CACHE_NAME` en `service-worker.js` para que los dispositivos instalados reciban el nuevo `script.js`.
4. Redespliega la funcion (paso 4).

`registrarSuscripcionPush()` compara la clave de la suscripcion guardada contra `VAPID_PUBLIC_KEY`; si no coinciden, cancela la suscripcion vieja, borra su fila de `push_subscriptions` y crea una nueva. Cada usuario queda re-suscrito la proxima vez que abra la app con permisos de notificacion ya concedidos.
