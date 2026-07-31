# URBAPARK — Centro de Apoyo Operativo

Aplicacion web instalable (PWA) para la gestion operativa de los estacionamientos UrbaPark: activacion y seguimiento de codigos de emergencia, guias operativas, mantenimiento, inventario, asistencia e informes de intervencion.

Construida con HTML, CSS y JavaScript puro (sin framework ni paso de build) sobre **Supabase** (Postgres + Auth + Storage + Edge Functions).

---

## Sedes

| ID | Sede |
|----|------|
| `puruchuco` | Real Plaza Puruchuco |
| `salaverry` | Real Plaza Salaverry |
| `primavera` | Real Plaza Primavera |
| `civico` | Real Plaza Civico |
| `gama` | GAMA |

Los modulos de **Mantenimiento**, **Caja** y **Ronda** se filtran por sede; el resto es transversal.

---

## Codigos de emergencia

| Codigo | Color | Situacion |
|--------|-------|-----------|
| **Rojo** | `#d92d20` | Incendios o inflamacion de chimeneas |
| **Naranja** | `#b54708` | Atrapados en ascensores, escaleras o travolator |
| **3D** | `#027a48` | Fugas de gases y derrames de combustibles |
| **CAT** | `#175cd3` | Persona necesita atencion medica |
| **Verde** | `#039855` | Sismos |
| **CROC** | `#3b4cc0` | Incidente con sospechoso o riesgo de seguridad |
| **ADAM** | `#111827` | Personas extraviadas |
| **CALMA** | `#a855f7` | Agresion fisica o verbal y alteracion del orden |
| **CAPTA** | `#7c6f64` | Persona de alto riesgo, amenaza o agresion |

Cada codigo tiene ficha con guia paso a paso, checklist de controles, imagen de referencia y alerta sonora. Al activarse se replica en tiempo real a las demas sesiones y dispara una **notificacion push** a los anfitriones via la Edge Function `send-code-alert`.

### Atajos de teclado
- **Teclas 1–9**: activar el codigo segun su posicion en la grilla
- **Tecla 0**: desactivar todos los codigos
- **Escape**: cerrar la ficha, el panel de administracion o la ventana de modulo abierta

---

## Paginas de la aplicacion

| Archivo | Proposito |
|---------|-----------|
| [`index.html`](index.html) | App principal: login, busqueda global, menu de modulos, codigos de emergencia, guias operativas y panel de administracion. |
| [`mantenimiento-control.html`](mantenimiento-control.html) | Centro de control de mantenimiento: planes preventivos, intervenciones, inventario y asignaciones a tecnicos. |
| [`informe-incidentes.html`](informe-incidentes.html) | Registro de informes de intervencion con fotos, borradores locales y exportacion. |
| [`asistencia.html`](asistencia.html) | Control de asistencia presencial por turnos mediante QR. |

### Modulos del menu principal
`Mantenimiento` · `Operaciones` · `Caja` · `Ronda` · `Codigos` · `Capacitacion` · `Abonados` · `Registro`

---

## Roles de usuario

| Rol | Etiqueta | Alcance |
|-----|----------|---------|
| `encargado_ti` | Encargado de Mantenimiento y TI | Global — rol superior, acceso total |
| `admin` | Administrador | Por sede |
| `jefe_operaciones` | Jefe de operaciones | Global |
| `coordinador_operaciones` | Coordinador de operaciones | Global |
| `gdh` | GDH | Global |
| `comercial_abonados` | Comercial de abonados | Global |
| `tecnico` | Tecnico de mantenimiento | Por sede |
| `supervisor` | Supervisor | Por sede |
| `eco` | ECO | Por sede |
| `charly` | Charly | Por sede |
| `anfitrion` | Anfitrion | Por sede — recibe las alertas push |

Un `admin` solo puede crear usuarios con rol `supervisor`, `eco`, `charly` o `anfitrion`. La visibilidad real se aplica en la base de datos mediante politicas **RLS** por sede y rol.

---

## Backend — `supabase/`

### Edge Functions (Deno / TypeScript)

| Funcion | Que hace |
|---------|----------|
| `send-code-alert` | Envia notificaciones push Web (VAPID) al activarse un codigo |
| `attendance-qr` | Genera y valida los QR de asistencia por turno |
| `create-user` | Alta de usuarios con rol y sede (usa la service role key) |
| `delete-user` | Baja de usuarios |
| `resolve-login` | Permite iniciar sesion con nombre de usuario ademas de correo |
| `maintenance-reminders` | Recordatorios de mantenimientos preventivos pendientes |
| `migrate-guide-images` | Migra imagenes de guias desde `localStorage` al bucket de Storage |

### Migraciones — `supabase/migrations/`

Historial versionado del esquema (jun–jul 2026). Cubre, entre otros:

- Storage y audiencias de guias operativas (`guide_image_storage`, `guide_sites`, `guide_audience`)
- Operaciones y roles con alcance por sede (`site_scoped_operations`, `add_global_operation_roles`)
- Sistema de mantenimiento: inventario por area, intervenciones, rol tecnico, asignaciones, planes preventivos automaticos
- Inventario centralizado: multi-ubicacion, movimientos, costos, PyG y manejo de moneda
- Asistencia: turnos, asistencia de supervisor, turnos 08:00 y 13:00
- Abonados y rol superior, auditoria de entregas push
- Activos de operaciones y panel de salud del sistema

### Scripts SQL sueltos (raiz)
- [`supabase-setup.sql`](supabase-setup.sql) — esquema base inicial, incluye `push_subscriptions`
- [`supabase-guias-operativas.sql`](supabase-guias-operativas.sql) — tablas de guias operativas
- [`supabase-push-setup.md`](supabase-push-setup.md) — pasos para activar las notificaciones push reales

---

## PWA y cache

- [`manifest.webmanifest`](manifest.webmanifest) — instalable, `standalone`, orientacion vertical
- [`service-worker.js`](service-worker.js) — cache versionado (`codigos-urbapark-vNN`)

> **Al desplegar cambios, sube la version de `CACHE_NAME` en `service-worker.js`.** Si no, los dispositivos ya instalados seguiran sirviendo la version anterior desde cache.

---

## Desarrollo local

No hay dependencias ni build. Sirve la carpeta con cualquier servidor estatico (abrir el HTML con `file://` rompe el service worker y los modulos):

```bash
npx serve .
```

Para trabajar con el backend hace falta la [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase functions deploy send-code-alert
```

```bash
supabase db push
```

El proyecto de Supabase vinculado es `uibiwhkxlyxdfytvudbn`. La app usa la **publishable key** (clave publica, segura para el cliente); toda la proteccion real vive en las politicas RLS.

---

## Estructura

```
codigos/
├── index.html                    # App principal
├── script.js                     # Logica principal (codigos, guias, modulos, admin)
├── styles.css                    # Estilos globales y tema claro/oscuro
├── mantenimiento-control.{html,css,js}
├── informe-incidentes.{html,css,js}
├── asistencia.{html,css,js} + asistencia-status.css
├── service-worker.js             # Cache offline de la PWA
├── manifest.webmanifest
├── assets/
│   ├── codigo-*.png / *.webp     # Imagenes de cada codigo
│   ├── icons/                    # Iconos de la PWA
│   ├── urbapark-logo.png
│   └── xlsx.full.min.js          # SheetJS para exportar a Excel
└── supabase/
    ├── functions/                # 7 Edge Functions
    └── migrations/               # Historial del esquema
```
