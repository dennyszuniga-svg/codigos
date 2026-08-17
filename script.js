const STORAGE_KEYS = {
    history: 'historialCodigos',
    checklist: 'estadoChecklistCodigos',
    guides: 'guiasOperativas',
    guideDraft: 'borradorGuiaOperativa',
    guideProgress: 'progresoGuiasOperativas',
    guideImagesMigrated: 'fotosGuiasMigradasAStorage',
    theme: 'temaCodigosUrbapark',
    maintenanceReports: 'urbapark-maintenance-reports',
    occupancyDraft: 'urbapark-operations-occupancy-draft'
};

const SUPABASE_CONFIG = {
    url: 'https://uibiwhkxlyxdfytvudbn.supabase.co',
    publishableKey: 'sb_publishable_R-auhGcSmwSl-1U9WdGe3g_ZYm5BZEt'
};

const SUPABASE_ESM_SOURCES = [
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm',
    'https://esm.sh/@supabase/supabase-js@2'
];

const VAPID_PUBLIC_KEY = 'BG9moXgahVKNxX367YNu3NPS5GdD03nrtB3YikfldVYwq8YAsKZEmIPevWZaozevHeCgWXXDPNp3BKC652FoZHc';
const GUIDE_IMAGE_BUCKET = 'guide-images';
const GUIDE_IMAGE_URL_TTL = 60 * 60;
const GDH_DOCUMENT_BUCKET = 'gdh-documentos';
const GDH_ANNOUNCEMENT_BUCKET = 'gdh-comunicados';
const MEDIA_VAULT_DB_NAME = 'urbapark-media-vault';
const MEDIA_VAULT_DB_VERSION = 1;
const MEDIA_VAULT_STORE = 'media';
const MAINTENANCE_ACCESS_SESSION_KEY = 'urbapark-maintenance-area-unlocked';
const SEDES_OPERACION = [
    { id: 'puruchuco', nombre: 'Real Plaza Puruchuco', corto: 'Puruchuco' },
    { id: 'salaverry', nombre: 'Real Plaza Salaverry', corto: 'Salaverry' },
    { id: 'primavera', nombre: 'Real Plaza Primavera', corto: 'Primavera' },
    { id: 'civico', nombre: 'Real Plaza Civico', corto: 'Civico' },
    { id: 'gama', nombre: 'GAMA', corto: 'GAMA' }
];
const MODULOS_POR_SEDE = new Set(['mantenimiento', 'caja', 'ronda']);
const ROL_SUPERIOR = 'encargado_ti';
const ROLES_OPERACION_GLOBAL = ['jefe_operaciones', 'coordinador_operaciones', 'gdh'];
const ROLES_GLOBALES = [ROL_SUPERIOR, 'comercial_abonados', ...ROLES_OPERACION_GLOBAL];
const ROLES_CREABLES_POR_ADMIN = ['supervisor', 'fortaleza', 'eco', 'charly', 'anfitrion'];
const ROLES_USUARIO = [
    ROL_SUPERIOR,
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
    'anfitrion'
];
const ETIQUETAS_ROL = {
    [ROL_SUPERIOR]: 'Encargado de Mantenimiento y TI',
    admin: 'Administrador',
    comercial_abonados: 'Comercial de abonados',
    jefe_operaciones: 'Jefe de operaciones',
    coordinador_operaciones: 'Coordinador de operaciones',
    gdh: 'GDH',
    tecnico: 'Tecnico de mantenimiento',
    supervisor: 'Supervisor',
    fortaleza: 'Fortaleza',
    eco: 'ECO',
    charly: 'Charly',
    anfitrion: 'Anfitrion'
};
const TIPOS_ABONO = {
    locatario_lv: { nombre: 'Locatario auto - lunes a viernes', monto: 150 },
    locatario_sd: { nombre: 'Locatario auto - sabado a domingo', monto: 200 }
};
const EQUIPOS_MANTENIMIENTO = [
    { sede: 'civico', codigo: 'ENTRADA 1', nombre: 'Carril de entrada 1', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'civico', codigo: 'ENTRADA 2', nombre: 'Carril de entrada 2', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'civico', codigo: 'SALIDA 1', nombre: 'Carril de salida 1', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'civico', codigo: 'SALIDA 2', nombre: 'Carril de salida 2', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'civico', codigo: 'TPA 1', nombre: 'Cajero automatico full 1', tipo: 'Cajero automatico full', componentes: ['Cajero automatico full'], preventivoMinutos: 120 },
    { sede: 'civico', codigo: 'TPA 2', nombre: 'Cajero automatico full 2', tipo: 'Cajero automatico full', componentes: ['Cajero automatico full'], preventivoMinutos: 120 },
    { sede: 'civico', codigo: 'TPA 3', nombre: 'Cajero automatico full 3', tipo: 'Cajero automatico full', componentes: ['Cajero automatico full'], preventivoMinutos: 120 },
    { sede: 'civico', codigo: 'TPALITE1', nombre: 'Equipo de pago automatico con tarjeta', tipo: 'Pago automatico tarjeta', componentes: ['Pago con tarjeta'], preventivoMinutos: 120 },
    { sede: 'salaverry', codigo: 'TPA 1', nombre: 'Cajero automatico 1', tipo: 'Cajero automatico', componentes: ['Cajero automatico'], preventivoMinutos: 120 },
    { sede: 'salaverry', codigo: 'TPA 2', nombre: 'Cajero automatico 2', tipo: 'Cajero automatico', componentes: ['Cajero automatico'], preventivoMinutos: 120 },
    { sede: 'salaverry', codigo: 'TPA 3', nombre: 'Cajero automatico 3', tipo: 'Cajero automatico', componentes: ['Cajero automatico'], preventivoMinutos: 120 },
    { sede: 'salaverry', codigo: 'TPA 4', nombre: 'Cajero automatico 4', tipo: 'Cajero automatico', componentes: ['Cajero automatico'], preventivoMinutos: 120 },
    { sede: 'salaverry', codigo: 'TPA 5', nombre: 'Cajero automatico 5', tipo: 'Cajero automatico', componentes: ['Cajero automatico'], preventivoMinutos: 120 },
    { sede: 'salaverry', codigo: 'TPA 6', nombre: 'Cajero automatico 6', tipo: 'Cajero automatico', componentes: ['Cajero automatico'], preventivoMinutos: 120 },
    { sede: 'salaverry', codigo: 'TPA 7', nombre: 'Cajero automatico 7', tipo: 'Cajero automatico', componentes: ['Cajero automatico'], preventivoMinutos: 120 },
    { sede: 'salaverry', codigo: 'TPA 8', nombre: 'Cajero automatico 8', tipo: 'Cajero automatico', componentes: ['Cajero automatico'], preventivoMinutos: 120 },
    { sede: 'salaverry', codigo: 'PUMA 1 A', nombre: 'Carril de ingreso Puma 1 A', tipo: 'Carril de ingreso', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'salaverry', codigo: 'PUMA 1 B', nombre: 'Carril de ingreso Puma 1 B', tipo: 'Carril de ingreso', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'salaverry', codigo: 'PUMA 2 A', nombre: 'Carril de ingreso Puma 2 A', tipo: 'Carril de ingreso', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'salaverry', codigo: 'PUMA 2 B', nombre: 'Carril de ingreso Puma 2 B', tipo: 'Carril de ingreso', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'salaverry', codigo: 'PUMA 3 A', nombre: 'Carril de ingreso Puma 3 A', tipo: 'Carril de ingreso', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'salaverry', codigo: 'PUMA 3 B', nombre: 'Carril de ingreso Puma 3 B', tipo: 'Carril de ingreso', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'salaverry', codigo: 'PUMA 4 A', nombre: 'Carril de ingreso Puma 4 A', tipo: 'Carril de ingreso', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'salaverry', codigo: 'PUMA 4 B', nombre: 'Carril de ingreso Puma 4 B', tipo: 'Carril de ingreso', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'salaverry', codigo: 'PUMA 5 A', nombre: 'Carril de ingreso Puma 5 A', tipo: 'Carril de ingreso', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'salaverry', codigo: 'PUMA 5 B', nombre: 'Carril de ingreso Puma 5 B', tipo: 'Carril de ingreso', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'primavera', codigo: 'ENTRADA ALVAREZ CALDERON', nombre: 'Carril de entrada Alvarez Calderon', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'primavera', codigo: 'SALIDA ALVAREZ CARRION', nombre: 'Carril de salida Alvarez Carrion', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'primavera', codigo: 'ENTRADA 2 AVIACION', nombre: 'Carril de entrada 2 Aviacion', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'primavera', codigo: 'ENTRADA 3 AVIACION', nombre: 'Carril de entrada 3 Aviacion', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'primavera', codigo: 'SALIDA 2 AVIACION', nombre: 'Carril de salida 2 Aviacion', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'primavera', codigo: 'SALIDA 3 AVIACION', nombre: 'Carril de salida 3 Aviacion', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'primavera', codigo: 'TPA1LITE JAPIBICI', nombre: 'Cajero automatico Lite 1 Japibici', tipo: 'Cajero automatico Lite', componentes: ['Pago con tarjeta'], preventivoMinutos: 120 },
    { sede: 'primavera', codigo: 'TPA1FULL JAPIBICI', nombre: 'Cajero automatico Full 1 Japibici', tipo: 'Cajero automatico Full', componentes: ['Cajero automatico Full'], preventivoMinutos: 120 },
    { sede: 'primavera', codigo: 'TPA2LITE JAPIBICI', nombre: 'Cajero automatico Lite 2 Japibici', tipo: 'Cajero automatico Lite', componentes: ['Pago con tarjeta'], preventivoMinutos: 120 },
    { sede: 'primavera', codigo: 'TPA2FULL JAPIBICI', nombre: 'Cajero automatico Full 2 Japibici', tipo: 'Cajero automatico Full', componentes: ['Cajero automatico Full'], preventivoMinutos: 120 },
    { sede: 'primavera', codigo: 'TPA3LITE', nombre: 'Cajero automatico Lite 3', tipo: 'Cajero automatico Lite', componentes: ['Pago con tarjeta'], preventivoMinutos: 120 },
    { sede: 'primavera', codigo: 'TPA4LITE', nombre: 'Cajero automatico Lite 4', tipo: 'Cajero automatico Lite', componentes: ['Pago con tarjeta'], preventivoMinutos: 120 },
    { sede: 'puruchuco', codigo: 'ENTRADA 1 DE JAVIER PRADO', nombre: 'Carril de entrada 1 Javier Prado', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'puruchuco', codigo: 'ENTRADA 2 DE JAVIER PRADO', nombre: 'Carril de entrada 2 Javier Prado', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'puruchuco', codigo: 'ENTRADA 3 DE JAVIER PRADO', nombre: 'Carril de entrada 3 Javier Prado', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'puruchuco', codigo: 'ENTRADA JAVIER PRADO PROVEEDORES', nombre: 'Carril de entrada Javier Prado Proveedores', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'puruchuco', codigo: 'ENTRADA 1 VISTA ALEGRE', nombre: 'Carril de entrada 1 Vista Alegre', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'puruchuco', codigo: 'ENTRADA 2 VISTA ALEGRE', nombre: 'Carril de entrada 2 Vista Alegre', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'puruchuco', codigo: 'ENTRADA 1 CARRETERA CENTRAL', nombre: 'Carril de entrada 1 Carretera Central', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'puruchuco', codigo: 'ENTRADA 2 CARRETERA CENTRAL', nombre: 'Carril de entrada 2 Carretera Central', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'puruchuco', codigo: 'ENTRADA DE ZONA IPAE', nombre: 'Carril de entrada Zona IPAE', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'puruchuco', codigo: 'SALIDA DE ZONA IPAE', nombre: 'Carril de salida Zona IPAE', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'puruchuco', codigo: 'SALIDA 1 DE JAVIER PRADO', nombre: 'Carril de salida 1 Javier Prado', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'puruchuco', codigo: 'SALIDA 2 DE JAVIER PRADO', nombre: 'Carril de salida 2 Javier Prado', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'puruchuco', codigo: 'SALIDA 3 DE JAVIER PRADO', nombre: 'Carril de salida 3 Javier Prado', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'puruchuco', codigo: 'SALIDA JAVIER PRADO PROVEEDORES', nombre: 'Carril de salida Javier Prado Proveedores', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120, activo: false },
    { sede: 'puruchuco', codigo: 'SALIDA 1 DE SMARTFIT', nombre: 'Carril de salida 1 Smartfit', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120, activo: false },
    { sede: 'puruchuco', codigo: 'SALIDA 1 VISTA ALEGRE', nombre: 'Carril de salida 1 Vista Alegre', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'puruchuco', codigo: 'SALIDA 2 VISTA ALEGRE', nombre: 'Carril de salida 2 Vista Alegre', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'puruchuco', codigo: 'SALIDA DE NICOLAS AYLLON', nombre: 'Carril de salida Nicolas Ayllon', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120, activo: false },
    { sede: 'puruchuco', codigo: 'SALIDA 2 CARRETERA CENTRAL', nombre: 'Carril de salida 2 Carretera Central', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120, activo: false },
    { sede: 'puruchuco', codigo: 'SALIDA 3 CARRETERA CENTRAL', nombre: 'Carril de salida 3 Carretera Central', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120, activo: false }
];
SEDES_OPERACION.forEach(sede => {
    EQUIPOS_MANTENIMIENTO.push(
        { sede: sede.id, codigo: 'ESTACIONAMIENTO', nombre: 'Mejoras generales de estacionamiento', tipo: 'Infraestructura', componentes: ['Infraestructura del estacionamiento'], preventivoMinutos: 0 },
        { sede: sede.id, codigo: 'FORTALEZA', nombre: 'Trabajos de Fortaleza', tipo: 'Infraestructura', componentes: ['Infraestructura y seguridad vial'], preventivoMinutos: 0 }
    );
});

const MAX_HISTORIAL = 10;

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
});

const timeFormatter = new Intl.DateTimeFormat('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
});

const etiquetasModo = {
    real: 'Emergencia real',
    simulacro: 'Simulacro'
};

const etiquetasPrioridad = {
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta',
    critica: 'Critica'
};

const codigosEmergencia = {
    rojo: {
        nombre: 'Codigo Rojo',
        descripcion: 'Incendios o inflamacion de chimeneas',
        guia: '5 primeros minutos en incendios o inflamacion de chimeneas',
        resumen: 'Activa respuesta contra incendio y comunica la ubicacion.',
        color: '#d92d20',
        icono: 'R',
        image: 'assets/codigo-rojo.webp',
        imagenAmpliada: 'assets/codigo-rojo.png',
        concepto: {
            titulo: 'Fuego / Incendio',
            foco: 'Control inicial, comunicacion y evacuacion preventiva',
            escena: 'fire',
            etiquetas: ['Extintores', 'Brigada', 'Bomberos']
        },
        checklist: [
            'Personal de URBAPARK comunica a ECO sobre el lugar y punto de ignicion.',
            'ECO realiza el comunicado a Charly (Supervisor de Centro de Control).',
            'Se procede a cerrar la zona.',
            'Se procede a evacuar clientes.'
        ],
        controles: [
            {
                id: 'uso-extintor',
                pregunta: 'Se llego a usar un extintor?',
                opciones: ['Si', 'No']
            }
        ]
    },
    naranja: {
        nombre: 'Codigo Naranja',
        descripcion: 'Atrapados en ascensores, escaleras o travolator',
        guia: '5 primeros minutos atrapados en ascensores, escaleras o travolator',
        resumen: 'Responde ante atrapamiento y coordina el servicio de emergencias.',
        color: '#b54708',
        icono: 'N',
        image: 'assets/codigo-naranja.webp',
        imagenAmpliada: 'assets/codigo-naranja.png',
        concepto: {
            titulo: 'Persona atrapada',
            foco: 'Contencion, comunicacion y rescate asistido',
            escena: 'lift',
            etiquetas: ['Ascensor', 'Mantenimiento', 'Calma']
        },
        checklist: [
            'Anfitrion comunica a ECO el atrapamiento de personas dentro del ascensor, escalera o travolator.',
            'ECO se dirige al punto e informa de inmediato a Charly para activar al proveedor de ascensores.',
            'Mantener comunicacion calmada con los clientes, informar que la ayuda esta en camino y contener la situacion.'
        ]
    },
    'verde-oscuro': {
        nombre: 'Codigo 3D',
        descripcion: 'Fugas de gases y derrames de combustibles',
        guia: 'Diluye - Dispersa - Dirige',
        resumen: 'Controla gases o derrames con apoyo de mantenimiento y seguridad.',
        color: '#027a48',
        icono: '3D',
        image: 'assets/codigo-3d.webp',
        imagenAmpliada: 'assets/codigo-3d.png',
        concepto: {
            titulo: 'Derrame / fuga',
            foco: 'Diluye, dispersa y dirige el control de la zona',
            escena: 'spill',
            etiquetas: ['Aislar', 'Medir', 'Ventilar']
        },
        checklist: [],
        controles: [
            {
                id: 'tipo-incidente-3d',
                pregunta: 'Tipo de incidente 3D',
                opciones: ['Gas', 'Gasolina o petroleo'],
                posicion: 'antes'
            }
        ],
        checklistsCondicionales: {
            'tipo-incidente-3d': {
                Gas: [
                    'Anfitrion se aleja del punto, comunica a ECO y apaga la radio hasta ubicarse en una zona segura.',
                    'ECO comunica de inmediato a Charly la fuga de gas y la ubicacion exacta.',
                    'ECO cierra la zona y establece un perimetro de seguridad definido.'
                ],
                'Gasolina o petroleo': [
                    'Anfitrion coloca arena en el punto del derrame, informa a ECO y reporta la situacion al grupo.',
                    'ECO se acerca al punto y recopila los datos del vehiculo que genera el derrame.',
                    'ECO coordina con Charly el perifoneo y mantiene controlada la zona afectada.'
                ]
            }
        }
    },
    azul: {
        nombre: 'Codigo CAT',
        descripcion: 'Persona necesita atencion medica',
        guia: 'Comunica + Atiende + Traslada',
        resumen: 'Orienta la atencion medica y el traslado del paciente.',
        color: '#175cd3',
        icono: 'CAT',
        image: 'assets/codigo-cat.webp',
        imagenAmpliada: 'assets/codigo-cat.png',
        concepto: {
            titulo: 'Atencion medica',
            foco: 'Primeros auxilios, estabilizacion y traslado',
            escena: 'medical',
            etiquetas: ['Paciente', 'Topico', 'Traslado']
        },
        checklist: [
            'Anfitrion comunica por radio a ECO la situacion y ubicacion del cliente.',
            'ECO informa de inmediato a Charly la activacion del Codigo CAT.',
            'Anfitrion observa de forma constante y mantiene comunicacion de soporte con el cliente.'
        ],
        notaChecklist: 'NO SE ACERCA NI CONTENEMOS. VISION CONSTANTE Y COMUNICACION DE SOPORTE AL CLIENTE.'
    },
    verde: {
        nombre: 'Codigo Verde',
        descripcion: 'Sismos',
        guia: 'Verifica + Evalua + Restringe + Distribuye + Evacua',
        resumen: 'Gestiona el sismo con evacuacion y control de la operacion.',
        color: '#039855',
        icono: 'V',
        image: 'assets/codigo-verde.webp',
        imagenAmpliada: 'assets/codigo-verde.png',
        concepto: {
            titulo: 'Sismo / evacuacion',
            foco: 'Verifica, restringe accesos y evacua con control',
            escena: 'evac',
            etiquetas: ['Alarma', 'Rutas', 'Punto seguro']
        },
        checklist: [
            'ECO lanza el Codigo Verde y alerta a todo el equipo de URBAPARK.',
            'Anfitriones se acercan a los ascensores para evacuar y orientar a los clientes.',
            'Anfitrion de modulo evacua a los clientes y cierra su caja con llave.',
            'Rondas evacuan a los clientes y los direccionan hacia las puertas de emergencia.',
            'Fortaleza apertura plumillas y bloquea accesos para facilitar la evacuacion.',
            'Japibici evacua por la escalera de emergencia y direcciona a los clientes por la ruta segura.'
        ]
    },
    croc: {
        nombre: 'Codigo CROC',
        descripcion: 'Incidente con sospechoso o riesgo de seguridad',
        guia: 'Comunica + Rastrea + Observa + Contiene',
        resumen: 'Coordina con seguridad y control para contener la situacion.',
        color: '#3b4cc0',
        icono: 'CROC',
        image: 'assets/codigo-croc.webp',
        imagenAmpliada: 'assets/codigo-croc.png',
        concepto: {
            titulo: 'Riesgo de seguridad',
            foco: 'Rastreo, observacion y contencion del incidente',
            escena: 'security',
            etiquetas: ['Camaras', 'Cerco', 'Autoridad']
        },
        checklist: [
            'Anfitrion comunica al grupo via radial un presunto C10, indicando vestimenta y ultimo lugar donde fue visualizado.',
            'ECO comunica a Charly los detalles del presunto C10 y la referencia de ubicacion.',
            'Anfitriones se posicionan en ascensores y puertas de emergencia para reforzar puntos de salida.',
            'Anfitriones realizan seguimiento visual y comunican desplazamientos sin perder contacto operativo.'
        ]
    },
    adam: {
        nombre: 'Codigo ADAM',
        descripcion: 'Personas extraviadas',
        guia: 'Personas extraviadas',
        resumen: 'Activa la busqueda y el seguimiento del familiar o la persona.',
        color: '#111827',
        icono: 'ADAM',
        image: 'assets/codigo-adam.webp',
        imagenAmpliada: 'assets/codigo-adam.png',
        concepto: {
            titulo: 'Persona extraviada',
            foco: 'Busqueda coordinada con datos, recorrido y reporte',
            escena: 'search',
            etiquetas: ['Datos', 'Busqueda', 'Control']
        },
        checklist: [
            'Anfitrion comunica a ECO la activacion del Codigo ADAM, entregando detalles de la persona extraviada.',
            'Anfitrion permanece con la persona extraviada en un punto visible por camaras y mantiene comunicacion calmada.',
            'ECO se acerca al punto y acompana a la persona extraviada hacia el modulo mas cercano.',
            'ECO realiza la entrega de la persona extraviada a Charly, dejando constancia del cierre de atencion.'
        ]
    },
    calma: {
        nombre: 'Codigo CALMA',
        descripcion: 'Agresion fisica o verbal y alteracion del orden',
        guia: 'Comunica + Atiende + Lidera sin agredir + Mantiene la calma + Aisla',
        resumen: 'Desescala el conflicto y aisla el punto para proteger a todos.',
        color: '#a855f7',
        icono: 'CLM',
        image: 'assets/codigo-calma.webp',
        imagenAmpliada: 'assets/codigo-calma.png',
        concepto: {
            titulo: 'Alteracion del orden',
            foco: 'Desescalamiento, separacion y control sin agresion',
            escena: 'calm',
            etiquetas: ['Separar', 'Dialogar', 'Aislar']
        },
        checklist: [
            'Anfitrion comunica a ECO los detalles de la situacion y la ubicacion exacta.',
            'ECO se acerca, aborda la situacion y busca apaciguar a las personas involucradas.',
            'Si la situacion escala, ECO solicita apoyo de Charly o Tango para contener y calmar el punto.',
            'A la llegada de Tango, ECO y anfitriones se retiran del punto manteniendo el control operativo.'
        ]
    },
    capta: {
        nombre: 'Codigo CAPTA',
        descripcion: 'Persona de alto riesgo, amenaza o agresion',
        guia: 'Comunica + Acompana + Protege + Tranquiliza + Activa',
        resumen: 'Acompana y protege a la persona mientras se activa el protocolo.',
        color: '#7c6f64',
        icono: 'CAP',
        image: 'assets/codigo-capta.webp',
        imagenAmpliada: 'assets/codigo-capta.png',
        concepto: {
            titulo: 'Alto riesgo / amenaza',
            foco: 'Acompanar, proteger, tranquilizar y activar apoyo',
            escena: 'shield',
            etiquetas: ['Proteger', 'Acompanamiento', 'Apoyo']
        },
        checklist: [
            'Anfitrion aborda a la persona de forma respetuosa e informa que no esta permitido el comercio ambulatorio, consumo indebido o conducta que afecte la operacion del mall.',
            'ECO comunica a Charly la ubicacion y descripcion de la persona intervenida.',
            'ECO acompana a la persona durante su retiro; si la situacion escala, activa Codigo CALMA o Codigo CROC segun corresponda.'
        ]
    }
};

const ordenCodigos = ['rojo', 'naranja', 'verde-oscuro', 'azul', 'verde', 'croc', 'adam', 'calma', 'capta'];

const OPERATIONS_CHECKLIST_BUCKET = 'operations-checklist-images';
const OPERATIONS_CHECKLIST_SECTIONS = [
    {
        id: 'vehiculos',
        nombre: 'Ingresos y salidas vehiculares',
        descripcion: 'Validacion de carriles, accesos y equipos asociados.',
        criticidad: 'critica',
        items: [
            ['equipos-operativos', 'Equipos de ingreso y salida operativos.', 'critica'],
            ['lpr-operativo', 'LPR operativo y con lectura correcta de placas.', 'critica'],
            ['camaras-acceso', 'Camaras de ingreso y salida operativas y enfocadas.', 'critica'],
            ['barreras', 'Barreras operativas y alineadas.', 'critica'],
            ['ticketera', 'Ticketera operativa y con rollo termico.', 'critica'],
            ['interfonia-acceso', 'Interfonia operativa en ingresos y salidas.', 'critica'],
            ['tiempo-barrera', 'Tiempo de apertura de barrera menor a 7 segundos.', 'critica'],
            ['carriles-limpios', 'Carriles limpios y libres de obstaculos.', 'critica']
        ]
    },
    {
        id: 'pagos',
        nombre: 'Modulos de pago (TPA / TPM)',
        descripcion: 'No se muestra en Puruchuco porque la sede no realiza cobros.',
        criticidad: 'critica',
        excluidaEn: ['puruchuco'],
        items: [
            ['modulos-operativos', 'Modulos limpios y operativos.', 'critica'],
            ['pantallas-pago', 'Pantallas operativas y visibles.', 'critica'],
            ['medios-pago', 'Monedero, billetero y devolvedor operativos.', 'critica'],
            ['impresora-pago', 'Impresora operativa y con rollo termico.', 'critica'],
            ['interfonia-pago', 'Interfonia operativa.', 'critica'],
            ['recaudo', 'Recaudo realizado y fondo cuadrado.', 'critica'],
            ['area-pago', 'Area limpia y ordenada.', 'critica']
        ]
    },
    {
        id: 'fortaleza',
        nombre: 'Fortaleza',
        descripcion: 'Control de monitoreo, comunicaciones y soporte operativo.',
        criticidad: 'media',
        items: [
            ['camaras-fortaleza', 'Camaras operativas y con enfoque correcto.', 'media'],
            ['pantallas-fortaleza', 'Pantallas limpias y operativas.', 'media'],
            ['radios', 'Radios de comunicacion cargados y operativos.', 'media'],
            ['grupos-camaras', 'Grupos de camaras organizados correctamente.', 'media'],
            ['incidencias', 'Registro y seguimiento de incidencias actualizado.', 'media'],
            ['area-fortaleza', 'Area limpia y ordenada.', 'media'],
            ['scooters', 'Scooters con carga suficiente para la operacion.', 'media']
        ]
    },
    {
        id: 'generales',
        nombre: 'Validaciones generales',
        descripcion: 'Seguridad, respuesta y condiciones generales de operacion.',
        criticidad: 'mixta',
        items: [
            ['extintores', 'Extintores verificados y operativos.', 'critica'],
            ['luces-emergencia', 'Luces de emergencia operativas.', 'critica'],
            ['rutas-evacuacion', 'Rutas de evacuacion despejadas.', 'critica'],
            ['senaleticas', 'Senaleticas de seguridad limpias y en buen estado.', 'critica'],
            ['botiquin', 'Botiquin implementado y vigente.', 'critica'],
            ['radio-epp', 'Personal con radio y EPP completo.', 'media'],
            ['libro-reclamaciones', 'Libro de reclamaciones disponible.', 'baja'],
            ['sin-incidencias', 'Operacion sin incidencias criticas.', 'media'],
            ['auxilio-mecanico', 'Herramientas de auxilio mecanico disponibles.', 'baja']
        ]
    }
];

let historial = [];
let checklistEstado = {};
let codigoActivo = null;
let supabaseClient = null;
let inicializacionSupabase = null;
let sesionActual = null;
let perfilActual = null;
let historialRemotoActivo = false;
let canalEstadoOperativo = null;
let aplicandoEstadoRemoto = false;
let temporizadorSincronizacion = null;
let ultimoCodigoRemotoAlertado = null;
let hidratandoFotosCodigos = false;
let moduloActivo = null;
let elementoRetornoModulo = null;
let guiasOperativas = [];
let guiasRemotasActivas = false;
let guiaTareasBorrador = [];
let progresoGuias = {};
let progresoUsuariosAdmin = {};
let usuariosAdmin = [];
let canalGuiasOperativas = null;
let busquedaGlobal = '';
let elementoRetornoPanelAdmin = null;
let temporizadorBorradorGuia = null;
let accesoMantenimientoActivo = false;
let inventarioRepuestos = [];
let intervencionesMantenimiento = [];
let movimientosInventario = [];
let mantenimientoProgramado = [];
let tareasMantenimiento = [];
let tecnicosMantenimiento = [];
let canalInventario = null;
let canalIntervencionesMantenimiento = null;
let canalMantenimientoProgramado = null;
let canalTareasMantenimiento = null;
let solicitudesAbonados = [];
let canalSolicitudesAbonados = null;
let activosOperaciones = [];
let canalActivosOperaciones = null;
let canalChecklistOperaciones = null;
let canalOcupabilidadOperaciones = null;
let canalComunicadosGdh = null;
let comunicadosGdh = [];
let lecturasGdh = [];
let comunicadoObligatorioActual = null;
let checklistOperacionesActual = null;
let historialChecklistsOperaciones = [];
let ultimoChecklistOperacionesFinalizado = null;
let informeGeneralOperaciones = [];
let temporizadorChecklistOperaciones = null;
let temporizadorVentanaChecklistOperaciones = null;
let registroOcupabilidadDiaria = null;
let zonasOcupabilidadActual = [];
let temporizadorBorradorOcupabilidad = null;
let sedeActivaPorModulo = {
    mantenimiento: 'puruchuco',
    caja: 'gama',
    ronda: 'puruchuco'
};
let filtrosHistorial = {
    fecha: '',
    codigo: '',
    modo: '',
    prioridad: '',
    texto: ''
};

function obtenerElemento(id) {
    return document.getElementById(id);
}

function limpiarElemento(elemento) {
    while (elemento.firstChild) {
        elemento.removeChild(elemento.firstChild);
    }
}

function safeParseJSON(value, fallback) {
    if (typeof value !== 'string' || value.trim() === '') {
        return fallback;
    }

    try {
        return JSON.parse(value);
    } catch (error) {
        console.warn('JSON invalido en localStorage:', error);
        return fallback;
    }
}

function guardarEstadoLocalStorage(clave, valor) {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
    } catch (error) {
        console.warn(`No se pudo guardar ${clave}:`, error);
    }
}

function obtenerSedeActual() {
    const sede = perfilActual?.sede;
    return SEDES_OPERACION.some(item => item.id === sede) ? sede : null;
}

function obtenerSedeMantenimientoActiva() {
    const sede = sedeActivaPorModulo.mantenimiento;
    return SEDES_OPERACION.some(item => item.id === sede) ? sede : 'puruchuco';
}

function obtenerClaveLocalPorSede(claveBase) {
    const sede = obtenerSedeActual();
    return sede ? `${claveBase}:${sede}` : claveBase;
}

function migrarDatosLocalesInicialesDeSede() {
    const sede = obtenerSedeActual();
    if (sede !== 'gama') {
        return;
    }

    [STORAGE_KEYS.history, STORAGE_KEYS.checklist].forEach(claveBase => {
        const claveSede = obtenerClaveLocalPorSede(claveBase);
        if (localStorage.getItem(claveSede) === null && localStorage.getItem(claveBase) !== null) {
            localStorage.setItem(claveSede, localStorage.getItem(claveBase));
        }
    });
}

function actualizarBotonTema() {
    const boton = obtenerElemento('toggleThemeButton');

    if (!boton) {
        return;
    }

    const oscuro = document.body.classList.contains('dark-theme');
    boton.setAttribute('aria-pressed', String(oscuro));
    boton.setAttribute('aria-label', oscuro ? 'Activar modo claro' : 'Activar modo oscuro');
    boton.title = oscuro ? 'Activar modo claro' : 'Activar modo oscuro';
}

function aplicarTemaGuardado() {
    const tema = safeParseJSON(localStorage.getItem(STORAGE_KEYS.theme), 'claro');
    document.body.classList.toggle('dark-theme', tema === 'oscuro');
    actualizarBotonTema();
}

function alternarTema() {
    const oscuro = !document.body.classList.contains('dark-theme');
    document.body.classList.toggle('dark-theme', oscuro);
    guardarEstadoLocalStorage(STORAGE_KEYS.theme, oscuro ? 'oscuro' : 'claro');
    actualizarBotonTema();
}

function actualizarEstadoSincronizacion(texto, tipo = 'info') {
    const estado = obtenerElemento('syncStatus');

    if (!estado) {
        return;
    }

    estado.textContent = texto;
    estado.dataset.status = tipo;
}

function actualizarEstadoAuth(texto, tipo = 'info') {
    const estado = obtenerElemento('authStatus');

    if (!estado) {
        return;
    }

    estado.textContent = texto;
    estado.dataset.status = tipo;
}

function actualizarBotonIngreso(disponible, texto = null) {
    const boton = obtenerElemento('authSubmit');

    if (!boton) {
        return;
    }

    boton.disabled = !disponible;
    boton.textContent = texto || (disponible ? 'Ingresar' : 'Conectando...');
}

function mostrarAppAutenticada(mostrar) {
    const authPanel = obtenerElemento('authPanel');
    const appShell = obtenerElemento('appShell');
    const bottomNav = obtenerElemento('bottomNav');

    if (authPanel) {
        authPanel.hidden = mostrar;
    }

    if (appShell) {
        appShell.hidden = !mostrar;
    }

    if (bottomNav) {
        bottomNav.hidden = !mostrar;
    }
}

function obtenerNombreUsuarioActivo() {
    return perfilActual?.apellidos_nombres || perfilActual?.nombre || sesionActual?.user?.email || 'Usuario conectado';
}

function prepararEnlaceInformeMantenimiento() {
    const enlace = obtenerElemento('openMaintenanceReport');
    if (!enlace) {
        return;
    }

    const parametros = new URLSearchParams({
        tecnico: obtenerNombreUsuarioActivo(),
        usuarioId: sesionActual?.user?.id || '',
        sede: obtenerNombreSede(obtenerSedeMantenimientoActiva()),
        sedeId: obtenerSedeMantenimientoActiva(),
        regreso: 'index.html?module=mantenimiento'
    });
    enlace.href = `informe-incidentes.html?${parametros.toString()}`;
}

function obtenerMesActual() {
    return new Date().toISOString().slice(0, 7);
}

function configurarPanelTareasMantenimiento() {
    const formulario = obtenerElemento('maintenanceTaskForm');
    const mes = obtenerElemento('maintenanceTasksMonth');
    const sede = obtenerElemento('maintenanceTaskSite');
    const fecha = obtenerElemento('maintenanceTaskDueDate');
    const subtitulo = obtenerElemento('maintenanceTasksSubtitle');

    const puedeGestionar = usuarioPuedeGestionarTareasMantenimiento();
    if (formulario) formulario.hidden = !puedeGestionar;
    const opcionRecurrente = obtenerElemento('maintenanceTaskRecurring')?.closest('label');
    if (opcionRecurrente) opcionRecurrente.hidden = !usuarioEsSuperior();
    if (mes && !mes.value) mes.value = obtenerMesActual();
    if (fecha && !fecha.value) fecha.value = `${mes?.value || obtenerMesActual()}-28`;
    if (subtitulo) {
        subtitulo.textContent = puedeGestionar
            ? 'Crea pendientes, asigna responsables y controla su revision hasta el cierre.'
            : 'Estas son las tareas que debes atender durante el mes.';
    }

    if (sede && !sede.options.length) {
        SEDES_OPERACION.forEach(item => {
            const opcion = document.createElement('option');
            opcion.value = item.id;
            opcion.textContent = item.nombre;
            sede.appendChild(opcion);
        });
        sede.value = obtenerSedeMantenimientoActiva();
    }
    if (sede) {
        const adminSede = perfilActual?.rol === 'admin';
        if (adminSede && perfilActual?.sede) sede.value = perfilActual.sede;
        sede.disabled = adminSede;
    }
    actualizarEquiposAsignacionMantenimiento();
}

function abrirAlmacenMultimedia() {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            reject(new Error('El dispositivo no ofrece almacenamiento multimedia.'));
            return;
        }
        const solicitud = window.indexedDB.open(MEDIA_VAULT_DB_NAME, MEDIA_VAULT_DB_VERSION);
        solicitud.onupgradeneeded = () => {
            const base = solicitud.result;
            if (!base.objectStoreNames.contains(MEDIA_VAULT_STORE)) {
                const almacen = base.createObjectStore(MEDIA_VAULT_STORE, { keyPath: 'key' });
                almacen.createIndex('scope', 'scope', { unique: false });
            }
        };
        solicitud.onsuccess = () => resolve(solicitud.result);
        solicitud.onerror = () => reject(solicitud.error || new Error('No se pudo abrir el respaldo multimedia.'));
    });
}

async function guardarMediaLocal(key, dataUrl, scope = 'general', extra = {}) {
    const base = await abrirAlmacenMultimedia();
    await new Promise((resolve, reject) => {
        const transaccion = base.transaction(MEDIA_VAULT_STORE, 'readwrite');
        transaccion.objectStore(MEDIA_VAULT_STORE).put({ key, scope, dataUrl, savedAt: new Date().toISOString(), ...extra });
        transaccion.oncomplete = resolve;
        transaccion.onerror = () => reject(transaccion.error || new Error('No se pudo respaldar la foto.'));
        transaccion.onabort = () => reject(transaccion.error || new Error('Se interrumpio el respaldo de la foto.'));
    });
    base.close();
}

async function leerMediaLocal(key) {
    if (!key) return null;
    const base = await abrirAlmacenMultimedia();
    const registro = await new Promise((resolve, reject) => {
        const transaccion = base.transaction(MEDIA_VAULT_STORE, 'readonly');
        const solicitud = transaccion.objectStore(MEDIA_VAULT_STORE).get(key);
        solicitud.onsuccess = () => resolve(solicitud.result || null);
        solicitud.onerror = () => reject(solicitud.error || new Error('No se pudo recuperar la foto.'));
    });
    base.close();
    return registro;
}

async function leerMediaPorScope(scope) {
    const base = await abrirAlmacenMultimedia();
    const registros = await new Promise((resolve, reject) => {
        const transaccion = base.transaction(MEDIA_VAULT_STORE, 'readonly');
        const solicitud = transaccion.objectStore(MEDIA_VAULT_STORE).index('scope').getAll(scope);
        solicitud.onsuccess = () => resolve(solicitud.result || []);
        solicitud.onerror = () => reject(solicitud.error || new Error('No se pudieron recuperar las fotos pendientes.'));
    });
    base.close();
    return registros;
}

async function eliminarMediaLocal(key) {
    if (!key) return;
    const base = await abrirAlmacenMultimedia();
    await new Promise((resolve, reject) => {
        const transaccion = base.transaction(MEDIA_VAULT_STORE, 'readwrite');
        transaccion.objectStore(MEDIA_VAULT_STORE).delete(key);
        transaccion.oncomplete = resolve;
        transaccion.onerror = () => reject(transaccion.error || new Error('No se pudo retirar la foto local.'));
    });
    base.close();
}

async function solicitarAlmacenPersistenteMultimedia() {
    try {
        if (navigator.storage?.persist) await navigator.storage.persist();
    } catch (error) {
        console.warn('El navegador no concedio almacenamiento persistente para fotos.', error);
    }
}

function actualizarEquiposAsignacionMantenimiento() {
    const selector = obtenerElemento('maintenanceTaskEquipment');
    const sede = obtenerElemento('maintenanceTaskSite')?.value || obtenerSedeMantenimientoActiva();
    if (!selector) return;

    limpiarElemento(selector);
    const general = document.createElement('option');
    general.value = '';
    general.textContent = 'Trabajo general / sin equipo';
    selector.appendChild(general);
    EQUIPOS_MANTENIMIENTO
        .filter(equipo => equipo.sede === sede && equipo.activo !== false)
        .forEach(equipo => {
            const opcion = document.createElement('option');
            opcion.value = equipo.codigo;
            opcion.textContent = `${equipo.codigo} - ${equipo.nombre}`;
            opcion.dataset.nombre = equipo.nombre;
            selector.appendChild(opcion);
        });
}

async function cargarTecnicosMantenimiento() {
    const selector = obtenerElemento('maintenanceTaskTechnician');
    if (!usuarioPuedeGestionarTareasMantenimiento() || !supabaseClient || !selector) return;

    const { data, error } = await supabaseClient
        .from('profiles')
        .select('id,nombre,email')
        .eq('rol', 'tecnico')
        .eq('activo', true)
        .order('nombre', { ascending: true });
    if (error) {
        actualizarEstadoTareasMantenimiento('No se pudo cargar la lista de tecnicos.', 'error');
        return;
    }

    tecnicosMantenimiento = Array.isArray(data) ? data : [];
    limpiarElemento(selector);
    const inicial = document.createElement('option');
    inicial.value = '';
    inicial.textContent = tecnicosMantenimiento.length ? 'Selecciona un tecnico' : 'No hay tecnicos activos';
    selector.appendChild(inicial);
    tecnicosMantenimiento.forEach(tecnico => {
        const opcion = document.createElement('option');
        opcion.value = tecnico.id;
        opcion.textContent = tecnico.nombre || tecnico.email;
        selector.appendChild(opcion);
    });
}

function actualizarEstadoTareasMantenimiento(mensaje = '', estado = 'info') {
    const salida = obtenerElemento('maintenanceTasksStatus');
    if (!salida) return;
    salida.textContent = mensaje;
    salida.dataset.status = estado;
}

async function cargarTareasMantenimiento() {
    if (!accesoMantenimientoActivo || !supabaseClient || !sesionActual?.user) return;
    const mes = obtenerElemento('maintenanceTasksMonth')?.value || obtenerMesActual();
    if (usuarioEsSuperior()) {
        await generarPreventivosAutomaticos(mes, { notificar: true });
    }
    const inicio = `${mes}-01`;
    const finFecha = new Date(`${inicio}T00:00:00`);
    finFecha.setMonth(finFecha.getMonth() + 1);
    const fin = finFecha.toISOString().slice(0, 10);

    actualizarEstadoTareasMantenimiento('Cargando tareas...', 'info');
    const { data, error } = await supabaseClient
        .from('tareas_mantenimiento')
        .select('id,titulo,descripcion,sede,equipo_codigo,equipo_nombre,prioridad,fecha_limite,asignado_a,asignado_por,estado,observacion_tecnico,iniciada_at,completada_at,created_at,plan_preventivo_id,periodo,profiles!tareas_mantenimiento_asignado_a_fkey(nombre,email)')
        .gte('fecha_limite', inicio)
        .lt('fecha_limite', fin)
        .order('fecha_limite', { ascending: true });

    if (error) {
        tareasMantenimiento = [];
        actualizarEstadoTareasMantenimiento('No se pudieron cargar las tareas mensuales.', 'error');
        console.warn('No se pudieron cargar tareas de mantenimiento:', error);
    } else {
        tareasMantenimiento = Array.isArray(data) ? data : [];
        actualizarEstadoTareasMantenimiento(`${tareasMantenimiento.length} tareas en el mes.`, 'success');
    }
    renderizarTareasMantenimiento();
    renderizarDashboardTecnico();
}

function etiquetaEstadoTarea(estado) {
    return {
        pendiente: 'Pendiente',
        en_proceso: 'En proceso',
        observado: 'Observado',
        aprobado: 'Aprobado',
        cerrado: 'Cerrado',
        completada: 'Aprobado'
    }[estado] || estado;
}

function tareaEstaFinalizada(estado) {
    return ['aprobado', 'cerrado', 'completada'].includes(estado);
}

function crearEnlaceInformeTarea(tarea) {
    const parametros = new URLSearchParams({
        tecnico: obtenerNombreUsuarioActivo(),
        usuarioId: sesionActual?.user?.id || '',
        sede: obtenerNombreSede(tarea.sede),
        sedeId: tarea.sede,
        equipo: tarea.equipo_codigo || '',
        tareaId: tarea.id,
        regreso: 'index.html?module=mantenimiento'
    });
    return `informe-incidentes.html?${parametros.toString()}`;
}

function renderizarTareasMantenimiento() {
    const contenedor = obtenerElemento('maintenanceTasksList');
    if (!contenedor) return;
    limpiarElemento(contenedor);
    if (!tareasMantenimiento.length) {
        contenedor.appendChild(crearMensajeVacio('No hay tareas asignadas para este mes.', 'inventory-empty'));
        return;
    }

    tareasMantenimiento.forEach(tarea => {
        const tarjeta = document.createElement('article');
        const cuerpo = document.createElement('div');
        const titulo = document.createElement('h5');
        const detalle = document.createElement('p');
        const meta = document.createElement('p');
        const estado = document.createElement('span');
        const acciones = document.createElement('div');
        const informe = document.createElement('a');
        const vencida = !tareaEstaFinalizada(tarea.estado) && tarea.fecha_limite < new Date().toISOString().slice(0, 10);

        tarjeta.className = 'maintenance-task-card';
        tarjeta.classList.toggle('is-overdue', vencida);
        tarjeta.classList.toggle('is-completed', tareaEstaFinalizada(tarea.estado));
        tarjeta.dataset.taskStatus = tarea.estado;
        titulo.textContent = tarea.titulo;
        detalle.textContent = tarea.descripcion || 'Sin indicaciones adicionales.';
        meta.className = 'maintenance-task-meta';
        const tecnico = tarea.profiles?.nombre || tarea.profiles?.email || 'Tecnico asignado';
        const equipo = tarea.equipo_codigo ? ` - ${tarea.equipo_codigo}` : '';
        const automatico = tarea.plan_preventivo_id ? ' - Preventivo automatico' : '';
        meta.textContent = `${obtenerNombreSede(tarea.sede)}${equipo} - ${tecnico} - Limite: ${tarea.fecha_limite} - Prioridad ${tarea.prioridad}${automatico}`;
        estado.className = 'maintenance-task-state';
        estado.textContent = vencida ? 'Vencida' : etiquetaEstadoTarea(tarea.estado);
        cuerpo.append(titulo, detalle, meta);

        informe.className = 'clear-btn';
        informe.href = crearEnlaceInformeTarea(tarea);
        informe.textContent = 'Abrir informe';
        acciones.className = 'maintenance-task-actions';
        acciones.append(estado, informe);

        if (!usuarioPuedeGestionarTareasMantenimiento() && !tareaEstaFinalizada(tarea.estado)) {
            const avanzar = document.createElement('button');
            avanzar.type = 'button';
            avanzar.className = 'finish-btn';
            avanzar.dataset.updateMaintenanceTask = tarea.id;
            if (tarea.estado === 'pendiente') {
                avanzar.dataset.taskState = 'en_proceso';
                avanzar.textContent = 'Iniciar tarea';
                acciones.appendChild(avanzar);
            }
        }
        if (usuarioPuedeGestionarTareasMantenimiento()) {
            const selectorEstado = document.createElement('select');
            selectorEstado.className = 'maintenance-task-status-select';
            selectorEstado.setAttribute('aria-label', `Estado de ${tarea.titulo}`);
            ['pendiente', 'en_proceso', 'observado', 'aprobado', 'cerrado'].forEach(valor => {
                const opcion = document.createElement('option');
                opcion.value = valor;
                opcion.textContent = etiquetaEstadoTarea(valor);
                selectorEstado.appendChild(opcion);
            });
            selectorEstado.value = tarea.estado === 'completada' ? 'aprobado' : tarea.estado;
            selectorEstado.dataset.taskStatusSelect = tarea.id;

            const actualizar = document.createElement('button');
            actualizar.type = 'button';
            actualizar.className = 'finish-btn';
            actualizar.dataset.manageMaintenanceTask = tarea.id;
            actualizar.textContent = 'Actualizar estado';
            acciones.append(selectorEstado, actualizar);
        }
        if (usuarioEsSuperior()) {
            const eliminar = document.createElement('button');
            eliminar.type = 'button';
            eliminar.className = 'clear-btn danger-action';
            eliminar.dataset.deleteMaintenanceTask = tarea.id;
            eliminar.textContent = 'Eliminar';
            acciones.appendChild(eliminar);
        }

        tarjeta.append(cuerpo, acciones);
        if (tarea.observacion_tecnico) {
            const nota = document.createElement('p');
            nota.className = 'maintenance-task-note';
            nota.textContent = `Nota del tecnico: ${tarea.observacion_tecnico}`;
            tarjeta.appendChild(nota);
        }
        contenedor.appendChild(tarjeta);
    });
}

async function guardarTareaMantenimiento(event) {
    event.preventDefault();
    if (!usuarioPuedeGestionarTareasMantenimiento() || !supabaseClient) return;
    const equipoSelect = obtenerElemento('maintenanceTaskEquipment');
    const opcionEquipo = equipoSelect?.selectedOptions?.[0];
    const payload = {
        titulo: obtenerElemento('maintenanceTaskTitle').value.trim(),
        descripcion: obtenerElemento('maintenanceTaskDescription').value.trim(),
        sede: obtenerElemento('maintenanceTaskSite').value,
        equipo_codigo: equipoSelect?.value || null,
        equipo_nombre: equipoSelect?.value ? opcionEquipo?.dataset.nombre || opcionEquipo?.textContent || '' : null,
        prioridad: obtenerElemento('maintenanceTaskPriority').value,
        fecha_limite: obtenerElemento('maintenanceTaskDueDate').value,
        asignado_a: obtenerElemento('maintenanceTaskTechnician').value,
        asignado_por: sesionActual.user.id
    };
    const recurrente = usuarioEsSuperior() && obtenerElemento('maintenanceTaskRecurring')?.checked === true;
    if (!payload.titulo || !payload.sede || !payload.fecha_limite || !payload.asignado_a) {
        actualizarEstadoTareasMantenimiento('Completa tarea, tecnico, sede y fecha limite.', 'error');
        return;
    }
    if (recurrente && !payload.equipo_codigo) {
        actualizarEstadoTareasMantenimiento('Para repetir mensualmente debes seleccionar un equipo.', 'error');
        return;
    }

    const boton = event.currentTarget.querySelector('button[type="submit"]');
    boton.disabled = true;
    actualizarEstadoTareasMantenimiento('Asignando tarea...', 'info');
    let data = null;
    let error = null;
    if (recurrente) {
        const diaMes = Math.min(28, Number(payload.fecha_limite.slice(-2)) || 28);
        const resultadoPlan = await supabaseClient.from('planes_preventivos').upsert({
            titulo: payload.titulo,
            descripcion: payload.descripcion,
            sede: payload.sede,
            equipo_codigo: payload.equipo_codigo,
            equipo_nombre: payload.equipo_nombre,
            prioridad: payload.prioridad,
            tecnico_id: payload.asignado_a,
            dia_mes: diaMes,
            activo: true,
            creado_por: sesionActual.user.id
        }, { onConflict: 'sede,equipo_codigo,tecnico_id' });
        error = resultadoPlan.error;
        if (!error) {
            const generadas = await generarPreventivosAutomaticos(payload.fecha_limite.slice(0, 7), { notificar: true });
            data = generadas[0] || { id: '' };
        }
    } else {
        const resultadoTarea = await supabaseClient.from('tareas_mantenimiento').insert(payload).select('id').single();
        data = resultadoTarea.data;
        error = resultadoTarea.error;
    }
    boton.disabled = false;
    if (error) {
        actualizarEstadoTareasMantenimiento('No se pudo asignar la tarea.', 'error');
        console.warn('No se pudo asignar tarea:', error);
        return;
    }

    if (!recurrente) {
        await enviarAlertaPushTarea(data.id, payload.asignado_a, payload.titulo, payload.fecha_limite, payload.sede);
    }
    event.currentTarget.reset();
    obtenerElemento('maintenanceTaskSite').value = obtenerSedeMantenimientoActiva();
    obtenerElemento('maintenanceTaskPriority').value = 'media';
    obtenerElemento('maintenanceTaskDueDate').value = `${obtenerElemento('maintenanceTasksMonth').value || obtenerMesActual()}-28`;
    actualizarEquiposAsignacionMantenimiento();
    actualizarEstadoTareasMantenimiento(recurrente
        ? 'Plan mensual creado y primera tarea generada.'
        : 'Tarea asignada y notificacion enviada.', 'success');
    await cargarTareasMantenimiento();
}

async function enviarAlertaPushTarea(tareaId, asignadoA, titulo, fechaLimite, sede) {
    try {
        const { error } = await supabaseClient.functions.invoke('send-code-alert', {
            body: { evento: 'tarea_mantenimiento', tareaId, asignadoA, titulo, fechaLimite, sede }
        });
        if (error) console.warn('No se pudo notificar la tarea:', error);
    } catch (error) {
        console.warn('Funcion push no disponible para tarea:', error);
    }
}

async function generarPreventivosAutomaticos(mes = obtenerMesActual(), { notificar = false } = {}) {
    if (!supabaseClient || !sesionActual?.user || !usuarioPuedeAccederMantenimiento()) return [];
    const { data, error } = await supabaseClient.rpc('generar_tareas_preventivas', {
        mes_arg: `${mes}-01`
    });
    if (error) {
        console.warn('No se pudieron generar los preventivos automaticos:', error);
        return [];
    }
    const generadas = Array.isArray(data) ? data : [];
    if (notificar && usuarioEsSuperior()) {
        for (const tarea of generadas) {
            await enviarAlertaPushTarea(tarea.id, tarea.asignado_a, tarea.titulo, tarea.fecha_limite, tarea.sede);
        }
    }
    return generadas;
}

function renderizarDashboardTecnico() {
    const panel = obtenerElemento('technicalDashboard');
    if (!panel) return;
    limpiarElemento(panel);
    const hoy = new Date().toISOString().slice(0, 10);
    const total = tareasMantenimiento.length;
    const pendientes = tareasMantenimiento.filter(item => item.estado === 'pendiente').length;
    const proceso = tareasMantenimiento.filter(item => item.estado === 'en_proceso').length;
    const observadas = tareasMantenimiento.filter(item => item.estado === 'observado').length;
    const completadas = tareasMantenimiento.filter(item => tareaEstaFinalizada(item.estado)).length;
    const vencidas = tareasMantenimiento.filter(item => !tareaEstaFinalizada(item.estado) && item.fecha_limite < hoy).length;
    const cumplimiento = total ? Math.round((completadas / total) * 100) : 0;
    panel.append(
        crearTarjetaDashboard('Asignadas', String(total), 'Tareas del mes', 'neutral'),
        crearTarjetaDashboard('Pendientes', String(pendientes), 'Aun no iniciadas', pendientes ? 'warning' : 'good'),
        crearTarjetaDashboard('En proceso', String(proceso), 'Trabajos iniciados', proceso ? 'neutral' : 'good'),
        crearTarjetaDashboard('Observadas', String(observadas), 'Requieren correccion', observadas ? 'danger' : 'good'),
        crearTarjetaDashboard('Aprobadas/cerradas', String(completadas), `${cumplimiento}% de cumplimiento`, cumplimiento >= 90 ? 'good' : 'warning'),
        crearTarjetaDashboard('Vencidas', String(vencidas), 'Requieren atencion', vencidas ? 'danger' : 'good')
    );
}

function actualizarSelectorHistorialEquipos() {
    const selector = obtenerElemento('equipmentHistorySelect');
    if (!selector) return;
    const valor = selector.value;
    limpiarElemento(selector);
    const inicial = document.createElement('option');
    inicial.value = '';
    inicial.textContent = 'Selecciona un equipo';
    selector.appendChild(inicial);
    obtenerEquiposMantenimientoSede().forEach(equipo => {
        const opcion = document.createElement('option');
        opcion.value = equipo.codigo;
        opcion.textContent = `${equipo.codigo} - ${equipo.nombre}`;
        selector.appendChild(opcion);
    });
    if ([...selector.options].some(opcion => opcion.value === valor)) selector.value = valor;
}

function renderizarHistorialEquipos() {
    const selector = obtenerElemento('equipmentHistorySelect');
    const resumen = obtenerElemento('repeatedFailuresSummary');
    const lista = obtenerElemento('equipmentHistoryList');
    if (!selector || !resumen || !lista) return;
    limpiarElemento(resumen);
    limpiarElemento(lista);

    const correctivosPorEquipo = intervencionesMantenimiento
        .filter(item => item.tipo_mantenimiento === 'Correctivo')
        .reduce((mapa, item) => {
            const codigo = item.equipo_codigo || item.equipo_nombre || 'Sin equipo';
            if (!mapa.has(codigo)) mapa.set(codigo, []);
            mapa.get(codigo).push(item);
            return mapa;
        }, new Map());
    const repetitivas = [...correctivosPorEquipo.entries()]
        .filter(([, items]) => items.length >= 2)
        .sort((a, b) => b[1].length - a[1].length);
    if (!repetitivas.length) {
        resumen.appendChild(crearMensajeVacio('No se detectan equipos con dos o mas correctivos registrados.', 'inventory-empty'));
    } else {
        repetitivas.forEach(([codigo, items]) => {
            const alerta = document.createElement('button');
            alerta.type = 'button';
            alerta.className = 'repeated-failure-item';
            alerta.dataset.historyEquipment = codigo;
            alerta.textContent = `${codigo}: ${items.length} correctivos - Ultimo: ${items[0].motivo || 'sin causa detallada'}`;
            resumen.appendChild(alerta);
        });
    }

    if (!selector.value) {
        lista.appendChild(crearMensajeVacio('Selecciona un equipo para revisar su historial completo.', 'inventory-empty'));
        return;
    }
    const registros = intervencionesMantenimiento.filter(item => item.equipo_codigo === selector.value);
    if (!registros.length) {
        lista.appendChild(crearMensajeVacio('Este equipo aun no tiene intervenciones registradas.', 'inventory-empty'));
        return;
    }
    registros.forEach(item => {
        const fila = document.createElement('article');
        const titulo = document.createElement('strong');
        const detalle = document.createElement('p');
        const fecha = new Date(item.fecha_guardado);
        fila.className = 'equipment-history-item';
        titulo.textContent = `${item.tipo_mantenimiento} - ${item.numero_informe}`;
        detalle.textContent = `${Number.isNaN(fecha.getTime()) ? item.fecha_guardado : fecha.toLocaleDateString('es-PE')} - ${item.tecnico || 'Sin tecnico'} - ${minutosAHorasTexto(item.duracion_minutos)} - ${item.motivo || 'Sin detalle de falla'}`;
        fila.append(titulo, detalle);
        lista.appendChild(fila);
    });
}

async function actualizarEstadoTareaMantenimiento(id, estado) {
    let observacion = '';
    if (['observado', 'aprobado', 'cerrado'].includes(estado)) {
        observacion = window.prompt(
            estado === 'observado' ? 'Indica que debe corregirse:' : 'Observacion de revision (opcional):',
            ''
        ) || '';
        if (estado === 'observado' && !observacion.trim()) {
            mostrarToast('La observacion es obligatoria para devolver la tarea.');
            return;
        }
    }
    const { error } = await supabaseClient.rpc('actualizar_estado_tarea_mantenimiento', {
        tarea_id: id,
        estado_nuevo: estado,
        observacion_nueva: observacion
    });
    if (error) {
        mostrarToast('No se pudo actualizar la tarea.');
        return;
    }
    if (['aprobado', 'cerrado'].includes(estado)) {
        const tarea = tareasMantenimiento.find(item => item.id === id);
        supabaseClient.functions.invoke('send-code-alert', {
            body: {
                evento: estado === 'cerrado' ? 'tarea_cerrada' : 'tarea_aprobada',
                tareaId: id,
                titulo: tarea?.titulo || 'Tarea de mantenimiento',
                sede: tarea?.sede || obtenerSedeMantenimientoActiva()
            }
        }).catch(errorPush => console.warn('No se pudo notificar la tarea completada:', errorPush));
    }
    mostrarToast(`Estado actualizado a ${etiquetaEstadoTarea(estado)}.`);
    await cargarTareasMantenimiento();
}

async function eliminarTareaMantenimiento(id) {
    if (!usuarioEsSuperior() || !window.confirm('Eliminar esta tarea asignada?')) return;
    const { error } = await supabaseClient.from('tareas_mantenimiento').delete().eq('id', id);
    if (error) {
        mostrarToast('No se pudo eliminar la tarea.');
        return;
    }
    await cargarTareasMantenimiento();
}

function aplicarModuloSolicitadoDesdeURL() {
    const modulo = new URLSearchParams(window.location.search).get('module');
    if (!modulo || !obtenerElemento(`module-${modulo}`)) {
        return;
    }
    seleccionarModulo(modulo, { desplazar: false });
    window.history.replaceState(window.history.state, '', obtenerRutaNavegacionModulo(modulo));
}

function obtenerClaveSesionMantenimiento() {
    return `accesoMantenimiento:${sesionActual?.user?.id || 'sin-usuario'}`;
}

function usuarioPuedeAccederMantenimiento() {
    return perfilActual?.activo !== false && [ROL_SUPERIOR, 'admin', 'tecnico'].includes(perfilActual?.rol);
}

function usuarioPuedeGestionarTareasMantenimiento() {
    return perfilActual?.activo !== false && [ROL_SUPERIOR, 'admin'].includes(perfilActual?.rol);
}

function usuarioPuedeGestionarInventario() {
    return usuarioEsSuperior();
}

function actualizarEstadoAccesoMantenimiento(mensaje = '', estado = 'info') {
    const salida = obtenerElemento('maintenanceAccessStatus');
    if (salida) {
        salida.textContent = mensaje;
        salida.dataset.status = estado;
    }
}

function actualizarEstadoInventario(mensaje = '', estado = 'info') {
    const salida = obtenerElemento('inventoryStatus');
    if (salida) {
        salida.textContent = mensaje;
        salida.dataset.status = estado;
    }
}

function crearTarjetaKpiMantenimiento(etiqueta, valor, detalle, estado = 'neutral') {
    const tarjeta = document.createElement('article');
    const valorElemento = document.createElement('strong');
    const etiquetaElemento = document.createElement('span');
    const detalleElemento = document.createElement('small');

    tarjeta.className = `maintenance-kpi-card kpi-${estado}`;
    valorElemento.textContent = valor;
    etiquetaElemento.textContent = etiqueta;
    detalleElemento.textContent = detalle;
    tarjeta.append(valorElemento, etiquetaElemento, detalleElemento);
    return tarjeta;
}

function calcularKpisInventario() {
    const total = inventarioRepuestos.length;
    const conMinimo = inventarioRepuestos.filter(item => Number(item.stock_minimo || 0) > 0);
    const stockBajo = inventarioRepuestos.filter(item =>
        Number(item.stock || 0) <= Number(item.stock_minimo || 0)
        && Number(item.stock_minimo || 0) > 0
    );
    const stockCritico = inventarioRepuestos.filter(item =>
        Number(item.stock || 0) === 0
        || (
            Number(item.stock_minimo || 0) > 0
            && Number(item.stock || 0) <= Number(item.stock_minimo || 0) * 0.5
        )
    );
    const sinUbicacion = inventarioRepuestos.filter(item => !String(item.ubicacion || '').trim());
    const ahora = Date.now();
    const actualizados7Dias = inventarioRepuestos.filter(item => {
        const fecha = item.updated_at ? new Date(item.updated_at).getTime() : 0;
        return fecha && ahora - fecha <= 7 * 24 * 60 * 60 * 1000;
    });
    const salud = total ? Math.max(0, Math.round(((total - stockBajo.length) / total) * 100)) : 0;
    const categorias = inventarioRepuestos.reduce((mapa, item) => {
        const categoria = String(item.categoria || 'General').trim() || 'General';
        const actual = mapa.get(categoria) || { total: 0, bajo: 0 };
        actual.total += 1;
        if (stockBajo.includes(item)) {
            actual.bajo += 1;
        }
        mapa.set(categoria, actual);
        return mapa;
    }, new Map());

    return {
        total,
        conMinimo: conMinimo.length,
        stockBajo: stockBajo.length,
        stockCritico: stockCritico.length,
        sinUbicacion: sinUbicacion.length,
        actualizados7Dias: actualizados7Dias.length,
        salud,
        categorias: [...categorias.entries()]
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 4)
    };
}

function obtenerEquiposMantenimientoSede(sede = obtenerSedeMantenimientoActiva()) {
    return EQUIPOS_MANTENIMIENTO.filter(item => item.sede === sede && item.tipo !== 'Infraestructura' && item.activo !== false);
}

function minutosAHorasTexto(minutos) {
    const total = Number(minutos || 0);
    const horas = Math.floor(total / 60);
    const resto = Math.round(total % 60);
    if (!horas) {
        return `${resto} min`;
    }
    return resto ? `${horas} h ${resto} min` : `${horas} h`;
}

function esTipoPreventivo(tipo) {
    return ['Preventivo', 'PreventivoMensual'].includes(tipo);
}

function calcularKpisIntervenciones() {
    const registros = intervencionesMantenimiento.filter(item => Number(item.duracion_minutos || 0) >= 0);
    const registrosConParada = registros.filter(item => item.genera_parada !== false);
    const trabajosSinParada = registros.filter(item => item.genera_parada === false);
    const preventivos = registros.filter(item => esTipoPreventivo(item.tipo_mantenimiento));
    const correctivos = registros.filter(item => item.tipo_mantenimiento === 'Correctivo');
    const totalMinutos = registrosConParada.reduce((sum, item) => sum + Number(item.duracion_minutos || 0), 0);
    const correctivoMinutos = correctivos
        .filter(item => item.genera_parada !== false)
        .reduce((sum, item) => sum + Number(item.duracion_minutos || 0), 0);
    const promedio = registrosConParada.length ? Math.round(totalMinutos / registrosConParada.length) : 0;
    const preventivosEnTiempo = preventivos.filter(item => {
        const esperado = Number(item.preventivo_estimado_minutos || 120);
        return Number(item.duracion_minutos || 0) <= esperado;
    });
    const equiposSede = obtenerEquiposMantenimientoSede();
    const equiposIntervenidos = new Set(registros.map(item => String(item.equipo_codigo || '').toUpperCase()).filter(Boolean));
    const cobertura = equiposSede.length
        ? Math.round((equiposSede.filter(item => equiposIntervenidos.has(item.codigo)).length / equiposSede.length) * 100)
        : 0;
    const mayorParada = [...registrosConParada].sort((a, b) => Number(b.duracion_minutos || 0) - Number(a.duracion_minutos || 0))[0];

    return {
        total: registros.length,
        preventivos: preventivos.length,
        correctivos: correctivos.length,
        trabajosSinParada: trabajosSinParada.length,
        totalMinutos,
        correctivoMinutos,
        promedio,
        preventivoCumplimiento: preventivos.length ? Math.round((preventivosEnTiempo.length / preventivos.length) * 100) : 0,
        cobertura,
        equiposSede: equiposSede.length,
        mayorParada
    };
}

function obtenerMesGerencialActual() {
    const campo = obtenerElemento('managementMonth');
    if (campo?.value) {
        return campo.value;
    }
    return new Date().toISOString().slice(0, 7);
}

function estaEnMes(fechaISO, mesYYYYMM = obtenerMesGerencialActual()) {
    if (!fechaISO || !mesYYYYMM) {
        return false;
    }
    const fecha = new Date(fechaISO);
    return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 7) === mesYYYYMM;
}

function obtenerIntervencionesMes(mesYYYYMM = obtenerMesGerencialActual()) {
    return intervencionesMantenimiento.filter(item => estaEnMes(item.fecha_guardado, mesYYYYMM));
}

function calcularDashboardGerencial() {
    const registros = obtenerIntervencionesMes();
    const conParada = registros.filter(item => item.genera_parada !== false);
    const preventivos = registros.filter(item => esTipoPreventivo(item.tipo_mantenimiento));
    const correctivos = registros.filter(item => item.tipo_mantenimiento === 'Correctivo');
    const totalParada = conParada.reduce((sum, item) => sum + Number(item.duracion_minutos || 0), 0);
    const equiposCorrectivos = correctivos.reduce((mapa, item) => {
        const key = item.equipo_codigo || item.equipo_nombre || 'Sin equipo';
        mapa.set(key, (mapa.get(key) || 0) + 1);
        return mapa;
    }, new Map());
    const equipoMasFallas = [...equiposCorrectivos.entries()].sort((a, b) => b[1] - a[1])[0];
    const pendientesPreventivos = mantenimientoProgramado.filter(item => {
        const proximo = new Date(`${item.proximo_preventivo}T00:00:00`);
        return !Number.isNaN(proximo.getTime()) && proximo <= new Date();
    });

    return {
        registros,
        preventivos,
        correctivos,
        totalParada,
        promedioParada: conParada.length ? Math.round(totalParada / conParada.length) : 0,
        equipoMasFallas,
        stockBajo: calcularKpisInventario().stockBajo,
        pendientesPreventivos
    };
}

function crearTarjetaDashboard(titulo, valor, detalle, estado = 'neutral') {
    const tarjeta = crearTarjetaKpiMantenimiento(titulo, valor, detalle, estado);
    tarjeta.classList.add('management-card');
    return tarjeta;
}

function renderizarDashboardGerencial() {
    const panel = obtenerElemento('managementDashboardPanel');
    const grid = obtenerElemento('managementDashboardGrid');
    const agenda = obtenerElemento('preventiveSchedulePanel');
    const campoMes = obtenerElemento('managementMonth');
    if (!grid || !agenda) {
        return;
    }

    if (campoMes && !campoMes.value) {
        campoMes.value = obtenerMesGerencialActual();
    }

    limpiarElemento(grid);
    limpiarElemento(agenda);

    if (!accesoMantenimientoActivo) {
        grid.appendChild(crearMensajeVacio('Ingresa al area de mantenimiento para ver el dashboard.', 'inventory-empty'));
        return;
    }

    const datos = calcularDashboardGerencial();
    grid.append(
        crearTarjetaDashboard('Informes del mes', String(datos.registros.length), obtenerNombreSede(obtenerSedeMantenimientoActiva()), 'neutral'),
        crearTarjetaDashboard('Preventivos', String(datos.preventivos.length), 'Intervenciones preventivas registradas', datos.preventivos.length ? 'good' : 'warning'),
        crearTarjetaDashboard('Correctivos', String(datos.correctivos.length), 'Eventos que requieren analisis de causa', datos.correctivos.length ? 'warning' : 'good'),
        crearTarjetaDashboard('Parada total', minutosAHorasTexto(datos.totalParada), `Promedio ${minutosAHorasTexto(datos.promedioParada)}`, datos.totalParada ? 'warning' : 'good'),
        crearTarjetaDashboard('Equipo recurrente', datos.equipoMasFallas?.[0] || 'Sin recurrencia', datos.equipoMasFallas ? `${datos.equipoMasFallas[1]} correctivo(s)` : 'Sin fallas repetidas', datos.equipoMasFallas ? 'danger' : 'good'),
        crearTarjetaDashboard('Stock bajo', String(datos.stockBajo), 'Repuestos por reponer', datos.stockBajo ? 'danger' : 'good'),
        crearTarjetaDashboard('Preventivos vencidos', String(datos.pendientesPreventivos.length), 'Equipos pendientes o por vencer', datos.pendientesPreventivos.length ? 'danger' : 'good')
    );

    const titulo = document.createElement('strong');
    const lista = document.createElement('div');
    titulo.textContent = 'Programacion preventiva';
    lista.className = 'preventive-schedule-list';

    const programados = mantenimientoProgramado
        .slice()
        .sort((a, b) => String(a.proximo_preventivo).localeCompare(String(b.proximo_preventivo)))
        .slice(0, 8);

    if (!programados.length) {
        lista.appendChild(crearMensajeVacio('Aun no hay preventivos programados para esta sede.', 'inventory-empty'));
    } else {
        programados.forEach(item => {
            const fila = document.createElement('article');
            const fecha = document.createElement('time');
            const datosEquipo = document.createElement('div');
            const codigo = document.createElement('strong');
            const tipo = document.createElement('small');
            const estado = document.createElement('span');
            const proximo = new Date(`${item.proximo_preventivo}T00:00:00`);
            const vencido = !Number.isNaN(proximo.getTime()) && proximo < new Date(new Date().toDateString());

            fila.className = 'preventive-schedule-item';
            fila.classList.toggle('is-overdue', vencido);
            fecha.dateTime = item.proximo_preventivo;
            fecha.textContent = item.proximo_preventivo || '-';
            codigo.textContent = item.equipo_codigo || item.equipo_nombre;
            tipo.textContent = item.equipo_tipo || 'Equipo';
            datosEquipo.append(codigo, tipo);
            estado.textContent = vencido ? 'Vencido' : item.estado || 'Pendiente';
            fila.append(fecha, datosEquipo, estado);
            lista.appendChild(fila);
        });
    }
    agenda.append(titulo, lista);

    if (!panel.hidden) {
        panel.setAttribute('aria-busy', 'false');
    }
}

function establecerDashboardGerencial(abierto, { enfocar = false } = {}) {
    const panel = obtenerElemento('managementDashboardPanel');
    const boton = obtenerElemento('toggleManagementDashboard');
    if (!panel || !boton) {
        return;
    }

    panel.hidden = !abierto;
    boton.setAttribute('aria-expanded', String(abierto));
    boton.textContent = abierto ? 'Ocultar dashboard' : 'Dashboard';
    if (abierto) {
        renderizarDashboardGerencial();
        if (enfocar) {
            panel.focus({ preventScroll: true });
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } else if (enfocar) {
        boton.focus();
    }
}

function escaparCsv(valor) {
    const texto = String(valor ?? '');
    return `"${texto.replace(/"/g, '""')}"`;
}

function exportarMantenimientoMensual() {
    if (!accesoMantenimientoActivo) {
        mostrarToast('Ingresa al area de mantenimiento para exportar.');
        return;
    }

    const mes = obtenerMesGerencialActual();
    const registros = obtenerIntervencionesMes(mes);
    if (!registros.length) {
        mostrarToast('No hay informes de mantenimiento para exportar en ese mes.');
        return;
    }

    const cabeceras = [
        'Sede',
        'Mes',
        'Numero informe',
        'Fecha',
        'Equipo',
        'Tipo',
        'Prioridad',
        'Resultado',
        'Tecnico',
        'Supervisor',
        'Duracion minutos',
        'Genera parada',
        'Repuestos'
    ];
    const filas = registros.map(item => [
        obtenerNombreSede(item.sede || obtenerSedeMantenimientoActiva()),
        mes,
        item.numero_informe,
        item.fecha_guardado,
        `${item.equipo_codigo || ''} ${item.equipo_nombre || ''}`.trim(),
        item.tipo_mantenimiento,
        item.prioridad,
        item.resultado_final,
        item.tecnico,
        item.supervisor,
        item.duracion_minutos,
        item.genera_parada === false ? 'No' : 'Si',
        Array.isArray(item.repuestos_usados)
            ? item.repuestos_usados.map(rep => `${rep.codigo || rep.nombre} x ${rep.cantidad}`).join('; ')
            : ''
    ]);
    const contenido = [cabeceras, ...filas]
        .map(fila => fila.map(escaparCsv).join(','))
        .join('\r\n');
    const blob = new Blob([`\ufeff${contenido}`], { type: 'text/csv;charset=utf-8' });
    const enlace = document.createElement('a');
    const url = URL.createObjectURL(blob);
    enlace.href = url;
    enlace.download = `mantenimiento-${obtenerSedeMantenimientoActiva()}-${mes}.csv`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
    mostrarToast('Exportacion mensual generada.');
}

function renderizarKpisMantenimiento() {
    const grid = obtenerElemento('maintenanceKpiGrid');
    const categorias = obtenerElemento('maintenanceKpiCategories');
    const actualizado = obtenerElemento('maintenanceKpiUpdated');
    const tituloKpi = obtenerElemento('maintenanceKpiTitle');
    const nombreSede = obtenerNombreSede(obtenerSedeMantenimientoActiva());

    if (!grid || !categorias) {
        return;
    }

    if (tituloKpi) {
        tituloKpi.textContent = `KPIs de mantenimiento - ${nombreSede}`;
    }

    limpiarElemento(grid);
    limpiarElemento(categorias);

    if (!accesoMantenimientoActivo) {
        if (actualizado) {
            actualizado.textContent = `Acceso pendiente - ${nombreSede}`;
        }
        grid.appendChild(crearMensajeVacio('Ingresa al area de mantenimiento para ver los KPIs.', 'inventory-empty'));
        return;
    }

    const inventario = calcularKpisInventario();
    const intervenciones = calcularKpisIntervenciones();
    const estadoSalud = inventario.salud >= 85 ? 'good' : inventario.salud >= 60 ? 'warning' : 'danger';
    const estadoBajo = inventario.stockBajo ? 'danger' : 'good';
    const estadoCritico = inventario.stockCritico ? 'danger' : 'good';
    const estadoUbicacion = inventario.sinUbicacion ? 'warning' : 'good';
    const estadoPreventivo = !intervenciones.preventivos || intervenciones.preventivoCumplimiento >= 90 ? 'good' : intervenciones.preventivoCumplimiento >= 70 ? 'warning' : 'danger';

    grid.append(
        crearTarjetaKpiMantenimiento('Horas de parada', minutosAHorasTexto(intervenciones.totalMinutos), `${intervenciones.total} intervenciones registradas`, intervenciones.totalMinutos ? 'warning' : 'neutral'),
        crearTarjetaKpiMantenimiento('Correctivos', String(intervenciones.correctivos), `${minutosAHorasTexto(intervenciones.correctivoMinutos)} de parada correctiva`, intervenciones.correctivos ? 'danger' : 'good'),
        crearTarjetaKpiMantenimiento('Trabajos sin parada', String(intervenciones.trabajosSinParada), 'Mejoras e instalaciones sin afectar equipos', 'good'),
        crearTarjetaKpiMantenimiento('Preventivos en tiempo', intervenciones.preventivos ? `${intervenciones.preventivoCumplimiento}%` : '0%', `${intervenciones.preventivos} preventivos contra 2 h esperadas`, estadoPreventivo),
        crearTarjetaKpiMantenimiento('Promedio de atencion', minutosAHorasTexto(intervenciones.promedio), 'Duracion promedio por informe', intervenciones.promedio > 120 ? 'warning' : 'neutral'),
        crearTarjetaKpiMantenimiento('Cobertura equipos', `${intervenciones.cobertura}%`, `${intervenciones.equiposSede} equipos catalogados en sede`, intervenciones.cobertura >= 80 ? 'good' : intervenciones.cobertura ? 'warning' : 'neutral'),
        crearTarjetaKpiMantenimiento('Salud de stock', `${inventario.salud}%`, `${inventario.total - inventario.stockBajo} de ${inventario.total} repuestos sobre minimo`, estadoSalud),
        crearTarjetaKpiMantenimiento('Repuestos registrados', String(inventario.total), `${inventario.conMinimo} con stock minimo definido`, 'neutral'),
        crearTarjetaKpiMantenimiento('Stock bajo', String(inventario.stockBajo), 'Requieren reposicion o revision', estadoBajo),
        crearTarjetaKpiMantenimiento('Criticos', String(inventario.stockCritico), 'Sin stock o al 50% del minimo', estadoCritico),
        crearTarjetaKpiMantenimiento('Sin ubicacion', String(inventario.sinUbicacion), 'Pendientes de ordenar en almacen', estadoUbicacion),
        crearTarjetaKpiMantenimiento('Actualizados 7 dias', String(inventario.actualizados7Dias), 'Movimientos recientes de inventario', 'neutral')
    );

    if (actualizado) {
        actualizado.textContent = inventario.total || intervenciones.total
            ? `${nombreSede} - Actualizado: ${new Date().toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}`
            : `${nombreSede} - Sin registros de mantenimiento`;
    }

    if (!inventario.categorias.length && !intervenciones.mayorParada) {
        categorias.appendChild(crearMensajeVacio('Aun no hay categorias para mostrar.', 'inventory-empty'));
        return;
    }

    const titulo = document.createElement('strong');
    const lista = document.createElement('div');
    titulo.textContent = 'Resumen operativo';
    lista.className = 'maintenance-kpi-category-list';
    if (intervenciones.mayorParada) {
        const item = document.createElement('span');
        item.textContent = `Mayor parada: ${intervenciones.mayorParada.equipo_codigo} (${minutosAHorasTexto(intervenciones.mayorParada.duracion_minutos)})`;
        lista.appendChild(item);
    }
    inventario.categorias.forEach(([nombre, datos]) => {
        const item = document.createElement('span');
        item.textContent = `${nombre}: ${datos.total} repuestos${datos.bajo ? `, ${datos.bajo} en bajo stock` : ''}`;
        lista.appendChild(item);
    });
    categorias.append(titulo, lista);
}

function establecerPanelKpisMantenimiento(abierto, { enfocar = false } = {}) {
    const panel = obtenerElemento('maintenanceKpiPanel');
    const boton = obtenerElemento('toggleMaintenanceKpis');
    if (!panel || !boton) {
        return;
    }

    panel.hidden = !abierto;
    boton.setAttribute('aria-expanded', String(abierto));
    boton.textContent = abierto ? 'Ocultar KPIs' : 'Ver KPIs';
    if (abierto) {
        renderizarKpisMantenimiento();
        if (enfocar) {
            panel.focus({ preventScroll: true });
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } else if (enfocar) {
        boton.focus();
    }
}

function actualizarAreaMantenimientoUI() {
    const contenedorPrivado = obtenerElemento('maintenancePrivateShell');
    const acceso = obtenerElemento('maintenanceAccessGate');
    const contenido = obtenerElemento('maintenancePrivateContent');
    const formularioInventario = obtenerElemento('inventoryForm');
    const panelInventario = obtenerElemento('inventoryPanel');
    const sede = obtenerElemento('maintenanceSiteLabel');
    const controlesGerenciales = [
        obtenerElemento('toggleManagementDashboard'),
        obtenerElemento('exportMonthlyMaintenance'),
        obtenerElemento('toggleMaintenanceKpis')
    ];
    const centroControl = obtenerElemento('maintenanceControlCenter');
    const botonTareas = obtenerElemento('toggleMaintenanceTasks');
    const panelTareas = obtenerElemento('maintenanceTasksPanel');
    const accionInforme = obtenerElemento('openMaintenanceReport')?.closest('.maintenance-report-action');

    const autorizado = usuarioPuedeAccederMantenimiento();
    accesoMantenimientoActivo = autorizado;

    if (contenedorPrivado) {
        contenedorPrivado.hidden = !autorizado;
    }
    if (acceso) {
        acceso.hidden = true;
    }
    if (contenido) {
        contenido.hidden = !accesoMantenimientoActivo;
    }
    if (formularioInventario) {
        formularioInventario.hidden = !usuarioPuedeGestionarInventario();
    }
    if (panelInventario) {
        panelInventario.hidden = true;
    }
    controlesGerenciales.forEach(control => {
        if (control) control.hidden = true;
    });
    if (centroControl) {
        centroControl.href = `mantenimiento-control.html?sede=${encodeURIComponent(obtenerSedeMantenimientoActiva())}`;
        centroControl.hidden = perfilActual?.rol === 'admin';
    }
    if (botonTareas) {
        botonTareas.textContent = perfilActual?.rol === 'tecnico' ? 'Mis tareas' : 'Tareas y pendientes';
        botonTareas.hidden = !autorizado;
    }
    if (panelTareas && perfilActual?.rol === 'admin') {
        panelTareas.hidden = true;
        botonTareas?.setAttribute('aria-expanded', 'false');
    }
    if (accionInforme) {
        accionInforme.hidden = perfilActual?.rol === 'admin';
    }
    if (sede) {
        sede.textContent = `Area de mantenimiento: ${obtenerNombreSede(obtenerSedeMantenimientoActiva())}`;
    }
    configurarPanelTareasMantenimiento();
    renderizarKpisMantenimiento();
    renderizarDashboardGerencial();
}

async function validarAccesoMantenimiento(event) {
    event.preventDefault();
    const campo = obtenerElemento('maintenanceAccessPassword');
    const boton = event.currentTarget.querySelector('button[type="submit"]');
    const clave = campo?.value || '';

    if (!clave || !supabaseClient || !sesionActual?.user) {
        actualizarEstadoAccesoMantenimiento('Ingresa la contrasena del area.', 'error');
        return;
    }

    if (boton) {
        boton.disabled = true;
        boton.textContent = 'Verificando...';
    }
    actualizarEstadoAccesoMantenimiento('Verificando acceso...', 'info');

    const { data, error } = await supabaseClient.rpc('validar_acceso_mantenimiento', { clave_ingresada: clave });

    if (boton) {
        boton.disabled = false;
        boton.textContent = 'Ingresar';
    }

    if (error) {
        console.warn('No se pudo validar el acceso de mantenimiento:', error);
        actualizarEstadoAccesoMantenimiento('No se pudo verificar la contrasena. Intenta nuevamente.', 'error');
        return;
    }

    if (!data) {
        actualizarEstadoAccesoMantenimiento('Contrasena incorrecta.', 'error');
        campo?.select();
        return;
    }

    accesoMantenimientoActivo = true;
    try {
        sessionStorage.setItem(obtenerClaveSesionMantenimiento(), '1');
        sessionStorage.setItem(MAINTENANCE_ACCESS_SESSION_KEY, '1');
    } catch (errorSesion) {
        console.warn('No se pudo conservar el acceso de mantenimiento:', errorSesion);
    }
    if (campo) {
        campo.value = '';
    }
    actualizarEstadoAccesoMantenimiento('', 'success');
    actualizarAreaMantenimientoUI();
    prepararEnlaceInformeMantenimiento();
    await Promise.all([
        cargarInventarioRepuestos(),
        cargarIntervencionesMantenimiento(),
        cargarMovimientosInventario(),
        cargarMantenimientoProgramado(),
        cargarTareasMantenimiento(),
        cargarTecnicosMantenimiento()
    ]);
    suscribirInventarioRepuestos();
    suscribirIntervencionesMantenimiento();
    suscribirMantenimientoProgramado();
    suscribirTareasMantenimiento();
}

function restaurarAccesoMantenimiento() {
    accesoMantenimientoActivo = usuarioPuedeAccederMantenimiento();
    actualizarAreaMantenimientoUI();
    if (accesoMantenimientoActivo) {
        cargarInventarioRepuestos();
        cargarIntervencionesMantenimiento();
        cargarMovimientosInventario();
        cargarMantenimientoProgramado();
        cargarTareasMantenimiento();
        cargarTecnicosMantenimiento();
        suscribirInventarioRepuestos();
        suscribirIntervencionesMantenimiento();
        suscribirMantenimientoProgramado();
        suscribirTareasMantenimiento();
    }
}

function bloquearAreaMantenimiento() {
    if (usuarioPuedeAccederMantenimiento()) {
        mostrarToast('El acceso al area tecnica depende de tu rol de usuario.');
        return;
    }
    accesoMantenimientoActivo = false;
    inventarioRepuestos = [];
    try {
        sessionStorage.removeItem(obtenerClaveSesionMantenimiento());
        sessionStorage.removeItem(MAINTENANCE_ACCESS_SESSION_KEY);
    } catch (error) {
        console.warn('No se pudo cerrar el acceso de mantenimiento:', error);
    }
    if (canalInventario && supabaseClient) {
        supabaseClient.removeChannel(canalInventario);
        canalInventario = null;
    }
    if (canalIntervencionesMantenimiento && supabaseClient) {
        supabaseClient.removeChannel(canalIntervencionesMantenimiento);
        canalIntervencionesMantenimiento = null;
    }
    if (canalMantenimientoProgramado && supabaseClient) {
        supabaseClient.removeChannel(canalMantenimientoProgramado);
        canalMantenimientoProgramado = null;
    }
    if (canalTareasMantenimiento && supabaseClient) {
        supabaseClient.removeChannel(canalTareasMantenimiento);
        canalTareasMantenimiento = null;
    }
    actualizarAreaMantenimientoUI();
    renderizarInventarioRepuestos();
    renderizarKpisMantenimiento();
    obtenerElemento('maintenanceAccessPassword')?.focus();
}

async function cargarInventarioRepuestos() {
    if (!accesoMantenimientoActivo || !supabaseClient || !sesionActual?.user) {
        return;
    }
    if (!usuarioEsSuperior()) {
        inventarioRepuestos = [];
        return;
    }

    actualizarEstadoInventario('Cargando inventario...', 'info');
    const { data, error } = await supabaseClient
        .from('inventario_repuestos')
        .select('id,sede,codigo,nombre,categoria,stock,stock_minimo,unidad,ubicacion,updated_at')
        .eq('sede', obtenerSedeMantenimientoActiva())
        .order('nombre', { ascending: true });

    if (error) {
        console.warn('No se pudo cargar el inventario:', error);
        actualizarEstadoInventario('No se pudo cargar el inventario de la sede.', 'error');
        return;
    }

    inventarioRepuestos = Array.isArray(data) ? data : [];
    actualizarEstadoInventario(`${inventarioRepuestos.length} repuestos registrados.`, 'success');
    renderizarKpisMantenimiento();
    renderizarDashboardGerencial();
    renderizarInventarioRepuestos();
}

async function cargarIntervencionesMantenimiento() {
    if (!accesoMantenimientoActivo || !supabaseClient || !sesionActual?.user) {
        return;
    }

    const locales = safeParseJSON(localStorage.getItem(STORAGE_KEYS.maintenanceReports), [])
        .filter(item => item?.sede === obtenerSedeMantenimientoActiva());
    const { data, error } = await supabaseClient
        .from('intervenciones_mantenimiento')
        .select('id,numero_informe,sede,equipo_codigo,equipo_nombre,equipo_tipo,tipo_mantenimiento,prioridad,estado_inicial,resultado_final,motivo,solucion,tecnico,supervisor,hora_inicio,hora_final,duracion_minutos,preventivo_estimado_minutos,genera_parada,repuestos_usados,fecha_guardado')
        .eq('sede', obtenerSedeMantenimientoActiva())
        .order('fecha_guardado', { ascending: false })
        .limit(250);

    if (error) {
        intervencionesMantenimiento = locales;
        console.warn('No se pudieron cargar intervenciones de mantenimiento:', error);
        renderizarKpisMantenimiento();
        actualizarSelectorHistorialEquipos();
        renderizarHistorialEquipos();
        return;
    }

    const remotas = Array.isArray(data) ? data : [];
    const remotasPorInforme = new Set(remotas.map(item => item.numero_informe));
    intervencionesMantenimiento = [
        ...remotas,
        ...locales.filter(item => !remotasPorInforme.has(item.numero_informe))
    ];
    calcularProgramacionPreventivaBase();
    renderizarKpisMantenimiento();
    renderizarDashboardGerencial();
    actualizarSelectorHistorialEquipos();
    renderizarHistorialEquipos();
}

async function cargarMovimientosInventario() {
    if (!accesoMantenimientoActivo || !supabaseClient || !sesionActual?.user) {
        return;
    }
    if (!usuarioEsSuperior()) {
        movimientosInventario = [];
        return;
    }

    const { data, error } = await supabaseClient
        .from('inventario_movimientos')
        .select('id,sede,repuesto_codigo,repuesto_nombre,tipo,cantidad,unidad,numero_informe,observacion,created_at')
        .eq('sede', obtenerSedeMantenimientoActiva())
        .order('created_at', { ascending: false })
        .limit(300);

    if (error) {
        console.warn('No se pudieron cargar movimientos de inventario:', error);
        movimientosInventario = [];
        return;
    }

    movimientosInventario = Array.isArray(data) ? data : [];
    renderizarDashboardGerencial();
}

function calcularProgramacionPreventivaBase() {
    const hoy = new Date();
    const equipos = obtenerEquiposMantenimientoSede();
    const preventivos = intervencionesMantenimiento
        .filter(item => esTipoPreventivo(item.tipo_mantenimiento))
        .slice()
        .sort((a, b) => new Date(b.fecha_guardado) - new Date(a.fecha_guardado));

    mantenimientoProgramado = equipos.map(equipo => {
        const ultimo = preventivos.find(item => String(item.equipo_codigo || '').toUpperCase() === equipo.codigo);
        const base = ultimo?.fecha_guardado ? new Date(ultimo.fecha_guardado) : new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const proximo = new Date(base);
        proximo.setDate(proximo.getDate() + (ultimo ? 30 : 0));
        const proximoTexto = proximo.toISOString().slice(0, 10);
        return {
            sede: equipo.sede,
            equipo_codigo: equipo.codigo,
            equipo_nombre: equipo.nombre,
            equipo_tipo: equipo.tipo,
            frecuencia_dias: 30,
            ultimo_preventivo: ultimo?.fecha_guardado || '',
            proximo_preventivo: proximoTexto,
            estado: proximo < new Date(hoy.toDateString()) ? 'vencido' : 'pendiente'
        };
    });
}

async function cargarMantenimientoProgramado() {
    calcularProgramacionPreventivaBase();

    if (!accesoMantenimientoActivo || !supabaseClient || !sesionActual?.user) {
        renderizarDashboardGerencial();
        return;
    }

    const { data, error } = await supabaseClient
        .from('mantenimiento_programado')
        .select('id,sede,equipo_codigo,equipo_nombre,equipo_tipo,frecuencia_dias,ultimo_preventivo,proximo_preventivo,estado,observaciones')
        .eq('sede', obtenerSedeMantenimientoActiva())
        .order('proximo_preventivo', { ascending: true });

    if (error) {
        console.warn('No se pudo cargar mantenimiento programado:', error);
        renderizarDashboardGerencial();
        return;
    }

    if (Array.isArray(data) && data.length) {
        const remotos = new Map(data.map(item => [item.equipo_codigo, item]));
        mantenimientoProgramado = mantenimientoProgramado.map(item => remotos.get(item.equipo_codigo) || item);
    }
    renderizarDashboardGerencial();
}

function renderizarInventarioRepuestos() {
    const contenedor = obtenerElemento('inventoryList');
    if (!contenedor) {
        return;
    }

    limpiarElemento(contenedor);
    const texto = obtenerElemento('inventorySearch')?.value.trim().toLowerCase() || '';
    const visibles = inventarioRepuestos.filter(item => (
        [item.codigo, item.nombre, item.categoria, item.ubicacion]
            .some(valor => String(valor || '').toLowerCase().includes(texto))
    ));

    if (!visibles.length) {
        contenedor.appendChild(crearMensajeVacio(
            texto ? 'No hay repuestos que coincidan con la busqueda.' : 'Aun no hay repuestos registrados para esta sede.',
            'inventory-empty'
        ));
        return;
    }

    visibles.forEach(item => {
        const tarjeta = document.createElement('article');
        const datos = document.createElement('div');
        const nombre = document.createElement('strong');
        const detalle = document.createElement('small');
        const stock = document.createElement('div');
        const stockValor = document.createElement('span');
        const stockDetalle = document.createElement('small');
        const ubicacion = document.createElement('div');
        const ubicacionTitulo = document.createElement('span');
        const ubicacionDetalle = document.createElement('small');

        tarjeta.className = 'inventory-item';
        nombre.textContent = item.nombre;
        detalle.textContent = `${item.codigo} - ${item.categoria || 'General'}`;
        datos.append(nombre, detalle);

        stockValor.className = 'inventory-stock';
        stockValor.classList.toggle('is-low', Number(item.stock) <= Number(item.stock_minimo));
        stockValor.textContent = `${item.stock} ${item.unidad || 'unidad'}`;
        stockDetalle.textContent = `Minimo: ${item.stock_minimo}`;
        stock.append(stockValor, stockDetalle);

        ubicacionTitulo.textContent = 'Ubicacion';
        ubicacionDetalle.textContent = item.ubicacion || 'Sin indicar';
        ubicacion.append(ubicacionTitulo, ubicacionDetalle);
        tarjeta.append(datos, stock, ubicacion);

        if (usuarioPuedeGestionarInventario()) {
            const eliminar = document.createElement('button');
            eliminar.type = 'button';
            eliminar.className = 'clear-btn';
            eliminar.dataset.deleteInventory = item.id;
            eliminar.textContent = 'Eliminar';
            eliminar.setAttribute('aria-label', `Eliminar ${item.nombre}`);
            tarjeta.appendChild(eliminar);
        }

        contenedor.appendChild(tarjeta);
    });
}

async function guardarRepuestoInventario(event) {
    event.preventDefault();
    if (!accesoMantenimientoActivo || !usuarioPuedeGestionarInventario()) {
        actualizarEstadoInventario('No tienes permisos para modificar el inventario.', 'error');
        return;
    }

    const payload = {
        sede: obtenerSedeMantenimientoActiva(),
        codigo: obtenerElemento('inventoryCode').value.trim().toUpperCase(),
        nombre: obtenerElemento('inventoryName').value.trim(),
        categoria: obtenerElemento('inventoryCategory').value.trim() || 'General',
        stock: Number(obtenerElemento('inventoryStock').value),
        stock_minimo: Number(obtenerElemento('inventoryMinimum').value),
        unidad: obtenerElemento('inventoryUnit').value.trim() || 'unidad',
        ubicacion: obtenerElemento('inventoryLocation').value.trim(),
        actualizado_por: sesionActual.user.id
    };

    if (!payload.codigo || !payload.nombre || !Number.isFinite(payload.stock) || payload.stock < 0) {
        actualizarEstadoInventario('Completa codigo, repuesto y stock valido.', 'error');
        return;
    }

    actualizarEstadoInventario('Guardando repuesto...', 'info');
    const { error } = await supabaseClient
        .from('inventario_repuestos')
        .upsert(payload, { onConflict: 'sede,codigo' });

    if (error) {
        console.warn('No se pudo guardar el repuesto:', error);
        actualizarEstadoInventario('No se pudo guardar el repuesto.', 'error');
        return;
    }

    event.currentTarget.reset();
    obtenerElemento('inventoryMinimum').value = '0';
    obtenerElemento('inventoryUnit').value = 'unidad';
    actualizarEstadoInventario('Repuesto guardado correctamente.', 'success');
    await cargarInventarioRepuestos();
}

async function eliminarRepuestoInventario(id) {
    const item = inventarioRepuestos.find(repuesto => repuesto.id === id);
    if (!item || !usuarioPuedeGestionarInventario()) {
        return;
    }

    if (!window.confirm(`Eliminar ${item.nombre} del inventario de ${obtenerNombreSede(obtenerSedeMantenimientoActiva())}?`)) {
        return;
    }

    const { error } = await supabaseClient
        .from('inventario_repuestos')
        .delete()
        .eq('id', id)
        .eq('sede', obtenerSedeMantenimientoActiva());

    if (error) {
        actualizarEstadoInventario('No se pudo eliminar el repuesto.', 'error');
        return;
    }
    await cargarInventarioRepuestos();
}

function suscribirInventarioRepuestos() {
    if (!accesoMantenimientoActivo || !supabaseClient) {
        return;
    }
    if (canalInventario) {
        supabaseClient.removeChannel(canalInventario);
    }
    canalInventario = supabaseClient
        .channel(`inventario-${obtenerSedeMantenimientoActiva()}-${sesionActual.user.id}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'inventario_repuestos',
                filter: `sede=eq.${obtenerSedeMantenimientoActiva()}`
            },
            () => cargarInventarioRepuestos()
        )
        .subscribe();
}

function suscribirIntervencionesMantenimiento() {
    if (!accesoMantenimientoActivo || !supabaseClient) {
        return;
    }
    if (canalIntervencionesMantenimiento) {
        supabaseClient.removeChannel(canalIntervencionesMantenimiento);
    }
    canalIntervencionesMantenimiento = supabaseClient
        .channel(`intervenciones-mantenimiento-${obtenerSedeMantenimientoActiva()}-${sesionActual.user.id}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'intervenciones_mantenimiento',
                filter: `sede=eq.${obtenerSedeMantenimientoActiva()}`
            },
            () => cargarIntervencionesMantenimiento()
        )
        .subscribe();
}

function suscribirMantenimientoProgramado() {
    if (!accesoMantenimientoActivo || !supabaseClient) {
        return;
    }
    if (canalMantenimientoProgramado) {
        supabaseClient.removeChannel(canalMantenimientoProgramado);
    }
    canalMantenimientoProgramado = supabaseClient
        .channel(`mantenimiento-programado-${obtenerSedeMantenimientoActiva()}-${sesionActual.user.id}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'mantenimiento_programado',
                filter: `sede=eq.${obtenerSedeMantenimientoActiva()}`
            },
            () => cargarMantenimientoProgramado()
        )
        .subscribe();
}

function suscribirTareasMantenimiento() {
    if (!accesoMantenimientoActivo || !supabaseClient || !sesionActual?.user) return;
    if (canalTareasMantenimiento) supabaseClient.removeChannel(canalTareasMantenimiento);
    canalTareasMantenimiento = supabaseClient
        .channel(`tareas-mantenimiento-${sesionActual.user.id}`)
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'tareas_mantenimiento' },
            () => cargarTareasMantenimiento()
        )
        .subscribe();
}

function actualizarSesionUI() {
    const etiqueta = obtenerElemento('authUserLabel');
    const rolActual = perfilActual?.rol || 'sin-rol';
    const roles = ROLES_USUARIO;

    document.body.classList.remove('operational-mode', 'admin-mode', 'technical-mode', ...roles.map(rol => `role-${rol}`));
    document.body.dataset.role = rolActual;

    if (rolActual === ROL_SUPERIOR) {
        document.body.classList.add('admin-mode', `role-${ROL_SUPERIOR}`);
    } else if (rolActual === 'admin' || ROLES_OPERACION_GLOBAL.includes(rolActual)) {
        document.body.classList.add('admin-mode', `role-${rolActual}`);
    } else if (rolActual === 'tecnico') {
        document.body.classList.add('technical-mode', 'role-tecnico');
    } else if (rolActual !== 'sin-rol') {
        document.body.classList.add('operational-mode', `role-${rolActual}`);
    }

    if (!etiqueta) {
        return;
    }

    if (!sesionActual?.user) {
        etiqueta.textContent = 'Sin usuario';
        return;
    }

    const nombreRol = obtenerEtiquetaRol(perfilActual?.rol);
    const rol = nombreRol ? ` - ${nombreRol}` : '';
    const sede = perfilActual?.sede ? ` - ${obtenerNombreSede(perfilActual.sede)}` : '';
    etiqueta.textContent = `${obtenerNombreUsuarioActivo()}${rol}${sede}`;
}

function usuarioEsAdmin() {
    return [ROL_SUPERIOR, 'admin', ...ROLES_OPERACION_GLOBAL].includes(perfilActual?.rol)
        && perfilActual?.activo !== false;
}

function usuarioEsAdminGlobal() {
    return [ROL_SUPERIOR, ...ROLES_OPERACION_GLOBAL].includes(perfilActual?.rol)
        && perfilActual?.activo !== false;
}

function usuarioEsSuperior() {
    return perfilActual?.rol === ROL_SUPERIOR && perfilActual?.activo !== false;
}

function usuarioPuedeRestablecerPassword() {
    return perfilActual?.activo !== false && [ROL_SUPERIOR, 'gdh'].includes(perfilActual?.rol);
}

function usuarioPuedeRestablecerCuenta(usuario) {
    if (!usuarioPuedeRestablecerPassword() || !usuario?.activo || !usuario?.dni || usuario.id === sesionActual?.user?.id) {
        return false;
    }
    if (usuarioEsSuperior()) {
        return true;
    }
    return ['comercial_abonados', 'tecnico', 'supervisor', 'fortaleza', 'eco', 'charly', 'anfitrion'].includes(usuario.rol);
}

function usuarioPuedeVerSaludSupabase() {
    const nombre = String(perfilActual?.nombre || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
    return usuarioEsSuperior() && nombre.includes('dennys');
}

function usuarioEsRolGlobal(rol = perfilActual?.rol) {
    return ROLES_GLOBALES.includes(rol);
}

function usuarioPuedeGestionarActivosOperaciones() {
    return usuarioEsAdmin();
}

function usuarioPuedeElegirSedeActivosOperaciones() {
    return perfilActual?.activo !== false
        && [ROL_SUPERIOR, 'jefe_operaciones', 'coordinador_operaciones', 'gdh'].includes(perfilActual?.rol);
}

function configurarSedeActivosOperaciones() {
    const selector = obtenerElemento('operationsAssetsSite');
    if (!selector || !perfilActual) return;
    const sedePerfil = SEDES_OPERACION.some(item => item.id === perfilActual.sede)
        ? perfilActual.sede
        : SEDES_OPERACION[0].id;
    if (!usuarioPuedeElegirSedeActivosOperaciones()) selector.value = sedePerfil;
    selector.disabled = !usuarioPuedeElegirSedeActivosOperaciones();
    const agregar = obtenerElemento('addOperationsAsset');
    if (agregar) agregar.hidden = !usuarioPuedeGestionarActivosOperaciones();
}

function obtenerSedeActivosOperaciones() {
    const sede = obtenerElemento('operationsAssetsSite')?.value;
    return SEDES_OPERACION.some(item => item.id === sede) ? sede : SEDES_OPERACION[0].id;
}

function formatearCostoActivo(valor) {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2
    }).format(Number(valor || 0));
}

function obtenerNombreArchivoActivos(extension) {
    const sede = SEDES_OPERACION.find(item => item.id === obtenerSedeActivosOperaciones())?.corto || 'Sede';
    const fecha = new Date().toISOString().slice(0, 10);
    const sedeSegura = sede.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-');
    return `Activos-Operaciones-${sedeSegura}-${fecha}.${extension}`;
}

function obtenerFechaExportacionActivos() {
    return new Intl.DateTimeFormat('es-PE', {
        dateStyle: 'long',
        timeStyle: 'short'
    }).format(new Date());
}

function exportarActivosOperacionesExcel() {
    if (!activosOperaciones.length) {
        actualizarEstadoActivosOperaciones('No hay activos para exportar en esta sede.', 'error');
        return;
    }
    if (!window.XLSX) {
        actualizarEstadoActivosOperaciones('No se pudo cargar el generador de Excel. Verifica tu conexion.', 'error');
        return;
    }

    const filas = activosOperaciones.map(activo => ({
        Sede: obtenerNombreSede(activo.sede),
        Codigo: activo.codigo,
        'Nombre del activo': activo.nombre,
        'Costo (S/)': Number(activo.costo || 0),
        'Ultima actualizacion': formatearFechaHoraISO(activo.updated_at)
    }));
    const hoja = XLSX.utils.json_to_sheet(filas);
    hoja['!cols'] = [
        { wch: 24 },
        { wch: 18 },
        { wch: 42 },
        { wch: 16 },
        { wch: 23 }
    ];
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Activos');
    XLSX.writeFile(libro, obtenerNombreArchivoActivos('xlsx'), { compression: true });
    actualizarEstadoActivosOperaciones('Excel generado correctamente.', 'success');
}

function crearCeldaReporteActivos(etiqueta, tipo = 'td') {
    const celda = document.createElement(tipo);
    celda.textContent = etiqueta;
    return celda;
}

function generarPdfActivosOperaciones() {
    if (!activosOperaciones.length) {
        actualizarEstadoActivosOperaciones('No hay activos para generar el PDF de esta sede.', 'error');
        return;
    }

    const ventana = window.open('', '_blank');
    if (!ventana) {
        actualizarEstadoActivosOperaciones('Permite ventanas emergentes para generar el PDF.', 'error');
        return;
    }
    ventana.opener = null;

    const documento = ventana.document;
    const sede = obtenerNombreSede(obtenerSedeActivosOperaciones());
    const total = activosOperaciones.reduce((suma, activo) => suma + Number(activo.costo || 0), 0);
    documento.title = obtenerNombreArchivoActivos('pdf').replace('.pdf', '');

    const estilo = documento.createElement('style');
    estilo.textContent = `
        @page { size: A4; margin: 12mm; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #142536; font-family: Arial, sans-serif; font-size: 11px; }
        header { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; padding-bottom: 12px; border-bottom: 4px solid #ef4b1b; }
        .brand { color: #1596cf; font-size: 22px; font-weight: 800; }
        h1 { margin: 4px 0 2px; font-size: 20px; }
        p { margin: 3px 0; color: #526471; }
        .summary { display: flex; gap: 12px; margin: 14px 0; }
        .summary div { flex: 1; padding: 10px; border: 1px solid #d7e2e8; background: #f5f9fb; }
        .summary b { display: block; margin-top: 3px; color: #0c658f; font-size: 15px; }
        table { width: 100%; border-collapse: collapse; }
        thead { display: table-header-group; }
        tr { break-inside: avoid; page-break-inside: avoid; }
        th { padding: 8px; background: #172638; color: #fff; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #d7e2e8; vertical-align: top; }
        th:last-child, td:last-child { text-align: right; white-space: nowrap; }
        footer { margin-top: 12px; color: #6b7782; font-size: 9px; text-align: right; }
        @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
    `;
    documento.head.appendChild(estilo);

    const encabezado = documento.createElement('header');
    const tituloGrupo = documento.createElement('div');
    const marca = documento.createElement('div');
    const titulo = documento.createElement('h1');
    const subtitulo = documento.createElement('p');
    const fecha = documento.createElement('p');
    marca.className = 'brand';
    marca.textContent = 'UrbaPark';
    titulo.textContent = 'Activos de operaciones';
    subtitulo.textContent = sede;
    fecha.textContent = `Generado: ${obtenerFechaExportacionActivos()}`;
    tituloGrupo.append(marca, titulo, subtitulo);
    encabezado.append(tituloGrupo, fecha);

    const resumen = documento.createElement('section');
    resumen.className = 'summary';
    const cantidad = documento.createElement('div');
    const valor = documento.createElement('div');
    cantidad.append(crearCeldaReporteActivos('Activos registrados', 'span'), crearCeldaReporteActivos(String(activosOperaciones.length), 'b'));
    valor.append(crearCeldaReporteActivos('Valorizacion total', 'span'), crearCeldaReporteActivos(formatearCostoActivo(total), 'b'));
    resumen.append(cantidad, valor);

    const tabla = documento.createElement('table');
    const cabecera = documento.createElement('thead');
    const filaCabecera = documento.createElement('tr');
    ['Codigo', 'Nombre del activo', 'Costo actual'].forEach(texto => filaCabecera.appendChild(crearCeldaReporteActivos(texto, 'th')));
    cabecera.appendChild(filaCabecera);
    const cuerpo = documento.createElement('tbody');
    activosOperaciones.forEach(activo => {
        const fila = documento.createElement('tr');
        fila.append(
            crearCeldaReporteActivos(activo.codigo),
            crearCeldaReporteActivos(activo.nombre),
            crearCeldaReporteActivos(formatearCostoActivo(activo.costo))
        );
        cuerpo.appendChild(fila);
    });
    tabla.append(cabecera, cuerpo);

    const pie = documento.createElement('footer');
    pie.textContent = 'Registro de activos de operaciones - UrbaPark';
    documento.body.append(encabezado, resumen, tabla, pie);
    documento.close();
    actualizarEstadoActivosOperaciones('PDF preparado. Selecciona Guardar como PDF.', 'success');
    setTimeout(() => {
        ventana.focus();
        ventana.print();
    }, 300);
}

function actualizarEstadoActivosOperaciones(mensaje = '', estado = 'info') {
    const salida = obtenerElemento('operationsAssetsStatus');
    if (!salida) return;
    salida.textContent = mensaje;
    salida.dataset.status = estado;
}

async function cargarActivosOperaciones() {
    if (!supabaseClient || !sesionActual?.user) return;
    actualizarEstadoActivosOperaciones('Cargando activos...', 'info');
    const { data, error } = await supabaseClient
        .from('activos_operaciones')
        .select('id,sede,codigo,nombre,costo,updated_at')
        .eq('sede', obtenerSedeActivosOperaciones())
        .order('nombre', { ascending: true });

    if (error) {
        console.warn('No se pudieron cargar los activos:', error);
        actualizarEstadoActivosOperaciones('No se pudieron cargar los activos.', 'error');
        return;
    }

    activosOperaciones = Array.isArray(data) ? data : [];
    actualizarEstadoActivosOperaciones(`${activosOperaciones.length} activos registrados.`, 'success');
    renderizarActivosOperaciones();
}

function renderizarActivosOperaciones() {
    const contenedor = obtenerElemento('operationsAssetsList');
    if (!contenedor) return;
    limpiarElemento(contenedor);
    const busqueda = obtenerElemento('operationsAssetsSearch')?.value.trim().toLowerCase() || '';
    const visibles = activosOperaciones.filter(activo =>
        [activo.codigo, activo.nombre].some(valor => String(valor || '').toLowerCase().includes(busqueda))
    );

    if (!visibles.length) {
        contenedor.appendChild(crearMensajeVacio(
            busqueda ? 'No hay activos que coincidan con la busqueda.' : 'Aun no hay activos registrados.',
            'operations-assets-empty'
        ));
        return;
    }

    visibles.forEach(activo => {
        const tarjeta = document.createElement('article');
        const datos = document.createElement('div');
        const nombre = document.createElement('strong');
        const codigo = document.createElement('span');
        const costo = document.createElement('b');
        tarjeta.className = 'operations-asset-item';
        nombre.textContent = activo.nombre;
        codigo.textContent = activo.codigo;
        costo.textContent = formatearCostoActivo(activo.costo);
        datos.append(nombre, codigo);
        tarjeta.append(datos, costo);

        if (usuarioPuedeGestionarActivosOperaciones()) {
            const acciones = document.createElement('div');
            const editar = document.createElement('button');
            const eliminar = document.createElement('button');
            acciones.className = 'operations-asset-actions';
            editar.className = 'clear-btn';
            editar.type = 'button';
            editar.dataset.editOperationsAsset = activo.id;
            editar.textContent = 'Editar';
            eliminar.className = 'clear-btn danger-action';
            eliminar.type = 'button';
            eliminar.dataset.deleteOperationsAsset = activo.id;
            eliminar.textContent = 'Eliminar';
            acciones.append(editar, eliminar);
            tarjeta.appendChild(acciones);
        }
        contenedor.appendChild(tarjeta);
    });
}

function establecerPanelActivosOperaciones(abierto) {
    const panel = obtenerElemento('operationsAssetsPanel');
    const boton = obtenerElemento('openOperationsAssets');
    if (!panel || !boton) return;
    panel.hidden = !abierto;
    boton.setAttribute('aria-expanded', String(abierto));
    if (abierto) {
        establecerPanelOcupabilidadOperaciones(false);
        const checklistPanel = obtenerElemento('operationsChecklistPanel');
        const dashboardPanel = obtenerElemento('operationsDashboardPanel');
        if (checklistPanel) {
            checklistPanel.hidden = true;
            checklistPanel.classList.remove('operations-subwindow-active');
        }
        if (dashboardPanel) dashboardPanel.hidden = true;
        establecerPanelInformeGeneralOperaciones(false, false);
        document.body.classList.remove('operations-subwindow-open');
        obtenerElemento('openOperationsChecklist')?.setAttribute('aria-expanded', 'false');
        obtenerElemento('openOperationsDashboard')?.setAttribute('aria-expanded', 'false');
        configurarSedeActivosOperaciones();
        cargarActivosOperaciones();
        panel.scrollIntoView({ block: 'start' });
        obtenerElemento('operationsAssetsSearch')?.focus({ preventScroll: true });
    } else {
        establecerFormularioActivoOperaciones(false);
        boton.focus({ preventScroll: true });
    }
}

function establecerFormularioActivoOperaciones(abierto, activo = null) {
    const formulario = obtenerElemento('operationsAssetForm');
    if (!formulario || !usuarioPuedeGestionarActivosOperaciones()) return;
    formulario.hidden = !abierto;
    if (!abierto) {
        formulario.reset();
        obtenerElemento('operationsAssetId').value = '';
        obtenerElemento('operationsAssetCost').value = '0';
        return;
    }
    obtenerElemento('operationsAssetId').value = activo?.id || '';
    obtenerElemento('operationsAssetCode').value = activo?.codigo || '';
    obtenerElemento('operationsAssetName').value = activo?.nombre || '';
    obtenerElemento('operationsAssetCost').value = Number(activo?.costo || 0).toFixed(2);
    obtenerElemento('operationsAssetCode').focus();
}

async function guardarActivoOperaciones(event) {
    event.preventDefault();
    if (!usuarioPuedeGestionarActivosOperaciones() || !supabaseClient) return;
    const id = obtenerElemento('operationsAssetId').value;
    const payload = {
        sede: obtenerSedeActivosOperaciones(),
        codigo: obtenerElemento('operationsAssetCode').value.trim().toUpperCase(),
        nombre: obtenerElemento('operationsAssetName').value.trim(),
        costo: Number(obtenerElemento('operationsAssetCost').value),
        actualizado_por: sesionActual.user.id
    };
    if (!payload.codigo || !payload.nombre || !Number.isFinite(payload.costo) || payload.costo < 0) {
        actualizarEstadoActivosOperaciones('Completa el codigo, nombre y costo valido.', 'error');
        return;
    }

    actualizarEstadoActivosOperaciones('Guardando activo...', 'info');
    const consulta = id
        ? supabaseClient.from('activos_operaciones').update(payload).eq('id', id)
        : supabaseClient.from('activos_operaciones').insert({ ...payload, creado_por: sesionActual.user.id });
    const { error } = await consulta;
    if (error) {
        console.warn('No se pudo guardar el activo:', error);
        actualizarEstadoActivosOperaciones(
            error.code === '23505' ? 'Ya existe un activo con ese codigo.' : 'No se pudo guardar el activo.',
            'error'
        );
        return;
    }
    establecerFormularioActivoOperaciones(false);
    actualizarEstadoActivosOperaciones('Activo guardado correctamente.', 'success');
    await cargarActivosOperaciones();
}

async function eliminarActivoOperaciones(id) {
    if (!usuarioPuedeGestionarActivosOperaciones() || !supabaseClient) return;
    const activo = activosOperaciones.find(item => item.id === id);
    if (!activo || !window.confirm(`Eliminar el activo ${activo.codigo} - ${activo.nombre}?`)) return;
    const { error } = await supabaseClient.from('activos_operaciones').delete().eq('id', id);
    if (error) {
        actualizarEstadoActivosOperaciones('No se pudo eliminar el activo.', 'error');
        return;
    }
    actualizarEstadoActivosOperaciones('Activo eliminado.', 'success');
    await cargarActivosOperaciones();
}

function suscribirActivosOperaciones() {
    if (!supabaseClient || !sesionActual?.user) return;
    if (canalActivosOperaciones) supabaseClient.removeChannel(canalActivosOperaciones);
    canalActivosOperaciones = supabaseClient
        .channel(`activos-operaciones-${obtenerSedeActivosOperaciones()}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'activos_operaciones',
                filter: `sede=eq.${obtenerSedeActivosOperaciones()}`
            },
            cargarActivosOperaciones
        )
        .subscribe();
}

function crearZonaOcupabilidad(nombre = '') {
    return {
        id: `zona-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        nombre,
        capacidad: 0,
        libres: 0,
        ocupados: 0,
        yaris: 0,
        otrosVulnerables: 0,
        detalleVulnerables: '',
        observacion: '',
        ultimoConteo: 'libres'
    };
}

function zonasOcupabilidadIniciales() {
    return ['Zona roja', 'Zona verde', 'Zona amarilla'].map(crearZonaOcupabilidad);
}

function numeroEnteroSeguro(valor) {
    const numero = Number(valor);
    return Number.isFinite(numero) ? Math.max(0, Math.round(numero)) : 0;
}

function normalizarZonaOcupabilidad(zona = {}) {
    const capacidad = numeroEnteroSeguro(zona.capacidad);
    const libres = Math.min(capacidad, numeroEnteroSeguro(zona.libres));
    return {
        id: String(zona.id || `zona-${Date.now()}-${Math.random().toString(16).slice(2)}`),
        nombre: String(zona.nombre || '').slice(0, 100),
        capacidad,
        libres,
        ocupados: Math.max(0, capacidad - libres),
        yaris: numeroEnteroSeguro(zona.yaris),
        otrosVulnerables: numeroEnteroSeguro(zona.otrosVulnerables),
        detalleVulnerables: String(zona.detalleVulnerables || '').slice(0, 240),
        observacion: String(zona.observacion || '').slice(0, 500),
        ultimoConteo: zona.ultimoConteo === 'ocupados' ? 'ocupados' : 'libres'
    };
}

function horaCorteOcupabilidad(fecha = new Date()) {
    return `${String(fecha.getHours()).padStart(2, '0')}:00`;
}

function obtenerSedeOcupabilidad() {
    const sede = obtenerElemento('operationsOccupancySite')?.value || perfilActual?.sede;
    return SEDES_OPERACION.some(item => item.id === sede) ? sede : SEDES_OPERACION[0].id;
}

function configurarSelectSedesOcupabilidad() {
    const select = obtenerElemento('operationsOccupancySite');
    if (!select) return;
    const sedePrevia = select.value;
    limpiarElemento(select);
    const sedes = usuarioPuedeElegirSedeChecklistOperaciones()
        ? SEDES_OPERACION
        : SEDES_OPERACION.filter(item => item.id === perfilActual?.sede);
    sedes.forEach(sede => {
        const opcion = document.createElement('option');
        opcion.value = sede.id;
        opcion.textContent = sede.nombre;
        select.appendChild(opcion);
    });
    select.value = sedes.some(item => item.id === sedePrevia)
        ? sedePrevia
        : (sedes.some(item => item.id === perfilActual?.sede) ? perfilActual.sede : sedes[0]?.id || 'puruchuco');
    select.disabled = !usuarioPuedeElegirSedeChecklistOperaciones();
    const fecha = obtenerElemento('operationsOccupancyDate');
    const hora = obtenerElemento('operationsOccupancyTime');
    if (fecha && !fecha.value) fecha.value = fechaLocalISO();
    if (hora && !hora.value) hora.value = horaCorteOcupabilidad();
}

function claveBorradorOcupabilidad() {
    return `${STORAGE_KEYS.occupancyDraft}:${sesionActual?.user?.id || 'local'}`;
}

function guardarBorradorOcupabilidad() {
    if (!sesionActual?.user) return;
    const borrador = {
        sede: obtenerSedeOcupabilidad(),
        fecha: obtenerElemento('operationsOccupancyDate')?.value || fechaLocalISO(),
        hora: obtenerElemento('operationsOccupancyTime')?.value || horaCorteOcupabilidad(),
        zonas: zonasOcupabilidadActual,
        observacion: obtenerElemento('operationsOccupancyNote')?.value || '',
        actualizadoAt: new Date().toISOString()
    };
    try {
        localStorage.setItem(claveBorradorOcupabilidad(), JSON.stringify(borrador));
    } catch (error) {
        console.warn('No se pudo guardar el borrador de ocupabilidad:', error);
    }
}

function programarBorradorOcupabilidad() {
    window.clearTimeout(temporizadorBorradorOcupabilidad);
    temporizadorBorradorOcupabilidad = window.setTimeout(guardarBorradorOcupabilidad, 250);
}

function obtenerBorradorOcupabilidad() {
    const borrador = safeParseJSON(localStorage.getItem(claveBorradorOcupabilidad()), null);
    if (!borrador || borrador.sede !== obtenerSedeOcupabilidad()
        || borrador.fecha !== obtenerElemento('operationsOccupancyDate')?.value
        || borrador.hora !== obtenerElemento('operationsOccupancyTime')?.value) return null;
    return borrador;
}

function calcularTotalesOcupabilidad(zonas = zonasOcupabilidadActual) {
    return zonas.reduce((totales, zona) => {
        totales.capacidad += numeroEnteroSeguro(zona.capacidad);
        totales.libres += numeroEnteroSeguro(zona.libres);
        totales.ocupados += numeroEnteroSeguro(zona.ocupados);
        totales.yaris += numeroEnteroSeguro(zona.yaris);
        totales.otros += numeroEnteroSeguro(zona.otrosVulnerables);
        return totales;
    }, { capacidad: 0, libres: 0, ocupados: 0, yaris: 0, otros: 0 });
}

function actualizarResumenOcupabilidad() {
    const totales = calcularTotalesOcupabilidad();
    const porcentaje = totales.capacidad ? (totales.ocupados / totales.capacidad) * 100 : 0;
    obtenerElemento('occupancyTotalCapacity').textContent = String(totales.capacidad);
    obtenerElemento('occupancyTotalOccupied').textContent = String(totales.ocupados);
    obtenerElemento('occupancyTotalAvailable').textContent = String(totales.libres);
    obtenerElemento('occupancyRate').textContent = `${porcentaje.toFixed(1)}%`;
    obtenerElemento('occupancyVulnerableTotal').textContent = String(totales.yaris + totales.otros);
}

function crearCampoZonaOcupabilidad(zona, campo, etiqueta, tipo = 'number') {
    const label = document.createElement('label');
    const input = tipo === 'textarea' ? document.createElement('textarea') : document.createElement('input');
    label.className = `occupancy-zone-field occupancy-zone-${campo}`;
    label.appendChild(crearTextoElemento('span', etiqueta));
    if (tipo !== 'textarea') {
        input.type = tipo;
        if (tipo === 'number') {
            input.min = '0';
            input.step = '1';
            input.inputMode = 'numeric';
        }
    } else {
        input.rows = 2;
    }
    input.value = zona[campo] ?? '';
    input.dataset.occupancyZone = zona.id;
    input.dataset.occupancyField = campo;
    input.setAttribute('aria-label', `${etiqueta} de ${zona.nombre || 'zona'}`);
    label.appendChild(input);
    return label;
}

function renderizarZonasOcupabilidad() {
    const contenedor = obtenerElemento('operationsOccupancyZones');
    if (!contenedor) return;
    limpiarElemento(contenedor);
    const cabecera = document.createElement('div');
    cabecera.className = 'occupancy-zone-row occupancy-zone-header';
    ['Zona', 'Capacidad', 'Libres', 'Ocupados', 'Yaris', 'Otros vulnerables', 'Detalle / observacion', ''].forEach(texto => {
        cabecera.appendChild(crearTextoElemento('span', texto));
    });
    contenedor.appendChild(cabecera);

    zonasOcupabilidadActual.forEach((zona, indice) => {
        const fila = document.createElement('article');
        const quitar = document.createElement('button');
        fila.className = 'occupancy-zone-row';
        fila.dataset.occupancyZoneRow = zona.id;
        fila.setAttribute('role', 'row');
        fila.append(
            crearCampoZonaOcupabilidad(zona, 'nombre', 'Zona', 'text'),
            crearCampoZonaOcupabilidad(zona, 'capacidad', 'Capacidad'),
            crearCampoZonaOcupabilidad(zona, 'libres', 'Libres'),
            crearCampoZonaOcupabilidad(zona, 'ocupados', 'Ocupados'),
            crearCampoZonaOcupabilidad(zona, 'yaris', 'Toyota Yaris'),
            crearCampoZonaOcupabilidad(zona, 'otrosVulnerables', 'Otros vulnerables'),
            crearCampoZonaOcupabilidad(zona, 'detalleVulnerables', 'Detalle / observacion', 'textarea')
        );
        quitar.type = 'button';
        quitar.className = 'occupancy-zone-remove';
        quitar.dataset.removeOccupancyZone = zona.id;
        quitar.setAttribute('aria-label', `Eliminar ${zona.nombre || `zona ${indice + 1}`}`);
        quitar.title = 'Eliminar zona';
        quitar.textContent = '\u00d7';
        quitar.disabled = zonasOcupabilidadActual.length === 1;
        fila.appendChild(quitar);
        contenedor.appendChild(fila);
    });
    actualizarResumenOcupabilidad();
}

function actualizarZonaOcupabilidadDesdeCampo(input) {
    const zona = zonasOcupabilidadActual.find(item => item.id === input.dataset.occupancyZone);
    if (!zona) return;
    const campo = input.dataset.occupancyField;
    if (['nombre', 'detalleVulnerables', 'observacion'].includes(campo)) {
        zona[campo] = input.value;
    } else {
        zona[campo] = numeroEnteroSeguro(input.value);
        if (campo === 'libres' || campo === 'ocupados') zona.ultimoConteo = campo;
        zona.capacidad = numeroEnteroSeguro(zona.capacidad);
        if (campo === 'capacidad' || campo === 'libres' || campo === 'ocupados') {
            if (zona.ultimoConteo === 'ocupados') {
                zona.ocupados = Math.min(zona.capacidad, numeroEnteroSeguro(zona.ocupados));
                zona.libres = Math.max(0, zona.capacidad - zona.ocupados);
            } else {
                zona.libres = Math.min(zona.capacidad, numeroEnteroSeguro(zona.libres));
                zona.ocupados = Math.max(0, zona.capacidad - zona.libres);
            }
            const fila = input.closest('[data-occupancy-zone-row]');
            const libres = fila?.querySelector('[data-occupancy-field="libres"]');
            const ocupados = fila?.querySelector('[data-occupancy-field="ocupados"]');
            if (libres && libres !== input) libres.value = zona.libres;
            if (ocupados && ocupados !== input) ocupados.value = zona.ocupados;
        }
    }
    actualizarResumenOcupabilidad();
    programarBorradorOcupabilidad();
}

function corteOcupabilidadSeleccionado() {
    const hora = obtenerElemento('operationsOccupancyTime')?.value;
    return (registroOcupabilidadDiaria?.cortes || []).find(corte => corte.hora === hora) || null;
}

function cargarCorteOcupabilidadEnFormulario() {
    const corte = corteOcupabilidadSeleccionado();
    const borrador = corte ? null : obtenerBorradorOcupabilidad();
    zonasOcupabilidadActual = (corte?.zonas || borrador?.zonas || zonasOcupabilidadIniciales()).map(normalizarZonaOcupabilidad);
    obtenerElemento('operationsOccupancyNote').value = corte?.observacion || borrador?.observacion || '';
    renderizarZonasOcupabilidad();
    const estado = obtenerElemento('operationsOccupancyStatus');
    estado.textContent = corte
        ? `Corte de las ${corte.hora} cargado. Puedes corregirlo y volver a guardar.`
        : (borrador ? 'Borrador local recuperado.' : 'Completa el conteo del nuevo corte horario.');
    estado.dataset.status = corte || borrador ? 'success' : 'info';
}

function renderizarHistorialOcupabilidad() {
    const contenedor = obtenerElemento('operationsOccupancyHistory');
    if (!contenedor) return;
    limpiarElemento(contenedor);
    const cortes = [...(registroOcupabilidadDiaria?.cortes || [])].sort((a, b) => String(a.hora).localeCompare(String(b.hora)));
    if (!cortes.length) {
        contenedor.appendChild(crearMensajeVacio('Aun no hay cortes registrados para este dia.', 'operations-history-empty'));
        obtenerElemento('operationsOccupancyDailyAverage').textContent = 'Promedio diario: 0%';
        return;
    }
    let sumaPorcentajes = 0;
    cortes.forEach(corte => {
        const totales = calcularTotalesOcupabilidad((corte.zonas || []).map(normalizarZonaOcupabilidad));
        const porcentaje = totales.capacidad ? (totales.ocupados / totales.capacidad) * 100 : 0;
        sumaPorcentajes += porcentaje;
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'occupancy-history-item';
        boton.dataset.loadOccupancyCut = corte.hora;
        boton.append(
            crearTextoElemento('strong', corte.hora),
            crearTextoElemento('span', `${porcentaje.toFixed(1)}% ocupado`),
            crearTextoElemento('span', `${totales.ocupados} ocupados / ${totales.libres} libres`),
            crearTextoElemento('small', corte.responsable_nombre || 'Personal operativo')
        );
        contenedor.appendChild(boton);
    });
    obtenerElemento('operationsOccupancyDailyAverage').textContent = `Promedio diario: ${(sumaPorcentajes / cortes.length).toFixed(1)}%`;
}

async function cargarOcupabilidadDiaria() {
    if (!supabaseClient || !sesionActual?.user) return;
    const sede = obtenerSedeOcupabilidad();
    const fecha = obtenerElemento('operationsOccupancyDate')?.value || fechaLocalISO();
    const estado = obtenerElemento('operationsOccupancyStatus');
    estado.textContent = 'Cargando ocupabilidad del dia...';
    const { data, error } = await supabaseClient.from('operaciones_ocupabilidad_diaria')
        .select('*').eq('sede', sede).eq('fecha', fecha).maybeSingle();
    if (error) {
        console.warn('No se pudo cargar ocupabilidad:', error);
        estado.textContent = 'No se pudo cargar el registro diario. Verifica la conexion.';
        estado.dataset.status = 'error';
        return;
    }
    registroOcupabilidadDiaria = data || { sede, fecha, cortes: [] };
    cargarCorteOcupabilidadEnFormulario();
    renderizarHistorialOcupabilidad();
    suscribirOcupabilidadOperaciones();
}

function validarZonasOcupabilidad() {
    if (!zonasOcupabilidadActual.length) return 'Agrega al menos una zona.';
    for (const zona of zonasOcupabilidadActual) {
        if (!String(zona.nombre || '').trim()) return 'Todas las zonas deben tener nombre.';
        if (numeroEnteroSeguro(zona.capacidad) <= 0) return `Indica la capacidad de ${zona.nombre}.`;
        if (numeroEnteroSeguro(zona.libres) > numeroEnteroSeguro(zona.capacidad)) return `Los espacios libres de ${zona.nombre} superan su capacidad.`;
        if (numeroEnteroSeguro(zona.yaris) + numeroEnteroSeguro(zona.otrosVulnerables) > numeroEnteroSeguro(zona.ocupados)) {
            return `Los vehiculos vulnerables de ${zona.nombre} superan los espacios ocupados.`;
        }
    }
    return '';
}

async function guardarCorteOcupabilidad(event) {
    event.preventDefault();
    const errorValidacion = validarZonasOcupabilidad();
    const estado = obtenerElemento('operationsOccupancyStatus');
    if (errorValidacion) {
        estado.textContent = errorValidacion;
        estado.dataset.status = 'error';
        return;
    }
    const zonas = zonasOcupabilidadActual.map(zona => {
        const normalizada = normalizarZonaOcupabilidad(zona);
        delete normalizada.ultimoConteo;
        return normalizada;
    });
    estado.textContent = 'Guardando corte horario...';
    estado.dataset.status = 'info';
    const { data, error } = await supabaseClient.rpc('guardar_corte_ocupabilidad', {
        sede_arg: obtenerSedeOcupabilidad(),
        fecha_arg: obtenerElemento('operationsOccupancyDate').value,
        hora_arg: obtenerElemento('operationsOccupancyTime').value,
        zonas_arg: zonas,
        observacion_arg: obtenerElemento('operationsOccupancyNote').value.trim()
    });
    if (error) {
        console.warn('No se pudo guardar el corte de ocupabilidad:', error);
        estado.textContent = 'No se pudo guardar. El avance permanece protegido en este celular.';
        estado.dataset.status = 'error';
        guardarBorradorOcupabilidad();
        return;
    }
    registroOcupabilidadDiaria = Array.isArray(data) ? data[0] : data;
    localStorage.removeItem(claveBorradorOcupabilidad());
    renderizarHistorialOcupabilidad();
    estado.textContent = `Corte de las ${obtenerElemento('operationsOccupancyTime').value} guardado para todo el equipo.`;
    estado.dataset.status = 'success';
}

function suscribirOcupabilidadOperaciones() {
    if (!supabaseClient || !sesionActual?.user) return;
    if (canalOcupabilidadOperaciones) supabaseClient.removeChannel(canalOcupabilidadOperaciones);
    const sede = obtenerSedeOcupabilidad();
    canalOcupabilidadOperaciones = supabaseClient.channel(`ocupabilidad-${sede}`)
        .on('postgres_changes', {
            event: '*', schema: 'public', table: 'operaciones_ocupabilidad_diaria', filter: `sede=eq.${sede}`
        }, payload => {
            const registro = payload.new;
            if (registro?.fecha !== obtenerElemento('operationsOccupancyDate')?.value) return;
            registroOcupabilidadDiaria = registro;
            renderizarHistorialOcupabilidad();
        }).subscribe();
}

function exportarOcupabilidadDiariaExcel() {
    const cortes = registroOcupabilidadDiaria?.cortes || [];
    const estado = obtenerElemento('operationsOccupancyStatus');
    if (!cortes.length) {
        estado.textContent = 'No hay cortes guardados para exportar.';
        estado.dataset.status = 'error';
        return;
    }
    if (!window.XLSX) {
        estado.textContent = 'No se pudo cargar el generador de Excel.';
        estado.dataset.status = 'error';
        return;
    }
    const resumen = [];
    const detalle = [];
    const vulnerables = [];
    [...cortes].sort((a, b) => String(a.hora).localeCompare(String(b.hora))).forEach(corte => {
        const zonas = (corte.zonas || []).map(normalizarZonaOcupabilidad);
        const totales = calcularTotalesOcupabilidad(zonas);
        const porcentaje = totales.capacidad ? (totales.ocupados / totales.capacidad) * 100 : 0;
        resumen.push({
            Fecha: registroOcupabilidadDiaria.fecha,
            Hora: corte.hora,
            Sede: obtenerNombreSede(registroOcupabilidadDiaria.sede),
            Capacidad: totales.capacidad,
            Ocupados: totales.ocupados,
            Libres: totales.libres,
            'Ocupabilidad (%)': Number(porcentaje.toFixed(2)),
            'Toyota Yaris': totales.yaris,
            'Otros vulnerables': totales.otros,
            Responsable: corte.responsable_nombre || '',
            Observacion: corte.observacion || ''
        });
        zonas.forEach(zona => {
            detalle.push({
                Fecha: registroOcupabilidadDiaria.fecha,
                Hora: corte.hora,
                Sede: obtenerNombreSede(registroOcupabilidadDiaria.sede),
                Zona: zona.nombre,
                Capacidad: zona.capacidad,
                Ocupados: zona.ocupados,
                Libres: zona.libres,
                'Ocupabilidad (%)': Number((zona.capacidad ? zona.ocupados / zona.capacidad * 100 : 0).toFixed(2)),
                'Toyota Yaris': zona.yaris,
                'Otros vulnerables': zona.otrosVulnerables,
                Detalle: zona.detalleVulnerables || ''
            });
            if (zona.yaris || zona.otrosVulnerables) vulnerables.push({
                Fecha: registroOcupabilidadDiaria.fecha, Hora: corte.hora, Zona: zona.nombre,
                'Toyota Yaris': zona.yaris, 'Otros vulnerables': zona.otrosVulnerables,
                Detalle: zona.detalleVulnerables || '', Responsable: corte.responsable_nombre || ''
            });
        });
    });
    const libro = XLSX.utils.book_new();
    const hojaResumen = XLSX.utils.json_to_sheet(resumen);
    const hojaDetalle = XLSX.utils.json_to_sheet(detalle);
    const hojaVulnerables = XLSX.utils.json_to_sheet(vulnerables.length ? vulnerables : [{ Estado: 'Sin vehiculos vulnerables registrados' }]);
    hojaResumen['!cols'] = [12, 9, 26, 12, 12, 12, 18, 15, 18, 28, 40].map(wch => ({ wch }));
    hojaDetalle['!cols'] = [12, 9, 26, 24, 12, 12, 12, 18, 15, 18, 40].map(wch => ({ wch }));
    XLSX.utils.book_append_sheet(libro, hojaResumen, 'Resumen horario');
    XLSX.utils.book_append_sheet(libro, hojaDetalle, 'Detalle por zona');
    XLSX.utils.book_append_sheet(libro, hojaVulnerables, 'Vehiculos vulnerables');
    XLSX.writeFile(libro, `Ocupabilidad-${registroOcupabilidadDiaria.sede}-${registroOcupabilidadDiaria.fecha}.xlsx`, { compression: true });
    estado.textContent = 'Excel diario generado correctamente.';
    estado.dataset.status = 'success';
}

async function establecerPanelOcupabilidadOperaciones(abierto) {
    const panel = obtenerElemento('operationsOccupancyPanel');
    const boton = obtenerElemento('openOperationsOccupancy');
    if (!panel || !boton) return;
    panel.hidden = !abierto;
    panel.classList.toggle('operations-subwindow-active', abierto);
    document.body.classList.toggle('operations-subwindow-open', abierto);
    boton.setAttribute('aria-expanded', String(abierto));
    if (abierto) {
        establecerPanelActivosOperaciones(false);
        establecerPanelDashboardOperaciones(false);
        establecerPanelInformeGeneralOperaciones(false, false);
        await establecerPanelChecklistOperaciones(false);
        configurarSelectSedesOcupabilidad();
        await cargarOcupabilidadDiaria();
        panel.scrollTop = 0;
        if (window.history.state?.urbaparkOperationsPanel !== 'occupancy') {
            window.history.pushState({ ...(window.history.state || {}), urbaparkOperationsPanel: 'occupancy' }, '', `${window.location.pathname}${window.location.search}#operaciones-ocupabilidad`);
        }
        panel.focus({ preventScroll: true });
    } else {
        panel.classList.remove('operations-subwindow-active');
        if (!document.querySelector('.operations-subwindow-active')) document.body.classList.remove('operations-subwindow-open');
    }
}

function cerrarPanelOcupabilidadOperaciones() {
    if (window.history.state?.urbaparkOperationsPanel === 'occupancy') window.history.back();
    else establecerPanelOcupabilidadOperaciones(false);
}

const ZONAS_OCUPABILIDAD_SALAVERRY = Object.freeze([
    { id: 'sotano-1', nombre: 'Sotano 1', tipo: 'vehiculos', capacidad: 273, color: '#2f75b5' },
    { id: 'sotano-2', nombre: 'Sotano 2', tipo: 'vehiculos', capacidad: 398, color: '#ffc000' },
    { id: 'sotano-3', nombre: 'Sotano 3', tipo: 'vehiculos', capacidad: 568, color: '#92d050' },
    { id: 'sotano-4', nombre: 'Sotano 4', tipo: 'vehiculos', capacidad: 482, color: '#19a7d8' },
    { id: 'parking-vip', nombre: 'Parking VIP', tipo: 'vehiculos', capacidad: 28, color: '#2f75b5' },
    { id: 'bicicletas', nombre: 'Bicicletas', tipo: 'bicicletas', capacidad: 508, color: '#17212b' },
    { id: 'motos', nombre: 'Motos', tipo: 'motos', capacidad: 107, color: '#17212b' }
]);

function configurarSelectSedesOcupabilidad() {
    const select = obtenerElemento('operationsOccupancySite');
    if (!select) return;
    limpiarElemento(select);
    const opcion = document.createElement('option');
    opcion.value = 'salaverry';
    opcion.textContent = 'Real Plaza Salaverry';
    select.appendChild(opcion);
    select.value = 'salaverry';
    select.disabled = true;
    const fecha = obtenerElemento('operationsOccupancyDate');
    const hora = obtenerElemento('operationsOccupancyTime');
    if (fecha) fecha.value = fechaLocalISO();
    if (hora) hora.value = horaCorteOcupabilidad();
}

function obtenerSedeOcupabilidad() {
    return 'salaverry';
}

function obtenerZonaGuardadaOcupabilidad(id, hora = obtenerElemento('operationsOccupancyTime')?.value) {
    const corte = (registroOcupabilidadDiaria?.cortes || []).find(item => item.hora === hora);
    return (corte?.zonas || []).find(zona => zona.id === id) || null;
}

function claveBorradorZonaOcupabilidad(id) {
    return `${STORAGE_KEYS.occupancyDraft}:${sesionActual?.user?.id || 'local'}:${fechaLocalISO()}:${horaCorteOcupabilidad()}:${id}`;
}

function zonaOcupabilidadCompleta(configuracion, datos = {}) {
    const capacidad = configuracion.capacidad;
    const ocupados = Math.min(capacidad, numeroEnteroSeguro(datos.ocupados));
    return {
        ...configuracion,
        ocupados,
        libres: Math.max(0, capacidad - ocupados),
        yaris: numeroEnteroSeguro(datos.yaris),
        otrosVulnerables: numeroEnteroSeguro(datos.otrosVulnerables),
        detalleVulnerables: String(datos.detalleVulnerables || '').slice(0, 240),
        observacion: String(datos.observacion || '').slice(0, 500),
        responsable_nombre: datos.responsable_nombre || '',
        registrado_at: datos.registrado_at || ''
    };
}

function obtenerDatosZonaActual(configuracion) {
    const guardada = obtenerZonaGuardadaOcupabilidad(configuracion.id);
    if (guardada) return zonaOcupabilidadCompleta(configuracion, guardada);
    const borrador = safeParseJSON(localStorage.getItem(claveBorradorZonaOcupabilidad(configuracion.id)), {});
    return zonaOcupabilidadCompleta(configuracion, borrador);
}

function crearCampoConteoOcupabilidad(zona, campo, etiqueta) {
    const label = document.createElement('label');
    const input = document.createElement('input');
    label.className = 'occupancy-zone-field';
    label.appendChild(crearTextoElemento('span', etiqueta));
    input.type = 'number';
    input.min = '0';
    input.max = String(zona.capacidad);
    input.step = '1';
    input.inputMode = 'numeric';
    input.value = zona[campo];
    input.dataset.occupancyZone = zona.id;
    input.dataset.occupancyField = campo;
    input.setAttribute('aria-label', `${etiqueta} de ${zona.nombre}`);
    label.appendChild(input);
    return label;
}

function renderizarZonasOcupabilidad() {
    const contenedor = obtenerElemento('operationsOccupancyZones');
    if (!contenedor) return;
    limpiarElemento(contenedor);
    zonasOcupabilidadActual = ZONAS_OCUPABILIDAD_SALAVERRY.map(obtenerDatosZonaActual);
    zonasOcupabilidadActual.forEach(zona => {
        const guardada = obtenerZonaGuardadaOcupabilidad(zona.id);
        const tarjeta = document.createElement('article');
        tarjeta.className = 'occupancy-zone-card';
        tarjeta.dataset.occupancyZoneRow = zona.id;
        tarjeta.style.setProperty('--occupancy-zone-color', zona.color);

        const encabezado = document.createElement('div');
        encabezado.className = 'occupancy-zone-card-heading';
        const titulo = document.createElement('div');
        titulo.append(
            crearTextoElemento('strong', zona.nombre),
            crearTextoElemento('span', `Capacidad: ${zona.capacidad}`)
        );
        const estado = crearTextoElemento('span', guardada ? 'Reportado' : 'Pendiente');
        estado.className = guardada ? 'occupancy-zone-state is-complete' : 'occupancy-zone-state';
        encabezado.append(titulo, estado);

        const campos = document.createElement('div');
        campos.className = 'occupancy-zone-card-fields';
        campos.append(
            crearCampoConteoOcupabilidad(zona, 'ocupados', 'Ocupados'),
            crearCampoConteoOcupabilidad(zona, 'libres', 'Disponibles')
        );
        if (zona.tipo === 'vehiculos') {
            campos.append(
                crearCampoConteoOcupabilidad(zona, 'yaris', 'Toyota Yaris'),
                crearCampoConteoOcupabilidad(zona, 'otrosVulnerables', 'Otros vulnerables')
            );
        }

        const observacion = document.createElement('label');
        const textarea = document.createElement('textarea');
        observacion.className = 'occupancy-zone-field occupancy-zone-notes';
        observacion.appendChild(crearTextoElemento('span', 'Novedad o detalle'));
        textarea.rows = 2;
        textarea.maxLength = 500;
        textarea.value = zona.observacion || zona.detalleVulnerables || '';
        textarea.dataset.occupancyZone = zona.id;
        textarea.dataset.occupancyField = 'observacion';
        textarea.placeholder = 'Opcional';
        observacion.appendChild(textarea);

        const pie = document.createElement('div');
        pie.className = 'occupancy-zone-card-footer';
        const auditoria = guardada
            ? `Reportado por ${guardada.responsable_nombre || 'personal operativo'} a las ${formatearHoraCorta(guardada.registrado_at)}`
            : 'Falta el reporte de esta hora';
        pie.appendChild(crearTextoElemento('small', auditoria));
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = guardada ? 'clear-btn' : 'finish-btn';
        boton.dataset.saveOccupancyZone = zona.id;
        boton.textContent = guardada ? 'Corregir zona' : 'Reportar zona';
        pie.appendChild(boton);
        tarjeta.append(encabezado, campos, observacion, pie);
        contenedor.appendChild(tarjeta);
    });
    actualizarResumenOcupabilidad();
}

function formatearHoraCorta(fechaIso) {
    if (!fechaIso) return '--:--';
    const fecha = new Date(fechaIso);
    return Number.isNaN(fecha.getTime()) ? '--:--' : fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

function calcularTotalesOcupabilidad(zonas = zonasOcupabilidadActual) {
    return zonas.reduce((total, zona) => {
        if (zona.tipo === 'vehiculos') {
            total.capacidad += zona.capacidad;
            total.ocupados += numeroEnteroSeguro(zona.ocupados);
            total.libres += numeroEnteroSeguro(zona.libres);
        }
        if (zona.tipo === 'bicicletas') total.bicicletas = numeroEnteroSeguro(zona.ocupados);
        if (zona.tipo === 'motos') total.motos = numeroEnteroSeguro(zona.ocupados);
        return total;
    }, { capacidad: 0, ocupados: 0, libres: 0, bicicletas: 0, motos: 0 });
}

function actualizarResumenOcupabilidad() {
    const zonasGuardadas = ZONAS_OCUPABILIDAD_SALAVERRY.filter(zona => obtenerZonaGuardadaOcupabilidad(zona.id));
    const datosGuardados = ZONAS_OCUPABILIDAD_SALAVERRY.map(config => {
        const guardada = obtenerZonaGuardadaOcupabilidad(config.id);
        return zonaOcupabilidadCompleta(config, guardada || {});
    });
    const totales = calcularTotalesOcupabilidad(datosGuardados);
    const porcentaje = totales.capacidad ? totales.ocupados / totales.capacidad * 100 : 0;
    obtenerElemento('occupancyZonesReported').textContent = `${zonasGuardadas.length}/7`;
    obtenerElemento('occupancyTotalOccupied').textContent = totales.ocupados.toLocaleString('es-PE');
    obtenerElemento('occupancyTotalAvailable').textContent = totales.libres.toLocaleString('es-PE');
    obtenerElemento('occupancyRate').textContent = `${porcentaje.toFixed(1)}%`;
    obtenerElemento('occupancyMobilityTotal').textContent = `${totales.bicicletas} / ${totales.motos}`;
    const faltantes = ZONAS_OCUPABILIDAD_SALAVERRY.filter(zona => !obtenerZonaGuardadaOcupabilidad(zona.id)).map(zona => zona.nombre);
    const mensaje = obtenerElemento('operationsOccupancyHourStatus');
    if (mensaje) {
        mensaje.className = `occupancy-hour-status${faltantes.length ? '' : ' is-complete'}`;
        mensaje.textContent = faltantes.length
            ? `Hora ${horaCorteOcupabilidad()}: faltan ${faltantes.join(', ')}.`
            : `Hora ${horaCorteOcupabilidad()}: consolidado completo y Excel actualizado.`;
    }
}

function actualizarZonaOcupabilidadDesdeCampo(input) {
    const zona = zonasOcupabilidadActual.find(item => item.id === input.dataset.occupancyZone);
    if (!zona) return;
    const campo = input.dataset.occupancyField;
    if (campo === 'observacion') zona.observacion = input.value.slice(0, 500);
    else {
        zona[campo] = Math.min(zona.capacidad, numeroEnteroSeguro(input.value));
        if (campo === 'ocupados' || campo === 'libres') {
            const otroCampo = campo === 'ocupados' ? 'libres' : 'ocupados';
            zona[otroCampo] = Math.max(0, zona.capacidad - zona[campo]);
            const otroInput = input.closest('[data-occupancy-zone-row]')?.querySelector(`[data-occupancy-field="${otroCampo}"]`);
            if (otroInput) otroInput.value = zona[otroCampo];
        }
    }
    try { localStorage.setItem(claveBorradorZonaOcupabilidad(zona.id), JSON.stringify(zona)); } catch (error) { console.warn(error); }
}

async function guardarZonaOcupabilidad(id) {
    const estado = obtenerElemento('operationsOccupancyStatus');
    const zona = zonasOcupabilidadActual.find(item => item.id === id);
    const boton = document.querySelector(`[data-save-occupancy-zone="${id}"]`);
    if (!zona || !supabaseClient) return;
    boton.disabled = true;
    estado.textContent = `Guardando ${zona.nombre}...`;
    estado.dataset.status = 'info';
    const payload = {
        id: zona.id, nombre: zona.nombre, tipo: zona.tipo, capacidad: zona.capacidad,
        ocupados: zona.ocupados, libres: zona.libres, yaris: zona.yaris,
        otrosVulnerables: zona.otrosVulnerables, observacion: zona.observacion
    };
    const { data, error } = await supabaseClient.rpc('guardar_zona_ocupabilidad', {
        sede_arg: 'salaverry', fecha_arg: fechaLocalISO(), hora_arg: horaCorteOcupabilidad(), zona_arg: payload
    });
    boton.disabled = false;
    if (error) {
        estado.textContent = mensajeErrorSupabase(error, 'No se pudo guardar la zona.');
        estado.dataset.status = 'error';
        return;
    }
    registroOcupabilidadDiaria = Array.isArray(data) ? data[0] : data;
    localStorage.removeItem(claveBorradorZonaOcupabilidad(id));
    renderizarZonasOcupabilidad();
    renderizarHistorialOcupabilidad();
    estado.textContent = `${zona.nombre} registrada. El consolidado y el Excel ya estan actualizados.`;
    estado.dataset.status = 'success';
}

function renderizarHistorialOcupabilidad() {
    const contenedor = obtenerElemento('operationsOccupancyHistory');
    if (!contenedor) return;
    limpiarElemento(contenedor);
    const cortes = [...(registroOcupabilidadDiaria?.cortes || [])].sort((a, b) => String(a.hora).localeCompare(String(b.hora)));
    if (!cortes.length) {
        contenedor.appendChild(crearMensajeVacio('Aun no hay cortes registrados hoy.', 'operations-history-empty'));
        obtenerElemento('operationsOccupancyDailyAverage').textContent = 'Promedio diario: 0%';
        return;
    }
    let suma = 0;
    cortes.forEach(corte => {
        const zonas = ZONAS_OCUPABILIDAD_SALAVERRY.map(config => zonaOcupabilidadCompleta(config, (corte.zonas || []).find(z => z.id === config.id) || {}));
        const totales = calcularTotalesOcupabilidad(zonas);
        const porcentaje = totales.capacidad ? totales.ocupados / totales.capacidad * 100 : 0;
        suma += porcentaje;
        const elemento = document.createElement('article');
        elemento.className = 'occupancy-history-item';
        elemento.append(
            crearTextoElemento('strong', corte.hora),
            crearTextoElemento('span', `${(corte.zonas || []).length}/7 zonas`),
            crearTextoElemento('span', `${porcentaje.toFixed(1)}% de ocupabilidad`),
            crearTextoElemento('small', `${totales.ocupados} autos ocupados`)
        );
        const acciones = document.createElement('div');
        const exportar = document.createElement('button');
        const compartir = document.createElement('button');
        acciones.className = 'occupancy-history-actions';
        exportar.type = 'button';
        exportar.className = 'clear-btn';
        exportar.dataset.exportOccupancyHour = corte.hora;
        exportar.textContent = `Excel ${corte.hora}`;
        compartir.type = 'button';
        compartir.className = 'finish-btn';
        compartir.dataset.shareOccupancyHour = corte.hora;
        compartir.textContent = 'Compartir';
        acciones.append(exportar, compartir);
        elemento.appendChild(acciones);
        contenedor.appendChild(elemento);
    });
    obtenerElemento('operationsOccupancyDailyAverage').textContent = `Promedio diario: ${(suma / cortes.length).toFixed(1)}%`;
}

async function cargarOcupabilidadDiaria() {
    if (!supabaseClient) return;
    configurarSelectSedesOcupabilidad();
    const estado = obtenerElemento('operationsOccupancyStatus');
    estado.textContent = 'Actualizando aportes de Salaverry...';
    estado.dataset.status = 'info';
    const { data, error } = await supabaseClient.from('operaciones_ocupabilidad_diaria')
        .select('*').eq('sede', 'salaverry').eq('fecha', fechaLocalISO()).maybeSingle();
    if (error) {
        registroOcupabilidadDiaria = { sede: 'salaverry', fecha: fechaLocalISO(), cortes: [] };
        renderizarZonasOcupabilidad();
        renderizarHistorialOcupabilidad();
        estado.textContent = mensajeErrorSupabase(error, 'No se pudo cargar la ocupabilidad.');
        estado.dataset.status = 'error';
        return;
    }
    registroOcupabilidadDiaria = data || { sede: 'salaverry', fecha: fechaLocalISO(), cortes: [] };
    renderizarZonasOcupabilidad();
    renderizarHistorialOcupabilidad();
    suscribirOcupabilidadOperaciones();
    estado.textContent = 'Datos del dia sincronizados.';
    estado.dataset.status = 'success';
}

function suscribirOcupabilidadOperaciones() {
    if (!supabaseClient) return;
    if (canalOcupabilidadOperaciones) supabaseClient.removeChannel(canalOcupabilidadOperaciones);
    canalOcupabilidadOperaciones = supabaseClient.channel('ocupabilidad-salaverry-hoy')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'operaciones_ocupabilidad_diaria', filter: 'sede=eq.salaverry' }, payload => {
            const registro = payload.new;
            if (registro?.fecha !== fechaLocalISO()) return;
            registroOcupabilidadDiaria = registro;
            renderizarZonasOcupabilidad();
            renderizarHistorialOcupabilidad();
        }).subscribe();
}

function exportarOcupabilidadDiariaExcel() {
    const cortes = registroOcupabilidadDiaria?.cortes || [];
    const estado = obtenerElemento('operationsOccupancyStatus');
    if (!cortes.length || !window.XLSX) {
        estado.textContent = cortes.length ? 'No se pudo cargar el generador de Excel.' : 'Todavia no hay aportes para generar el Excel.';
        estado.dataset.status = 'error';
        return;
    }
    const resumen = [];
    const detalle = [];
    cortes.sort((a, b) => String(a.hora).localeCompare(String(b.hora))).forEach(corte => {
        const zonas = ZONAS_OCUPABILIDAD_SALAVERRY.map(config => zonaOcupabilidadCompleta(config, (corte.zonas || []).find(z => z.id === config.id) || {}));
        const totales = calcularTotalesOcupabilidad(zonas);
        const fila = { Fecha: fechaLocalISO(), Hora: corte.hora };
        zonas.forEach(zona => {
            fila[`${zona.nombre} ocupados`] = zona.ocupados;
            fila[`${zona.nombre} disponibles`] = zona.libres;
            detalle.push({ Fecha: fechaLocalISO(), Hora: corte.hora, Zona: zona.nombre, Capacidad: zona.capacidad,
                Ocupados: zona.ocupados, Disponibles: zona.libres, 'Ocupabilidad (%)': Number((zona.ocupados / zona.capacidad * 100).toFixed(2)),
                Responsable: zona.responsable_nombre || 'Pendiente', Registrado: zona.registrado_at || '', Observacion: zona.observacion || '' });
        });
        fila['Total autos ocupados'] = totales.ocupados;
        fila['Total autos disponibles'] = totales.libres;
        fila['Ocupabilidad autos (%)'] = Number((totales.ocupados / totales.capacidad * 100).toFixed(2));
        fila['Bicicletas ocupadas'] = totales.bicicletas;
        fila['Motos ocupadas'] = totales.motos;
        resumen.push(fila);
    });
    const libro = XLSX.utils.book_new();
    const hojaResumen = XLSX.utils.json_to_sheet(resumen);
    const hojaDetalle = XLSX.utils.json_to_sheet(detalle);
    hojaResumen['!cols'] = Object.keys(resumen[0]).map(() => ({ wch: 22 }));
    hojaDetalle['!cols'] = [12, 9, 20, 12, 12, 14, 18, 28, 24, 40].map(wch => ({ wch }));
    XLSX.utils.book_append_sheet(libro, hojaResumen, 'Consolidado por hora');
    XLSX.utils.book_append_sheet(libro, hojaDetalle, 'Detalle y responsables');
    XLSX.writeFile(libro, `Ocupabilidad-Salaverry-${fechaLocalISO()}.xlsx`, { compression: true });
    estado.textContent = 'Excel diario generado con todos los aportes disponibles.';
    estado.dataset.status = 'success';
}

function xmlSeguroOcupabilidad(valor) {
    return String(valor).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function asignarEstiloCeldaXml(xml, referencia, estilo) {
    const patron = new RegExp(`<c r="${referencia}"(?: s="\\d+")?`, 'g');
    return xml.replace(patron, `<c r="${referencia}" s="${estilo}"`);
}

async function aplicarFormatoVisualOcupabilidad(buffer) {
    if (!window.JSZip) return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const zip = await window.JSZip.loadAsync(buffer);
    const estilos = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="5">
<font><sz val="11"/><name val="Calibri"/><family val="2"/></font>
<font><b/><sz val="19"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
<font><b/><sz val="14"/><color rgb="FF000000"/><name val="Calibri"/></font>
<font><b/><sz val="14"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
<font><b/><sz val="16"/><color rgb="FFF04B1A"/><name val="Calibri"/></font>
</fonts>
<fills count="10">
<fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFFF0000"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF000000"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF2F75B5"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFFFC000"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF92D050"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF19A7D8"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFFFFFFF"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFF4F7F9"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="2"><border/><border><left style="thin"><color rgb="FF000000"/></left><right style="thin"><color rgb="FF000000"/></right><top style="thin"><color rgb="FF000000"/></top><bottom style="thin"><color rgb="FF000000"/></bottom></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="14">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="2" fillId="4" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="2" fillId="5" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="2" fillId="6" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="2" fillId="7" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="3" fillId="2" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="2" fillId="6" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="9" fontId="2" fillId="8" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="3" fillId="3" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="4" fillId="8" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="3" fillId="4" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
    zip.file('xl/styles.xml', estilos);

    let hojaXml = await zip.file('xl/worksheets/sheet1.xml').async('string');
    const estilosPorCelda = {};
    ['A1', 'B1', 'C1', 'D1', 'E1'].forEach(celda => { estilosPorCelda[celda] = 1; });
    ['A7', 'B7', 'C7', 'D7', 'E7'].forEach(celda => { estilosPorCelda[celda] = 2; });
    Object.assign(estilosPorCelda, { A8: 3, A9: 4, A10: 5, A11: 6, A12: 13, A13: 9, A15: 9, A16: 9,
        C3: 11, D3: 11, E3: 11, A3: 12 });
    for (let fila = 8; fila <= 13; fila += 1) {
        estilosPorCelda[`B${fila}`] = 7;
        estilosPorCelda[`C${fila}`] = 8;
        estilosPorCelda[`D${fila}`] = 9;
        estilosPorCelda[`E${fila}`] = 10;
    }
    for (const fila of [15, 16]) {
        estilosPorCelda[`B${fila}`] = 7;
        estilosPorCelda[`C${fila}`] = 8;
        estilosPorCelda[`D${fila}`] = 9;
        estilosPorCelda[`E${fila}`] = 10;
    }
    Object.entries(estilosPorCelda).forEach(([celda, estilo]) => { hojaXml = asignarEstiloCeldaXml(hojaXml, celda, estilo); });

    try {
        const logo = await fetch('assets/urbapark-logo.png').then(respuesta => respuesta.arrayBuffer());
        zip.file('xl/media/image1.png', logo);
        zip.file('xl/drawings/drawing1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><xdr:twoCellAnchor editAs="oneCell"><xdr:from><xdr:col>0</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>2</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:to><xdr:col>2</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>5</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="1" name="UrbaPark"/><xdr:cNvPicPr/></xdr:nvPicPr><xdr:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:twoCellAnchor></xdr:wsDr>`);
        zip.file('xl/drawings/_rels/drawing1.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image1.png"/></Relationships>`);
        zip.file('xl/worksheets/_rels/sheet1.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>`);
        if (!hojaXml.includes('xmlns:r=')) hojaXml = hojaXml.replace('<worksheet ', '<worksheet xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ');
        hojaXml = hojaXml.replace('</worksheet>', '<drawing r:id="rId1"/></worksheet>');
        let tipos = await zip.file('[Content_Types].xml').async('string');
        if (!tipos.includes('Extension="png"')) tipos = tipos.replace('</Types>', '<Default Extension="png" ContentType="image/png"/></Types>');
        if (!tipos.includes('/xl/drawings/drawing1.xml')) tipos = tipos.replace('</Types>', '<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>');
        zip.file('[Content_Types].xml', tipos);
    } catch (error) {
        console.warn('El Excel se genero sin el logo:', error);
    }
    zip.file('xl/worksheets/sheet1.xml', hojaXml);
    return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', compression: 'DEFLATE' });
}

function cargarImagenOcupabilidad(src) {
    return new Promise((resolve, reject) => {
        const imagen = new Image();
        imagen.onload = () => resolve(imagen);
        imagen.onerror = reject;
        imagen.src = src;
    });
}

function dibujarCeldaOcupabilidad(ctx, x, y, ancho, alto, fondo, texto, color = '#000000', tamano = 27) {
    ctx.fillStyle = fondo;
    ctx.fillRect(x, y, ancho, alto);
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, ancho, alto);
    ctx.fillStyle = color;
    ctx.font = `700 ${tamano}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(texto), x + ancho / 2, y + alto / 2, ancho - 14);
}

async function crearImagenCorteOcupabilidad(zonas, hora, fechaTexto) {
    const canvas = document.createElement('canvas');
    canvas.width = 1100;
    canvas.height = 860;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, canvas.width, 72);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 34px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('60% SE ABRE EL SIGUIENTE SOTANO', canvas.width / 2, 36);

    try {
        const logo = await cargarImagenOcupabilidad('assets/urbapark-logo.png');
        const maxAncho = 500;
        const maxAlto = 160;
        const escala = Math.min(maxAncho / logo.naturalWidth, maxAlto / logo.naturalHeight);
        const ancho = logo.naturalWidth * escala;
        const alto = logo.naturalHeight * escala;
        ctx.drawImage(logo, 18, 92 + (maxAlto - alto) / 2, ancho, alto);
    } catch (error) {
        ctx.fillStyle = '#ef4b1b';
        ctx.font = '800 50px Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('UrbaPark', 40, 165);
    }

    dibujarCeldaOcupabilidad(ctx, 570, 105, 235, 55, '#000000', fechaTexto, '#ffffff', 27);
    const horaGeneracion = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    dibujarCeldaOcupabilidad(ctx, 805, 105, 275, 55, '#000000', horaGeneracion, '#ffffff', 27);

    const x = 20;
    const yTabla = 270;
    const altos = 58;
    const anchos = [350, 205, 190, 175, 140];
    const posiciones = anchos.reduce((lista, ancho, indice) => {
        lista.push(indice ? lista[indice - 1] + anchos[indice - 1] : x);
        return lista;
    }, []);
    ['OCUPABILIDAD ' + hora, 'OCUPADOS', 'DISPO.', 'TOT.', '%'].forEach((texto, indice) => {
        dibujarCeldaOcupabilidad(ctx, posiciones[indice], yTabla, anchos[indice], altos, '#000000', texto, '#ffffff', indice ? 25 : 24);
    });

    const autos = zonas.filter(zona => zona.tipo === 'vehiculos');
    autos.forEach((zona, indice) => {
        const y = yTabla + altos * (indice + 1);
        const colorTexto = zona.id === 'parking-vip' ? '#ffffff' : '#000000';
        dibujarCeldaOcupabilidad(ctx, posiciones[0], y, anchos[0], altos, zona.color, zona.nombre.toUpperCase(), colorTexto, 27);
        dibujarCeldaOcupabilidad(ctx, posiciones[1], y, anchos[1], altos, '#ff0000', zona.ocupados, '#ffffff', 28);
        dibujarCeldaOcupabilidad(ctx, posiciones[2], y, anchos[2], altos, '#92d050', zona.libres, '#000000', 28);
        dibujarCeldaOcupabilidad(ctx, posiciones[3], y, anchos[3], altos, '#000000', zona.capacidad, '#ffffff', 28);
        dibujarCeldaOcupabilidad(ctx, posiciones[4], y, anchos[4], altos, '#ffffff', `${Math.round(zona.ocupados / zona.capacidad * 100)}%`, '#000000', 28);
    });
    const totales = calcularTotalesOcupabilidad(zonas);
    const yTotal = yTabla + altos * 6;
    dibujarCeldaOcupabilidad(ctx, posiciones[0], yTotal, anchos[0], altos, '#000000', 'TOTAL', '#ffffff', 28);
    dibujarCeldaOcupabilidad(ctx, posiciones[1], yTotal, anchos[1], altos, '#ff0000', totales.ocupados, '#ffffff', 28);
    dibujarCeldaOcupabilidad(ctx, posiciones[2], yTotal, anchos[2], altos, '#92d050', totales.libres, '#000000', 28);
    dibujarCeldaOcupabilidad(ctx, posiciones[3], yTotal, anchos[3], altos, '#000000', totales.capacidad, '#ffffff', 28);
    dibujarCeldaOcupabilidad(ctx, posiciones[4], yTotal, anchos[4], altos, '#ffffff', `${Math.round(totales.ocupados / totales.capacidad * 100)}%`, '#000000', 28);

    const movilidad = [zonas.find(zona => zona.id === 'bicicletas'), zonas.find(zona => zona.id === 'motos')];
    movilidad.forEach((zona, indice) => {
        const y = yTotal + altos + 22 + altos * indice;
        dibujarCeldaOcupabilidad(ctx, posiciones[0], y, anchos[0], altos, '#000000', zona.nombre.toUpperCase(), '#ffffff', 28);
        dibujarCeldaOcupabilidad(ctx, posiciones[1], y, anchos[1], altos, '#ff0000', zona.ocupados, '#ffffff', 28);
        dibujarCeldaOcupabilidad(ctx, posiciones[2], y, anchos[2], altos, '#92d050', zona.libres, '#000000', 28);
        dibujarCeldaOcupabilidad(ctx, posiciones[3], y, anchos[3], altos, '#000000', zona.capacidad, '#ffffff', 28);
        dibujarCeldaOcupabilidad(ctx, posiciones[4], y, anchos[4], altos, '#ffffff', `${Math.round(zona.ocupados / zona.capacidad * 100)}%`, '#000000', 28);
    });

    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('No se pudo crear la imagen.')), 'image/png', 0.96);
    });
}

async function exportarCorteOcupabilidadExcel(horaSeleccionada = '', compartir = false) {
    const estado = obtenerElemento('operationsOccupancyStatus');
    const hora = typeof horaSeleccionada === 'string' && horaSeleccionada ? horaSeleccionada : horaCorteOcupabilidad();
    const corte = (registroOcupabilidadDiaria?.cortes || []).find(item => item.hora === hora);
    const reportadas = corte?.zonas || [];
    const faltantes = ZONAS_OCUPABILIDAD_SALAVERRY.filter(config => !reportadas.some(zona => zona.id === config.id));
    if (!window.XLSX) {
        estado.textContent = 'No se pudo cargar el generador de Excel.';
        estado.dataset.status = 'error';
        return;
    }
    if (!corte || faltantes.length) {
        estado.textContent = `Completa las 7 zonas antes de generar el Excel. Faltan: ${faltantes.map(zona => zona.nombre).join(', ') || 'todas'}.`;
        estado.dataset.status = 'error';
        return;
    }
    const zonas = ZONAS_OCUPABILIDAD_SALAVERRY.map(config => zonaOcupabilidadCompleta(config, reportadas.find(zona => zona.id === config.id)));
    const autos = zonas.filter(zona => zona.tipo === 'vehiculos');
    const bicicletas = zonas.find(zona => zona.id === 'bicicletas');
    const motos = zonas.find(zona => zona.id === 'motos');
    const fecha = new Date(`${fechaLocalISO()}T12:00:00`);
    const fechaTexto = fecha.toLocaleDateString('es-PE');
    const horaTexto = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    if (compartir) {
        estado.textContent = 'Preparando la imagen para WhatsApp...';
        estado.dataset.status = 'info';
        try {
            const imagen = await crearImagenCorteOcupabilidad(zonas, hora, fechaTexto);
            const nombreImagen = `Ocupabilidad-Salaverry-${fechaLocalISO()}-${hora.replace(':', '')}.png`;
            const imagenCompartible = new File([imagen], nombreImagen, { type: 'image/png' });
            if (!navigator.share || (navigator.canShare && !navigator.canShare({ files: [imagenCompartible] }))) {
                const enlace = document.createElement('a');
                const url = URL.createObjectURL(imagen);
                enlace.href = url;
                enlace.download = nombreImagen;
                document.body.appendChild(enlace);
                enlace.click();
                enlace.remove();
                window.setTimeout(() => URL.revokeObjectURL(url), 1000);
                estado.textContent = 'Imagen descargada. Compartela desde WhatsApp en este dispositivo.';
                estado.dataset.status = 'success';
                return;
            }
            await navigator.share({
                files: [imagenCompartible],
                title: `Ocupabilidad Salaverry ${hora}`,
                text: `Ocupabilidad Real Plaza Salaverry - ${fechaTexto} ${hora}`
            });
            estado.textContent = `Imagen del corte ${hora} compartida.`;
            estado.dataset.status = 'success';
        } catch (error) {
            if (error?.name === 'AbortError') {
                estado.textContent = 'Se cancelo el envio por WhatsApp.';
                estado.dataset.status = 'info';
            } else {
                console.error('No se pudo compartir la imagen:', error);
                estado.textContent = 'No se pudo preparar la imagen. Intenta nuevamente.';
                estado.dataset.status = 'error';
            }
        }
        return;
    }
    const filas = [
        ['60% SE ABRE EL SIGUIENTE SOTANO', '', '', '', ''],
        ['', '', '', '', ''],
        ['UrbaPark', '', fechaTexto, horaTexto, ''],
        ['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', ''],
        [`OCUPABILIDAD ${hora}`, 'OCUPADOS', 'DISPO.', 'TOT.', '%'],
        ...autos.map(zona => [zona.nombre.toUpperCase(), zona.ocupados, zona.libres, zona.capacidad, { f: `IFERROR(B${autos.indexOf(zona) + 8}/D${autos.indexOf(zona) + 8},0)`, v: zona.ocupados / zona.capacidad }]),
        ['TOTAL', { f: 'SUM(B8:B12)', v: autos.reduce((suma, zona) => suma + zona.ocupados, 0) },
            { f: 'SUM(C8:C12)', v: autos.reduce((suma, zona) => suma + zona.libres, 0) },
            { f: 'SUM(D8:D12)', v: autos.reduce((suma, zona) => suma + zona.capacidad, 0) },
            { f: 'IFERROR(B13/D13,0)', v: autos.reduce((suma, zona) => suma + zona.ocupados, 0) / 1749 }],
        ['', '', '', '', ''],
        ['BICICLETAS', bicicletas.ocupados, bicicletas.libres, bicicletas.capacidad, { f: 'IFERROR(B15/D15,0)', v: bicicletas.ocupados / bicicletas.capacidad }],
        ['MOTOS', motos.ocupados, motos.libres, motos.capacidad, { f: 'IFERROR(B16/D16,0)', v: motos.ocupados / motos.capacidad }]
    ];
    const hoja = XLSX.utils.aoa_to_sheet(filas);
    hoja['!merges'] = [XLSX.utils.decode_range('A1:E1'), XLSX.utils.decode_range('A3:B5'), XLSX.utils.decode_range('D3:E3')];
    hoja['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 16 }, { wch: 15 }, { wch: 13 }];
    hoja['!rows'] = [{ hpt: 34 }, { hpt: 8 }, { hpt: 28 }, { hpt: 24 }, { hpt: 24 }, { hpt: 9 }, { hpt: 28 },
        { hpt: 27 }, { hpt: 27 }, { hpt: 27 }, { hpt: 27 }, { hpt: 27 }, { hpt: 29 }, { hpt: 12 }, { hpt: 27 }, { hpt: 27 }];
    hoja['!ref'] = 'A1:E16';
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, `Ocupabilidad ${hora.replace(':', '')}`);
    const buffer = XLSX.write(libro, { bookType: 'xlsx', type: 'array', compression: true });
    estado.textContent = 'Preparando el Excel de la hora...';
    estado.dataset.status = 'info';
    try {
        const archivo = await aplicarFormatoVisualOcupabilidad(buffer);
        const nombreArchivo = `Ocupabilidad-Salaverry-${fechaLocalISO()}-${hora.replace(':', '')}.xlsx`;
        const enlace = document.createElement('a');
        const url = URL.createObjectURL(archivo);
        enlace.href = url;
        enlace.download = nombreArchivo;
        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        estado.textContent = `Excel del corte ${hora} generado correctamente.`;
        estado.dataset.status = 'success';
    } catch (error) {
        if (error?.name === 'AbortError') {
            estado.textContent = 'Se cancelo el envio por WhatsApp.';
            estado.dataset.status = 'info';
            return;
        }
        console.error('No se pudo generar el Excel horario:', error);
        estado.textContent = 'No se pudo terminar el Excel horario. Intenta nuevamente.';
        estado.dataset.status = 'error';
    }
}

function obtenerSeccionesChecklistOperaciones(sede = obtenerSedeChecklistOperaciones()) {
    return OPERATIONS_CHECKLIST_SECTIONS.filter(seccion => !seccion.excluidaEn?.includes(sede));
}

function obtenerSedeChecklistOperaciones() {
    const sede = obtenerElemento('operationsChecklistSite')?.value || perfilActual?.sede;
    return SEDES_OPERACION.some(item => item.id === sede) ? sede : SEDES_OPERACION[0].id;
}

function usuarioPuedeElegirSedeChecklistOperaciones() {
    return usuarioEsRolGlobal() || perfilActual?.sede === 'general';
}

function usuarioPuedeVerInformeGeneralOperaciones() {
    return perfilActual?.activo !== false
        && [ROL_SUPERIOR, 'jefe_operaciones', 'coordinador_operaciones', 'gdh'].includes(perfilActual?.rol);
}

function usuarioPuedeGestionarChecklistOperaciones() {
    return perfilActual?.activo !== false
        && [ROL_SUPERIOR, 'admin', 'supervisor', 'fortaleza'].includes(perfilActual?.rol);
}

function usuarioPuedeAportarFotosChecklistOperaciones() {
    return perfilActual?.activo !== false && perfilActual?.rol === 'anfitrion';
}

function usuarioPuedeVerChecklistOperaciones() {
    return perfilActual?.activo !== false && Boolean(sesionActual?.user);
}

async function limpiarEvidenciasOperacionesVencidas() {
    if (!supabaseClient || !sesionActual?.user) return;
    const clave = `urbapark-operations-image-cleanup-${fechaLocalISO()}`;
    try {
        if (localStorage.getItem(clave)) return;
        const limite = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString();
        let consulta = supabaseClient.from('operaciones_checklists')
            .select('id,evidencias')
            .lt('updated_at', limite);
        if (!usuarioEsSuperior()) consulta = consulta.eq('responsable_id', sesionActual.user.id);
        const { data: registros, error } = await consulta;
        if (error) throw error;
        for (const registro of registros || []) {
            const rutas = Object.values(registro.evidencias || {}).flat()
                .map(foto => foto?.path).filter(Boolean);
            if (!rutas.length) continue;
            const { error: storageError } = await supabaseClient.storage.from(OPERATIONS_CHECKLIST_BUCKET).remove(rutas);
            if (storageError) throw storageError;
            const { error: updateError } = await supabaseClient.from('operaciones_checklists')
                .update({ evidencias: {} }).eq('id', registro.id);
            if (updateError) throw updateError;
        }
        localStorage.setItem(clave, 'ok');
    } catch (error) {
        console.warn('La limpieza de evidencias operativas quedo pendiente:', error);
    }
}

function fechaLocalISO(fecha = new Date()) {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
}

function horaLocal(fecha = new Date()) {
    return `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`;
}

const VENTANAS_CHECKLIST_OPERACIONES = Object.freeze({
    apertura: { etiqueta: 'Apertura', inicio: '05:00', puntualHasta: '10:00', cierre: '14:00' },
    intermedio: { etiqueta: 'Intermedio', inicio: '14:00', puntualHasta: '15:00', cierre: '18:00' },
    cierre: { etiqueta: 'Cierre', inicio: '18:00', puntualHasta: '23:00', cierre: '02:00' }
});

function minutosDelDia(fecha = new Date()) {
    return fecha.getHours() * 60 + fecha.getMinutes();
}

function restarDiasFechaLocal(fecha, dias) {
    const copia = new Date(fecha);
    copia.setDate(copia.getDate() - dias);
    return fechaLocalISO(copia);
}

function obtenerVentanaChecklistOperaciones(fecha = new Date()) {
    const minutos = minutosDelDia(fecha);
    let turno = '';
    let estado = 'cerrado';
    let fechaOperativa = fechaLocalISO(fecha);

    if (minutos >= 5 * 60 && minutos < 14 * 60) {
        turno = 'apertura';
        estado = minutos < 10 * 60 ? 'a_tiempo' : 'tardanza';
    } else if (minutos >= 14 * 60 && minutos < 18 * 60) {
        turno = 'intermedio';
        estado = minutos < 15 * 60 ? 'a_tiempo' : 'tardanza';
    } else if (minutos >= 18 * 60) {
        turno = 'cierre';
        estado = minutos < 23 * 60 ? 'a_tiempo' : 'tardanza';
    } else if (minutos < 2 * 60) {
        turno = 'cierre';
        estado = 'tardanza';
        fechaOperativa = restarDiasFechaLocal(fecha, 1);
    }

    const configuracion = turno ? VENTANAS_CHECKLIST_OPERACIONES[turno] : null;
    return {
        turno,
        estado,
        fechaOperativa,
        habilitado: estado !== 'cerrado',
        configuracion,
        mensaje: configuracion
            ? `${configuracion.etiqueta}: ${estado === 'a_tiempo' ? 'a tiempo' : 'con tardanza'}. Ventana ${configuracion.inicio}-${configuracion.cierre}; puntual hasta ${configuracion.puntualHasta}.`
            : 'Checklist cerrado. El siguiente turno de apertura se habilita a las 05:00.'
    };
}

function obtenerEstadoHorarioRegistroOperaciones(registro, fecha = new Date()) {
    const ventana = obtenerVentanaChecklistOperaciones(fecha);
    if (!registro?.turno) return ventana;
    if (registro.estado === 'finalizado') {
        return { ...ventana, habilitado: false, estado: 'cerrado', mensaje: 'Checklist finalizado. El resultado permanece disponible para consulta.' };
    }
    const corresponde = ventana.habilitado
        && registro.turno === ventana.turno
        && registro.fecha === ventana.fechaOperativa;
    return corresponde
        ? ventana
        : { ...ventana, habilitado: false, estado: 'cerrado', mensaje: `El turno ${VENTANAS_CHECKLIST_OPERACIONES[registro.turno]?.etiqueta || registro.turno} de este borrador ya cerro. El avance queda conservado, pero no puede modificarse ni finalizarse.` };
}

function obtenerPuntualidadChecklistOperaciones(registro) {
    if (registro?.estado_horario) return registro.estado_horario;
    if (registro?.observaciones?.__estado_horario) return registro.observaciones.__estado_horario;
    if (registro?.inicio_at) {
        const estadoInferido = obtenerVentanaChecklistOperaciones(new Date(registro.inicio_at)).estado;
        return estadoInferido === 'cerrado' ? '' : estadoInferido;
    }
    return '';
}

function crearEstadoNuevoChecklistOperaciones(sede) {
    const ahora = new Date();
    const ventana = obtenerVentanaChecklistOperaciones(ahora);
    return {
        id: null,
        sede,
        fecha: ventana.fechaOperativa,
        inicio_at: ahora.toISOString(),
        responsable_id: sesionActual?.user?.id || '',
        responsable_nombre: obtenerNombreUsuarioActivo(),
        responsable_rol: perfilActual?.rol || '',
        turno: ventana.turno,
        estado_horario: ventana.estado,
        estado: 'borrador',
        respuestas: {},
        observaciones: { __estado_horario: ventana.estado },
        evidencias: {}
    };
}

function configurarSelectSedesOperaciones() {
    const formulario = obtenerElemento('operationsChecklistSite');
    const dashboard = obtenerElemento('operationsDashboardSite');
    [formulario, dashboard].forEach(selector => {
        if (!selector || selector.options.length) return;
        SEDES_OPERACION.forEach(sede => selector.add(new Option(sede.nombre, sede.id)));
    });
    if (formulario) {
        formulario.value = SEDES_OPERACION.some(item => item.id === perfilActual?.sede)
            ? perfilActual.sede
            : SEDES_OPERACION[0].id;
        formulario.disabled = !usuarioPuedeElegirSedeChecklistOperaciones();
    }
    if (dashboard) {
        dashboard.value = SEDES_OPERACION.some(item => item.id === perfilActual?.sede)
            ? perfilActual.sede
            : SEDES_OPERACION[0].id;
        dashboard.disabled = !usuarioPuedeElegirSedeChecklistOperaciones();
    }
    const botonInforme = obtenerElemento('openOperationsGeneralReport');
    if (botonInforme) botonInforme.hidden = !usuarioPuedeVerInformeGeneralOperaciones();
    const botonChecklist = obtenerElemento('openOperationsChecklist');
    if (botonChecklist) {
        botonChecklist.hidden = !usuarioPuedeVerChecklistOperaciones();
        botonChecklist.textContent = usuarioPuedeGestionarChecklistOperaciones()
            ? 'Iniciar o continuar checklist'
            : 'Ver checklist activo';
    }
}

function actualizarEstadoChecklistOperaciones(mensaje = '', estado = 'info') {
    const salida = obtenerElemento('operationsChecklistStatus');
    if (!salida) return;
    salida.textContent = mensaje;
    salida.dataset.status = estado;
}

function actualizarBannerBorradorOperaciones(mensaje = 'El avance se guarda automaticamente.', estado = 'info') {
    const banner = obtenerElemento('operationsDraftBanner');
    if (!banner) return;
    banner.textContent = mensaje;
    banner.dataset.status = estado;
}

async function cargarBorradorChecklistOperaciones(sede) {
    checklistOperacionesActual = crearEstadoNuevoChecklistOperaciones(sede);
    const ventana = obtenerVentanaChecklistOperaciones();
    if (supabaseClient && sesionActual?.user && ventana.habilitado) {
        const { data, error } = await supabaseClient
            .from('operaciones_checklists')
            .select('*')
            .eq('sede', sede)
            .eq('fecha', ventana.fechaOperativa)
            .eq('turno', ventana.turno)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error && error.code !== 'PGRST116') {
            console.warn('No se pudo recuperar el checklist operativo:', error);
            actualizarBannerBorradorOperaciones('No se pudo consultar el borrador remoto.', 'error');
        } else if (data) {
            checklistOperacionesActual = data;
            checklistOperacionesActual.estado_horario = obtenerPuntualidadChecklistOperaciones(data);
            await hidratarEvidenciasChecklistOperaciones(checklistOperacionesActual);
            actualizarBannerBorradorOperaciones(
                data.estado === 'finalizado' ? 'Checklist finalizado para este turno.' : 'Checklist activo recuperado automaticamente.',
                'success'
            );
        } else if (usuarioPuedeGestionarChecklistOperaciones() && ventana.habilitado) {
            try {
                await asegurarRegistroChecklistOperaciones();
                actualizarBannerBorradorOperaciones('Checklist iniciado. El equipo de la sede ya puede ver el avance y aportar fotos.', 'success');
            } catch (inicioError) {
                console.warn('No se pudo iniciar el checklist operativo:', inicioError);
                actualizarBannerBorradorOperaciones('No se pudo iniciar el checklist. Revisa la conexion.', 'error');
            }
        } else if (!ventana.habilitado) {
            actualizarBannerBorradorOperaciones(ventana.mensaje, 'info');
        } else {
            actualizarBannerBorradorOperaciones('Todavia no hay un checklist iniciado para este turno.', 'info');
        }
    }
    renderizarChecklistOperaciones();
    suscribirChecklistOperaciones(sede);
}

function firmaSincronizacionChecklistOperaciones(registro) {
    const evidencias = {};
    Object.entries(registro?.evidencias || {}).forEach(([seccion, fotos]) => {
        evidencias[seccion] = Array.isArray(fotos) ? fotos.map(foto => foto?.path || '') : [];
    });
    return JSON.stringify({
        estado: registro?.estado,
        respuestas: registro?.respuestas || {},
        observaciones: registro?.observaciones || {},
        evidencias
    });
}

function suscribirChecklistOperaciones(sede) {
    if (!supabaseClient || !sesionActual?.user || !sede) return;
    if (canalChecklistOperaciones) supabaseClient.removeChannel(canalChecklistOperaciones);
    canalChecklistOperaciones = supabaseClient
        .channel(`operaciones-checklist-${sede}`)
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'operaciones_checklists', filter: `sede=eq.${sede}` },
            async payload => {
                const remoto = payload.new;
                if (!remoto || remoto.sede !== sede) return;
                const ventana = obtenerVentanaChecklistOperaciones();
                const esTurnoActual = remoto.fecha === ventana.fechaOperativa && remoto.turno === ventana.turno;
                const esRegistroActual = checklistOperacionesActual?.id && remoto.id === checklistOperacionesActual.id;
                if (!esTurnoActual && !esRegistroActual) return;
                if (esRegistroActual && firmaSincronizacionChecklistOperaciones(remoto) === firmaSincronizacionChecklistOperaciones(checklistOperacionesActual)) return;
                checklistOperacionesActual = remoto;
                checklistOperacionesActual.estado_horario = obtenerPuntualidadChecklistOperaciones(remoto);
                await hidratarEvidenciasChecklistOperaciones(checklistOperacionesActual);
                const panel = obtenerElemento('operationsChecklistPanel');
                const posicion = panel?.scrollTop || 0;
                renderizarChecklistOperaciones();
                if (panel) panel.scrollTop = posicion;
                if (remoto.estado === 'finalizado') actualizarBannerBorradorOperaciones('Checklist finalizado. Puedes consultar el resultado en Historial y KPI.', 'success');
                else actualizarBannerBorradorOperaciones('Avance actualizado por el equipo de la sede.', 'success');
            }
        )
        .subscribe();
}

function crearTextoElemento(etiqueta, texto, clase = '') {
    const elemento = document.createElement(etiqueta);
    elemento.textContent = texto;
    if (clase) elemento.className = clase;
    return elemento;
}

function crearOpcionEstadoOperaciones(seccionId, itemId, valor, etiqueta) {
    const label = document.createElement('label');
    const input = document.createElement('input');
    const texto = document.createElement('span');
    label.className = `operations-status-option is-${valor}`;
    input.type = 'radio';
    input.name = `operations-${seccionId}-${itemId}`;
    input.value = valor;
    input.dataset.operationsSection = seccionId;
    input.dataset.operationsItem = itemId;
    input.checked = checklistOperacionesActual?.respuestas?.[`${seccionId}:${itemId}`] === valor;
    texto.textContent = etiqueta;
    label.append(input, texto);
    return label;
}

function obtenerEvidenciasSeccionOperaciones(registro, seccionId) {
    const evidencias = registro?.evidencias?.[seccionId];
    return Array.isArray(evidencias) ? evidencias : [];
}

function obtenerScopeEvidenciasOperaciones(registro = checklistOperacionesActual) {
    return registro?.id ? `operaciones:${registro.id}` : '';
}

function obtenerEvidenciasOperacionesPersistibles(evidencias = checklistOperacionesActual?.evidencias) {
    const resultado = {};
    Object.entries(evidencias || {}).forEach(([seccion, fotos]) => {
        resultado[seccion] = (Array.isArray(fotos) ? fotos : [])
            .filter(foto => foto?.path && !foto.pendiente)
            .map(foto => ({
                path: foto.path,
                nombre: foto.nombre || 'evidencia.jpg',
                autor_id: foto.autor_id || '',
                autor_nombre: foto.autor_nombre || '',
                creado_at: foto.creado_at || ''
            }));
    });
    return resultado;
}

async function recuperarEvidenciasPendientesOperaciones(registro = checklistOperacionesActual) {
    const scope = obtenerScopeEvidenciasOperaciones(registro);
    if (!scope) return;
    try {
        const pendientes = await leerMediaPorScope(scope);
        pendientes.forEach(pendiente => {
            const seccion = pendiente.seccionId;
            if (!seccion) return;
            registro.evidencias = registro.evidencias || {};
            if (!Array.isArray(registro.evidencias[seccion])) registro.evidencias[seccion] = [];
            if (!registro.evidencias[seccion].some(foto => foto.localKey === pendiente.key)) {
                registro.evidencias[seccion].push({
                    localKey: pendiente.key,
                    dataUrl: pendiente.dataUrl,
                    nombre: pendiente.nombre || 'evidencia.jpg',
                    autor_nombre: pendiente.autorNombre || obtenerNombreUsuarioActivo(),
                    creado_at: pendiente.savedAt,
                    pendiente: true
                });
            }
        });
    } catch (error) {
        console.warn('No se pudieron recuperar evidencias operativas pendientes:', error);
    }
}

async function sincronizarEvidenciasPendientesOperaciones(registro = checklistOperacionesActual) {
    const scope = obtenerScopeEvidenciasOperaciones(registro);
    if (!scope || !supabaseClient || !sesionActual?.user || registro.estado !== 'borrador') return;
    let pendientes = [];
    try {
        pendientes = await leerMediaPorScope(scope);
    } catch (error) {
        console.warn('No se pudo consultar la cola de fotos operativas:', error);
        return;
    }
    for (const pendiente of pendientes) {
        let ruta = '';
        try {
            const blob = await fetch(pendiente.dataUrl).then(respuesta => respuesta.blob());
            ruta = `${registro.sede}/${sesionActual.user.id}/${registro.id}/${pendiente.seccionId}/${Date.now()}-${Math.random().toString(16).slice(2)}.jpg`;
            const { error: uploadError } = await supabaseClient.storage
                .from(OPERATIONS_CHECKLIST_BUCKET)
                .upload(ruta, blob, { contentType: 'image/jpeg', upsert: false });
            if (uploadError) throw uploadError;
            const { data, error: rpcError } = await supabaseClient.rpc('agregar_evidencia_checklist_operaciones', {
                checklist_id_arg: registro.id,
                seccion_arg: pendiente.seccionId,
                evidencia_arg: { path: ruta, nombre: pendiente.nombre || 'evidencia.jpg' }
            });
            if (rpcError) throw rpcError;
            registro.evidencias = data || registro.evidencias || {};
            await eliminarMediaLocal(pendiente.key);
        } catch (error) {
            console.warn('La evidencia operativa sigue pendiente de sincronizar:', error);
            if (ruta) await supabaseClient.storage.from(OPERATIONS_CHECKLIST_BUCKET).remove([ruta]);
        }
    }
}

async function hidratarEvidenciasChecklistOperaciones(registro) {
    if (!registro) return registro;
    if (supabaseClient && registro.evidencias) {
        const fotos = Object.values(registro.evidencias).flat().filter(foto => foto?.path);
        await Promise.all(fotos.map(async foto => {
            if (foto.url && Number(foto.urlExpiresAt || 0) > Date.now()) return;
            const { data, error } = await supabaseClient.storage
                .from(OPERATIONS_CHECKLIST_BUCKET)
                .createSignedUrl(foto.path, 60 * 60 * 24);
            if (!error && data?.signedUrl) {
                foto.url = data.signedUrl;
                foto.urlExpiresAt = Date.now() + (23 * 60 * 60 * 1000);
            }
        }));
    }
    await recuperarEvidenciasPendientesOperaciones(registro);
    await sincronizarEvidenciasPendientesOperaciones(registro);
    return registro;
}

function crearPanelEvidenciasChecklistOperaciones(seccion) {
    const panel = document.createElement('section');
    const cabecera = document.createElement('div');
    const acciones = document.createElement('div');
    const galeria = document.createElement('div');
    const fotos = obtenerEvidenciasSeccionOperaciones(checklistOperacionesActual, seccion.id);
    const puedeAdjuntar = usuarioPuedeGestionarChecklistOperaciones() || usuarioPuedeAportarFotosChecklistOperaciones();
    panel.className = 'operations-evidence-panel';
    panel.dataset.operationsEvidencePanel = seccion.id;
    cabecera.className = 'operations-evidence-heading';
    cabecera.append(
        crearTextoElemento('strong', 'Evidencias del bloque'),
        crearTextoElemento('span', `${fotos.length} de 5 fotos · minimo 3`)
    );
    acciones.className = 'operations-evidence-actions';
    galeria.className = 'operations-evidence-gallery';

    if (puedeAdjuntar) {
        const crearEntrada = (captura, multiple, etiqueta) => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            label.className = 'clear-btn operations-photo-action';
            label.textContent = etiqueta;
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = multiple;
            input.hidden = true;
            input.dataset.operationsEvidenceInput = seccion.id;
            if (captura) input.setAttribute('capture', 'environment');
            label.appendChild(input);
            return label;
        };
        acciones.append(
            crearEntrada(true, false, 'Tomar foto'),
            crearEntrada(false, true, 'Elegir fotos')
        );
    }

    fotos.forEach((foto, indice) => {
        const figura = document.createElement('figure');
        const imagen = document.createElement('img');
        const pie = document.createElement('figcaption');
        figura.className = 'operations-evidence-item';
        imagen.src = foto.url || foto.dataUrl || '';
        imagen.alt = `Evidencia ${indice + 1} de ${seccion.nombre}`;
        imagen.loading = 'lazy';
        pie.textContent = `${foto.autor_nombre || 'Personal de sede'} · ${foto.creado_at ? formatearFechaHoraReporte(foto.creado_at) : 'sin hora'}`;
        if (foto.pendiente) figura.classList.add('is-pending');
        figura.append(imagen, pie);
        galeria.appendChild(figura);
    });

    if (!fotos.length) galeria.appendChild(crearMensajeVacio('Aun no se adjuntaron fotos en este bloque.', 'operations-evidence-empty'));
    const estado = crearTextoElemento('p', '', 'auth-status operations-evidence-status');
    estado.dataset.operationsPhotoStatus = seccion.id;
    panel.append(cabecera, acciones, galeria, estado);
    return panel;
}

function renderizarChecklistOperaciones() {
    const registro = checklistOperacionesActual;
    const contenedor = obtenerElemento('operationsChecklistSections');
    if (!registro || !contenedor) return;
    limpiarElemento(contenedor);
    obtenerElemento('operationsChecklistSite').value = registro.sede;
    obtenerElemento('operationsChecklistDate').value = registro.fecha;
    obtenerElemento('operationsChecklistStartTime').value = horaLocal(new Date(registro.inicio_at));
    obtenerElemento('operationsChecklistResponsible').value = registro.responsable_nombre;
    obtenerElemento('operationsChecklistRole').value = obtenerEtiquetaRol(registro.responsable_rol);
    obtenerElemento('operationsChecklistShift').value = registro.turno || '';
    const estadoHorario = obtenerEstadoHorarioRegistroOperaciones(registro);
    const estadoVentana = obtenerElemento('operationsShiftWindowStatus');
    if (estadoVentana) {
        estadoVentana.textContent = estadoHorario.mensaje;
        estadoVentana.dataset.status = estadoHorario.estado;
    }

    obtenerSeccionesChecklistOperaciones(registro.sede).forEach(seccion => {
        const tarjeta = document.createElement('section');
        const cabecera = document.createElement('div');
        const tituloGrupo = document.createElement('div');
        const insignia = crearTextoElemento('span', seccion.criticidad === 'mixta' ? 'Criticidad mixta' : `Criticidad ${seccion.criticidad}`, `operations-criticality is-${seccion.criticidad}`);
        const lista = document.createElement('div');
        tarjeta.className = 'operations-checklist-section';
        tarjeta.dataset.operationsSectionCard = seccion.id;
        cabecera.className = 'operations-checklist-section-heading';
        tituloGrupo.append(crearTextoElemento('h3', seccion.nombre), crearTextoElemento('p', seccion.descripcion));
        cabecera.append(tituloGrupo, insignia);
        lista.className = 'operations-checklist-items';
        seccion.items.forEach(([id, texto, criticidad]) => {
            const fila = document.createElement('article');
            const detalle = document.createElement('div');
            const opciones = document.createElement('fieldset');
            const leyenda = document.createElement('legend');
            fila.className = 'operations-checklist-item';
            fila.dataset.operationsItemRow = `${seccion.id}:${id}`;
            detalle.append(
                crearTextoElemento('p', texto),
                crearTextoElemento('span', criticidad === 'critica' ? 'Punto critico' : criticidad === 'media' ? 'Prioridad media' : 'Prioridad baja', `operations-item-priority is-${criticidad}`)
            );
            leyenda.className = 'sr-only';
            leyenda.textContent = `Resultado para ${texto}`;
            opciones.className = 'operations-status-options';
            opciones.append(
                leyenda,
                crearOpcionEstadoOperaciones(seccion.id, id, 'cumple', 'Si cumple'),
                crearOpcionEstadoOperaciones(seccion.id, id, 'no_cumple', 'No cumple'),
                crearOpcionEstadoOperaciones(seccion.id, id, 'na', 'N.A.')
            );
            fila.append(detalle, opciones);
            lista.appendChild(fila);
        });
        const observacionLabel = document.createElement('label');
        const observacion = document.createElement('textarea');
        observacionLabel.className = 'operations-observation';
        observacionLabel.appendChild(crearTextoElemento('span', 'Novedad y solucion aplicada'));
        observacion.rows = 3;
        observacion.maxLength = 1200;
        observacion.placeholder = 'Obligatorio cuando exista un punto que no cumple.';
        observacion.dataset.operationsObservation = seccion.id;
        observacion.value = registro.observaciones?.[seccion.id] || '';
        observacionLabel.appendChild(observacion);
        tarjeta.append(cabecera, lista, observacionLabel, crearPanelEvidenciasChecklistOperaciones(seccion));
        contenedor.appendChild(tarjeta);
    });
    actualizarProgresoChecklistOperaciones();
    establecerBloqueoHorarioChecklistOperaciones(!estadoHorario.habilitado);
}

function establecerBloqueoHorarioChecklistOperaciones(bloqueado) {
    const formulario = obtenerElemento('operationsChecklistForm');
    if (!formulario) return;
    const puedeGestionar = usuarioPuedeGestionarChecklistOperaciones();
    const puedeAdjuntar = puedeGestionar || usuarioPuedeAportarFotosChecklistOperaciones();
    formulario.querySelectorAll('#operationsChecklistSections input[type="radio"], #operationsChecklistSections textarea').forEach(control => {
        control.disabled = bloqueado || !puedeGestionar;
    });
    formulario.querySelectorAll('input[data-operations-evidence-input]').forEach(control => {
        const cantidad = obtenerEvidenciasSeccionOperaciones(checklistOperacionesActual, control.dataset.operationsEvidenceInput).length;
        control.disabled = bloqueado || !puedeAdjuntar || !checklistOperacionesActual?.id || cantidad >= 5;
        control.closest('label')?.classList.toggle('is-disabled', control.disabled);
    });
    const finalizar = obtenerElemento('finishOperationsChecklist');
    if (finalizar) {
        finalizar.hidden = !puedeGestionar;
        finalizar.disabled = bloqueado || !puedeGestionar || !checklistOperacionesActual?.id;
    }
    const descartar = obtenerElemento('discardOperationsChecklist');
    if (descartar) descartar.hidden = !puedeGestionar;
    formulario.classList.toggle('is-time-locked', bloqueado);
    formulario.classList.toggle('is-photo-contributor', !puedeGestionar && puedeAdjuntar);
}

function actualizarControlHorarioChecklistOperaciones() {
    if (!checklistOperacionesActual) return;
    const ventanaActual = obtenerVentanaChecklistOperaciones();
    const sinAvance = !checklistOperacionesActual.id
        && Object.keys(checklistOperacionesActual.respuestas || {}).length === 0;
    if (sinAvance && ventanaActual.habilitado && (
        checklistOperacionesActual.turno !== ventanaActual.turno
        || checklistOperacionesActual.fecha !== ventanaActual.fechaOperativa
    )) {
        checklistOperacionesActual.turno = ventanaActual.turno;
        checklistOperacionesActual.fecha = ventanaActual.fechaOperativa;
        checklistOperacionesActual.inicio_at = new Date().toISOString();
        checklistOperacionesActual.estado_horario = ventanaActual.estado;
        checklistOperacionesActual.observaciones.__estado_horario = ventanaActual.estado;
        obtenerElemento('operationsChecklistShift').value = ventanaActual.turno;
        obtenerElemento('operationsChecklistDate').value = ventanaActual.fechaOperativa;
        obtenerElemento('operationsChecklistStartTime').value = horaLocal();
    }
    const estadoHorario = obtenerEstadoHorarioRegistroOperaciones(checklistOperacionesActual);
    const estadoVentana = obtenerElemento('operationsShiftWindowStatus');
    if (estadoVentana) {
        estadoVentana.textContent = estadoHorario.mensaje;
        estadoVentana.dataset.status = estadoHorario.estado;
    }
    establecerBloqueoHorarioChecklistOperaciones(!estadoHorario.habilitado);
}

function calcularResumenChecklistOperaciones(registro = checklistOperacionesActual) {
    const secciones = obtenerSeccionesChecklistOperaciones(registro?.sede);
    const items = secciones.flatMap(seccion => seccion.items.map(item => ({ seccion: seccion.id, id: item[0], criticidad: item[2] })));
    const valores = items.map(item => ({ ...item, valor: registro?.respuestas?.[`${item.seccion}:${item.id}`] || '' }));
    const cumple = valores.filter(item => item.valor === 'cumple').length;
    const noCumple = valores.filter(item => item.valor === 'no_cumple').length;
    const noAplica = valores.filter(item => item.valor === 'na').length;
    const revisados = cumple + noCumple + noAplica;
    const evaluados = cumple + noCumple;
    return {
        total: items.length,
        revisados,
        cumple,
        noCumple,
        noAplica,
        cumplimiento: evaluados ? Number(((cumple / evaluados) * 100).toFixed(2)) : 0,
        criticos: valores.filter(item => item.valor === 'no_cumple' && item.criticidad === 'critica').length
    };
}

function actualizarProgresoChecklistOperaciones() {
    if (!checklistOperacionesActual) return;
    const resumen = calcularResumenChecklistOperaciones();
    obtenerElemento('operationsChecklistProgress').textContent = `${resumen.revisados} de ${resumen.total} puntos revisados`;
    document.querySelectorAll('[data-operations-item-row]').forEach(fila => {
        const valor = checklistOperacionesActual.respuestas?.[fila.dataset.operationsItemRow];
        fila.dataset.result = valor || '';
    });
}

async function asegurarRegistroChecklistOperaciones() {
    if (checklistOperacionesActual?.id) return checklistOperacionesActual.id;
    if (!supabaseClient || !sesionActual?.user || !checklistOperacionesActual) throw new Error('No hay conexion con Supabase.');
    const registro = checklistOperacionesActual;
    const { data, error } = await supabaseClient.from('operaciones_checklists').insert({
        sede: registro.sede,
        fecha: registro.fecha,
        inicio_at: registro.inicio_at,
        responsable_id: sesionActual.user.id,
        responsable_nombre: registro.responsable_nombre,
        responsable_rol: registro.responsable_rol,
        turno: registro.turno || null,
        respuestas: registro.respuestas,
        observaciones: registro.observaciones,
        evidencias: obtenerEvidenciasOperacionesPersistibles(registro.evidencias)
    }).select('*').single();
    if (error) throw error;
    Object.assign(registro, data);
    return data.id;
}

function programarGuardadoChecklistOperaciones() {
    window.clearTimeout(temporizadorChecklistOperaciones);
    actualizarBannerBorradorOperaciones('Guardando avance...', 'info');
    temporizadorChecklistOperaciones = window.setTimeout(guardarBorradorChecklistOperaciones, 500);
}

async function guardarBorradorChecklistOperaciones() {
    if (!checklistOperacionesActual || checklistOperacionesActual.estado !== 'borrador') return;
    if (!obtenerEstadoHorarioRegistroOperaciones(checklistOperacionesActual).habilitado) {
        actualizarBannerBorradorOperaciones('Turno cerrado. El borrador se conserva sin nuevos cambios.', 'error');
        return;
    }
    try {
        checklistOperacionesActual.observaciones.__estado_horario = checklistOperacionesActual.estado_horario;
        await asegurarRegistroChecklistOperaciones();
        const resumen = calcularResumenChecklistOperaciones();
        const { error } = await supabaseClient.from('operaciones_checklists').update({
            turno: checklistOperacionesActual.turno || null,
            respuestas: checklistOperacionesActual.respuestas,
            observaciones: checklistOperacionesActual.observaciones,
            evidencias: obtenerEvidenciasOperacionesPersistibles(checklistOperacionesActual.evidencias),
            total_items: resumen.total,
            cumple_items: resumen.cumple,
            no_cumple_items: resumen.noCumple,
            no_aplica_items: resumen.noAplica,
            cumplimiento: resumen.cumplimiento,
            criticos_no_cumple: resumen.criticos
        }).eq('id', checklistOperacionesActual.id);
        if (error) throw error;
        actualizarBannerBorradorOperaciones(`Avance guardado a las ${horaLocal()}.`, 'success');
    } catch (error) {
        console.warn('No se pudo guardar el checklist operativo:', error);
        actualizarBannerBorradorOperaciones('No se pudo guardar. Revisa la conexion antes de cerrar.', 'error');
    }
}

function validarChecklistOperaciones() {
    const registro = checklistOperacionesActual;
    const resumen = calcularResumenChecklistOperaciones(registro);
    const estadoHorario = obtenerEstadoHorarioRegistroOperaciones(registro);
    if (!estadoHorario.habilitado) return estadoHorario.mensaje;
    if (!registro?.turno) return 'Selecciona el turno de la revision.';
    if (resumen.revisados !== resumen.total) return `Faltan ${resumen.total - resumen.revisados} puntos por revisar.`;
    for (const seccion of obtenerSeccionesChecklistOperaciones(registro.sede)) {
        const fotosSeccion = obtenerEvidenciasSeccionOperaciones(registro, seccion.id);
        if (fotosSeccion.some(foto => foto.pendiente)) return `Hay fotos pendientes de sincronizar en ${seccion.nombre}. Conecta el equipo antes de finalizar.`;
        const cantidadFotos = fotosSeccion.length;
        if (cantidadFotos < 3) return `Adjunta al menos 3 fotos en ${seccion.nombre}.`;
        const tieneNoCumple = seccion.items.some(item => registro.respuestas?.[`${seccion.id}:${item[0]}`] === 'no_cumple');
        if (tieneNoCumple && !String(registro.observaciones?.[seccion.id] || '').trim()) {
            return `Describe la novedad y solucion en ${seccion.nombre}.`;
        }
    }
    return '';
}

async function adjuntarFotosChecklistOperaciones(seccionId, archivos) {
    const estado = document.querySelector(`[data-operations-photo-status="${seccionId}"]`);
    if (!checklistOperacionesActual?.id || !supabaseClient || !sesionActual?.user) {
        if (estado) estado.textContent = 'El checklist debe estar iniciado antes de adjuntar fotos.';
        return;
    }
    if (!(usuarioPuedeGestionarChecklistOperaciones() || usuarioPuedeAportarFotosChecklistOperaciones())) return;
    const actuales = obtenerEvidenciasSeccionOperaciones(checklistOperacionesActual, seccionId);
    const disponibles = Math.max(0, 5 - actuales.length);
    const seleccionados = Array.from(archivos || []).slice(0, disponibles);
    if (!seleccionados.length) {
        if (estado) estado.textContent = actuales.length >= 5 ? 'Este bloque ya tiene el maximo de 5 fotos.' : 'Selecciona una foto.';
        return;
    }
    if (estado) estado.textContent = `Subiendo ${seleccionados.length} foto(s)...`;
    let agregadas = 0;
    for (const archivo of seleccionados) {
        let ruta = '';
        let dataUrl = '';
        const localKey = `operaciones:${checklistOperacionesActual.id}:${seccionId}:${Date.now()}-${Math.random().toString(16).slice(2)}`;
        try {
            dataUrl = await comprimirFoto(archivo, 1280, 0.74);
            await guardarMediaLocal(localKey, dataUrl, obtenerScopeEvidenciasOperaciones(), {
                seccionId,
                nombre: archivo.name || 'evidencia.jpg',
                autorNombre: obtenerNombreUsuarioActivo()
            });
            const blob = await fetch(dataUrl).then(respuesta => respuesta.blob());
            ruta = `${checklistOperacionesActual.sede}/${sesionActual.user.id}/${checklistOperacionesActual.id}/${seccionId}/${Date.now()}-${Math.random().toString(16).slice(2)}.jpg`;
            const { error: uploadError } = await supabaseClient.storage
                .from(OPERATIONS_CHECKLIST_BUCKET)
                .upload(ruta, blob, { contentType: 'image/jpeg', upsert: false });
            if (uploadError) throw uploadError;
            const evidencia = {
                path: ruta,
                nombre: archivo.name || 'evidencia.jpg',
                autor_id: sesionActual.user.id,
                autor_nombre: obtenerNombreUsuarioActivo(),
                creado_at: new Date().toISOString()
            };
            const { data: evidenciasActualizadas, error: rpcError } = await supabaseClient.rpc('agregar_evidencia_checklist_operaciones', {
                checklist_id_arg: checklistOperacionesActual.id,
                seccion_arg: seccionId,
                evidencia_arg: evidencia
            });
            if (rpcError) throw rpcError;
            checklistOperacionesActual.evidencias = evidenciasActualizadas || checklistOperacionesActual.evidencias || {};
            await eliminarMediaLocal(localKey);
            await hidratarEvidenciasChecklistOperaciones(checklistOperacionesActual);
            agregadas += 1;
        } catch (error) {
            console.warn('No se pudo adjuntar evidencia operativa:', error);
            if (ruta) await supabaseClient.storage.from(OPERATIONS_CHECKLIST_BUCKET).remove([ruta]);
            if (dataUrl) {
                checklistOperacionesActual.evidencias = checklistOperacionesActual.evidencias || {};
                const fotosPendientes = checklistOperacionesActual.evidencias[seccionId] || [];
                if (!fotosPendientes.some(foto => foto.localKey === localKey)) {
                    fotosPendientes.push({
                        localKey,
                        dataUrl,
                        nombre: archivo.name || 'evidencia.jpg',
                        autor_nombre: obtenerNombreUsuarioActivo(),
                        creado_at: new Date().toISOString(),
                        pendiente: true
                    });
                    checklistOperacionesActual.evidencias[seccionId] = fotosPendientes;
                }
            }
        }
    }
    const panel = obtenerElemento('operationsChecklistPanel');
    const posicion = panel?.scrollTop || 0;
    renderizarChecklistOperaciones();
    if (panel) panel.scrollTop = posicion;
    const estadoActual = document.querySelector(`[data-operations-photo-status="${seccionId}"]`);
    if (estadoActual) {
        estadoActual.textContent = agregadas
            ? `${agregadas} foto(s) agregada(s) por ${obtenerNombreUsuarioActivo()}.`
            : 'Foto protegida en este dispositivo y pendiente de sincronizar. Revisa la conexion.';
        estadoActual.dataset.status = agregadas ? 'success' : 'error';
    }
}

async function finalizarChecklistOperaciones(event) {
    event.preventDefault();
    const validacion = validarChecklistOperaciones();
    if (validacion) {
        actualizarEstadoChecklistOperaciones(validacion, 'error');
        return;
    }
    actualizarEstadoChecklistOperaciones('Finalizando checklist...', 'info');
    try {
        await asegurarRegistroChecklistOperaciones();
        const resumen = calcularResumenChecklistOperaciones();
        const finAt = new Date().toISOString();
        const { error } = await supabaseClient.from('operaciones_checklists').update({
            turno: checklistOperacionesActual.turno,
            estado: 'finalizado',
            fin_at: finAt,
            respuestas: checklistOperacionesActual.respuestas,
            observaciones: checklistOperacionesActual.observaciones,
            evidencias: checklistOperacionesActual.evidencias,
            total_items: resumen.total,
            cumple_items: resumen.cumple,
            no_cumple_items: resumen.noCumple,
            no_aplica_items: resumen.noAplica,
            cumplimiento: resumen.cumplimiento,
            criticos_no_cumple: resumen.criticos
        }).eq('id', checklistOperacionesActual.id);
        if (error) throw error;
        checklistOperacionesActual.estado = 'finalizado';
        checklistOperacionesActual.fin_at = finAt;
        Object.assign(checklistOperacionesActual, {
            total_items: resumen.total,
            cumple_items: resumen.cumple,
            no_cumple_items: resumen.noCumple,
            no_aplica_items: resumen.noAplica,
            cumplimiento: resumen.cumplimiento,
            criticos_no_cumple: resumen.criticos
        });
        ultimoChecklistOperacionesFinalizado = structuredClone(checklistOperacionesActual);
        obtenerElemento('shareLastOperationsChecklist').hidden = false;
        actualizarEstadoChecklistOperaciones(`Checklist finalizado con ${resumen.cumplimiento}% de cumplimiento.`, 'success');
        renderizarChecklistOperaciones();
        actualizarBannerBorradorOperaciones('Checklist finalizado. El resultado ya esta disponible para todo el equipo.', 'success');
    } catch (error) {
        console.warn('No se pudo finalizar el checklist:', error);
        actualizarEstadoChecklistOperaciones('No se pudo finalizar. El borrador permanece guardado.', 'error');
    }
}

async function descartarBorradorChecklistOperaciones() {
    if (!checklistOperacionesActual || !window.confirm('Seguro que deseas descartar este checklist? El avance guardado se eliminara.')) return;
    if (checklistOperacionesActual.id) {
        const { error } = await supabaseClient.from('operaciones_checklists').delete().eq('id', checklistOperacionesActual.id);
        if (error) {
            actualizarEstadoChecklistOperaciones('No se pudo descartar el borrador.', 'error');
            return;
        }
    }
    checklistOperacionesActual = crearEstadoNuevoChecklistOperaciones(obtenerSedeChecklistOperaciones());
    renderizarChecklistOperaciones();
    actualizarBannerBorradorOperaciones('Borrador descartado. Puedes iniciar una nueva revision.', 'success');
}

async function establecerPanelChecklistOperaciones(abierto) {
    const panel = obtenerElemento('operationsChecklistPanel');
    const boton = obtenerElemento('openOperationsChecklist');
    if (!panel || !boton) return;
    panel.hidden = !abierto;
    panel.classList.toggle('operations-subwindow-active', abierto);
    document.body.classList.toggle('operations-subwindow-open', abierto);
    boton.setAttribute('aria-expanded', String(abierto));
    if (abierto) {
        establecerPanelOcupabilidadOperaciones(false);
        establecerPanelActivosOperaciones(false);
        establecerPanelDashboardOperaciones(false);
        establecerPanelInformeGeneralOperaciones(false, false);
        configurarSelectSedesOperaciones();
        await cargarBorradorChecklistOperaciones(obtenerSedeChecklistOperaciones());
        window.clearInterval(temporizadorVentanaChecklistOperaciones);
        temporizadorVentanaChecklistOperaciones = window.setInterval(actualizarControlHorarioChecklistOperaciones, 30000);
        panel.scrollTop = 0;
        if (window.history.state?.urbaparkOperationsPanel !== 'checklist') {
            window.history.pushState({ ...(window.history.state || {}), urbaparkOperationsPanel: 'checklist' }, '', `${window.location.pathname}${window.location.search}#operaciones-checklist`);
        }
        panel.focus({ preventScroll: true });
    } else {
        window.clearInterval(temporizadorVentanaChecklistOperaciones);
        temporizadorVentanaChecklistOperaciones = null;
        panel.classList.remove('operations-subwindow-active');
        if (!document.querySelector('.operations-subwindow-active')) document.body.classList.remove('operations-subwindow-open');
        boton.focus({ preventScroll: true });
    }
}

function cerrarPanelChecklistOperaciones() {
    if (window.history.state?.urbaparkOperationsPanel === 'checklist') window.history.back();
    else establecerPanelChecklistOperaciones(false);
}

function obtenerRangoMesOperaciones() {
    const mes = obtenerElemento('operationsDashboardMonth')?.value || fechaLocalISO().slice(0, 7);
    const [anio, numeroMes] = mes.split('-').map(Number);
    const ultimoDia = new Date(anio, numeroMes, 0).getDate();
    return { mes, inicio: `${mes}-01`, fin: `${mes}-${String(ultimoDia).padStart(2, '0')}` };
}

async function cargarDashboardOperaciones() {
    if (!supabaseClient || !sesionActual?.user) return;
    const sede = obtenerElemento('operationsDashboardSite').value;
    const rango = obtenerRangoMesOperaciones();
    const estado = obtenerElemento('operationsDashboardStatus');
    estado.textContent = 'Cargando resultados...';
    const { data, error } = await supabaseClient.from('operaciones_checklists')
        .select('*')
        .eq('estado', 'finalizado')
        .eq('sede', sede)
        .gte('fecha', rango.inicio)
        .lte('fecha', rango.fin)
        .order('inicio_at', { ascending: false });
    if (error) {
        estado.textContent = 'No se pudo cargar el historial operativo.';
        estado.dataset.status = 'error';
        return;
    }
    historialChecklistsOperaciones = Array.isArray(data) ? data : [];
    renderizarDashboardOperaciones();
    estado.textContent = `${historialChecklistsOperaciones.length} checklists finalizados.`;
    estado.dataset.status = 'success';
}

function renderizarDashboardOperaciones() {
    const registros = historialChecklistsOperaciones;
    const totalNoCumple = registros.reduce((suma, item) => suma + Number(item.no_cumple_items || 0), 0);
    const totalCriticos = registros.reduce((suma, item) => suma + Number(item.criticos_no_cumple || 0), 0);
    const promedio = registros.length
        ? registros.reduce((suma, item) => suma + Number(item.cumplimiento || 0), 0) / registros.length
        : 0;
    obtenerElemento('operationsKpiTotal').textContent = String(registros.length);
    obtenerElemento('operationsKpiCompliance').textContent = `${promedio.toFixed(1)}%`;
    obtenerElemento('operationsKpiFailures').textContent = String(totalNoCumple);
    obtenerElemento('operationsKpiCritical').textContent = String(totalCriticos);
    obtenerElemento('operationsKpiLate').textContent = String(registros.filter(item => obtenerPuntualidadChecklistOperaciones(item) === 'tardanza').length);

    const resumenSecciones = obtenerElemento('operationsSectionKpis');
    limpiarElemento(resumenSecciones);
    obtenerSeccionesChecklistOperaciones(obtenerElemento('operationsDashboardSite').value).forEach(seccion => {
        let cumple = 0;
        let evaluados = 0;
        registros.forEach(registro => seccion.items.forEach(item => {
            const valor = registro.respuestas?.[`${seccion.id}:${item[0]}`];
            if (valor === 'cumple') { cumple += 1; evaluados += 1; }
            if (valor === 'no_cumple') evaluados += 1;
        }));
        const tarjeta = document.createElement('article');
        tarjeta.append(crearTextoElemento('span', seccion.nombre), crearTextoElemento('strong', `${evaluados ? ((cumple / evaluados) * 100).toFixed(1) : '0.0'}%`));
        resumenSecciones.appendChild(tarjeta);
    });

    const historialContenedor = obtenerElemento('operationsChecklistHistory');
    limpiarElemento(historialContenedor);
    if (!registros.length) {
        historialContenedor.appendChild(crearMensajeVacio('No hay checklists finalizados en este periodo.', 'operations-history-empty'));
        return;
    }
    registros.forEach(registro => {
        const tarjeta = document.createElement('article');
        const cabecera = document.createElement('div');
        const datos = document.createElement('p');
        const resultado = document.createElement('strong');
        const compartir = document.createElement('button');
        tarjeta.className = 'operations-history-item';
        cabecera.append(crearTextoElemento('h3', registro.responsable_nombre), crearTextoElemento('span', obtenerEtiquetaRol(registro.responsable_rol)));
        const estadoPuntualidad = obtenerPuntualidadChecklistOperaciones(registro);
        const puntualidad = estadoPuntualidad === 'tardanza' ? 'TARDANZA' : estadoPuntualidad === 'a_tiempo' ? 'A TIEMPO' : 'SIN CLASIFICAR';
        datos.textContent = `${registro.fecha} - ${String(registro.turno || '').toUpperCase()} - ${puntualidad} - ${registro.no_cumple_items || 0} no conformidades`;
        resultado.textContent = `${Number(registro.cumplimiento || 0).toFixed(1)}%`;
        resultado.className = Number(registro.criticos_no_cumple || 0) ? 'has-critical' : '';
        compartir.type = 'button';
        compartir.className = 'clear-btn operations-report-share';
        compartir.dataset.shareOperationsChecklist = registro.id;
        compartir.textContent = 'PDF / WhatsApp';
        tarjeta.append(cabecera, datos, resultado, compartir);
        historialContenedor.appendChild(tarjeta);
    });
}

function exportarChecklistOperacionesExcel() {
    if (!historialChecklistsOperaciones.length) {
        obtenerElemento('operationsDashboardStatus').textContent = 'No hay resultados para exportar.';
        return;
    }
    if (!window.XLSX) {
        obtenerElemento('operationsDashboardStatus').textContent = 'No se pudo cargar el generador de Excel.';
        return;
    }
    const resumen = historialChecklistsOperaciones.map(registro => ({
        Fecha: registro.fecha,
        Sede: obtenerNombreSede(registro.sede),
        Responsable: registro.responsable_nombre,
        Cargo: obtenerEtiquetaRol(registro.responsable_rol),
        Turno: registro.turno,
        Puntualidad: obtenerPuntualidadChecklistOperaciones(registro) === 'tardanza' ? 'Tardanza' : obtenerPuntualidadChecklistOperaciones(registro) === 'a_tiempo' ? 'A tiempo' : 'Sin clasificar',
        'Cumplimiento (%)': Number(registro.cumplimiento || 0),
        'No conformidades': Number(registro.no_cumple_items || 0),
        'Criticos no conformes': Number(registro.criticos_no_cumple || 0)
    }));
    const detalle = [];
    historialChecklistsOperaciones.forEach(registro => {
        obtenerSeccionesChecklistOperaciones(registro.sede).forEach(seccion => seccion.items.forEach(item => {
            detalle.push({
                Fecha: registro.fecha,
                Sede: obtenerNombreSede(registro.sede),
                Responsable: registro.responsable_nombre,
                Seccion: seccion.nombre,
                Verificacion: item[1],
                Criticidad: item[2],
                Resultado: registro.respuestas?.[`${seccion.id}:${item[0]}`] || '',
                Observacion: registro.observaciones?.[seccion.id] || ''
            });
        }));
    });
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(resumen), 'Resumen');
    XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(detalle), 'Detalle');
    const { mes } = obtenerRangoMesOperaciones();
    XLSX.writeFile(libro, `Checklist-Operaciones-${obtenerElemento('operationsDashboardSite').value}-${mes}.xlsx`, { compression: true });
}

function limpiarTextoReporte(valor = '') {
    return String(valor).replace(/[\u2013\u2014]/g, '-').replace(/\u2022/g, '-').trim();
}

function nombreArchivoSeguro(valor = '') {
    return limpiarTextoReporte(valor).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
}

async function crearDocumentoPdfOperaciones(titulo, subtitulo = '') {
    if (!window.PDFLib) throw new Error('El generador de PDF no esta disponible.');
    const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
    const pdf = await PDFDocument.create();
    const normal = await pdf.embedFont(StandardFonts.Helvetica);
    const negrita = await pdf.embedFont(StandardFonts.HelveticaBold);
    const estado = { pdf, normal, negrita, rgb, pagina: null, y: 0, ancho: 0, alto: 0 };

    const nuevaPagina = () => {
        estado.pagina = pdf.addPage([595.28, 841.89]);
        estado.ancho = estado.pagina.getWidth();
        estado.alto = estado.pagina.getHeight();
        estado.y = estado.alto - 54;
        estado.pagina.drawRectangle({ x: 0, y: estado.alto - 18, width: estado.ancho, height: 18, color: rgb(0.94, 0.29, 0.11) });
        estado.pagina.drawText('URBAPARK', { x: 40, y: estado.y, size: 17, font: negrita, color: rgb(0.08, 0.48, 0.67) });
        estado.y -= 28;
    };
    nuevaPagina();

    const escribir = (texto, opciones = {}) => {
        const size = opciones.size || 10;
        const font = opciones.bold ? negrita : normal;
        const color = opciones.color || rgb(0.12, 0.18, 0.24);
        const margen = opciones.indent || 0;
        const maxWidth = opciones.maxWidth || estado.ancho - 80 - margen;
        const parrafos = limpiarTextoReporte(texto).split(/\n/);
        parrafos.forEach(parrafo => {
            const palabras = parrafo.split(/\s+/).filter(Boolean);
            const lineas = [];
            let linea = '';
            palabras.forEach(palabra => {
                const candidata = linea ? `${linea} ${palabra}` : palabra;
                if (font.widthOfTextAtSize(candidata, size) > maxWidth && linea) {
                    lineas.push(linea);
                    linea = palabra;
                } else linea = candidata;
            });
            lineas.push(linea || ' ');
            lineas.forEach(item => {
                if (estado.y < 52) nuevaPagina();
                estado.pagina.drawText(item, { x: 40 + margen, y: estado.y, size, font, color });
                estado.y -= opciones.lineHeight || size + 4;
            });
        });
        estado.y -= opciones.after || 2;
    };

    escribir(titulo, { size: 18, bold: true, color: rgb(0.08, 0.28, 0.40), after: 4 });
    if (subtitulo) escribir(subtitulo, { size: 10, color: rgb(0.34, 0.42, 0.48), after: 8 });
    return { ...estado, escribir, bytes: () => pdf.save() };
}

async function crearPdfChecklistOperaciones(registro) {
    const reporte = await crearDocumentoPdfOperaciones(
        'CHECKLIST OPERATIVO',
        `${obtenerNombreSede(registro.sede)} | ${registro.fecha} | ${String(registro.turno || '').toUpperCase()}`
    );
    const duracion = calcularDuracionChecklistOperaciones(registro);
    reporte.escribir(`Responsable: ${registro.responsable_nombre}`, { bold: true });
    const estadoPuntualidad = obtenerPuntualidadChecklistOperaciones(registro);
    const puntualidad = estadoPuntualidad === 'tardanza' ? 'TARDANZA' : estadoPuntualidad === 'a_tiempo' ? 'A TIEMPO' : 'SIN CLASIFICAR';
    reporte.escribir(`Cargo: ${obtenerEtiquetaRol(registro.responsable_rol)} | Estado horario: ${puntualidad}`);
    reporte.escribir(`Inicio: ${formatearFechaHoraReporte(registro.inicio_at)} | Fin: ${formatearFechaHoraReporte(registro.fin_at)} | Duracion: ${duracion} min`);
    reporte.escribir(`Cumplimiento: ${Number(registro.cumplimiento || calcularResumenChecklistOperaciones(registro).cumplimiento).toFixed(1)}%`, { size: 13, bold: true, color: reporte.rgb(0.05, 0.48, 0.29), after: 8 });
    obtenerSeccionesChecklistOperaciones(registro.sede).forEach(seccion => {
        reporte.escribir(seccion.nombre.toUpperCase(), { size: 12, bold: true, color: reporte.rgb(0.94, 0.29, 0.11), after: 4 });
        seccion.items.forEach(item => {
            const valor = registro.respuestas?.[`${seccion.id}:${item[0]}`] || 'sin_respuesta';
            const etiqueta = valor === 'cumple' ? 'SI CUMPLE' : valor === 'no_cumple' ? 'NO CUMPLE' : valor === 'na' ? 'N.A.' : 'SIN RESPUESTA';
            reporte.escribir(`[${etiqueta}] ${item[1]} (${item[2]})`, { indent: 8, size: 9 });
        });
        const observacion = String(registro.observaciones?.[seccion.id] || '').trim();
        if (observacion) reporte.escribir(`Novedad / solucion: ${observacion}`, { indent: 8, size: 9, bold: true, after: 6 });
    });
    return reporte.bytes();
}

function formatearFechaHoraReporte(valor) {
    if (!valor) return '-';
    return new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(valor));
}

function calcularDuracionChecklistOperaciones(registro) {
    const inicio = new Date(registro?.inicio_at).getTime();
    const fin = new Date(registro?.fin_at).getTime();
    return Number.isFinite(inicio) && Number.isFinite(fin) ? Math.max(0, Math.round((fin - inicio) / 60000)) : 0;
}

async function compartirPdfChecklistOperaciones(registro) {
    if (!registro) return;
    const estado = obtenerElemento('operationsChecklistStatus') || obtenerElemento('operationsDashboardStatus');
    try {
        if (estado) estado.textContent = 'Generando PDF...';
        const bytes = await crearPdfChecklistOperaciones(registro);
        const nombre = `Checklist-${nombreArchivoSeguro(obtenerNombreSede(registro.sede))}-${registro.fecha}.pdf`;
        const archivo = new File([bytes], nombre, { type: 'application/pdf' });
        if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [archivo] }))) {
            await navigator.share({ title: 'Checklist operativo UrbaPark', text: `${obtenerNombreSede(registro.sede)} - ${registro.fecha}`, files: [archivo] });
            if (estado) estado.textContent = 'PDF listo para compartir por WhatsApp.';
            return;
        }
        descargarBlob(new Blob([bytes], { type: 'application/pdf' }), nombre);
        if (estado) estado.textContent = 'PDF descargado. Puedes adjuntarlo en WhatsApp.';
    } catch (error) {
        if (error?.name === 'AbortError') return;
        console.warn('No se pudo generar el PDF operativo:', error);
        if (estado) estado.textContent = 'No se pudo generar el PDF.';
    }
}

function descargarBlob(blob, nombre) {
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function obtenerRangoMesGeneralOperaciones() {
    const mes = obtenerElemento('operationsGeneralMonth')?.value || fechaLocalISO().slice(0, 7);
    const [anio, numeroMes] = mes.split('-').map(Number);
    return { mes, inicio: `${mes}-01`, fin: `${mes}-${String(new Date(anio, numeroMes, 0).getDate()).padStart(2, '0')}` };
}

function calcularAnalisisGeneralOperaciones(registros) {
    const sedes = SEDES_OPERACION.map(sede => {
        const items = registros.filter(registro => registro.sede === sede.id);
        const cumple = items.reduce((suma, item) => suma + Number(item.cumple_items || 0), 0);
        const noCumple = items.reduce((suma, item) => suma + Number(item.no_cumple_items || 0), 0);
        const evaluados = cumple + noCumple;
        const duraciones = items.map(calcularDuracionChecklistOperaciones).filter(valor => valor > 0);
        return {
            id: sede.id,
            nombre: sede.nombre,
            total: items.length,
            cumplimiento: evaluados ? (cumple / evaluados) * 100 : 0,
            noCumple,
            criticos: items.reduce((suma, item) => suma + Number(item.criticos_no_cumple || 0), 0),
            duracionPromedio: duraciones.length ? duraciones.reduce((a, b) => a + b, 0) / duraciones.length : 0,
            rapidos: items.filter(item => calcularDuracionChecklistOperaciones(item) > 0 && calcularDuracionChecklistOperaciones(item) < 10).length
        };
    }).sort((a, b) => b.cumplimiento - a.cumplimiento || b.total - a.total);

    const puntos = new Map();
    registros.forEach(registro => obtenerSeccionesChecklistOperaciones(registro.sede).forEach(seccion => seccion.items.forEach(item => {
        const clave = `${seccion.id}:${item[0]}`;
        const valor = registro.respuestas?.[clave];
        if (!['cumple', 'no_cumple'].includes(valor)) return;
        const actual = puntos.get(clave) || { seccion: seccion.nombre, punto: item[1], criticidad: item[2], cumple: 0, noCumple: 0 };
        actual[valor === 'cumple' ? 'cumple' : 'noCumple'] += 1;
        puntos.set(clave, actual);
    })));
    const menosCumplidos = Array.from(puntos.values()).map(item => ({
        ...item,
        evaluados: item.cumple + item.noCumple,
        incumplimiento: ((item.noCumple / (item.cumple + item.noCumple)) * 100)
    })).filter(item => item.noCumple > 0).sort((a, b) => b.incumplimiento - a.incumplimiento || b.noCumple - a.noCumple).slice(0, 10);
    const rapidos = registros.filter(item => {
        const minutos = calcularDuracionChecklistOperaciones(item);
        return minutos > 0 && minutos < 10;
    }).sort((a, b) => calcularDuracionChecklistOperaciones(a) - calcularDuracionChecklistOperaciones(b));
    const totalCumple = registros.reduce((suma, item) => suma + Number(item.cumple_items || 0), 0);
    const totalNoCumple = registros.reduce((suma, item) => suma + Number(item.no_cumple_items || 0), 0);
    return {
        registros,
        sedes,
        menosCumplidos,
        rapidos,
        total: registros.length,
        cumplimiento: totalCumple + totalNoCumple ? (totalCumple / (totalCumple + totalNoCumple)) * 100 : 0,
        criticos: registros.reduce((suma, item) => suma + Number(item.criticos_no_cumple || 0), 0),
        tardanzas: registros.filter(item => obtenerPuntualidadChecklistOperaciones(item) === 'tardanza').length
    };
}

async function cargarInformeGeneralOperaciones() {
    if (!usuarioPuedeVerInformeGeneralOperaciones() || !supabaseClient) return;
    const rango = obtenerRangoMesGeneralOperaciones();
    const estado = obtenerElemento('operationsGeneralStatus');
    estado.textContent = 'Analizando todas las sedes...';
    const { data, error } = await supabaseClient.from('operaciones_checklists')
        .select('*').eq('estado', 'finalizado')
        .gte('fecha', rango.inicio).lte('fecha', rango.fin)
        .order('inicio_at', { ascending: false });
    if (error) {
        estado.textContent = 'No se pudo cargar el informe multisede.';
        estado.dataset.status = 'error';
        return;
    }
    informeGeneralOperaciones = Array.isArray(data) ? data : [];
    renderizarInformeGeneralOperaciones();
    estado.textContent = `${informeGeneralOperaciones.length} checklists incluidos en el analisis.`;
    estado.dataset.status = 'success';
}

function renderizarInformeGeneralOperaciones() {
    const analisis = calcularAnalisisGeneralOperaciones(informeGeneralOperaciones);
    const resumen = obtenerElemento('operationsExecutiveSummary');
    const benchmark = obtenerElemento('operationsBenchmark');
    const puntos = obtenerElemento('operationsLeastCompliant');
    const rapidos = obtenerElemento('operationsFastReviews');
    [resumen, benchmark, puntos, rapidos].forEach(limpiarElemento);

    const mejor = analisis.sedes.find(sede => sede.total > 0);
    const tarjetas = [
        ['Checklists del mes', analisis.total],
        ['Cumplimiento general', `${analisis.cumplimiento.toFixed(1)}%`],
        ['Mejor sede', mejor?.nombre || 'Sin datos'],
        ['Criticos no conformes', analisis.criticos],
        ['Checklists con tardanza', analisis.tardanzas],
        ['Revisiones < 10 min', analisis.rapidos.length]
    ];
    tarjetas.forEach(([etiqueta, valor]) => {
        const tarjeta = document.createElement('article');
        tarjeta.append(crearTextoElemento('span', etiqueta), crearTextoElemento('strong', String(valor)));
        resumen.appendChild(tarjeta);
    });

    benchmark.appendChild(crearTextoElemento('h3', 'Benchmark de sedes'));
    analisis.sedes.forEach((sede, indice) => {
        const fila = document.createElement('article');
        const barra = document.createElement('div');
        fila.append(
            crearTextoElemento('b', `${indice + 1}. ${sede.nombre}`),
            crearTextoElemento('span', `${sede.total} checklists | ${sede.cumplimiento.toFixed(1)}% | ${sede.rapidos} rapidos`)
        );
        barra.className = 'operations-benchmark-bar';
        barra.style.setProperty('--benchmark-width', `${Math.max(2, sede.cumplimiento)}%`);
        fila.appendChild(barra);
        benchmark.appendChild(fila);
    });

    puntos.appendChild(crearTextoElemento('h3', 'Puntos con menor cumplimiento'));
    if (!analisis.menosCumplidos.length) puntos.appendChild(crearMensajeVacio('No hay incumplimientos registrados en el mes.'));
    analisis.menosCumplidos.slice(0, 6).forEach(item => {
        const fila = document.createElement('article');
        fila.append(
            crearTextoElemento('b', item.punto),
            crearTextoElemento('span', `${item.seccion} | ${item.noCumple} no cumple de ${item.evaluados} | ${item.incumplimiento.toFixed(1)}%`)
        );
        puntos.appendChild(fila);
    });

    rapidos.appendChild(crearTextoElemento('h3', 'Revisiones inusualmente rapidas'));
    rapidos.appendChild(crearTextoElemento('p', 'Se muestran para validacion las revisiones terminadas en menos de 10 minutos.'));
    if (!analisis.rapidos.length) rapidos.appendChild(crearMensajeVacio('No se detectaron revisiones por debajo del umbral.'));
    analisis.rapidos.slice(0, 12).forEach(item => {
        const fila = document.createElement('article');
        fila.append(
            crearTextoElemento('b', `${obtenerNombreSede(item.sede)} - ${item.responsable_nombre}`),
            crearTextoElemento('span', `${item.fecha} | ${calcularDuracionChecklistOperaciones(item)} min | ${Number(item.cumplimiento || 0).toFixed(1)}%`)
        );
        rapidos.appendChild(fila);
    });
}

function textoResumenEjecutivoOperaciones(analisis) {
    const conDatos = analisis.sedes.filter(sede => sede.total > 0);
    const mejor = conDatos[0];
    const menor = conDatos[conDatos.length - 1];
    const principal = analisis.menosCumplidos[0];
    return [
        `Durante el periodo se completaron ${analisis.total} checklists, con un cumplimiento general de ${analisis.cumplimiento.toFixed(1)}%.`,
        mejor ? `${mejor.nombre} lidera el benchmark con ${mejor.cumplimiento.toFixed(1)}% de cumplimiento.` : 'No existen datos suficientes para comparar sedes.',
        menor && menor.id !== mejor?.id ? `${menor.nombre} presenta el menor cumplimiento (${menor.cumplimiento.toFixed(1)}%) y requiere seguimiento.` : '',
        principal ? `El punto con mayor tasa de incumplimiento es "${principal.punto}" (${principal.incumplimiento.toFixed(1)}%).` : 'No se registraron puntos incumplidos.',
        analisis.rapidos.length ? `${analisis.rapidos.length} revisiones terminaron en menos de 10 minutos y deben validarse con sus responsables.` : 'No se detectaron revisiones inusualmente rapidas.'
    ].filter(Boolean);
}

async function exportarInformeGeneralOperacionesPdf() {
    if (!informeGeneralOperaciones.length) return mostrarToast('No hay datos del mes para generar el informe.');
    try {
        const rango = obtenerRangoMesGeneralOperaciones();
        const analisis = calcularAnalisisGeneralOperaciones(informeGeneralOperaciones);
        const reporte = await crearDocumentoPdfOperaciones('INFORME GERENCIAL DE OPERACIONES', `Benchmark multisede | Periodo ${rango.mes}`);
        reporte.escribir('RESUMEN EJECUTIVO', { size: 13, bold: true, color: reporte.rgb(0.94, 0.29, 0.11) });
        textoResumenEjecutivoOperaciones(analisis).forEach(texto => reporte.escribir(`- ${texto}`, { indent: 8 }));
        reporte.escribir('BENCHMARK DE SEDES', { size: 13, bold: true, color: reporte.rgb(0.08, 0.48, 0.67), after: 5 });
        analisis.sedes.forEach((sede, indice) => reporte.escribir(`${indice + 1}. ${sede.nombre}: ${sede.cumplimiento.toFixed(1)}% | ${sede.total} checklists | ${sede.rapidos} rapidos`));
        reporte.escribir('PUNTOS CON MENOR CUMPLIMIENTO', { size: 13, bold: true, color: reporte.rgb(0.94, 0.29, 0.11), after: 5 });
        analisis.menosCumplidos.forEach(item => reporte.escribir(`- ${item.punto}: ${item.incumplimiento.toFixed(1)}% de incumplimiento (${item.noCumple}/${item.evaluados})`));
        reporte.escribir('REVISIONES PARA VALIDAR (< 10 MIN)', { size: 13, bold: true, color: reporte.rgb(0.08, 0.48, 0.67), after: 5 });
        analisis.rapidos.forEach(item => reporte.escribir(`- ${item.fecha} | ${obtenerNombreSede(item.sede)} | ${item.responsable_nombre} | ${calcularDuracionChecklistOperaciones(item)} min`));
        descargarBlob(new Blob([await reporte.bytes()], { type: 'application/pdf' }), `Informe-Operaciones-${rango.mes}.pdf`);
    } catch (error) {
        console.warn('No se pudo generar el informe PDF:', error);
        mostrarToast('No se pudo generar el PDF gerencial.');
    }
}

async function exportarInformeGeneralOperacionesPptx() {
    if (!informeGeneralOperaciones.length) return mostrarToast('No hay datos del mes para generar el informe.');
    if (!window.PptxGenJS) return mostrarToast('No se pudo cargar el generador de PowerPoint.');
    const rango = obtenerRangoMesGeneralOperaciones();
    const analisis = calcularAnalisisGeneralOperaciones(informeGeneralOperaciones);
    const pptx = new window.PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.author = 'UrbaPark';
    pptx.subject = 'KPI de checklist operativo multisede';
    pptx.title = `Informe de operaciones ${rango.mes}`;
    pptx.company = 'UrbaPark';
    pptx.lang = 'es-PE';
    pptx.theme = { headFontFace: 'Aptos Display', bodyFontFace: 'Aptos', lang: 'es-PE' };
    pptx.defineSlideMaster({
        title: 'URBAPARK',
        background: { color: 'F7FAFC' },
        objects: [
            { rect: { x: 0, y: 0, w: 13.333, h: 0.16, fill: { color: 'EF4B1B' }, line: { color: 'EF4B1B' } } },
            { text: { text: 'URBAPARK | OPERACIONES', options: { x: 0.45, y: 0.2, w: 4.5, h: 0.3, fontFace: 'Aptos', fontSize: 10, bold: true, color: '167AA8', margin: 0 } } },
            { text: { text: `Periodo ${rango.mes}`, options: { x: 10.4, y: 0.2, w: 2.4, h: 0.3, fontSize: 9, color: '627482', align: 'right', margin: 0 } } }
        ],
        slideNumber: { x: 12.75, y: 7.1, color: '7B8791', fontSize: 8 }
    });
    const agregarTitulo = (slide, titulo, subtitulo = '') => {
        slide.addText(titulo, { x: 0.55, y: 0.7, w: 12.2, h: 0.45, fontSize: 24, bold: true, color: '153B50', margin: 0 });
        if (subtitulo) slide.addText(subtitulo, { x: 0.55, y: 1.18, w: 12.1, h: 0.35, fontSize: 11, color: '607483', margin: 0 });
    };
    let slide = pptx.addSlide('URBAPARK');
    slide.background = { color: '12394E' };
    slide.addText('INFORME GERENCIAL\nDE OPERACIONES', { x: 0.8, y: 1.55, w: 8.6, h: 1.7, fontSize: 32, bold: true, color: 'FFFFFF', breakLine: false, margin: 0 });
    slide.addText(`Checklist operativo multisede | ${rango.mes}`, { x: 0.82, y: 3.45, w: 7.2, h: 0.45, fontSize: 16, color: '8ED8F2', margin: 0 });
    slide.addText(`${analisis.total} checklists  |  ${analisis.cumplimiento.toFixed(1)}% cumplimiento`, { x: 0.82, y: 4.25, w: 8.5, h: 0.55, fontSize: 20, bold: true, color: 'FFB39A', margin: 0 });

    slide = pptx.addSlide('URBAPARK');
    agregarTitulo(slide, 'Resumen ejecutivo', 'Lectura gerencial del periodo seleccionado');
    slide.addText(textoResumenEjecutivoOperaciones(analisis).map(texto => ({ text: texto, options: { bullet: { indent: 18 }, hanging: 4, breakLine: true } })), { x: 0.75, y: 1.7, w: 11.8, h: 4.6, fontSize: 18, color: '243746', breakLine: false, paraSpaceAfterPt: 16, margin: 0.08 });

    slide = pptx.addSlide('URBAPARK');
    agregarTitulo(slide, 'Benchmark de sedes', 'Ordenado por porcentaje de cumplimiento');
    slide.addTable([
        [{ text: 'Posicion' }, { text: 'Sede' }, { text: 'Checklists' }, { text: 'Cumplimiento' }, { text: 'Criticos' }, { text: '< 10 min' }],
        ...analisis.sedes.map((sede, indice) => [String(indice + 1), sede.nombre, String(sede.total), `${sede.cumplimiento.toFixed(1)}%`, String(sede.criticos), String(sede.rapidos)])
    ], { x: 0.65, y: 1.65, w: 12, h: 4.5, border: { type: 'solid', color: 'CAD6DE', pt: 1 }, fill: 'FFFFFF', color: '233746', fontSize: 14, margin: 0.08, rowH: 0.58, bold: false, autoFit: false, colW: [1, 3.8, 1.5, 2, 1.3, 1.4] });

    slide = pptx.addSlide('URBAPARK');
    agregarTitulo(slide, 'Puntos con menor cumplimiento', 'Prioridades para el plan de accion');
    slide.addTable([
        [{ text: 'Punto de control' }, { text: 'Seccion' }, { text: 'Criticidad' }, { text: 'No cumple' }, { text: 'Tasa' }],
        ...analisis.menosCumplidos.slice(0, 8).map(item => [item.punto, item.seccion, item.criticidad, `${item.noCumple}/${item.evaluados}`, `${item.incumplimiento.toFixed(1)}%`])
    ], { x: 0.55, y: 1.55, w: 12.2, h: 5.2, border: { type: 'solid', color: 'D5DEE5', pt: 1 }, fill: 'FFFFFF', color: '233746', fontSize: 11, margin: 0.07, rowH: 0.54, colW: [5.1, 2.5, 1.4, 1.5, 1.3] });

    slide = pptx.addSlide('URBAPARK');
    agregarTitulo(slide, 'Revisiones para validar', 'Checklists terminados en menos de 10 minutos');
    const filasRapidas = analisis.rapidos.slice(0, 12).map(item => [item.fecha, obtenerNombreSede(item.sede), item.responsable_nombre, `${calcularDuracionChecklistOperaciones(item)} min`, `${Number(item.cumplimiento || 0).toFixed(1)}%`]);
    slide.addTable([
        [{ text: 'Fecha' }, { text: 'Sede' }, { text: 'Responsable' }, { text: 'Duracion' }, { text: 'Resultado' }],
        ...(filasRapidas.length ? filasRapidas : [['-', 'Sin revisiones bajo el umbral', '-', '-', '-']])
    ], { x: 0.6, y: 1.6, w: 12.1, h: 4.9, border: { type: 'solid', color: 'D5DEE5', pt: 1 }, fill: 'FFFFFF', color: '233746', fontSize: 12, margin: 0.08, rowH: 0.46, colW: [1.5, 3, 3.6, 1.5, 1.5] });

    slide = pptx.addSlide('URBAPARK');
    agregarTitulo(slide, 'Conclusiones y foco del siguiente mes');
    const acciones = analisis.menosCumplidos.slice(0, 3).map((item, indice) => `${indice + 1}. Corregir ${item.punto.toLowerCase()} y verificar el cierre en cada sede.`);
    if (analisis.rapidos.length) acciones.push('Validar con los responsables las revisiones inferiores a 10 minutos.');
    acciones.push('Mantener seguimiento semanal del benchmark y de no conformidades criticas.');
    slide.addText(acciones.map(texto => ({ text: texto, options: { breakLine: true, bullet: { indent: 18 } } })), { x: 0.8, y: 1.8, w: 11.6, h: 3.8, fontSize: 20, color: '243746', breakLine: false, paraSpaceAfterPt: 18, margin: 0.08 });
    await pptx.writeFile({ fileName: `Informe-Operaciones-${rango.mes}.pptx` });
}

async function establecerPanelInformeGeneralOperaciones(abierto, registrarHistorial = true) {
    const panel = obtenerElemento('operationsGeneralReportPanel');
    const boton = obtenerElemento('openOperationsGeneralReport');
    if (!panel || !boton || (abierto && !usuarioPuedeVerInformeGeneralOperaciones())) return;
    panel.hidden = !abierto;
    panel.classList.toggle('operations-subwindow-active', abierto);
    document.body.classList.toggle('operations-subwindow-open', abierto);
    boton.setAttribute('aria-expanded', String(abierto));
    if (abierto) {
        establecerPanelOcupabilidadOperaciones(false);
        establecerPanelActivosOperaciones(false);
        establecerPanelDashboardOperaciones(false);
        const checklist = obtenerElemento('operationsChecklistPanel');
        if (checklist) {
            checklist.hidden = true;
            checklist.classList.remove('operations-subwindow-active');
        }
        obtenerElemento('openOperationsChecklist')?.setAttribute('aria-expanded', 'false');
        obtenerElemento('operationsGeneralMonth').value ||= fechaLocalISO().slice(0, 7);
        await cargarInformeGeneralOperaciones();
        if (registrarHistorial && window.history.state?.urbaparkOperationsPanel !== 'general') {
            window.history.pushState({ ...(window.history.state || {}), urbaparkOperationsPanel: 'general' }, '', `${window.location.pathname}${window.location.search}#operaciones-informe`);
        }
        panel.scrollTop = 0;
        panel.focus({ preventScroll: true });
    } else {
        panel.classList.remove('operations-subwindow-active');
        if (!document.querySelector('.operations-subwindow-active')) document.body.classList.remove('operations-subwindow-open');
    }
}

function cerrarPanelInformeGeneralOperaciones() {
    if (window.history.state?.urbaparkOperationsPanel === 'general') window.history.back();
    else establecerPanelInformeGeneralOperaciones(false, false);
}

function establecerPanelDashboardOperaciones(abierto) {
    const panel = obtenerElemento('operationsDashboardPanel');
    const boton = obtenerElemento('openOperationsDashboard');
    if (!panel || !boton) return;
    panel.hidden = !abierto;
    boton.setAttribute('aria-expanded', String(abierto));
    if (abierto) {
        establecerPanelOcupabilidadOperaciones(false);
        establecerPanelActivosOperaciones(false);
        const checklistPanel = obtenerElemento('operationsChecklistPanel');
        if (checklistPanel) {
            checklistPanel.hidden = true;
            checklistPanel.classList.remove('operations-subwindow-active');
        }
        establecerPanelInformeGeneralOperaciones(false, false);
        document.body.classList.remove('operations-subwindow-open');
        obtenerElemento('openOperationsChecklist')?.setAttribute('aria-expanded', 'false');
        configurarSelectSedesOperaciones();
        obtenerElemento('operationsDashboardMonth').value ||= fechaLocalISO().slice(0, 7);
        cargarDashboardOperaciones();
        panel.scrollIntoView({ block: 'start' });
    } else {
        boton.focus({ preventScroll: true });
    }
}

function obtenerEtiquetaRol(rol) {
    return ETIQUETAS_ROL[rol] || rol || '';
}

function usuarioPuedeGestionarAbonados() {
    return usuarioEsAdmin();
}

function usuarioEsComercialAbonados() {
    return perfilActual?.rol === 'comercial_abonados' && perfilActual?.activo !== false;
}

function usuarioPuedeAccederAbonados() {
    return usuarioEsAdmin() || usuarioEsComercialAbonados();
}

function obtenerSedeAbonadosActiva() {
    if (!usuarioEsSuperior() && !usuarioEsComercialAbonados()) {
        return obtenerSedeActual();
    }
    const sede = obtenerElemento('subscriberSite')?.value;
    return SEDES_OPERACION.some(item => item.id === sede) ? sede : SEDES_OPERACION[0].id;
}

function actualizarAccesoAbonados() {
    const permitido = usuarioPuedeAccederAbonados();
    const boton = document.querySelector('.subscribers-module-button');
    const selector = obtenerElemento('subscriberSite');
    const campoSede = obtenerElemento('subscriberSiteField');
    boton.hidden = !permitido;
    document.querySelectorAll('.subscriber-admin-only').forEach(elemento => {
        elemento.hidden = !usuarioPuedeGestionarAbonados();
    });

    if (!permitido) {
        solicitudesAbonados = [];
        if (moduloActivo === 'abonados') {
            seleccionarModulo(null, { desplazar: false });
        }
        return;
    }

    if (selector && !selector.options.length) {
        SEDES_OPERACION.forEach(sede => selector.add(new Option(sede.nombre, sede.id)));
    }

    if (selector) {
        selector.value = (usuarioEsSuperior() || usuarioEsComercialAbonados())
            ? (selector.value || SEDES_OPERACION[0].id)
            : obtenerSedeActual();
        selector.disabled = !usuarioEsSuperior() && !usuarioEsComercialAbonados();
    }
    if (campoSede) {
        campoSede.title = usuarioEsSuperior() || usuarioEsComercialAbonados()
            ? 'Puede seleccionar cualquiera de las cinco sedes'
            : 'Sede asignada a su cuenta';
    }

    const mes = obtenerElemento('subscriberMonth');
    if (mes && !mes.value) {
        mes.value = new Date().toISOString().slice(0, 7);
    }
    const fechaInicio = obtenerElemento('subscriberStart');
    if (fechaInicio && !fechaInicio.value) {
        fechaInicio.value = new Date().toISOString().slice(0, 10);
    }
}

function actualizarEstadoAbonados(mensaje = '', tipo = 'info') {
    const estado = obtenerElemento('subscriberStatus');
    if (estado) {
        estado.textContent = mensaje;
        estado.dataset.status = tipo;
    }
}

function obtenerRangoMesAbonados() {
    const valor = obtenerElemento('subscriberMonth')?.value || new Date().toISOString().slice(0, 7);
    const [anio, mes] = valor.split('-').map(Number);
    const inicio = `${valor}-01`;
    const siguiente = new Date(Date.UTC(anio, mes, 1)).toISOString().slice(0, 10);
    return { inicio, siguiente };
}

async function cargarSolicitudesAbonados() {
    if (!usuarioPuedeGestionarAbonados() || !supabaseClient) {
        return;
    }

    const lista = obtenerElemento('subscribersList');
    if (lista) lista.textContent = 'Cargando solicitudes...';
    const { inicio, siguiente } = obtenerRangoMesAbonados();
    const sede = obtenerSedeAbonadosActiva();
    let consulta = supabaseClient
        .from('solicitudes_abonados')
        .select('id,sede,nombres_completos,dni,tipo_abono,monto,fecha_inicio,estado,observaciones,created_at,atendido_at')
        .eq('sede', sede)
        .gte('fecha_inicio', inicio)
        .lt('fecha_inicio', siguiente)
        .order('fecha_inicio', { ascending: false });
    const { data, error } = await consulta;

    if (error) {
        console.warn('No se pudieron cargar abonados:', error);
        solicitudesAbonados = [];
        renderizarSolicitudesAbonados();
        actualizarEstadoAbonados('No se pudieron cargar los abonados.', 'error');
        return;
    }
    solicitudesAbonados = data || [];
    renderizarSolicitudesAbonados();
}

function renderizarSolicitudesAbonados() {
    const lista = obtenerElemento('subscribersList');
    if (!lista) return;
    limpiarElemento(lista);

    const pendientes = solicitudesAbonados.filter(item => item.estado === 'pendiente').length;
    const generados = solicitudesAbonados.filter(item => item.estado === 'generado').length;
    const proyectado = solicitudesAbonados
        .filter(item => item.estado !== 'rechazado')
        .reduce((total, item) => total + Number(item.monto || 0), 0);
    obtenerElemento('subscriberTotal').textContent = String(solicitudesAbonados.length);
    obtenerElemento('subscriberPending').textContent = String(pendientes);
    obtenerElemento('subscriberGenerated').textContent = String(generados);
    obtenerElemento('subscriberRevenue').textContent = `S/ ${proyectado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
    obtenerElemento('subscriberContext').textContent = `${obtenerNombreSede(obtenerSedeAbonadosActiva())} - ${obtenerElemento('subscriberMonth')?.value || ''}`;

    if (!solicitudesAbonados.length) {
        const vacio = document.createElement('p');
        vacio.className = 'empty-site-guides';
        vacio.textContent = 'No hay solicitudes para esta sede y mes.';
        lista.appendChild(vacio);
        return;
    }

    solicitudesAbonados.forEach(item => {
        const tarjeta = document.createElement('article');
        const principal = document.createElement('div');
        const nombre = document.createElement('strong');
        const detalle = document.createElement('div');
        const insignia = document.createElement('span');
        const meta = document.createElement('div');
        const acciones = document.createElement('div');
        const estado = document.createElement('select');
        const guardar = document.createElement('button');
        const tipo = TIPOS_ABONO[item.tipo_abono] || { nombre: item.tipo_abono, monto: item.monto };

        tarjeta.className = 'subscriber-item';
        principal.className = 'subscriber-item-main';
        nombre.textContent = item.nombres_completos;
        detalle.textContent = `${tipo.nombre} - S/ ${Number(item.monto).toFixed(2)}`;
        insignia.className = 'subscriber-status-badge';
        insignia.dataset.status = item.estado;
        insignia.textContent = item.estado;
        meta.className = 'subscriber-item-meta';
        [`DNI ${item.dni}`, `Inicio: ${item.fecha_inicio}`, item.observaciones || 'Sin observaciones'].forEach(texto => {
            const dato = document.createElement('span');
            dato.textContent = texto;
            meta.appendChild(dato);
        });
        principal.append(nombre, detalle, insignia, meta);

        acciones.className = 'subscriber-item-actions';
        [['pendiente', 'Pendiente'], ['generado', 'Abono generado'], ['rechazado', 'Rechazado']].forEach(([valor, texto]) => {
            const opcion = new Option(texto, valor, false, item.estado === valor);
            estado.add(opcion);
        });
        estado.dataset.subscriberStatus = item.id;
        estado.setAttribute('aria-label', `Estado de ${item.nombres_completos}`);
        guardar.type = 'button';
        guardar.className = 'clear-btn';
        guardar.dataset.updateSubscriber = item.id;
        guardar.textContent = 'Guardar estado';
        acciones.append(estado, guardar);
        tarjeta.append(principal, acciones);
        lista.appendChild(tarjeta);
    });
}

async function guardarSolicitudAbonado(event) {
    event.preventDefault();
    if (!usuarioPuedeAccederAbonados() || !supabaseClient) return;
    const botonEnviar = event.currentTarget.querySelector('button[type="submit"]');
    if (botonEnviar?.disabled) return;
    if (botonEnviar) botonEnviar.disabled = true;
    const tipoId = obtenerElemento('subscriberType').value;
    const tipo = TIPOS_ABONO[tipoId];
    const dni = obtenerElemento('subscriberDni').value.trim();
    if (!tipo || !/^\d{8,12}$/.test(dni)) {
        actualizarEstadoAbonados('Revisa el tipo de abono y el numero de DNI.', 'error');
        if (botonEnviar) botonEnviar.disabled = false;
        return;
    }

    const payload = {
        sede: obtenerSedeAbonadosActiva(),
        nombres_completos: obtenerElemento('subscriberName').value.trim(),
        dni,
        tipo_abono: tipoId,
        monto: tipo.monto,
        fecha_inicio: obtenerElemento('subscriberStart').value,
        observaciones: obtenerElemento('subscriberNotes').value.trim(),
        estado: 'pendiente',
        creado_por: sesionActual.user.id
    };
    actualizarEstadoAbonados('Registrando solicitud...', 'info');
    const { error } = await supabaseClient.from('solicitudes_abonados').insert(payload);
    if (error) {
        console.warn('No se pudo registrar abonado:', error);
        actualizarEstadoAbonados(error.code === '23505' ? 'Ya existe una solicitud para ese DNI, sede y fecha.' : 'No se pudo registrar la solicitud.', 'error');
        if (botonEnviar) botonEnviar.disabled = false;
        return;
    }
    event.currentTarget.reset();
    obtenerElemento('subscriberStart').value = new Date().toISOString().slice(0, 10);
    actualizarEstadoAbonados('Solicitud registrada. Enviando alerta a la administracion...', 'success');
    const entrega = await enviarAlertaPushAbonado(payload.sede);
    if (entrega.sent > 0) {
        actualizarEstadoAbonados(`Solicitud registrada. ${entrega.sent} alerta${entrega.sent === 1 ? '' : 's'} enviada${entrega.sent === 1 ? '' : 's'} correctamente.`, 'success');
    } else {
        actualizarEstadoAbonados('Solicitud registrada, pero la alerta no fue entregada. El administrador debe reactivar Alertas en su celular.', 'error');
    }
    if (usuarioPuedeGestionarAbonados()) await cargarSolicitudesAbonados();
    if (botonEnviar) botonEnviar.disabled = false;
}

async function actualizarSolicitudAbonado(id) {
    if (!usuarioPuedeGestionarAbonados() || !id) return;
    const estado = document.querySelector(`[data-subscriber-status="${id}"]`)?.value;
    const cambios = {
        estado,
        atendido_por: estado === 'pendiente' ? null : sesionActual.user.id,
        atendido_at: estado === 'pendiente' ? null : new Date().toISOString()
    };
    const { error } = await supabaseClient.from('solicitudes_abonados').update(cambios).eq('id', id);
    if (error) {
        mostrarToast('No se pudo actualizar la solicitud.');
        return;
    }
    mostrarToast('Estado del abonado actualizado.');
    await cargarSolicitudesAbonados();
}

function suscribirSolicitudesAbonados() {
    if (!usuarioPuedeGestionarAbonados() || !supabaseClient) return;
    if (canalSolicitudesAbonados) supabaseClient.removeChannel(canalSolicitudesAbonados);
    canalSolicitudesAbonados = supabaseClient
        .channel(`solicitudes-abonados-${sesionActual.user.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitudes_abonados' }, payload => {
            if (usuarioEsSuperior() || payload.new?.sede === obtenerSedeActual() || payload.old?.sede === obtenerSedeActual()) {
                if (payload.eventType === 'INSERT' && payload.new?.creado_por !== sesionActual?.user?.id) {
                    mostrarToast(`Nueva solicitud de abonado en ${obtenerNombreSede(payload.new.sede)}.`);
                }
                cargarSolicitudesAbonados();
            }
        })
        .subscribe();
}

function actualizarPanelAdminGuias() {
    const acciones = obtenerElemento('adminActionsPanel');
    const panel = obtenerElemento('adminGuidePanel');
    const usuarios = obtenerElemento('adminUsersPanel');
    const salud = obtenerElemento('systemHealthPanel');
    const botonGuias = obtenerElemento('toggleGuideAdmin');
    const botonUsuarios = obtenerElemento('toggleUsersAdmin');
    const botonSalud = obtenerElemento('toggleSystemHealth');
    const botonModuloPasswords = obtenerElemento('openPasswordResetModule');

    if (!acciones || !panel || !usuarios) {
        return;
    }

    const admin = usuarioEsAdmin();
    const puedeUsuarios = admin || usuarioPuedeRestablecerPassword();
    if (botonModuloPasswords) {
        botonModuloPasswords.hidden = !usuarioPuedeRestablecerPassword();
    }
    acciones.hidden = !admin && !puedeUsuarios;
    if (botonGuias) botonGuias.hidden = !admin;
    botonUsuarios.hidden = !puedeUsuarios;
    if (botonSalud) botonSalud.hidden = !usuarioPuedeVerSaludSupabase();

    if (!admin && !puedeUsuarios) {
        panel.hidden = true;
        usuarios.hidden = true;
        if (salud) salud.hidden = true;
        panel.classList.remove('panel-open');
        usuarios.classList.remove('panel-open');
        salud?.classList.remove('panel-open');
        document.body.classList.remove('admin-panel-open');
        botonGuias?.setAttribute('aria-expanded', 'false');
        botonUsuarios?.setAttribute('aria-expanded', 'false');
        botonSalud?.setAttribute('aria-expanded', 'false');
        return;
    }

    if (!usuarioPuedeVerSaludSupabase() && salud) {
        salud.hidden = true;
        salud.classList.remove('panel-open');
        botonSalud?.setAttribute('aria-expanded', 'false');
    }

    configurarFormularioCreacionUsuario();
    if (admin) {
        if (!guiaTareasBorrador.length) {
            guiaTareasBorrador = [crearTareaBorrador()];
        }
        renderizarTareasBorrador();
    }
}

function cerrarPanelesAdmin() {
    const panelGuias = obtenerElemento('adminGuidePanel');
    const panelUsuarios = obtenerElemento('adminUsersPanel');
    const panelSalud = obtenerElemento('systemHealthPanel');
    const botonGuias = obtenerElemento('toggleGuideAdmin');
    const botonUsuarios = obtenerElemento('toggleUsersAdmin');
    const botonSalud = obtenerElemento('toggleSystemHealth');

    if (panelGuias) {
        panelGuias.hidden = true;
        panelGuias.classList.remove('panel-open');
    }

    if (panelUsuarios) {
        panelUsuarios.hidden = true;
        panelUsuarios.classList.remove('panel-open');
    }

    if (panelSalud) {
        panelSalud.hidden = true;
        panelSalud.classList.remove('panel-open');
    }

    if (botonGuias) {
        botonGuias.textContent = 'Crear guias';
        botonGuias.setAttribute('aria-expanded', 'false');
    }

    if (botonUsuarios) {
        botonUsuarios.textContent = usuarioPuedeRestablecerPassword() && !usuarioEsAdmin()
            ? 'Contraseñas'
            : 'Crear usuarios';
        botonUsuarios.setAttribute('aria-expanded', 'false');
    }

    if (botonSalud) {
        botonSalud.textContent = 'Salud de Supabase';
        botonSalud.setAttribute('aria-expanded', 'false');
    }

    ocultarResultadoRestablecimiento();
    document.body.classList.remove('admin-panel-open');

    if (elementoRetornoPanelAdmin?.isConnected) {
        elementoRetornoPanelAdmin.focus();
    }
    elementoRetornoPanelAdmin = null;
}

function alternarPanelAdmin(tipo) {
    const accesoPermitido = tipo === 'usuarios'
        ? (usuarioEsAdmin() || usuarioPuedeRestablecerPassword())
        : tipo === 'salud'
            ? usuarioPuedeVerSaludSupabase()
            : usuarioEsAdmin();
    if (!accesoPermitido) {
        return;
    }
    const panelGuias = obtenerElemento('adminGuidePanel');
    const panelUsuarios = obtenerElemento('adminUsersPanel');
    const panelSalud = obtenerElemento('systemHealthPanel');
    const botonGuias = obtenerElemento('toggleGuideAdmin');
    const botonUsuarios = obtenerElemento('toggleUsersAdmin');
    const botonSalud = obtenerElemento('toggleSystemHealth');
    const abrirGuias = tipo === 'guias' ? panelGuias.hidden : false;
    const abrirUsuarios = tipo === 'usuarios' ? panelUsuarios.hidden : false;
    const abrirSalud = tipo === 'salud' ? panelSalud.hidden : false;

    if (abrirGuias || abrirUsuarios || abrirSalud) {
        elementoRetornoPanelAdmin = document.activeElement;
    }

    panelGuias.hidden = !abrirGuias;
    panelUsuarios.hidden = !abrirUsuarios;
    panelSalud.hidden = !abrirSalud;
    panelGuias.classList.toggle('panel-open', abrirGuias);
    panelUsuarios.classList.toggle('panel-open', abrirUsuarios);
    panelSalud.classList.toggle('panel-open', abrirSalud);
    document.body.classList.toggle('admin-panel-open', abrirGuias || abrirUsuarios || abrirSalud);
    botonGuias?.setAttribute('aria-expanded', String(abrirGuias));
    botonUsuarios?.setAttribute('aria-expanded', String(abrirUsuarios));
    botonSalud?.setAttribute('aria-expanded', String(abrirSalud));
    botonGuias.textContent = abrirGuias ? 'Ocultar crear guias' : 'Crear guias';
    const etiquetaUsuarios = usuarioPuedeRestablecerPassword() && !usuarioEsAdmin() ? 'Contraseñas' : 'Crear usuarios';
    botonUsuarios.textContent = abrirUsuarios ? `Ocultar ${etiquetaUsuarios.toLowerCase()}` : etiquetaUsuarios;
    if (botonSalud) botonSalud.textContent = abrirSalud ? 'Ocultar salud' : 'Salud de Supabase';

    if (abrirGuias) {
        renderizarTareasBorrador();
        panelGuias.querySelector('[data-close-admin-panel]')?.focus();
    }

    if (abrirUsuarios) {
        configurarFormularioCreacionUsuario();
        if (usuarioEsSuperior() || usuarioPuedeRestablecerPassword()) {
            cargarUsuariosAdmin();
        }
        panelUsuarios.querySelector('[data-close-admin-panel]')?.focus();
    }

    if (abrirSalud) {
        cargarSaludSupabase();
        panelSalud.querySelector('[data-close-admin-panel]')?.focus();
    }
}

function formatearBytesSalud(valor) {
    if (valor == null || valor === '') return 'No disponible';
    const bytes = Number(valor);
    if (!Number.isFinite(bytes) || bytes < 0) return 'No disponible';
    if (bytes < 1024) return `${bytes.toFixed(0)} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function obtenerNivelSalud(porcentaje) {
    if (!Number.isFinite(porcentaje)) return 'unknown';
    if (porcentaje >= 85) return 'danger';
    if (porcentaje >= 70) return 'warning';
    return 'healthy';
}

function crearTarjetaMetricaSalud(titulo, valor, detalle, porcentaje = null) {
    const tarjeta = document.createElement('article');
    const etiqueta = document.createElement('span');
    const numero = document.createElement('strong');
    const descripcion = document.createElement('small');
    tarjeta.className = `system-health-metric health-${obtenerNivelSalud(porcentaje)}`;
    etiqueta.textContent = titulo;
    numero.textContent = valor;
    descripcion.textContent = detalle;
    tarjeta.append(etiqueta, numero, descripcion);

    if (Number.isFinite(porcentaje)) {
        const barra = document.createElement('div');
        const avance = document.createElement('span');
        const porcentajeTexto = document.createElement('b');
        const porcentajeLimitado = Math.min(Math.max(porcentaje, 0), 100);
        barra.className = 'system-health-progress';
        barra.setAttribute('role', 'progressbar');
        barra.setAttribute('aria-valuemin', '0');
        barra.setAttribute('aria-valuemax', '100');
        barra.setAttribute('aria-valuenow', porcentajeLimitado.toFixed(1));
        avance.style.width = `${porcentajeLimitado}%`;
        porcentajeTexto.textContent = `${porcentaje.toFixed(1)}% usado`;
        barra.appendChild(avance);
        tarjeta.append(barra, porcentajeTexto);
    }
    return tarjeta;
}

function crearFilaListaSalud(etiqueta, total, detalle = '') {
    const fila = document.createElement('div');
    const contenido = document.createElement('span');
    const nombre = document.createElement('strong');
    const secundario = document.createElement('small');
    const valor = document.createElement('b');
    fila.className = 'system-health-list-row';
    nombre.textContent = etiqueta;
    secundario.textContent = detalle;
    contenido.appendChild(nombre);
    if (detalle) contenido.appendChild(secundario);
    valor.textContent = String(total ?? 0);
    fila.append(contenido, valor);
    return fila;
}

function renderizarSaludSupabase(datos) {
    const resumen = obtenerElemento('systemHealthOverview');
    const roles = obtenerElemento('systemHealthRoles');
    const sedes = obtenerElemento('systemHealthSites');
    const anfitriones = obtenerElemento('systemHealthHosts');
    const tablas = obtenerElemento('systemHealthTables');
    if (!resumen || !roles || !sedes || !anfitriones || !tablas) return;

    [resumen, roles, sedes, anfitriones, tablas].forEach(limpiarElemento);
    const databaseRaw = datos.database?.bytes;
    const storageRaw = datos.storage?.bytes;
    const databaseBytes = Number(databaseRaw);
    const databaseLimit = Number(datos.database?.limit_bytes || 524288000);
    const storageBytes = Number(storageRaw);
    const storageLimit = Number(datos.storage?.limit_bytes || 1073741824);
    const databaseAvailable = databaseRaw != null && Number.isFinite(databaseBytes);
    const storageAvailable = storageRaw != null && Number.isFinite(storageBytes);
    const databasePercent = databaseAvailable && databaseLimit ? databaseBytes / databaseLimit * 100 : null;
    const storagePercent = storageAvailable && storageLimit ? storageBytes / storageLimit * 100 : null;

    resumen.append(
        crearTarjetaMetricaSalud(
            'Base de datos',
            formatearBytesSalud(databaseAvailable ? databaseBytes : null),
            databaseAvailable ? `Limite gratuito: ${formatearBytesSalud(databaseLimit)}` : 'Medicion avanzada pendiente',
            databasePercent
        ),
        crearTarjetaMetricaSalud(
            'Fotos y archivos',
            formatearBytesSalud(storageAvailable ? storageBytes : null),
            storageAvailable
                ? `${Number(datos.storage?.objects || 0)} archivos - limite ${formatearBytesSalud(storageLimit)}`
                : 'Medicion avanzada pendiente',
            storagePercent
        ),
        crearTarjetaMetricaSalud(
            'Usuarios',
            String(datos.users?.total || 0),
            `${Number(datos.users?.active || 0)} activos - ${Number(datos.users?.created_last_30_days || 0)} nuevos en 30 dias`
        ),
        crearTarjetaMetricaSalud(
            'Conexiones actuales',
            datos.database_connections == null ? 'No disponible' : String(datos.database_connections),
            datos.database_connections == null ? 'Disponible con medicion avanzada' : 'Conexiones abiertas en Postgres'
        )
    );

    const rolesDatos = Array.isArray(datos.users?.roles) ? datos.users.roles : [];
    if (!rolesDatos.length) roles.appendChild(crearMensajeVacio('No hay roles para mostrar.'));
    rolesDatos.forEach(item => roles.appendChild(crearFilaListaSalud(
        obtenerEtiquetaRol(item.role) || item.role || 'Sin rol',
        item.count,
        `${Number(item.active || 0)} activos`
    )));

    const sedesDatos = Array.isArray(datos.users?.sites) ? datos.users.sites : [];
    if (!sedesDatos.length) sedes.appendChild(crearMensajeVacio('No hay sedes para mostrar.'));
    sedesDatos.forEach(item => sedes.appendChild(crearFilaListaSalud(
        item.site === 'sin_sede' ? 'Sin sede asignada' : obtenerNombreSede(item.site),
        item.count,
        `${Number(item.active || 0)} activos`
    )));

    const anfitrionesDatos = Array.isArray(datos.users?.hosts) ? datos.users.hosts : [];
    if (!anfitrionesDatos.length) {
        anfitriones.appendChild(crearMensajeVacio('No hay usuarios creados con el rol Anfitrion.'));
    }
    anfitrionesDatos.forEach(usuario => {
        const fila = document.createElement('article');
        const identidad = document.createElement('div');
        const nombre = document.createElement('strong');
        const correo = document.createElement('span');
        const sede = document.createElement('span');
        const estado = document.createElement('b');
        fila.className = 'system-health-user-row';
        nombre.textContent = usuario.name || 'Sin nombre';
        correo.textContent = usuario.email || 'Sin correo';
        sede.textContent = obtenerNombreSede(usuario.site);
        estado.className = usuario.active === false ? 'health-user-inactive' : 'health-user-active';
        estado.textContent = usuario.active === false ? 'Inactivo' : 'Activo';
        identidad.append(nombre, correo);
        fila.append(identidad, sede, estado);
        anfitriones.appendChild(fila);
    });

    const tablasDatos = Array.isArray(datos.tables) ? datos.tables : [];
    if (!tablasDatos.length) tablas.appendChild(crearMensajeVacio('No hay datos de tablas disponibles.'));
    tablasDatos.forEach(item => {
        const detalle = item.bytes == null
            ? `${Number(item.estimated_rows || 0)} registros visibles`
            : `${Number(item.estimated_rows || 0)} registros estimados - ${formatearBytesSalud(item.bytes)}`;
        tablas.appendChild(crearFilaListaSalud(item.table || 'Tabla', detalle));
    });

    const actualizado = obtenerElemento('systemHealthUpdated');
    if (actualizado) {
        const fecha = datos.generated_at ? new Date(datos.generated_at) : new Date();
        actualizado.textContent = `Ultima actualizacion: ${new Intl.DateTimeFormat('es-PE', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(fecha)}`;
    }
}

async function obtenerSaludSupabaseBasica() {
    const { data: perfiles, error } = await supabaseClient
        .from('profiles')
        .select('nombre,email,rol,activo,sede,created_at')
        .order('created_at', { ascending: true });
    if (error) throw error;

    const usuarios = Array.isArray(perfiles) ? perfiles : [];
    const agrupar = (campo) => Array.from(usuarios.reduce((mapa, usuario) => {
        const clave = usuario[campo] || (campo === 'sede' ? 'sin_sede' : 'sin_rol');
        const actual = mapa.get(clave) || { count: 0, active: 0 };
        actual.count += 1;
        if (usuario.activo !== false) actual.active += 1;
        mapa.set(clave, actual);
        return mapa;
    }, new Map()), ([clave, valor]) => ({
        [campo === 'rol' ? 'role' : 'site']: clave,
        ...valor
    })).sort((a, b) => b.count - a.count);

    const tablasConsulta = [
        'registros_codigos', 'guias_operativas', 'guia_progreso', 'estado_operativo',
        'intervenciones_mantenimiento', 'tareas_mantenimiento', 'mantenimiento_programado',
        'planes_preventivos', 'inventario_repuestos', 'inventario_movimientos',
        'solicitudes_abonados', 'push_subscriptions', 'activos_operaciones'
    ];
    const resultados = await Promise.all(tablasConsulta.map(async tabla => {
        const respuesta = await supabaseClient.from(tabla).select('*', { count: 'exact', head: true });
        return respuesta.error ? null : {
            table: tabla,
            estimated_rows: respuesta.count || 0,
            bytes: null
        };
    }));
    const haceTreintaDias = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return {
        mode: 'basic',
        generated_at: new Date().toISOString(),
        database: { bytes: null, limit_bytes: 524288000 },
        storage: { bytes: null, limit_bytes: 1073741824, objects: null },
        database_connections: null,
        users: {
            total: usuarios.length,
            active: usuarios.filter(usuario => usuario.activo !== false).length,
            created_last_30_days: usuarios.filter(usuario => new Date(usuario.created_at).getTime() >= haceTreintaDias).length,
            roles: agrupar('rol'),
            sites: agrupar('sede'),
            hosts: usuarios.filter(usuario => usuario.rol === 'anfitrion').map(usuario => ({
                name: usuario.nombre,
                email: usuario.email,
                site: usuario.sede,
                active: usuario.activo,
                created_at: usuario.created_at
            }))
        },
        tables: resultados.filter(Boolean).sort((a, b) => b.estimated_rows - a.estimated_rows)
    };
}

async function cargarSaludSupabase() {
    if (!usuarioPuedeVerSaludSupabase() || !supabaseClient) return;
    const estado = obtenerElemento('systemHealthStatus');
    if (estado) {
        estado.textContent = 'Consultando Supabase...';
        estado.dataset.status = 'info';
    }

    try {
        const { data, error } = await supabaseClient.rpc('get_system_health');
        if (!error && data) {
            renderizarSaludSupabase(data);
            if (estado) {
                estado.textContent = 'Todos los indicadores se actualizaron correctamente.';
                estado.dataset.status = 'success';
            }
            return;
        }

        const datosBasicos = await obtenerSaludSupabaseBasica();
        renderizarSaludSupabase(datosBasicos);
        if (estado) {
            estado.textContent = 'Usuarios y registros actualizados. La medicion de capacidad necesita aplicar la configuracion avanzada.';
            estado.dataset.status = 'warning';
        }
    } catch (error) {
        console.warn('No se pudo cargar la salud de Supabase:', error);
        if (estado) {
            estado.textContent = 'No se pudo consultar la salud de Supabase. Intenta nuevamente.';
            estado.dataset.status = 'error';
        }
    }
}

function configurarFormularioCreacionUsuario() {
    const esSuperior = usuarioEsSuperior();
    const esAdminGlobal = usuarioEsAdminGlobal();
    const selectorSede = obtenerElemento('newUserSite');
    const selectorRol = obtenerElemento('newUserRole');
    const formulario = obtenerElemento('createUserForm');
    const titulo = obtenerElemento('adminUsersTitle');
    const descripcion = obtenerElemento('adminUsersDescription');
    const ayuda = obtenerElemento('createUserHelper');
    const actualizar = obtenerElemento('refreshUsers');
    const estadoUsuarios = obtenerElemento('usersAdminStatus');
    const lista = obtenerElemento('usersAdminList');

    if (titulo) titulo.textContent = esAdminGlobal ? 'Usuarios y roles' : 'Crear usuario de sede';
    if (descripcion) {
        descripcion.textContent = esAdminGlobal
            ? 'Crea cuentas, ajusta roles y administra el acceso del personal de todas las sedes.'
            : 'Crea cuentas operativas únicamente para tu sede asignada.';
    }
    if (ayuda) {
        ayuda.textContent = esSuperior
            ? 'Ingresa apellidos y nombres y el DNI. El sistema entregara una contrasena temporal.'
            : 'Puedes crear personal operativo para tu sede. El sistema entregara una contrasena temporal.';
    }
    if (formulario) formulario.hidden = false;
    if (actualizar) actualizar.hidden = false;
    if (estadoUsuarios) estadoUsuarios.hidden = false;
    if (lista) lista.hidden = false;

    if (selectorSede) {
        Array.from(selectorSede.options).forEach(opcion => {
            opcion.hidden = !esAdminGlobal && opcion.value !== obtenerSedeActual();
            opcion.disabled = !esAdminGlobal && opcion.value !== obtenerSedeActual();
        });
        if (!esAdminGlobal) selectorSede.value = obtenerSedeActual();
        selectorSede.disabled = !esAdminGlobal;
    }

    if (selectorRol) {
        Array.from(selectorRol.options).forEach(opcion => {
            const permitida = esAdminGlobal || ROLES_CREABLES_POR_ADMIN.includes(opcion.value);
            opcion.hidden = !permitida;
            opcion.disabled = !permitida;
        });
        if (!esAdminGlobal && !ROLES_CREABLES_POR_ADMIN.includes(selectorRol.value)) {
            selectorRol.value = 'anfitrion';
        }
    }
}

function actualizarBotonAlertas() {
    const boton = obtenerElemento('enableAlertsButton');

    if (!boton) {
        return;
    }

    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        boton.textContent = 'Alertas no disponibles';
        boton.disabled = true;
        return;
    }

    if (Notification.permission === 'granted') {
        boton.textContent = 'Alertas activas';
        boton.disabled = true;
        return;
    }

    if (Notification.permission === 'denied') {
        boton.textContent = 'Alertas bloqueadas';
        boton.disabled = true;
        return;
    }

    boton.textContent = 'Activar alertas';
    boton.disabled = false;
}

function convertirBase64UrlAUint8Array(base64Url) {
    const padding = '='.repeat((4 - base64Url.length % 4) % 4);
    const base64 = `${base64Url}${padding}`.replace(/-/g, '+').replace(/_/g, '/');
    const raw = window.atob(base64);
    const output = new Uint8Array(raw.length);

    for (let i = 0; i < raw.length; i += 1) {
        output[i] = raw.charCodeAt(i);
    }

    return output;
}

function claveAplicacionCoincide(suscripcion, claveEsperada) {
    const opciones = suscripcion?.options;

    if (!opciones || !('applicationServerKey' in opciones)) {
        return true;
    }

    if (!opciones.applicationServerKey) {
        return false;
    }

    const actual = new Uint8Array(opciones.applicationServerKey);

    return actual.length === claveEsperada.length
        && actual.every((valor, indice) => valor === claveEsperada[indice]);
}

async function registrarSuscripcionPush() {
    if (!supabaseClient || !sesionActual?.user) {
        actualizarEstadoSincronizacion('Inicia sesion', 'warning');
        return;
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        actualizarEstadoSincronizacion('Sin push', 'warning');
        return;
    }

    const registro = await navigator.serviceWorker.ready;
    const claveServidor = convertirBase64UrlAUint8Array(VAPID_PUBLIC_KEY);
    let existente = await registro.pushManager.getSubscription();

    if (existente && !claveAplicacionCoincide(existente, claveServidor)) {
        const endpointObsoleto = existente.endpoint;

        await existente.unsubscribe().catch(() => {});
        await supabaseClient.from('push_subscriptions').delete().eq('endpoint', endpointObsoleto);
        existente = null;
    }

    const suscripcion = existente || await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: claveServidor
    });
    const json = suscripcion.toJSON();

    const { error } = await supabaseClient
        .from('push_subscriptions')
        .upsert({
            user_id: sesionActual.user.id,
            endpoint: json.endpoint,
            p256dh: json.keys?.p256dh || '',
            auth: json.keys?.auth || '',
            user_agent: navigator.userAgent,
            updated_at: new Date().toISOString()
        }, { onConflict: 'endpoint' });

    if (error) {
        actualizarEstadoSincronizacion('Push pendiente', 'warning');
        console.warn('No se pudo guardar suscripcion push:', error);
        return;
    }

    actualizarEstadoSincronizacion('Push activo', 'success');
}

async function solicitarPermisoAlertas() {
    if (!('Notification' in window)) {
        actualizarEstadoSincronizacion('Sin alertas', 'warning');
        return;
    }

    const permiso = await Notification.requestPermission();
    actualizarBotonAlertas();

    if (permiso === 'granted') {
        await registrarSuscripcionPush();
        actualizarEstadoSincronizacion('Alertas activas', 'success');
    } else {
        actualizarEstadoSincronizacion('Alertas bloqueadas', 'warning');
    }
}

function notificarCodigoRemoto(codigo, emailOrigen) {
    const info = codigosEmergencia[codigo];

    if (!info || ultimoCodigoRemotoAlertado === codigo) {
        return;
    }

    ultimoCodigoRemotoAlertado = codigo;
    reproducirSonidoAlerta();

    if (navigator.vibrate) {
        navigator.vibrate([260, 120, 260, 120, 420]);
    }

    const titulo = `${info.nombre} activado`;
    const cuerpo = emailOrigen
        ? `${emailOrigen} activo ${info.nombre}. Abre el checklist operativo.`
        : `Se activo ${info.nombre}. Abre el checklist operativo.`;

    if ('Notification' in window && Notification.permission === 'granted') {
        navigator.serviceWorker?.ready
            .then(registro => registro.showNotification(titulo, {
                body: cuerpo,
                icon: 'assets/icons/icon-192.png',
                badge: 'assets/icons/icon-192.png',
                tag: `codigo-activo-${codigo}`,
                renotify: true,
                vibrate: [260, 120, 260, 120, 420],
                data: { codigo }
            }))
            .catch(() => {
                new Notification(titulo, {
                    body: cuerpo,
                    icon: 'assets/icons/icon-192.png',
                    tag: `codigo-activo-${codigo}`
                });
            });
    }
}

function mostrarAlertaRemota(codigo, emailOrigen) {
    const info = codigosEmergencia[codigo];
    const alerta = obtenerElemento('remoteAlert');
    const titulo = obtenerElemento('remoteAlertTitle');
    const texto = obtenerElemento('remoteAlertText');
    const abrir = obtenerElemento('remoteAlertOpen');

    if (!info || !alerta || !titulo || !texto || !abrir) {
        return;
    }

    alerta.style.setProperty('--alert-color', info.color);
    titulo.textContent = `Se activo ${info.nombre}!!`;
    texto.textContent = emailOrigen
        ? `${emailOrigen} activo ${info.nombre}. Revisa el checklist operativo.`
        : `Se activo ${info.nombre}. Revisa el checklist operativo.`;
    alerta.hidden = false;
    abrir.focus();
}

function cerrarAlertaRemota() {
    const alerta = obtenerElemento('remoteAlert');

    if (alerta) {
        alerta.hidden = true;
    }
}

function abrirChecklistDesdeAlerta() {
    cerrarAlertaRemota();
    seleccionarModulo('codigos', { desplazar: false });
    const panel = document.querySelector('.checklist-panel');
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (panel) {
        panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
}

async function enviarAlertaPushCodigo(codigo) {
    if (!supabaseClient || !sesionActual?.user || !codigosEmergencia[codigo]) {
        return;
    }

    try {
        const { error } = await supabaseClient.functions.invoke('send-code-alert', {
            body: {
                codigo,
                nombre: codigosEmergencia[codigo].nombre,
                guia: codigosEmergencia[codigo].guia
            }
        });

        if (error) {
            console.warn('No se pudo enviar push remoto:', error);
        }
    } catch (error) {
        console.warn('Funcion push no disponible aun:', error);
    }
}

async function enviarAlertaPushAbonado(sede) {
    if (!supabaseClient || !sesionActual?.user || !sede) return { sent: 0, failed: 0 };

    try {
        const invocacion = supabaseClient.functions.invoke('send-code-alert', {
            body: { evento: 'nuevo_abonado', sede }
        });
        const limite = new Promise(resolve => window.setTimeout(
            () => resolve({ data: null, error: new Error('Tiempo de espera agotado') }),
            12_000
        ));
        const { data, error } = await Promise.race([invocacion, limite]);
        if (error) throw error;
        return data || { sent: 0, failed: 0 };
    } catch (error) {
        console.warn('Funcion push no disponible:', error);
        return { sent: 0, failed: 1, error: true };
    }
}

async function inicializarClienteSupabase() {
    if (supabaseClient) {
        return supabaseClient;
    }

    if (inicializacionSupabase) {
        return inicializacionSupabase;
    }

    inicializacionSupabase = cargarClienteSupabase();
    const cliente = await inicializacionSupabase;
    inicializacionSupabase = null;
    return cliente;
}

async function cargarClienteSupabase() {
    let createClient = window.supabase?.createClient;

    if (!createClient) {
        for (const source of SUPABASE_ESM_SOURCES) {
            try {
                const moduloSupabase = await import(source);
                createClient = moduloSupabase.createClient;
                break;
            } catch (error) {
                console.warn(`No se pudo cargar Supabase desde ${source}:`, error);
            }
        }

        if (!createClient) {
            actualizarEstadoAuth('No se pudo cargar Supabase. Revisa la conexion a internet y actualiza la app.', 'error');
            actualizarBotonIngreso(true, 'Reintentar');
            return null;
        }
    }

    supabaseClient = createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.publishableKey,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        }
    );

    actualizarBotonIngreso(true);
    return supabaseClient;
}

async function cargarPerfilActual() {
    perfilActual = null;

    if (!supabaseClient || !sesionActual?.user) {
        actualizarSesionUI();
        return;
    }

    const { data, error } = await supabaseClient
        .from('profiles')
        .select('nombre,apellidos_nombres,dni,rol,activo,sede,debe_cambiar_password,password_actualizada_at')
        .eq('id', sesionActual.user.id)
        .maybeSingle();

    if (error) {
        console.warn('No se pudo cargar perfil:', error);
    } else if (data) {
        perfilActual = data;
        migrarDatosLocalesInicialesDeSede();
        historial = cargarHistorial();
        checklistEstado = cargarChecklistEstado();
        await hidratarFotosChecklistCodigos();
        actualizarHistorialUI();
        actualizarResumenUI();
    }

    actualizarSesionUI();
    actualizarPanelAdminGuias();
    actualizarAccesoAbonados();
    renderizarGuiasOperativas();
}

function normalizarRegistroRemoto(registro) {
    const codigo = registro.codigo;
    const info = codigosEmergencia[codigo] || {};
    const cerrado = registro.cerrado_en || registro.created_at || '';
    const fechaCierre = cerrado ? new Date(cerrado) : null;

    return {
        id: registro.id,
        codigo,
        nombre: registro.nombre || info.nombre || codigo,
        descripcion: registro.descripcion || info.descripcion || '',
        fecha: fechaCierre && !Number.isNaN(fechaCierre.getTime()) ? dateFormatter.format(fechaCierre) : '',
        hora: fechaCierre && !Number.isNaN(fechaCierre.getTime()) ? timeFormatter.format(fechaCierre) : '',
        encargado: registro.encargado || '',
        modo: registro.modo || 'real',
        prioridad: registro.prioridad || 'media',
        activadoEn: registro.activado_en || '',
        cerradoEn: registro.cerrado_en || '',
        sede: registro.sede || obtenerSedeActual() || '',
        remoto: true,
        creadoPorEmail: registro.creado_por_email || ''
    };
}

async function cargarHistorialRemoto() {
    if (!supabaseClient || !sesionActual?.user) {
        return;
    }

    actualizarEstadoSincronizacion('Sincronizando', 'info');

    const { data, error } = await supabaseClient
        .from('registros_codigos')
        .select('id,codigo,nombre,descripcion,encargado,modo,prioridad,activado_en,cerrado_en,sede,created_at,creado_por_email')
        .order('created_at', { ascending: false })
        .limit(MAX_HISTORIAL);

    if (error) {
        historialRemotoActivo = false;
        actualizarEstadoSincronizacion('Modo local', 'warning');
        console.warn('No se pudo cargar historial remoto:', error);
        return;
    }

    historialRemotoActivo = true;
    historial = data.map(normalizarRegistroRemoto);
    guardarHistorial();
    actualizarHistorialUI();
    actualizarResumenUI();
    actualizarEstadoSincronizacion('Online', 'success');
}

function cargarGuiasLocales() {
    guiasOperativas = safeParseJSON(localStorage.getItem(STORAGE_KEYS.guides), []);
    if (!Array.isArray(guiasOperativas)) {
        guiasOperativas = [];
    }
    renderizarGuiasOperativas();
}

function guardarGuiasLocales() {
    guardarEstadoLocalStorage(STORAGE_KEYS.guides, guiasOperativas);
}

function cargarProgresoGuias() {
    progresoGuias = safeParseJSON(localStorage.getItem(STORAGE_KEYS.guideProgress), {});
    if (!progresoGuias || typeof progresoGuias !== 'object') {
        progresoGuias = {};
    }
}

function guardarProgresoGuias() {
    guardarEstadoLocalStorage(STORAGE_KEYS.guideProgress, progresoGuias);
}

async function cargarProgresoGuiasRemoto() {
    if (!supabaseClient || !sesionActual?.user) {
        return;
    }

    const { data, error } = await supabaseClient
        .from('guia_progreso')
        .select('guia_id,revisada,revisada_en')
        .eq('user_id', sesionActual.user.id);

    if (error) {
        console.warn('No se pudo cargar progreso de guias:', error);
        return;
    }

    (data || []).forEach(item => {
        progresoGuias[item.guia_id] = {
            revisada: item.revisada,
            revisadaEn: item.revisada_en
        };
    });
    guardarProgresoGuias();
    renderizarGuiasOperativas();
    actualizarProgresoCapacitacionUI();
}

function obtenerNombreSede(sede) {
    if (sede === 'general') return 'General';
    return SEDES_OPERACION.find(item => item.id === sede)?.nombre || 'Todas las sedes';
}

function normalizarSedeGuia(guia) {
    const sede = String(guia.sede || '').toLowerCase();
    if (sede === 'general' || SEDES_OPERACION.some(item => item.id === sede)) {
        return sede;
    }

    return guia.modulo === 'caja' ? 'gama' : 'general';
}

function obtenerSedesGuia(guia) {
    const sedes = Array.isArray(guia.sedes)
        ? guia.sedes
        : guia.sedes && typeof guia.sedes === 'string'
            ? safeParseJSON(guia.sedes, [])
            : [];
    const sedesValidas = sedes
        .map(sede => String(sede || '').toLowerCase())
        .filter((sede, indice, lista) =>
            (sede === 'general' || SEDES_OPERACION.some(item => item.id === sede))
            && lista.indexOf(sede) === indice
        );

    if (sedesValidas.length) {
        return sedesValidas;
    }

    return [normalizarSedeGuia(guia)];
}

function obtenerSedesSeleccionadasGuia() {
    const checks = [...document.querySelectorAll('input[name="guideSites"]:checked')];
    return checks
        .map(check => check.value)
        .filter(sede => SEDES_OPERACION.some(item => item.id === sede));
}

function establecerSedesSeleccionadasGuia(sedes) {
    const valores = new Set(
        (Array.isArray(sedes) && sedes.length ? sedes : ['puruchuco'])
            .filter(sede => SEDES_OPERACION.some(item => item.id === sede))
    );

    document.querySelectorAll('input[name="guideSites"]').forEach(check => {
        check.checked = valores.has(check.value);
    });
}

function obtenerTextoSedesGuia(guia) {
    const sedes = obtenerSedesGuia(guia);
    if (sedes.includes('general')) {
        return 'Todas las sedes';
    }

    return sedes.map(obtenerNombreSede).join(', ');
}

function actualizarCampoSedeGuia() {
    const modulo = obtenerElemento('guideModule')?.value;
    const campo = obtenerElemento('guideSiteField');
    const checks = [...document.querySelectorAll('input[name="guideSites"]')];
    const usaSede = MODULOS_POR_SEDE.has(modulo);

    if (!campo || !checks.length) {
        return;
    }

    campo.hidden = !usaSede;
    checks.forEach(check => {
        check.disabled = !usaSede;
    });
    if (!usaSede) {
        establecerSedesSeleccionadasGuia(['puruchuco']);
        return;
    }

    const sedePreferida = sedeActivaPorModulo[modulo] || 'puruchuco';
    if (!obtenerSedesSeleccionadasGuia().length) {
        establecerSedesSeleccionadasGuia([sedePreferida]);
    }
}

function normalizarGuiaOperativa(guia) {
    const pasos = Array.isArray(guia.pasos)
        ? guia.pasos
            .map((paso, indice) => {
                if (typeof paso === 'string') {
                    return {
                        titulo: `Tarea ${indice + 1}`,
                        descripcion: paso,
                        foto: null
                    };
                }

                if (paso && typeof paso === 'object') {
                    const foto = paso.foto && typeof paso.foto === 'object'
                        ? {
                            path: typeof paso.foto.path === 'string' ? paso.foto.path : '',
                            url: typeof paso.foto.url === 'string' ? paso.foto.url : '',
                            dataUrl: typeof paso.foto.dataUrl === 'string' ? paso.foto.dataUrl : '',
                            nombre: paso.foto.nombre || '',
                            agregadaEn: paso.foto.agregadaEn || ''
                        }
                        : null;
                    return {
                        titulo: paso.titulo || `Tarea ${indice + 1}`,
                        descripcion: paso.descripcion || paso.texto || '',
                        foto
                    };
                }

                return null;
            })
            .filter(paso => paso && paso.descripcion)
        : [];

    return {
        id: guia.id || `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        modulo: guia.modulo,
        sede: normalizarSedeGuia(guia),
        sedes: obtenerSedesGuia(guia),
        audiencia: guia.audiencia === 'supervision' ? 'supervision' : 'todos',
        titulo: guia.titulo || 'Guia sin titulo',
        descripcion: guia.descripcion || '',
        pasos,
        creadoPorEmail: guia.creado_por_email || guia.creadoPorEmail || '',
        createdAt: guia.created_at || guia.createdAt || new Date().toISOString(),
        updatedAt: guia.updated_at || guia.updatedAt || guia.created_at || guia.createdAt || new Date().toISOString(),
        remoto: Boolean(guia.id && !String(guia.id).startsWith('local-'))
    };
}

function usuarioPuedeVerGuia(guia) {
    if (guia.audiencia !== 'supervision') {
        return true;
    }

    return [ROL_SUPERIOR, 'admin', 'supervisor', 'fortaleza', ...ROLES_OPERACION_GLOBAL].includes(perfilActual?.rol);
}

function obtenerFuenteFotoGuia(foto) {
    return foto?.url || foto?.dataUrl || '';
}

async function hidratarFotosGuias(guias) {
    if (!supabaseClient || !sesionActual?.user) {
        return guias;
    }

    const fotos = guias.flatMap(guia => guia.pasos.map(paso => paso.foto).filter(foto => foto?.path));
    const rutas = [...new Set(fotos.map(foto => foto.path))];
    const urls = new Map();

    await Promise.all(rutas.map(async path => {
        const { data, error } = await supabaseClient.storage
            .from(GUIDE_IMAGE_BUCKET)
            .createSignedUrl(path, GUIDE_IMAGE_URL_TTL);
        if (!error && data?.signedUrl) {
            urls.set(path, data.signedUrl);
        } else {
            console.warn(`No se pudo abrir la foto ${path}:`, error);
        }
    }));

    fotos.forEach(foto => {
        foto.url = urls.get(foto.path) || '';
    });
    return guias;
}

async function cargarGuiasRemotas() {
    if (!supabaseClient || !sesionActual?.user) {
        return;
    }

    const { data, error } = await supabaseClient
        .from('guias_operativas')
        .select('id,modulo,sede,audiencia,titulo,descripcion,pasos,creado_por_email,created_at,updated_at')
        .order('updated_at', { ascending: false });

    if (error) {
        guiasRemotasActivas = false;
        console.warn('No se pudieron cargar guias operativas:', error);
        renderizarGuiasOperativas();
        return;
    }

    const guiasLocalesPendientes = guiasOperativas.filter(guia =>
        String(guia.id).startsWith('local-')
    );

    const guiasRemotas = data.map(normalizarGuiaOperativa);
    await hidratarFotosGuias(guiasRemotas);

    guiasRemotasActivas = true;
    guiasOperativas = [
        ...guiasRemotas,
        ...guiasLocalesPendientes
    ];
    guardarGuiasLocales();
    renderizarGuiasOperativas();
    actualizarProgresoCapacitacionUI();
    actualizarResultadosBusquedaGlobal();
    actualizarResumenUI();
}

function crearGuiaElemento(guia) {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    const icono = document.createElement('span');
    const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const texto = document.createElement('span');
    const titulo = document.createElement('strong');
    const descripcion = document.createElement('small');
    const estadoGuia = document.createElement('span');
    const cuerpo = document.createElement('div');
    const lista = document.createElement('ol');
    const meta = document.createElement('p');

    details.className = 'procedure-card';
    details.dataset.guideId = guia.id;
    const revisada = Boolean(progresoGuias[guia.id]?.revisada);
    details.classList.toggle('guide-reviewed', revisada);
    details.classList.toggle('guide-restricted', guia.audiencia === 'supervision');
    icono.className = 'procedure-icon';
    icono.setAttribute('aria-hidden', 'true');
    iconSvg.setAttribute('viewBox', '0 0 64 64');
    iconSvg.setAttribute('focusable', 'false');
    iconPath.setAttribute('d', 'M14 12h36v40H14zM22 24h20M22 34h20M22 44h12');
    iconSvg.appendChild(iconPath);
    icono.appendChild(iconSvg);

    titulo.textContent = guia.titulo;
    descripcion.textContent = guia.descripcion || 'Guia operativa agregada por administrador.';
    texto.className = 'procedure-copy';
    estadoGuia.className = 'guide-status-badge';
    estadoGuia.textContent = revisada ? 'Revisada' : 'Pendiente';
    texto.append(titulo, descripcion);
    summary.append(icono, texto, estadoGuia);

    cuerpo.className = 'procedure-body';
    lista.className = 'procedure-steps';

    guia.pasos.forEach((paso, indice) => {
        const item = document.createElement('li');
        const contenido = document.createElement('div');
        const pasoTitulo = document.createElement('h3');
        const detalle = document.createElement('p');
        const foto = document.createElement('figure');

        pasoTitulo.textContent = paso.titulo || `Tarea ${indice + 1}`;
        detalle.textContent = paso.descripcion;
        foto.className = 'photo-placeholder';

        const fuenteFoto = obtenerFuenteFotoGuia(paso.foto);
        if (fuenteFoto) {
            const imagen = document.createElement('img');
            const caption = document.createElement('figcaption');
            imagen.src = fuenteFoto;
            imagen.alt = `Foto referencial de ${pasoTitulo.textContent}`;
            imagen.loading = 'lazy';
            imagen.decoding = 'async';
            imagen.tabIndex = 0;
            imagen.dataset.previewPhoto = fuenteFoto;
            imagen.dataset.previewTitle = `${guia.titulo} - ${pasoTitulo.textContent}`;
            caption.textContent = paso.foto.nombre || 'Foto referencial de la tarea.';
            foto.classList.add('photo-placeholder-filled');
            foto.append(imagen, caption);
        } else {
            const fotoTexto = document.createElement('span');
            const caption = document.createElement('figcaption');
            fotoTexto.textContent = 'Foto pendiente';
            caption.textContent = 'Evidencia o referencia visual del paso.';
            foto.append(fotoTexto, caption);
        }

        contenido.append(pasoTitulo, detalle);
        item.append(contenido, foto);
        lista.appendChild(item);
    });

    meta.className = 'guide-meta';
    const sedeTexto = obtenerTextoSedesGuia(guia);
    const autoria = guia.creadoPorEmail
        ? `Creado por ${guia.creadoPorEmail}`
        : 'Guia agregada por administrador';
    const acceso = guia.audiencia === 'supervision' ? 'Solo supervision y administracion' : 'Todos los usuarios';
    meta.textContent = `${sedeTexto} - ${acceso} - ${autoria}`;

    cuerpo.append(lista, meta);

    if (usuarioEsAdmin()) {
        const acciones = document.createElement('div');
        const editar = document.createElement('button');
        const eliminar = document.createElement('button');
        acciones.className = 'guide-actions';
        editar.className = 'clear-btn';
        editar.type = 'button';
        editar.dataset.editGuide = guia.id;
        editar.textContent = 'Editar guia';
        eliminar.className = 'clear-btn danger-action';
        eliminar.type = 'button';
        eliminar.dataset.deleteGuide = guia.id;
        eliminar.textContent = 'Eliminar guia completa';
        acciones.append(editar, eliminar);
        cuerpo.appendChild(acciones);
    }

    const progreso = document.createElement('div');
    const revisar = document.createElement('button');
    const exportarPdf = document.createElement('button');
    progreso.className = 'guide-actions';
    revisar.className = progresoGuias[guia.id]?.revisada ? 'finish-btn' : 'clear-btn';
    revisar.type = 'button';
    revisar.dataset.markGuideRead = guia.id;
    revisar.textContent = progresoGuias[guia.id]?.revisada ? 'Guia revisada' : 'Marcar como revisada';
    exportarPdf.className = 'clear-btn';
    exportarPdf.type = 'button';
    exportarPdf.dataset.exportGuidePdf = guia.id;
    exportarPdf.textContent = 'Generar PDF';
    progreso.append(revisar, exportarPdf);
    cuerpo.appendChild(progreso);

    details.append(summary, cuerpo);
    return details;
}

function renderizarNavegacionSedes() {
    MODULOS_POR_SEDE.forEach(modulo => {
        const contenedor = document.querySelector(`[data-site-navigation="${modulo}"]`);
        const contexto = obtenerElemento(`siteContext-${modulo}`);
        if (!contenedor) {
            return;
        }

        limpiarElemento(contenedor);
        SEDES_OPERACION.forEach(sede => {
            const boton = document.createElement('button');
            const activa = sedeActivaPorModulo[modulo] === sede.id;
            boton.className = 'site-button';
            boton.type = 'button';
            boton.dataset.selectSite = sede.id;
            boton.dataset.siteModule = modulo;
            boton.textContent = sede.corto || sede.nombre;
            boton.setAttribute('aria-label', `Consultar ${sede.nombre}`);
            boton.title = sede.nombre;
            boton.setAttribute('aria-pressed', activa ? 'true' : 'false');
            contenedor.appendChild(boton);
        });

        if (contexto) {
            const sede = obtenerNombreSede(sedeActivaPorModulo[modulo]);
            contexto.textContent = modulo === 'mantenimiento'
                ? `Consultando ${sede}. Las guias generales tambien se muestran en esta sede.`
                : `Consultando guias de ${sede}.`;
        }
    });
}

function seleccionarSedeModulo(modulo, sede, opciones = {}) {
    if (!MODULOS_POR_SEDE.has(modulo) || !SEDES_OPERACION.some(item => item.id === sede)) {
        return;
    }

    sedeActivaPorModulo[modulo] = sede;
    renderizarGuiasOperativas();

    if (modulo === 'mantenimiento' && accesoMantenimientoActivo) {
        prepararEnlaceInformeMantenimiento();
        actualizarAreaMantenimientoUI();
        if (usuarioEsSuperior() && obtenerElemento('maintenanceTaskSite')) {
            obtenerElemento('maintenanceTaskSite').value = sede;
            actualizarEquiposAsignacionMantenimiento();
        }
        cargarInventarioRepuestos();
        cargarIntervencionesMantenimiento();
        cargarMovimientosInventario();
        cargarMantenimientoProgramado();
        suscribirInventarioRepuestos();
        suscribirIntervencionesMantenimiento();
        suscribirMantenimientoProgramado();
        suscribirTareasMantenimiento();
    }

    if (opciones.desplazar) {
        obtenerElemento(`module-${modulo}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function renderizarGuiasOperativas() {
    renderizarNavegacionSedes();

    ['mantenimiento', 'operaciones', 'caja', 'ronda'].forEach(modulo => {
        const contenedor = obtenerElemento(`dynamicGuides-${modulo}`);
        if (!contenedor) {
            return;
        }

        limpiarElemento(contenedor);
        const sedeActiva = sedeActivaPorModulo[modulo];
        const guiasModulo = guiasOperativas.filter(guia => {
            if (guia.modulo !== modulo || !usuarioPuedeVerGuia(guia)) {
                return false;
            }
            return !MODULOS_POR_SEDE.has(modulo)
                || obtenerSedesGuia(guia).includes('general')
                || obtenerSedesGuia(guia).includes(sedeActiva);
        });

        guiasModulo.forEach(guia => contenedor.appendChild(crearGuiaElemento(guia)));

        if (MODULOS_POR_SEDE.has(modulo) && !guiasModulo.length) {
            const vacio = document.createElement('p');
            vacio.className = 'empty-site-guides';
            vacio.textContent = `Aun no hay guias especificas para ${obtenerNombreSede(sedeActiva)}.`;
            contenedor.appendChild(vacio);
        }
    });
    actualizarContadoresModulos();
}

function actualizarContadoresModulos() {
    ['mantenimiento', 'operaciones', 'caja', 'ronda'].forEach(modulo => {
        const contador = document.querySelector(`[data-module-count="${modulo}"]`);
        const boton = document.querySelector(`button[data-module="${modulo}"]`);
        if (!contador) {
            return;
        }

        const guiasBase = modulo === 'mantenimiento' ? 2 : 0;
        const total = guiasBase + guiasOperativas.filter(guia => guia.modulo === modulo && usuarioPuedeVerGuia(guia)).length;
        const revisadas = guiasOperativas.filter(guia =>
            guia.modulo === modulo && usuarioPuedeVerGuia(guia) && progresoGuias[guia.id]?.revisada
        ).length;
        const etiquetaTotal = total === 1 ? '1 guia' : `${total} guias`;
        contador.textContent = revisadas ? `${etiquetaTotal} · ${revisadas} revisadas` : etiquetaTotal;
        boton?.setAttribute('aria-label', `${modulo}. ${contador.textContent}`);
    });

    const contadorCodigos = document.querySelector('[data-module-count="codigos"]');
    if (contadorCodigos) {
        contadorCodigos.textContent = `${ordenCodigos.length} protocolos`;
    }

    const guiasVisibles = guiasOperativas.filter(usuarioPuedeVerGuia);
    const total = guiasVisibles.length;
    const revisadas = guiasVisibles.filter(guia => progresoGuias[guia.id]?.revisada).length;
    const porcentaje = total ? Math.round((revisadas / total) * 100) : 0;
    const contadorCapacitacion = document.querySelector('[data-module-count="capacitacion"]');
    if (contadorCapacitacion) {
        contadorCapacitacion.textContent = total ? `${porcentaje}% completado` : 'Sin avance registrado';
    }
}

function crearTareaBorrador(descripcion = '', foto = null) {
    return {
        id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        descripcion,
        foto
    };
}

function obtenerClaveBorradorGuia() {
    const usuario = sesionActual?.user?.id;
    return usuario ? `${STORAGE_KEYS.guideDraft}:${usuario}` : STORAGE_KEYS.guideDraft;
}

function guardarBorradorGuia() {
    if (!usuarioEsAdmin()) {
        return;
    }

    const borrador = {
        editandoId: obtenerElemento('guideEditingId')?.value || '',
        modulo: obtenerElemento('guideModule')?.value || 'mantenimiento',
        sedes: obtenerSedesSeleccionadasGuia(),
        audiencia: obtenerElemento('guideAudience')?.value || 'todos',
        titulo: obtenerElemento('guideTitle')?.value || '',
        descripcion: obtenerElemento('guideDescription')?.value || '',
        tareas: guiaTareasBorrador.map(tarea => ({
            descripcion: tarea.descripcion || '',
            foto: tarea.foto || null
        })),
        actualizadoEn: new Date().toISOString()
    };

    const tieneContenido = borrador.editandoId
        || borrador.titulo.trim()
        || borrador.descripcion.trim()
        || borrador.tareas.some(tarea => tarea.descripcion.trim() || tarea.foto);
    if (!tieneContenido) {
        return;
    }

    try {
        localStorage.setItem(obtenerClaveBorradorGuia(), JSON.stringify(borrador));
    } catch (error) {
        console.warn('No se pudo guardar el borrador de guia:', error);
        const estado = obtenerElemento('guideEditorStatus');
        if (estado) {
            estado.textContent = 'El borrador es demasiado grande para guardarse en este dispositivo.';
            estado.dataset.status = 'warning';
        }
    }
}

function programarGuardadoBorradorGuia(retraso = 250) {
    window.clearTimeout(temporizadorBorradorGuia);
    temporizadorBorradorGuia = window.setTimeout(guardarBorradorGuia, retraso);
}

function borrarBorradorGuia() {
    window.clearTimeout(temporizadorBorradorGuia);
    localStorage.removeItem(obtenerClaveBorradorGuia());
}

function restaurarBorradorGuia() {
    if (!usuarioEsAdmin()) {
        return;
    }

    const borrador = safeParseJSON(localStorage.getItem(obtenerClaveBorradorGuia()), null);
    if (!borrador || typeof borrador !== 'object') {
        return;
    }

    obtenerElemento('guideEditingId').value = borrador.editandoId || '';
    obtenerElemento('guideModule').value = borrador.modulo || 'mantenimiento';
    actualizarCampoSedeGuia();
    if (MODULOS_POR_SEDE.has(borrador.modulo)) {
        const sedesBorrador = Array.isArray(borrador.sedes) && borrador.sedes.length
            ? borrador.sedes
            : [borrador.sede].filter(Boolean);
        establecerSedesSeleccionadasGuia(sedesBorrador);
    }
    obtenerElemento('guideAudience').value = borrador.audiencia === 'supervision' ? 'supervision' : 'todos';
    obtenerElemento('guideTitle').value = borrador.titulo || '';
    obtenerElemento('guideDescription').value = borrador.descripcion || '';
    guiaTareasBorrador = Array.isArray(borrador.tareas) && borrador.tareas.length
        ? borrador.tareas.map(tarea => crearTareaBorrador(tarea.descripcion || '', tarea.foto || null))
        : [crearTareaBorrador()];
    renderizarTareasBorrador();
    obtenerElemento('cancelGuideEdit').hidden = !borrador.editandoId;

    const estado = obtenerElemento('guideEditorStatus');
    if (estado) {
        estado.textContent = 'Borrador recuperado automaticamente.';
        estado.dataset.status = 'success';
    }
}

function renderizarTareasBorrador() {
    const contenedor = obtenerElemento('guideTasksList');

    if (!contenedor) {
        return;
    }

    limpiarElemento(contenedor);

    guiaTareasBorrador.forEach((tarea, indice) => {
        const tarjeta = document.createElement('article');
        const encabezado = document.createElement('div');
        const titulo = document.createElement('h4');
        const acciones = document.createElement('div');
        const subir = document.createElement('button');
        const bajar = document.createElement('button');
        const quitar = document.createElement('button');
        const labelDescripcion = document.createElement('label');
        const descripcion = document.createElement('textarea');
        const fotoArea = document.createElement('div');
        const fotoAcciones = document.createElement('div');
        const botonCamara = document.createElement('button');
        const botonGaleria = document.createElement('button');
        const fotoInputCamara = document.createElement('input');
        const fotoInputGaleria = document.createElement('input');
        const fotoEstado = document.createElement('span');

        tarjeta.className = 'guide-task-card';
        tarjeta.dataset.taskId = tarea.id;
        encabezado.className = 'guide-task-card-header';
        titulo.textContent = `Tarea ${indice + 1}`;
        acciones.className = 'guide-task-card-actions';
        subir.className = 'clear-btn';
        subir.type = 'button';
        subir.dataset.moveGuideTask = tarea.id;
        subir.dataset.direction = 'up';
        subir.textContent = 'Subir';
        subir.disabled = indice === 0;
        bajar.className = 'clear-btn';
        bajar.type = 'button';
        bajar.dataset.moveGuideTask = tarea.id;
        bajar.dataset.direction = 'down';
        bajar.textContent = 'Bajar';
        bajar.disabled = indice === guiaTareasBorrador.length - 1;
        quitar.className = 'clear-btn danger-action';
        quitar.type = 'button';
        quitar.dataset.removeGuideTask = tarea.id;
        quitar.textContent = 'Eliminar tarea';
        acciones.append(subir, bajar, quitar);
        encabezado.append(titulo, acciones);

        labelDescripcion.className = 'guide-task-description';
        labelDescripcion.textContent = 'Descripcion de la tarea';
        descripcion.value = tarea.descripcion;
        descripcion.rows = 3;
        descripcion.placeholder = 'Describe que debe hacer el anfitrion en esta tarea';
        descripcion.dataset.taskDescription = tarea.id;
        labelDescripcion.appendChild(descripcion);

        fotoArea.className = 'guide-task-photo';
        fotoAcciones.className = 'guide-task-photo-actions';
        botonCamara.className = 'photo-capture-btn';
        botonCamara.type = 'button';
        botonCamara.dataset.openTaskCamera = tarea.id;
        botonCamara.textContent = tarea.foto ? 'Tomar otra foto' : 'Tomar foto';
        botonGaleria.className = 'clear-btn';
        botonGaleria.type = 'button';
        botonGaleria.dataset.openTaskGallery = tarea.id;
        botonGaleria.textContent = 'Elegir imagen';
        fotoInputCamara.type = 'file';
        fotoInputCamara.accept = 'image/*';
        fotoInputCamara.setAttribute('capture', 'environment');
        fotoInputCamara.dataset.taskPhoto = tarea.id;
        fotoInputCamara.dataset.photoSource = 'camera';
        fotoInputCamara.className = 'guide-task-file-input';
        fotoInputGaleria.type = 'file';
        fotoInputGaleria.accept = 'image/*';
        fotoInputGaleria.dataset.taskPhoto = tarea.id;
        fotoInputGaleria.dataset.photoSource = 'gallery';
        fotoInputGaleria.className = 'guide-task-file-input';
        fotoAcciones.append(botonCamara, botonGaleria, fotoInputCamara, fotoInputGaleria);
        fotoEstado.className = 'photo-status';
        fotoEstado.textContent = tarea.foto ? 'Foto agregada y guardada en el borrador' : 'Sin foto';
        fotoArea.append(fotoAcciones, fotoEstado);

        const fuenteFoto = obtenerFuenteFotoGuia(tarea.foto);
        if (fuenteFoto) {
            const preview = document.createElement('img');
            preview.className = 'guide-task-preview';
            preview.src = fuenteFoto;
            preview.alt = `Foto de la tarea ${indice + 1}`;
            preview.tabIndex = 0;
            preview.dataset.previewPhoto = fuenteFoto;
            preview.dataset.previewTitle = `Tarea ${indice + 1}`;
            fotoArea.appendChild(preview);
        }

        tarjeta.append(encabezado, labelDescripcion, fotoArea);
        contenedor.appendChild(tarjeta);
    });
}

function agregarTareaBorrador() {
    guiaTareasBorrador.push(crearTareaBorrador());
    renderizarTareasBorrador();
    programarGuardadoBorradorGuia();
}

function reiniciarTareasBorrador() {
    guiaTareasBorrador = [crearTareaBorrador()];
    renderizarTareasBorrador();
}

function obtenerPasosBorrador() {
    return guiaTareasBorrador
        .map((tarea, indice) => ({
            titulo: `Tarea ${indice + 1}`,
            descripcion: tarea.descripcion.trim(),
            foto: tarea.foto
        }))
        .filter(tarea => tarea.descripcion);
}

function cargarGuiaEnEditor(id) {
    if (!usuarioEsAdmin()) {
        return;
    }

    const guia = guiasOperativas.find(item => item.id === id);
    const estado = obtenerElemento('guideEditorStatus');

    if (!guia) {
        return;
    }

    const panel = obtenerElemento('adminGuidePanel');
    const botonGuias = obtenerElemento('toggleGuideAdmin');
    const botonUsuarios = obtenerElemento('toggleUsersAdmin');
    const panelUsuarios = obtenerElemento('adminUsersPanel');
    if (panel && panel.hidden) {
        panel.hidden = false;
        panel.classList.add('panel-open');
        document.body.classList.add('admin-panel-open');
        botonGuias?.setAttribute('aria-expanded', 'true');
        if (botonGuias) {
            botonGuias.textContent = 'Ocultar crear guias';
        }
        if (panelUsuarios) {
            panelUsuarios.hidden = true;
            panelUsuarios.classList.remove('panel-open');
        }
        botonUsuarios?.setAttribute('aria-expanded', 'false');
        if (botonUsuarios) {
            botonUsuarios.textContent = 'Crear usuarios';
        }
    }

    obtenerElemento('guideEditingId').value = guia.id;
    obtenerElemento('guideModule').value = guia.modulo;
    actualizarCampoSedeGuia();
    if (MODULOS_POR_SEDE.has(guia.modulo)) {
        establecerSedesSeleccionadasGuia(obtenerSedesGuia(guia).filter(sede => sede !== 'general'));
    }
    obtenerElemento('guideAudience').value = guia.audiencia;
    obtenerElemento('guideTitle').value = guia.titulo;
    obtenerElemento('guideDescription').value = guia.descripcion || '';
    guiaTareasBorrador = guia.pasos.map(paso => crearTareaBorrador(paso.descripcion, paso.foto));
    if (!guiaTareasBorrador.length) {
        guiaTareasBorrador.push(crearTareaBorrador());
    }
    renderizarTareasBorrador();
    obtenerElemento('cancelGuideEdit').hidden = false;
    guardarBorradorGuia();

    if (estado) {
        estado.textContent = 'Editando guia existente.';
        estado.dataset.status = 'info';
    }

    obtenerElemento('adminGuidePanel')?.focus?.();
}

function cancelarEdicionGuia() {
    borrarBorradorGuia();
    obtenerElemento('adminGuideForm')?.reset();
    obtenerElemento('guideEditingId').value = '';
    obtenerElemento('cancelGuideEdit').hidden = true;
    actualizarCampoSedeGuia();
    reiniciarTareasBorrador();
    const estado = obtenerElemento('guideEditorStatus');
    if (estado) {
        estado.textContent = '';
        estado.dataset.status = 'info';
    }
}

async function actualizarFotoTareaBorrador(input) {
    const tarea = guiaTareasBorrador.find(item => item.id === input.dataset.taskPhoto);

    if (!tarea || !input.files || input.files.length === 0) {
        return;
    }

    const estado = obtenerElemento('guideEditorStatus');

    try {
        if (estado) {
            estado.textContent = 'Procesando foto...';
            estado.dataset.status = 'info';
        }

        const file = input.files[0];
        if (!file.type.startsWith('image/')) {
            throw new Error('El archivo seleccionado no es una imagen.');
        }
        const dataUrl = await comprimirFoto(file, 860, 0.68);
        if (!dataUrl || !dataUrl.startsWith('data:image/')) {
            throw new Error('La foto no pudo convertirse a un formato compatible.');
        }
        tarea.foto = {
            dataUrl,
            nombre: file.name || 'foto-guia.jpg',
            agregadaEn: obtenerFechaHoraActual().iso
        };
        renderizarTareasBorrador();
        guardarBorradorGuia();

        if (estado) {
            estado.textContent = 'Foto agregada a la tarea.';
            estado.dataset.status = 'success';
        }
    } catch (error) {
        console.warn('No se pudo agregar foto a la guia:', error);
        if (estado) {
            estado.textContent = `No se pudo agregar la foto. ${error.message || 'Intenta nuevamente.'}`;
            estado.dataset.status = 'error';
        }
    } finally {
        input.value = '';
    }
}

function obtenerRutasFotosPasos(pasos) {
    return pasos
        .map(paso => paso.foto?.path)
        .filter(Boolean);
}

async function eliminarFotosGuias(rutas) {
    const rutasUnicas = [...new Set(rutas.filter(Boolean))];
    if (!supabaseClient || !rutasUnicas.length) {
        return;
    }

    const { error } = await supabaseClient.storage
        .from(GUIDE_IMAGE_BUCKET)
        .remove(rutasUnicas);
    if (error) {
        console.warn('No se pudieron eliminar fotos de guia:', error);
    }
}

async function eliminarFotosGuiasSinUso(rutas, ignorarIds = []) {
    const rutasUnicas = [...new Set(rutas.filter(Boolean))];
    if (!rutasUnicas.length) {
        return;
    }

    const idsIgnorados = new Set(ignorarIds.filter(Boolean).map(String));
    const rutasUsadas = new Set();
    guiasOperativas.forEach(guia => {
        if (idsIgnorados.has(String(guia.id))) {
            return;
        }
        obtenerRutasFotosPasos(guia.pasos).forEach(path => rutasUsadas.add(path));
    });

    await eliminarFotosGuias(rutasUnicas.filter(path => !rutasUsadas.has(path)));
}

async function subirFotosPasosGuia(pasos, guiaId) {
    const rutasNuevas = [];
    const carpetaGuia = guiaId && !String(guiaId).startsWith('local-')
        ? guiaId
        : crypto.randomUUID();

    try {
        const pasosPreparados = [];
        for (const paso of pasos) {
            const foto = paso.foto;
            if (!foto?.dataUrl || foto.path) {
                pasosPreparados.push({
                    ...paso,
                    foto: foto
                        ? {
                            path: foto.path || '',
                            nombre: foto.nombre || '',
                            agregadaEn: foto.agregadaEn || ''
                        }
                        : null
                });
                continue;
            }

            const blob = await fetch(foto.dataUrl).then(response => response.blob());
            const extension = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
            const path = `${sesionActual.user.id}/${carpetaGuia}/${crypto.randomUUID()}.${extension}`;
            const { error } = await supabaseClient.storage
                .from(GUIDE_IMAGE_BUCKET)
                .upload(path, blob, {
                    contentType: blob.type || 'image/jpeg',
                    upsert: false
                });
            if (error) {
                throw error;
            }

            rutasNuevas.push(path);
            pasosPreparados.push({
                ...paso,
                foto: {
                    path,
                    nombre: foto.nombre || `foto-guia.${extension}`,
                    agregadaEn: foto.agregadaEn || obtenerFechaHoraActual().iso
                }
            });
        }

        return { pasos: pasosPreparados, rutasNuevas };
    } catch (error) {
        await eliminarFotosGuias(rutasNuevas);
        throw error;
    }
}

async function migrarFotosGuiasLegacy() {
    if (!usuarioEsAdmin() || !supabaseClient || !sesionActual?.user) {
        return;
    }

    if (localStorage.getItem(STORAGE_KEYS.guideImagesMigrated) === '1') {
        return;
    }

    try {
        const { data, error } = await supabaseClient.functions.invoke('migrate-guide-images', {
            body: {}
        });
        if (error) {
            console.warn('No se pudo migrar fotos antiguas:', error);
            return;
        }

        if (data?.migratedPhotos > 0) {
            mostrarToast(`${data.migratedPhotos} fotos de guias fueron optimizadas.`);
        }
        localStorage.setItem(STORAGE_KEYS.guideImagesMigrated, '1');
    } catch (error) {
        console.warn('Migracion de fotos no disponible:', error);
    }
}

async function guardarGuiaOperativa(event) {
    event.preventDefault();

    if (!usuarioEsAdmin()) {
        return;
    }

    const estado = obtenerElemento('guideEditorStatus');
    const modulo = obtenerElemento('guideModule')?.value;
    const sedesSeleccionadas = MODULOS_POR_SEDE.has(modulo)
        ? obtenerSedesSeleccionadasGuia()
        : ['general'];
    const audiencia = obtenerElemento('guideAudience')?.value;
    const titulo = obtenerElemento('guideTitle')?.value.trim();
    const descripcion = obtenerElemento('guideDescription')?.value.trim();
    const pasos = obtenerPasosBorrador();
    const editandoId = obtenerElemento('guideEditingId')?.value;

    if (!modulo || !sedesSeleccionadas.length || !['todos', 'supervision'].includes(audiencia) || !titulo || !pasos.length) {
        if (estado) {
            estado.textContent = 'Completa al menos una sede, nivel de acceso, titulo y al menos un paso.';
            estado.dataset.status = 'error';
        }
        return;
    }

    const guiaLocal = {
        modulo,
        sede: sedesSeleccionadas[0],
        sedes: sedesSeleccionadas,
        audiencia,
        titulo,
        descripcion,
        pasos,
        creado_por: sesionActual.user.id,
        creado_por_email: sesionActual.user.email || ''
    };

    if (estado) {
        estado.textContent = 'Guardando guia...';
        estado.dataset.status = 'info';
    }

    let errorRemoto = null;

    if (supabaseClient && sesionActual?.user) {
        let rutasNuevas = [];
        let pasosRemotos = pasos;
        try {
            const tieneFotosNuevas = pasos.some(paso => paso.foto?.dataUrl && !paso.foto?.path);
            if (tieneFotosNuevas) {
                if (estado) {
                    estado.textContent = 'Subiendo fotos de la guia...';
                    estado.dataset.status = 'info';
                }
            }
            const subida = await subirFotosPasosGuia(pasos, editandoId);
            pasosRemotos = subida.pasos;
            rutasNuevas = subida.rutasNuevas;
        } catch (error) {
            console.warn('No se pudieron subir fotos de la guia:', error);
            if (estado) {
                estado.textContent = `No se pudieron subir las fotos. ${error.message || ''}`.trim();
                estado.dataset.status = 'error';
            }
            return;
        }

        const { sedes: _sedesLocales, ...guiaBaseRemota } = guiaLocal;
        const editandoRemota = editandoId && !String(editandoId).startsWith('local-');
        let data = null;
        let error = null;

        if (editandoRemota) {
            const respuesta = await supabaseClient
                .from('guias_operativas')
                .update({
                    modulo,
                    sede: sedesSeleccionadas[0],
                    audiencia,
                    titulo,
                    descripcion,
                    pasos: pasosRemotos
                })
                .eq('id', editandoId)
                .select('id,modulo,sede,audiencia,titulo,descripcion,pasos,creado_por_email,created_at,updated_at')
                .single();
            data = respuesta.data;
            error = respuesta.error;

            if (!error && sedesSeleccionadas.length > 1) {
                const copias = sedesSeleccionadas.slice(1).map(sedeDestino => ({
                    ...guiaBaseRemota,
                    sede: sedeDestino,
                    pasos: pasosRemotos
                }));
                const insercion = await supabaseClient
                    .from('guias_operativas')
                    .insert(copias)
                    .select('id,modulo,sede,audiencia,titulo,descripcion,pasos,creado_por_email,created_at,updated_at');
                if (insercion.error) {
                    error = insercion.error;
                } else {
                    data = [data, ...(insercion.data || [])];
                }
            }
        } else {
            const guiasRemotas = sedesSeleccionadas.map(sedeDestino => ({
                ...guiaBaseRemota,
                sede: sedeDestino,
                pasos: pasosRemotos
            }));
            const respuesta = await supabaseClient
                .from('guias_operativas')
                .insert(guiasRemotas)
                .select('id,modulo,sede,audiencia,titulo,descripcion,pasos,creado_por_email,created_at,updated_at');
            data = respuesta.data;
            error = respuesta.error;
        }

        if (!error && data) {
            const guiasGuardadas = (Array.isArray(data) ? data : [data]).map(normalizarGuiaOperativa);
            await hidratarFotosGuias(guiasGuardadas);
            const guiaAnterior = guiasOperativas.find(item => item.id === editandoId);
            const rutasAnteriores = guiaAnterior ? obtenerRutasFotosPasos(guiaAnterior.pasos) : [];
            const rutasActuales = guiasGuardadas.flatMap(guiaGuardada => obtenerRutasFotosPasos(guiaGuardada.pasos));
            await eliminarFotosGuiasSinUso(rutasAnteriores.filter(path => !rutasActuales.includes(path)), [editandoId]);
            guiasOperativas = editandoId
                ? [
                    ...guiasGuardadas,
                    ...guiasOperativas.filter(item => item.id !== editandoId && !guiasGuardadas.some(guardada => guardada.id === item.id))
                ]
                : [
                    ...guiasGuardadas,
                    ...guiasOperativas.filter(item => !guiasGuardadas.some(guardada => guardada.id === item.id))
                ];
            guardarGuiasLocales();
            if (MODULOS_POR_SEDE.has(modulo) && sedesSeleccionadas[0] !== 'general') {
                sedeActivaPorModulo[modulo] = sedesSeleccionadas[0];
            }
            renderizarGuiasOperativas();
            cancelarEdicionGuia();
            if (estado) {
                estado.textContent = sedesSeleccionadas.length > 1
                    ? `Guia guardada en ${sedesSeleccionadas.length} sedes.`
                    : editandoId ? 'Guia actualizada para todos.' : 'Guia guardada y compartida.';
                estado.dataset.status = 'success';
            }
            seleccionarModulo(modulo, { desplazar: false });
            actualizarResultadosBusquedaGlobal();
            actualizarProgresoCapacitacionUI();
            actualizarResumenUI();
            return;
        }

        await eliminarFotosGuias(rutasNuevas);
        errorRemoto = error || new Error('Supabase no devolvio la guia guardada.');
        console.warn('No se pudo guardar guia remota:', error);
    }

    const local = normalizarGuiaOperativa({
        ...guiaLocal,
        id: editandoId || `local-${Date.now()}`,
        createdAt: new Date().toISOString()
    });
    if (editandoId) {
        guiasOperativas = guiasOperativas.map(item => item.id === editandoId ? local : item);
    } else {
        const locales = sedesSeleccionadas.map((sedeDestino, indice) => normalizarGuiaOperativa({
            ...guiaLocal,
            sede: sedeDestino,
            id: `local-${Date.now()}-${indice}`,
            createdAt: new Date().toISOString()
        }));
        guiasOperativas.unshift(...locales);
    }
    guardarGuiasLocales();
    if (MODULOS_POR_SEDE.has(modulo) && sedesSeleccionadas[0] !== 'general') {
        sedeActivaPorModulo[modulo] = sedesSeleccionadas[0];
    }
    renderizarGuiasOperativas();
    cancelarEdicionGuia();
    seleccionarModulo(modulo, { desplazar: false });
    actualizarResultadosBusquedaGlobal();
    actualizarProgresoCapacitacionUI();
    actualizarResumenUI();

    if (estado) {
        const detalle = errorRemoto?.message ? ` Motivo: ${errorRemoto.message}` : '';
        estado.textContent = `Guia visible solo en este dispositivo; no se pudo compartir.${detalle}`;
        estado.dataset.status = 'warning';
    }
}

async function eliminarGuiaOperativa(id) {
    if (!usuarioEsAdmin() || !id) {
        return;
    }

    const guia = guiasOperativas.find(item => item.id === id);

    if (supabaseClient && !String(id).startsWith('local-')) {
        const { error } = await supabaseClient
            .from('guias_operativas')
            .delete()
            .eq('id', id);

        if (!error) {
            await eliminarFotosGuiasSinUso(guia ? obtenerRutasFotosPasos(guia.pasos) : [], [id]);
            await cargarGuiasRemotas();
            return;
        }

        console.warn('No se pudo eliminar guia remota:', error);
    }

    guiasOperativas = guiasOperativas.filter(guia => guia.id !== id);
    guardarGuiasLocales();
    renderizarGuiasOperativas();
    actualizarResultadosBusquedaGlobal();
    actualizarProgresoCapacitacionUI();
    actualizarResumenUI();
}

async function marcarGuiaRevisada(id) {
    const guia = guiasOperativas.find(item => item.id === id);

    if (!guia) {
        return;
    }

    const revisada = !progresoGuias[id]?.revisada;
    progresoGuias[id] = {
        revisada,
        revisadaEn: revisada ? obtenerFechaHoraActual().iso : null,
        titulo: guia.titulo,
        modulo: guia.modulo
    };
    guardarProgresoGuias();
    renderizarGuiasOperativas();
    actualizarProgresoCapacitacionUI();

    if (supabaseClient && sesionActual?.user && !String(id).startsWith('local-')) {
        const { error } = await supabaseClient
            .from('guia_progreso')
            .upsert({
                guia_id: id,
                user_id: sesionActual.user.id,
                user_email: sesionActual.user.email || '',
                revisada,
                revisada_en: revisada ? progresoGuias[id].revisadaEn : null
            }, { onConflict: 'guia_id,user_id' });

        if (error) {
            console.warn('No se pudo sincronizar progreso de guia:', error);
        }
    }
}

function actualizarProgresoCapacitacionUI() {
    const texto = obtenerElemento('trainingProgressText');
    if (!texto) {
        return;
    }

    const guiasVisibles = guiasOperativas.filter(usuarioPuedeVerGuia);
    const total = guiasVisibles.length;
    const revisadas = guiasVisibles.filter(guia => progresoGuias[guia.id]?.revisada).length;
    texto.textContent = total
        ? `${revisadas} de ${total} guias revisadas en este dispositivo.`
        : 'Aun no hay guias operativas agregadas.';
    actualizarContadoresModulos();
}

async function cargarUsuariosAdmin() {
    if ((!usuarioEsAdmin() && !usuarioPuedeRestablecerPassword()) || !supabaseClient) {
        return;
    }

    const lista = obtenerElemento('usersAdminList');
    if (lista) {
        lista.textContent = 'Cargando usuarios...';
    }

    let data;
    let error;
    if (usuarioEsAdmin()) {
        const respuesta = await supabaseClient
            .from('profiles')
            .select('id,email,nombre,apellidos_nombres,dni,rol,activo,sede,debe_cambiar_password,created_at')
            .order('created_at', { ascending: true });
        data = respuesta.data;
        error = respuesta.error;
    } else {
        const respuesta = await supabaseClient.functions.invoke('reset-user-password', {
            body: { action: 'list' }
        });
        data = respuesta.data?.users;
        error = respuesta.error || (respuesta.data?.error ? new Error(respuesta.data.error) : null);
    }

    if (error) {
        if (lista) {
            lista.textContent = 'No se pudieron cargar usuarios.';
        }
        console.warn('No se pudieron cargar usuarios:', error);
        return;
    }

    usuariosAdmin = data || [];
    progresoUsuariosAdmin = {};
    if (!usuarioEsAdmin()) {
        renderizarUsuariosAdmin();
        return;
    }

    const { data: progreso } = await supabaseClient
        .from('guia_progreso')
        .select('user_id,revisada');
    (progreso || []).forEach(item => {
        if (!progresoUsuariosAdmin[item.user_id]) {
            progresoUsuariosAdmin[item.user_id] = { total: 0, revisadas: 0 };
        }
        progresoUsuariosAdmin[item.user_id].total += 1;
        if (item.revisada) {
            progresoUsuariosAdmin[item.user_id].revisadas += 1;
        }
    });
    renderizarUsuariosAdmin();
}

function renderizarUsuariosAdmin() {
    const lista = obtenerElemento('usersAdminList');
    if (!lista) {
        return;
    }

    limpiarElemento(lista);

    if (!usuariosAdmin.length) {
        lista.textContent = 'No hay usuarios para mostrar.';
        return;
    }

    const soloRestablecer = !usuarioEsAdmin();

    usuariosAdmin.forEach(usuario => {
        const fila = document.createElement('article');
        const datos = document.createElement('div');
        const nombre = document.createElement('input');
        const dni = document.createElement('input');
        const email = document.createElement('span');
        const rol = document.createElement('select');
        const sede = document.createElement('select');
        const activo = document.createElement('select');
        const guardar = document.createElement('button');
        const restablecer = document.createElement('button');
        const eliminar = document.createElement('button');
        const acciones = document.createElement('div');
        const esCuentaActual = usuario.id === sesionActual?.user?.id;

        fila.className = 'user-admin-row';
        fila.dataset.userId = usuario.id;
        nombre.type = 'text';
        nombre.value = usuario.apellidos_nombres || usuario.nombre || '';
        nombre.placeholder = 'Apellidos y nombres';
        nombre.dataset.userName = usuario.id;
        nombre.setAttribute('aria-label', `Apellidos y nombres de ${usuario.nombre || usuario.email}`);
        nombre.disabled = soloRestablecer;
        dni.type = 'text';
        dni.inputMode = 'numeric';
        dni.maxLength = 8;
        dni.value = usuario.dni || '';
        dni.placeholder = 'DNI pendiente';
        dni.dataset.userDni = usuario.id;
        dni.setAttribute('aria-label', `DNI de ${usuario.nombre || usuario.email}`);
        dni.disabled = soloRestablecer;
        const progreso = progresoUsuariosAdmin[usuario.id];
        const esCorreoInterno = String(usuario.email || '').endsWith('@usuarios.urbapark.pe');
        const acceso = usuario.dni
            ? `DNI: ${usuario.dni}`
            : esCorreoInterno
                ? `Acceso anterior: ${usuario.nombre || String(usuario.email).split('@')[0]}`
                : usuario.email;
        email.textContent = progreso
            ? `${acceso} - ${progreso.revisadas}/${guiasOperativas.length || progreso.total} guias revisadas`
            : `${acceso} - sin avance registrado`;
        datos.className = 'user-admin-identity';
        datos.append(nombre, dni, email);

        ROLES_USUARIO.forEach(opcion => {
            const option = document.createElement('option');
            option.value = opcion;
            option.textContent = obtenerEtiquetaRol(opcion);
            option.selected = usuario.rol === opcion;
            option.disabled = opcion === ROL_SUPERIOR && usuario.rol !== ROL_SUPERIOR;
            rol.appendChild(option);
        });
        rol.dataset.userRole = usuario.id;
        rol.disabled = soloRestablecer;

        const sedesUsuario = usuarioEsRolGlobal(usuario.rol)
            ? [{ id: 'general', nombre: 'General' }, ...SEDES_OPERACION]
            : SEDES_OPERACION;
        sedesUsuario.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.nombre;
            option.selected = usuario.sede === item.id;
            sede.appendChild(option);
        });
        sede.dataset.userSite = usuario.id;
        sede.setAttribute('aria-label', `Sede de ${usuario.nombre || usuario.email}`);
        sede.disabled = soloRestablecer;

        [
            ['true', 'Activo'],
            ['false', 'Inactivo']
        ].forEach(([valor, etiqueta]) => {
            const option = document.createElement('option');
            option.value = valor;
            option.textContent = etiqueta;
            option.selected = String(Boolean(usuario.activo)) === valor;
            activo.appendChild(option);
        });
        activo.dataset.userActive = usuario.id;
        activo.disabled = soloRestablecer;

        guardar.className = 'clear-btn';
        guardar.type = 'button';
        guardar.dataset.saveUser = usuario.id;
        guardar.textContent = 'Guardar';
        guardar.hidden = soloRestablecer;
        guardar.disabled = usuario.rol === ROL_SUPERIOR && !usuarioEsSuperior();
        guardar.title = guardar.disabled ? 'La cuenta superior está protegida' : 'Guardar cambios del usuario';

        const puedeRestablecer = usuarioPuedeRestablecerCuenta(usuario);
        restablecer.className = 'clear-btn';
        restablecer.type = 'button';
        restablecer.dataset.resetUserPassword = usuario.id;
        restablecer.textContent = 'Restablecer';
        restablecer.disabled = !puedeRestablecer;
        restablecer.title = puedeRestablecer
            ? `Generar una contraseña temporal para ${usuario.nombre || usuario.dni}`
            : esCuentaActual
                ? 'No puedes restablecer tu propia contraseña desde este panel'
                : 'Esta cuenta está protegida para tu rol';

        eliminar.className = 'clear-btn danger-action';
        eliminar.type = 'button';
        eliminar.dataset.deleteUser = usuario.id;
        eliminar.textContent = esCuentaActual ? 'Tu cuenta' : 'Eliminar';
        eliminar.disabled = esCuentaActual || usuario.rol === ROL_SUPERIOR;
        eliminar.hidden = !usuarioEsSuperior();
        eliminar.title = esCuentaActual
            ? 'No puedes eliminar la cuenta con la que iniciaste sesion'
            : usuario.rol === ROL_SUPERIOR
                ? 'La cuenta superior esta protegida'
                : `Eliminar definitivamente a ${usuario.nombre || usuario.email}`;

        acciones.className = 'user-admin-actions';
        acciones.append(guardar, restablecer, eliminar);
        fila.append(datos, rol, sede, activo, acciones);
        lista.appendChild(fila);
    });
}

async function guardarUsuarioAdmin(id) {
    if (!usuarioEsAdmin() || !supabaseClient || !id) {
        return;
    }

    const usuarioActualizado = usuariosAdmin.find(item => item.id === id);
    if (usuarioActualizado?.rol === ROL_SUPERIOR && !usuarioEsSuperior()) {
        mostrarToast('La cuenta superior está protegida.');
        return;
    }

    const rol = document.querySelector(`[data-user-role="${id}"]`)?.value;
    const sede = document.querySelector(`[data-user-site="${id}"]`)?.value;
    const activo = document.querySelector(`[data-user-active="${id}"]`)?.value === 'true';
    const nombre = document.querySelector(`[data-user-name="${id}"]`)?.value.trim();
    const dni = document.querySelector(`[data-user-dni="${id}"]`)?.value.replace(/\D/g, '') || null;

    if (!nombre || (dni && !/^\d{8}$/.test(dni))) {
        mostrarToast('Revisa apellidos y nombres y el DNI de 8 digitos.');
        return;
    }

    if (sede === 'general' && !usuarioEsRolGlobal(rol)) {
        mostrarToast('La sede General solo corresponde a roles globales.');
        return;
    }

    const { error } = await supabaseClient
        .from('profiles')
        .update({ rol, sede, activo, nombre, apellidos_nombres: nombre, dni })
        .eq('id', id);

    if (error) {
        mostrarToast('No se pudo actualizar el usuario.');
        console.warn('No se pudo actualizar usuario:', error);
        return;
    }

    mostrarToast('Usuario actualizado.');
    if (id === sesionActual?.user?.id) {
        await cargarPerfilActual();
        await cargarHistorialRemoto();
        await cargarEstadoOperativoRemoto();
        suscribirEstadoOperativo();
    }
    await cargarUsuariosAdmin();
}

async function obtenerMensajeErrorFuncion(error, mensajePredeterminado) {
    const respuesta = error?.context;
    if (respuesta && typeof respuesta.clone === 'function') {
        try {
            const datos = await respuesta.clone().json();
            if (datos?.error) {
                return datos.error;
            }
        } catch (errorLectura) {
            console.warn('No se pudo leer el detalle de la funcion:', errorLectura);
        }
    }

    return error?.message || mensajePredeterminado;
}

function ocultarResultadoRestablecimiento() {
    const resultado = obtenerElemento('passwordResetResult');
    if (resultado) resultado.hidden = true;
    const usuario = obtenerElemento('passwordResetResultUser');
    const password = obtenerElemento('passwordResetResultValue');
    if (usuario) usuario.textContent = '';
    if (password) password.textContent = '';
}

function mostrarResultadoRestablecimiento(datos) {
    const resultado = obtenerElemento('passwordResetResult');
    const usuario = obtenerElemento('passwordResetResultUser');
    const password = obtenerElemento('passwordResetResultValue');
    const copiar = obtenerElemento('copyResetPassword');
    if (!resultado || !usuario || !password) return;

    usuario.textContent = `${datos.nombre || 'Colaborador'} - DNI ${datos.dni}`;
    password.textContent = datos.temporaryPassword;
    resultado.hidden = false;
    resultado.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    copiar?.focus({ preventScroll: true });
}

async function copiarPasswordRestablecida() {
    const password = obtenerElemento('passwordResetResultValue')?.textContent?.trim();
    if (!password) return;

    try {
        await navigator.clipboard.writeText(password);
    } catch (error) {
        const auxiliar = document.createElement('textarea');
        auxiliar.value = password;
        auxiliar.setAttribute('readonly', '');
        auxiliar.style.position = 'fixed';
        auxiliar.style.opacity = '0';
        document.body.appendChild(auxiliar);
        auxiliar.select();
        document.execCommand('copy');
        auxiliar.remove();
    }
    mostrarToast('Contraseña temporal copiada.');
}

async function restablecerPasswordUsuario(id) {
    if (!supabaseClient || !id) return;
    const usuario = usuariosAdmin.find(item => item.id === id);
    if (!usuarioPuedeRestablecerCuenta(usuario)) {
        mostrarToast('No tienes permiso para restablecer esta cuenta.');
        return;
    }

    const confirmar = window.confirm(`Se generará una nueva contraseña temporal para ${usuario.nombre || usuario.dni}. La contraseña anterior dejará de funcionar. ¿Continuar?`);
    if (!confirmar) return;

    const estado = obtenerElemento('usersAdminStatus');
    ocultarResultadoRestablecimiento();
    if (estado) {
        estado.hidden = false;
        estado.dataset.status = 'info';
        estado.textContent = 'Generando contraseña temporal...';
    }
    document.querySelectorAll('.user-admin-actions button').forEach(boton => { boton.disabled = true; });

    const { data, error } = await supabaseClient.functions.invoke('reset-user-password', {
        body: { userId: id }
    });

    if (error || !data?.temporaryPassword) {
        const mensaje = await obtenerMensajeErrorFuncion(error, data?.error || 'No se pudo restablecer la contraseña.');
        if (estado) {
            estado.dataset.status = 'error';
            estado.textContent = mensaje;
        }
        mostrarToast(mensaje);
        renderizarUsuariosAdmin();
        return;
    }

    mostrarResultadoRestablecimiento(data);
    if (estado) {
        estado.dataset.status = 'success';
        estado.textContent = 'Contraseña restablecida. Compártela ahora: solo se mostrará en este momento.';
    }
    mostrarToast('Contraseña temporal generada.');
    renderizarUsuariosAdmin();
}

async function eliminarUsuarioAdmin(id) {
    if (!usuarioEsSuperior() || !supabaseClient || !id) {
        return;
    }

    if (id === sesionActual?.user?.id) {
        mostrarToast('No puedes eliminar tu propia cuenta.');
        return;
    }

    const usuario = usuariosAdmin.find(item => item.id === id);
    if (!usuario) {
        mostrarToast('El usuario ya no aparece en la lista.');
        return;
    }

    const identificador = usuario.nombre || usuario.email;
    const confirmado = window.confirm(
        `Eliminar definitivamente a ${identificador}?\n\nLa cuenta perdera el acceso y esta accion no se puede deshacer. Los informes historicos se conservaran.`
    );
    if (!confirmado) {
        return;
    }

    const fila = document.querySelector(`[data-user-id="${id}"]`);
    const botones = fila?.querySelectorAll('button');
    const estado = obtenerElemento('usersAdminStatus');
    botones?.forEach(boton => {
        boton.disabled = true;
    });

    if (estado) {
        estado.textContent = `Eliminando a ${identificador}...`;
        estado.dataset.status = 'info';
    }

    try {
        const { data, error } = await supabaseClient.functions.invoke('delete-user', {
            body: { userId: id }
        });

        if (error || data?.error) {
            const mensaje = data?.error || await obtenerMensajeErrorFuncion(error, 'No se pudo eliminar el usuario.');
            throw new Error(mensaje);
        }

        usuariosAdmin = usuariosAdmin.filter(item => item.id !== id);
        delete progresoUsuariosAdmin[id];
        renderizarUsuariosAdmin();
        if (estado) {
            estado.textContent = `${identificador} fue eliminado correctamente.`;
            estado.dataset.status = 'success';
        }
        mostrarToast(`Usuario eliminado: ${identificador}`);
    } catch (error) {
        console.warn('No se pudo eliminar usuario:', error);
        if (estado) {
            estado.textContent = error.message || 'No se pudo eliminar el usuario.';
            estado.dataset.status = 'error';
        }
        botones?.forEach(boton => {
            boton.disabled = false;
        });
    }
}

async function crearUsuarioDesdeAdmin(event) {
    event.preventDefault();

    if (!usuarioEsAdmin() || !supabaseClient) {
        return;
    }

    const estado = obtenerElemento('createUserStatus');
    const nombre = obtenerElemento('newUserName')?.value.trim();
    const dni = obtenerElemento('newUserDni')?.value.replace(/\D/g, '');
    const sede = obtenerElemento('newUserSite')?.value;
    const rol = obtenerElemento('newUserRole')?.value;

    if (!usuarioEsAdminGlobal() && (sede !== obtenerSedeActual() || !ROLES_CREABLES_POR_ADMIN.includes(rol))) {
        if (estado) {
            estado.textContent = 'Solo puedes crear cuentas operativas para tu sede.';
            estado.dataset.status = 'error';
        }
        return;
    }

    if (sede === 'general' && !usuarioEsRolGlobal(rol)) {
        if (estado) {
            estado.textContent = 'La sede General solo puede usarse para roles globales.';
            estado.dataset.status = 'error';
        }
        return;
    }

    if (!nombre || !/^\d{8}$/.test(dni || '') || !sede || !rol) {
        if (estado) {
            estado.textContent = 'Completa apellidos y nombres, un DNI valido de 8 digitos y la sede.';
            estado.dataset.status = 'error';
        }
        return;
    }

    if (estado) {
        estado.textContent = 'Creando usuario...';
        estado.dataset.status = 'info';
    }

    try {
        const { data, error } = await supabaseClient.functions.invoke('create-user', {
            body: { apellidosNombres: nombre, dni, sede, rol }
        });

        if (error || data?.error) {
            const mensaje = data?.error || await obtenerMensajeErrorFuncion(error, 'No se pudo crear el usuario.');
            throw new Error(mensaje);
        }

        obtenerElemento('createUserForm')?.reset();
        configurarFormularioCreacionUsuario();
        if (estado) {
            estado.textContent = `${nombre} fue creado. DNI: ${dni}. Contrasena temporal: ${data.temporaryPassword}`;
            estado.dataset.status = 'success';
        }
        mostrarToast(`Usuario creado: ${nombre}`);
        if (usuarioEsAdmin()) {
            await cargarUsuariosAdmin();
        }
    } catch (error) {
        console.warn('No se pudo crear usuario:', error);
        if (estado) {
            estado.textContent = error.message || 'No se pudo crear el usuario.';
            estado.dataset.status = 'error';
        }
    }
}

function mostrarToast(mensaje) {
    const contenedor = obtenerElemento('toastContainer');
    if (!contenedor) {
        return;
    }

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = mensaje;
    contenedor.appendChild(toast);
    window.setTimeout(() => toast.remove(), 5200);
}

function obtenerItemsBusqueda() {
    const codigos = Object.entries(codigosEmergencia).map(([codigo, info]) => ({
        tipo: 'Codigo',
        titulo: info.nombre,
        detalle: `${info.descripcion}. ${info.guia}`,
        accion: () => {
            seleccionarModulo('codigos');
            const card = document.querySelector(`[data-code="${codigo}"]`);
            card?.focus();
        }
    }));

    const guias = guiasOperativas.filter(usuarioPuedeVerGuia).map(guia => ({
        tipo: `Guia - ${guia.modulo} - ${obtenerTextoSedesGuia(guia)}`,
        titulo: guia.titulo,
        detalle: `${guia.descripcion || ''} ${obtenerTextoSedesGuia(guia)} ${guia.pasos.map(paso => paso.descripcion).join(' ')}`,
        accion: () => {
            const primeraSede = obtenerSedesGuia(guia).find(sede => sede !== 'general');
            if (MODULOS_POR_SEDE.has(guia.modulo) && primeraSede) {
                sedeActivaPorModulo[guia.modulo] = primeraSede;
                renderizarGuiasOperativas();
            }
            seleccionarModulo(guia.modulo);
        }
    }));

    const modulos = [
        ['Mantenimiento', 'Guias de soporte, plumillas e impresoras', 'mantenimiento'],
        ['Operaciones', 'Procesos operativos y apoyo al personal nuevo', 'operaciones'],
        ['Caja', 'Procesos y guias de atencion para caja', 'caja'],
        ['Ronda', 'Rondas, verificaciones y tareas en campo', 'ronda'],
        ['Capacitacion', 'Primer dia, radio y roles de respuesta', 'capacitacion']
    ].map(([titulo, detalle, modulo]) => ({
        tipo: 'Modulo',
        titulo,
        detalle,
        accion: () => seleccionarModulo(modulo)
    }));

    return [...modulos, ...codigos, ...guias];
}

function actualizarResultadosBusquedaGlobal() {
    const contenedor = obtenerElemento('globalSearchResults');
    if (!contenedor) {
        return;
    }

    limpiarElemento(contenedor);
    const termino = busquedaGlobal.trim().toLowerCase();

    if (!termino) {
        contenedor.hidden = true;
        return;
    }

    const resultados = obtenerItemsBusqueda()
        .filter(item => `${item.tipo} ${item.titulo} ${item.detalle}`.toLowerCase().includes(termino))
        .slice(0, 8);

    contenedor.hidden = false;

    if (!resultados.length) {
        const vacio = document.createElement('p');
        vacio.className = 'activity-log-item';
        vacio.textContent = 'Sin resultados.';
        contenedor.appendChild(vacio);
        return;
    }

    resultados.forEach((item, indice) => {
        const boton = document.createElement('button');
        const titulo = document.createElement('strong');
        const detalle = document.createElement('span');
        boton.className = 'search-result-card';
        boton.type = 'button';
        boton.dataset.searchIndex = String(indice);
        boton.__searchAction = item.accion;
        titulo.textContent = `${item.tipo}: ${item.titulo}`;
        detalle.textContent = item.detalle;
        boton.append(titulo, detalle);
        contenedor.appendChild(boton);
    });
}

async function guardarRegistroRemoto(entrada, estado) {
    const sede = obtenerSedeActual();
    if (!supabaseClient || !sesionActual?.user || !sede) {
        actualizarEstadoSincronizacion('Modo local', 'warning');
        return;
    }

    const { error } = await supabaseClient
        .from('registros_codigos')
        .insert({
            codigo: entrada.codigo,
            nombre: entrada.nombre,
            descripcion: entrada.descripcion,
            encargado: entrada.encargado,
            modo: entrada.modo,
            prioridad: entrada.prioridad,
            activado_en: entrada.activadoEn || null,
            cerrado_en: entrada.cerradoEn || null,
            pasos: crearChecklistPersistible({ [entrada.codigo]: estado })[entrada.codigo]?.pasos || [],
            controles: estado?.controles || {},
            sede,
            creado_por: sesionActual.user.id,
            creado_por_email: obtenerNombreUsuarioActivo()
        });

    if (error) {
        historialRemotoActivo = false;
        actualizarEstadoSincronizacion('Pendiente local', 'warning');
        console.warn('No se pudo guardar registro remoto:', error);
        return;
    }

    historialRemotoActivo = true;
    actualizarEstadoSincronizacion('Online', 'success');
    await cargarHistorialRemoto();
}

function crearSnapshotEstadoOperativo() {
    return {
        sede: obtenerSedeActual(),
        codigo_activo: codigoActivo,
        checklist_estado: crearChecklistPersistible(),
        actualizado_por: sesionActual?.user?.id || null,
        actualizado_por_email: obtenerNombreUsuarioActivo()
    };
}

async function sincronizarEstadoOperativoRemoto() {
    const sede = obtenerSedeActual();
    if (aplicandoEstadoRemoto || !supabaseClient || !sesionActual?.user || !sede) {
        return;
    }

    const snapshot = crearSnapshotEstadoOperativo();
    const { error } = await supabaseClient
        .from('estado_operativo')
        .upsert({
            id: sede,
            sede,
            codigo_activo: snapshot.codigo_activo,
            checklist_estado: snapshot.checklist_estado,
            actualizado_por: snapshot.actualizado_por,
            actualizado_por_email: snapshot.actualizado_por_email,
            updated_at: new Date().toISOString()
        });

    if (error) {
        actualizarEstadoSincronizacion('Pendiente local', 'warning');
        console.warn('No se pudo sincronizar estado operativo:', error);
        return;
    }

    actualizarEstadoSincronizacion('Online', 'success');
}

function programarSincronizacionEstadoOperativo(retraso = 350) {
    if (aplicandoEstadoRemoto || !supabaseClient || !sesionActual?.user || !obtenerSedeActual()) {
        return;
    }

    window.clearTimeout(temporizadorSincronizacion);
    temporizadorSincronizacion = window.setTimeout(() => {
        sincronizarEstadoOperativoRemoto();
    }, retraso);
}

function normalizarEstadoOperativoRemoto(estadoRemoto) {
    const normalizado = {};

    if (!estadoRemoto || typeof estadoRemoto !== 'object') {
        return normalizado;
    }

    Object.keys(estadoRemoto).forEach(codigo => {
        if (codigosEmergencia[codigo]) {
            normalizado[codigo] = normalizarChecklistGuardado(codigo, estadoRemoto[codigo]);
        }
    });

    return normalizado;
}

function conservarFotosLocalesEnEstadoRemoto(estadoRemoto, estadoLocal = checklistEstado) {
    Object.entries(estadoRemoto || {}).forEach(([codigo, estado]) => {
        const pasosLocales = estadoLocal?.[codigo]?.pasos || [];
        (estado?.pasos || []).forEach((paso, indice) => {
            const fotoLocal = pasosLocales[indice]?.foto;
            if (!fotoLocal) return;
            const fotoRemota = paso.foto;
            const mismaFoto = !fotoRemota
                || (fotoLocal.storageKey && fotoRemota.storageKey === fotoLocal.storageKey)
                || (fotoLocal.path && fotoRemota.path === fotoLocal.path);
            if (mismaFoto) {
                paso.foto = {
                    ...(fotoRemota || {}),
                    ...fotoLocal,
                    path: fotoRemota?.path || fotoLocal.path || ''
                };
            }
        });
    });
    return estadoRemoto;
}

function aplicarEstadoOperativoRemoto(registro) {
    if (!registro || registro.sede !== obtenerSedeActual()) {
        return;
    }

    const codigoPrevio = codigoActivo;
    const codigoRemoto = codigosEmergencia[registro.codigo_activo]
        ? registro.codigo_activo
        : null;

    aplicandoEstadoRemoto = true;
    checklistEstado = conservarFotosLocalesEnEstadoRemoto(
        normalizarEstadoOperativoRemoto(registro.checklist_estado),
        checklistEstado
    );
    guardarChecklistEstado();
    codigoActivo = codigoRemoto;

    if (codigoActivo) {
        actualizarInterfazCodigo(codigoActivo);
    } else {
        desactivarTodos();
    }

    actualizarResumenUI();
    actualizarEstadoSincronizacion('Online', 'success');
    aplicandoEstadoRemoto = false;
    hidratarFotosChecklistCodigos();

    if (codigoRemoto && codigoRemoto !== codigoPrevio) {
        mostrarAlertaRemota(codigoRemoto, registro.actualizado_por_email);
        notificarCodigoRemoto(codigoRemoto, registro.actualizado_por_email);
    }

    if (!codigoRemoto) {
        ultimoCodigoRemotoAlertado = null;
    }
}

async function cargarEstadoOperativoRemoto() {
    const sede = obtenerSedeActual();
    if (!supabaseClient || !sesionActual?.user || !sede) {
        return;
    }

    const { data, error } = await supabaseClient
        .from('estado_operativo')
        .select('id,sede,codigo_activo,checklist_estado,actualizado_por,actualizado_por_email,updated_at')
        .eq('id', sede)
        .maybeSingle();

    if (error) {
        actualizarEstadoSincronizacion('Modo local', 'warning');
        console.warn('No se pudo cargar estado operativo remoto:', error);
        return;
    }

    if (data) {
        aplicarEstadoOperativoRemoto(data);
        return;
    }

    await sincronizarEstadoOperativoRemoto();
}

function suscribirEstadoOperativo() {
    const sede = obtenerSedeActual();
    if (!supabaseClient || !sesionActual?.user || !sede) {
        return;
    }

    if (canalEstadoOperativo) {
        supabaseClient.removeChannel(canalEstadoOperativo);
        canalEstadoOperativo = null;
    }

    canalEstadoOperativo = supabaseClient
        .channel(`estado-operativo-${sede}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'estado_operativo',
                filter: `id=eq.${sede}`
            },
            payload => {
                const nuevoEstado = payload.new;

                if (!nuevoEstado || nuevoEstado.actualizado_por === sesionActual?.user?.id) {
                    return;
                }

                aplicarEstadoOperativoRemoto(nuevoEstado);
            }
        )
        .subscribe(status => {
            if (status === 'SUBSCRIBED') {
                actualizarEstadoSincronizacion('Online', 'success');
            }
        });
}

function suscribirGuiasOperativas() {
    if (!supabaseClient || !sesionActual?.user) {
        return;
    }

    if (canalGuiasOperativas) {
        supabaseClient.removeChannel(canalGuiasOperativas);
        canalGuiasOperativas = null;
    }

    canalGuiasOperativas = supabaseClient
        .channel('guias-operativas-cambios')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'guias_operativas'
            },
            async payload => {
                await cargarGuiasRemotas();
                if (payload.eventType === 'INSERT') {
                    mostrarToast(`Nueva guia disponible: ${payload.new?.titulo || 'guia operativa'}.`);
                } else if (payload.eventType === 'UPDATE') {
                    mostrarToast(`Guia actualizada: ${payload.new?.titulo || 'guia operativa'}.`);
                } else if (payload.eventType === 'DELETE') {
                    mostrarToast('Una guia operativa fue eliminada.');
                }
            }
        )
        .subscribe();
}

function abrirModalCambioPassword(primeraVez = false) {
    const modal = obtenerElemento('passwordModal');
    const texto = obtenerElemento('passwordModalText');
    if (!modal) return;
    if (texto) {
        texto.textContent = primeraVez
            ? 'Estas usando una contrasena temporal. Puedes crear ahora una clave personal de al menos 8 caracteres.'
            : 'Crea una clave personal de al menos 8 caracteres.';
    }
    obtenerElemento('passwordChangeForm')?.reset();
    const estado = obtenerElemento('passwordChangeStatus');
    if (estado) estado.textContent = '';
    modal.hidden = false;
    obtenerElemento('newPersonalPassword')?.focus();
}

function cerrarModalCambioPassword() {
    const modal = obtenerElemento('passwordModal');
    if (modal) modal.hidden = true;
}

async function cambiarPasswordPersonal(event) {
    event.preventDefault();
    if (!supabaseClient || !sesionActual?.user) return;
    const password = obtenerElemento('newPersonalPassword')?.value || '';
    const confirmacion = obtenerElemento('confirmPersonalPassword')?.value || '';
    const estado = obtenerElemento('passwordChangeStatus');
    if (password.length < 8 || password !== confirmacion) {
        if (estado) {
            estado.textContent = password !== confirmacion
                ? 'Las contrasenas no coinciden.'
                : 'La contrasena debe tener al menos 8 caracteres.';
            estado.dataset.status = 'error';
        }
        return;
    }
    if (estado) {
        estado.textContent = 'Actualizando contrasena...';
        estado.dataset.status = 'info';
    }
    const { error } = await supabaseClient.auth.updateUser({ password });
    if (error) {
        if (estado) {
            estado.textContent = 'No se pudo actualizar la contrasena.';
            estado.dataset.status = 'error';
        }
        return;
    }
    await supabaseClient.rpc('confirmar_cambio_password');
    if (perfilActual) perfilActual.debe_cambiar_password = false;
    mostrarToast('Contrasena personal actualizada.');
    cerrarModalCambioPassword();
}

async function obtenerUrlFirmadaGdh(bucket, ruta) {
    if (!ruta || !supabaseClient) return '';
    const { data, error } = await supabaseClient.storage.from(bucket).createSignedUrl(ruta, 300);
    if (error) {
        console.warn('No se pudo firmar archivo GDH:', error);
        return '';
    }
    return data?.signedUrl || '';
}

function cerrarComunicadoObligatorio() {
    const modal = obtenerElemento('mandatoryAnnouncement');
    if (modal) modal.hidden = true;
    comunicadoObligatorioActual = null;
}

async function mostrarComunicadoObligatorio(comunicado) {
    comunicadoObligatorioActual = comunicado;
    const modal = obtenerElemento('mandatoryAnnouncement');
    const titulo = obtenerElemento('mandatoryAnnouncementTitle');
    const texto = obtenerElemento('mandatoryAnnouncementText');
    const enlaces = obtenerElemento('mandatoryAnnouncementLinks');
    const estado = obtenerElemento('mandatoryAnnouncementStatus');
    if (!modal || !titulo || !texto || !enlaces) return;
    titulo.textContent = comunicado.titulo;
    texto.textContent = comunicado.contenido;
    limpiarElemento(enlaces);
    if (comunicado.link_url && /^https?:\/\//i.test(comunicado.link_url)) {
        const link = document.createElement('a');
        link.className = 'clear-btn';
        link.href = comunicado.link_url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Abrir enlace';
        enlaces.appendChild(link);
    }
    if (comunicado.storage_path) {
        const url = await obtenerUrlFirmadaGdh(GDH_ANNOUNCEMENT_BUCKET, comunicado.storage_path);
        if (url) {
            const link = document.createElement('a');
            link.className = 'clear-btn';
            link.href = url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = 'Ver documento adjunto';
            enlaces.appendChild(link);
        }
    }
    if (estado) estado.textContent = 'Revisa la informacion antes de confirmar.';
    modal.hidden = false;
    obtenerElemento('confirmMandatoryAnnouncement')?.focus();
}

async function cargarComunicadosGdh() {
    if (!supabaseClient || !sesionActual?.user) return;
    const [{ data: comunicados, error }, { data: lecturas }] = await Promise.all([
        supabaseClient.from('gdh_comunicados').select('*').order('created_at', { ascending: false }),
        supabaseClient.from('gdh_lecturas').select('comunicado_id,user_id,confirmado,visto_at,confirmado_at').eq('user_id', sesionActual.user.id)
    ]);
    if (error) {
        console.warn('Modulo GDH pendiente de configuracion:', error);
        return;
    }
    comunicadosGdh = comunicados || [];
    lecturasGdh = lecturas || [];
    const comunicadoAplica = comunicado => comunicado.audiencia === 'todos'
        || (comunicado.audiencia === 'sedes' && comunicado.sedes?.includes(perfilActual?.sede))
        || (comunicado.audiencia === 'roles' && comunicado.roles?.includes(perfilActual?.rol))
        || (comunicado.audiencia === 'usuarios' && comunicado.usuarios?.includes(sesionActual.user.id));
    const pendiente = comunicadosGdh.find(comunicado => comunicado.obligatorio && comunicadoAplica(comunicado) && !lecturasGdh.some(lectura =>
        lectura.comunicado_id === comunicado.id && lectura.confirmado
    ));
    if (pendiente) {
        await mostrarComunicadoObligatorio(pendiente);
    } else {
        cerrarComunicadoObligatorio();
    }
}

async function confirmarComunicadoObligatorio() {
    if (!comunicadoObligatorioActual || !supabaseClient || !sesionActual?.user) return;
    const estado = obtenerElemento('mandatoryAnnouncementStatus');
    if (estado) estado.textContent = 'Registrando confirmacion...';
    const ahora = new Date().toISOString();
    const { error } = await supabaseClient.from('gdh_lecturas').upsert({
        comunicado_id: comunicadoObligatorioActual.id,
        user_id: sesionActual.user.id,
        visto_at: ahora,
        confirmado: true,
        confirmado_at: ahora
    }, { onConflict: 'comunicado_id,user_id' });
    if (error) {
        if (estado) estado.textContent = 'No se pudo guardar la lectura. Revisa tu conexion e intenta nuevamente.';
        return;
    }
    mostrarToast('Lectura confirmada para GDH.');
    await cargarComunicadosGdh();
}

function suscribirComunicadosGdh() {
    if (!supabaseClient || !sesionActual?.user) return;
    if (canalComunicadosGdh) supabaseClient.removeChannel(canalComunicadosGdh);
    canalComunicadosGdh = supabaseClient
        .channel(`gdh-comunicados-${sesionActual.user.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'gdh_comunicados' }, () => cargarComunicadosGdh())
        .subscribe();
}

async function aplicarSesion(session) {
    sesionActual = session;

    if (!session?.user) {
        perfilActual = null;
        accesoMantenimientoActivo = false;
        inventarioRepuestos = [];
        intervencionesMantenimiento = [];
        try {
            sessionStorage.removeItem(MAINTENANCE_ACCESS_SESSION_KEY);
        } catch (error) {
            console.warn('No se pudo limpiar el acceso de mantenimiento:', error);
        }
        if (canalEstadoOperativo && supabaseClient) {
            supabaseClient.removeChannel(canalEstadoOperativo);
            canalEstadoOperativo = null;
        }
        if (canalGuiasOperativas && supabaseClient) {
            supabaseClient.removeChannel(canalGuiasOperativas);
            canalGuiasOperativas = null;
        }
        if (canalInventario && supabaseClient) {
            supabaseClient.removeChannel(canalInventario);
            canalInventario = null;
        }
        if (canalIntervencionesMantenimiento && supabaseClient) {
            supabaseClient.removeChannel(canalIntervencionesMantenimiento);
            canalIntervencionesMantenimiento = null;
        }
        if (canalMantenimientoProgramado && supabaseClient) {
            supabaseClient.removeChannel(canalMantenimientoProgramado);
            canalMantenimientoProgramado = null;
        }
        if (canalSolicitudesAbonados && supabaseClient) {
            supabaseClient.removeChannel(canalSolicitudesAbonados);
            canalSolicitudesAbonados = null;
        }
        if (canalActivosOperaciones && supabaseClient) {
            supabaseClient.removeChannel(canalActivosOperaciones);
            canalActivosOperaciones = null;
        }
        if (canalChecklistOperaciones && supabaseClient) {
            supabaseClient.removeChannel(canalChecklistOperaciones);
            canalChecklistOperaciones = null;
        }
        if (canalOcupabilidadOperaciones && supabaseClient) {
            supabaseClient.removeChannel(canalOcupabilidadOperaciones);
            canalOcupabilidadOperaciones = null;
        }
        if (canalComunicadosGdh && supabaseClient) {
            supabaseClient.removeChannel(canalComunicadosGdh);
            canalComunicadosGdh = null;
        }
        cerrarComunicadoObligatorio();
        cerrarModalCambioPassword();
        activosOperaciones = [];
        solicitudesAbonados = [];
        mostrarAppAutenticada(false);
        actualizarEstadoAuth('Ingresa con tu usuario asignado.', 'info');
        actualizarSesionUI();
        actualizarPanelAdminGuias();
        return;
    }

    mostrarAppAutenticada(true);
    actualizarEstadoAuth('Sesion iniciada.', 'success');
    actualizarSesionUI();
    actualizarBotonAlertas();
    await cargarPerfilActual();
    await cargarComunicadosGdh();
    suscribirComunicadosGdh();
    if (perfilActual?.debe_cambiar_password) {
        abrirModalCambioPassword(true);
    }
    limpiarEvidenciasOperacionesVencidas();
    configurarSelectSedesOperaciones();
    configurarSelectSedesOcupabilidad();
    configurarSedeActivosOperaciones();
    await cargarActivosOperaciones();
    suscribirActivosOperaciones();
    if (usuarioPuedeGestionarAbonados()) {
        await cargarSolicitudesAbonados();
        suscribirSolicitudesAbonados();
    }
    restaurarAccesoMantenimiento();
    restaurarBorradorGuia();
    if ('Notification' in window && Notification.permission === 'granted') {
        registrarSuscripcionPush();
    }
    await migrarFotosGuiasLegacy();
    await cargarGuiasRemotas();
    await cargarProgresoGuiasRemoto();
    await cargarHistorialRemoto();
    await cargarEstadoOperativoRemoto();
    suscribirEstadoOperativo();
    suscribirGuiasOperativas();
    aplicarModuloSolicitadoDesdeURL();
}

async function iniciarSesion(event) {
    event.preventDefault();

    const identificador = obtenerElemento('authEmail')?.value.trim();
    const password = obtenerElemento('authPassword')?.value;
    const boton = obtenerElemento('authSubmit');

    if (!identificador || !password) {
        actualizarEstadoAuth('Completa usuario y contrasena.', 'error');
        return;
    }

    if (!supabaseClient) {
        actualizarBotonIngreso(false, 'Conectando...');
        actualizarEstadoAuth('Conectando con Supabase...', 'info');
        await inicializarClienteSupabase();
    }

    if (!supabaseClient) {
        actualizarEstadoAuth('Supabase no esta disponible. Revisa internet y vuelve a intentar.', 'error');
        actualizarBotonIngreso(true, 'Reintentar');
        return;
    }

    if (boton) {
        boton.disabled = true;
    }

    actualizarEstadoAuth('Validando credenciales...', 'info');
    const email = await resolverEmailLogin(identificador);

    if (!email) {
        if (boton) {
            boton.disabled = false;
        }
        actualizarEstadoAuth('No se encontro ese DNI o usuario anterior.', 'error');
        return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (boton) {
        boton.disabled = false;
    }

    if (error) {
        actualizarEstadoAuth('No se pudo iniciar sesion. Revisa DNI y contrasena.', 'error');
        return;
    }

    await aplicarSesion(data.session);
}

async function resolverEmailLogin(identificador) {
    const valor = identificador.trim();

    if (valor.includes('@')) {
        return valor.toLowerCase();
    }

    if (!supabaseClient) {
        return '';
    }

    try {
        const { data, error } = await supabaseClient.functions.invoke('resolve-login', {
            body: { usuario: valor }
        });

        if (error || !data?.email) {
            console.warn('No se pudo resolver usuario:', error || data);
            return '';
        }

        return data.email;
    } catch (error) {
        console.warn('Funcion resolve-login no disponible:', error);
        return '';
    }
}

async function cerrarSesion() {
    if (!supabaseClient) {
        return;
    }

    await supabaseClient.auth.signOut();
    await aplicarSesion(null);
}

async function inicializarAutenticacion() {
    actualizarBotonIngreso(false);
    actualizarEstadoAuth('Conectando con Supabase...', 'info');

    if (!await inicializarClienteSupabase()) {
        mostrarAppAutenticada(false);
        return;
    }

    supabaseClient.auth.onAuthStateChange((_event, session) => {
        aplicarSesion(session);
    });

    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        actualizarEstadoAuth('No se pudo verificar la sesion.', 'error');
        return;
    }

    await aplicarSesion(data.session);
}

function crearEstadoChecklistBase(codigo) {
    const info = codigosEmergencia[codigo];
    const controles = (info.controles || []).reduce((acumulado, control) => {
        acumulado[control.id] = {
            valor: '',
            actualizadoEn: null
        };
        return acumulado;
    }, {});

    return {
        encargado: '',
        modo: 'real',
        prioridad: 'media',
        activadoEn: null,
        cerradoEn: null,
        pasos: info.checklist.map(() => ({
            completado: false,
            completadoEn: null,
            observacion: '',
            foto: null
        })),
        controles
    };
}

function obtenerControlCondicional(info) {
    if (!info.checklistsCondicionales) {
        return null;
    }

    const controlId = Object.keys(info.checklistsCondicionales)[0];
    return controlId || null;
}

function obtenerPasosChecklist(codigo, estado) {
    const info = codigosEmergencia[codigo];
    const controlId = obtenerControlCondicional(info);

    if (!controlId) {
        return info.checklist;
    }

    const seleccion = estado?.controles?.[controlId]?.valor;
    return info.checklistsCondicionales[controlId][seleccion] || [];
}

function crearPasosEstado(cantidad) {
    return Array.from({ length: cantidad }, () => ({
        completado: false,
        completadoEn: null,
        observacion: '',
        foto: null
    }));
}

function sincronizarPasosChecklist(codigo, estado, reiniciar = false) {
    const pasos = obtenerPasosChecklist(codigo, estado);

    if (reiniciar) {
        estado.pasos = crearPasosEstado(pasos.length);
        return;
    }

    estado.pasos = pasos.map((paso, indice) => {
        const guardado = estado.pasos[indice];

        if (guardado && typeof guardado === 'object') {
            return {
                completado: Boolean(guardado.completado),
                completadoEn: guardado.completadoEn || null,
                observacion: typeof guardado.observacion === 'string' ? guardado.observacion : '',
                foto: guardado.foto && typeof guardado.foto === 'object' ? guardado.foto : null
            };
        }

        return {
            completado: Boolean(guardado),
            completadoEn: guardado ? new Date().toISOString() : null,
            observacion: '',
            foto: null
        };
    });
}

function normalizarChecklistGuardado(codigo, valor) {
    const base = crearEstadoChecklistBase(codigo);

    if (!valor) {
        return base;
    }

    if (Array.isArray(valor)) {
        base.pasos = valor.map(estado => ({
            completado: Boolean(estado),
            completadoEn: estado ? new Date().toISOString() : null
        }));
        sincronizarPasosChecklist(codigo, base);
        return base;
    }

    if (typeof valor !== 'object') {
        return base;
    }

    if (typeof valor.encargado === 'string') {
        base.encargado = valor.encargado;
    }

    if (typeof valor.modo === 'string' && etiquetasModo[valor.modo]) {
        base.modo = valor.modo;
    }

    if (typeof valor.prioridad === 'string' && etiquetasPrioridad[valor.prioridad]) {
        base.prioridad = valor.prioridad;
    }

    base.activadoEn = valor.activadoEn || valor.activatedAt || null;
    base.cerradoEn = valor.cerradoEn || valor.closedAt || null;

    const pasosGuardados = Array.isArray(valor.pasos)
        ? valor.pasos
        : Array.isArray(valor.items)
            ? valor.items
            : Array.isArray(valor.estados)
                ? valor.estados
                : [];

    const controlesInfo = codigosEmergencia[codigo].controles || [];
    controlesInfo.forEach(control => {
        const guardado = valor.controles?.[control.id] || valor.extras?.[control.id] || valor[control.id];

        if (guardado && typeof guardado === 'object') {
            base.controles[control.id] = {
                valor: typeof guardado.valor === 'string' ? guardado.valor : '',
                actualizadoEn: guardado.actualizadoEn || guardado.fechaHora || null
            };
            return;
        }

        if (typeof guardado === 'string') {
            base.controles[control.id] = {
                valor: guardado,
                actualizadoEn: null
            };
        }
    });

    base.pasos = pasosGuardados.map(guardado => {
        if (guardado && typeof guardado === 'object') {
            return {
                completado: Boolean(guardado.completado ?? guardado.checked ?? guardado.estado),
                completadoEn: guardado.completadoEn || guardado.checkedAt || guardado.fechaHora || null,
                observacion: typeof guardado.observacion === 'string' ? guardado.observacion : '',
                foto: guardado.foto && typeof guardado.foto === 'object' ? guardado.foto : null
            };
        }

        return {
            completado: Boolean(guardado),
            completadoEn: guardado ? new Date().toISOString() : null,
            observacion: '',
            foto: null
        };
    });
    sincronizarPasosChecklist(codigo, base);

    return base;
}

function obtenerEstadoChecklist(codigo) {
    if (!codigosEmergencia[codigo]) {
        return null;
    }

    if (!checklistEstado[codigo]) {
        checklistEstado[codigo] = crearEstadoChecklistBase(codigo);
    } else {
        checklistEstado[codigo] = normalizarChecklistGuardado(codigo, checklistEstado[codigo]);
    }

    sincronizarPasosChecklist(codigo, checklistEstado[codigo]);

    return checklistEstado[codigo];
}

function cargarHistorial() {
    const datos = safeParseJSON(localStorage.getItem(obtenerClaveLocalPorSede(STORAGE_KEYS.history)), []);

    if (!Array.isArray(datos)) {
        return [];
    }

    return datos
        .filter(entrada => entrada && typeof entrada === 'object')
        .filter(entrada => typeof entrada.codigo === 'string' && codigosEmergencia[entrada.codigo])
        .slice(0, MAX_HISTORIAL)
        .map(entrada => ({
            codigo: entrada.codigo,
            nombre: entrada.nombre || codigosEmergencia[entrada.codigo].nombre,
            descripcion: entrada.descripcion || codigosEmergencia[entrada.codigo].descripcion,
            fecha: entrada.fecha || '',
            hora: entrada.hora || entrada.tiempo || '',
            encargado: entrada.encargado || '',
            modo: etiquetasModo[entrada.modo] ? entrada.modo : 'real',
            prioridad: etiquetasPrioridad[entrada.prioridad] ? entrada.prioridad : 'media',
            sede: entrada.sede || obtenerSedeActual() || '',
            activadoEn: entrada.activadoEn || null,
            cerradoEn: entrada.cerradoEn || null
        }));
}

function cargarChecklistEstado() {
    const datos = safeParseJSON(localStorage.getItem(obtenerClaveLocalPorSede(STORAGE_KEYS.checklist)), {});

    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
        return {};
    }

    const estado = {};

    Object.keys(codigosEmergencia).forEach(codigo => {
        if (Object.prototype.hasOwnProperty.call(datos, codigo)) {
            estado[codigo] = normalizarChecklistGuardado(codigo, datos[codigo]);
        }
    });

    return estado;
}

function crearChecklistPersistible(origen = checklistEstado) {
    const copia = {};
    Object.entries(origen || {}).forEach(([codigo, estado]) => {
        copia[codigo] = {
            ...estado,
            pasos: (estado?.pasos || []).map(paso => ({
                ...paso,
                foto: paso?.foto ? {
                    storageKey: paso.foto.storageKey || '',
                    path: paso.foto.path || '',
                    nombre: paso.foto.nombre || '',
                    tomadaEn: paso.foto.tomadaEn || ''
                } : null
            }))
        };
    });
    return copia;
}

function guardarChecklistEstado() {
    guardarEstadoLocalStorage(obtenerClaveLocalPorSede(STORAGE_KEYS.checklist), crearChecklistPersistible());
}

function obtenerFechaHoraActual() {
    const ahora = new Date();
    return {
        fecha: dateFormatter.format(ahora),
        hora: timeFormatter.format(ahora),
        iso: ahora.toISOString()
    };
}

function formatearFechaHoraISO(iso) {
    if (!iso) {
        return '';
    }

    const fecha = new Date(iso);
    if (Number.isNaN(fecha.getTime())) {
        return '';
    }

    return `${dateFormatter.format(fecha)} ${timeFormatter.format(fecha)}`;
}

function obtenerDuracionTexto(inicioIso, finIso) {
    if (!inicioIso || !finIso) {
        return 'En curso';
    }

    const inicio = new Date(inicioIso);
    const fin = new Date(finIso);

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime()) || fin < inicio) {
        return 'No disponible';
    }

    return formatearDuracionMs(fin - inicio);
}

function formatearDuracionMs(duracionMs) {
    if (typeof duracionMs !== 'number' || duracionMs < 0) {
        return 'No disponible';
    }

    const totalSegundos = Math.round(duracionMs / 1000);
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;
    const partes = [];

    if (horas) {
        partes.push(`${horas} h`);
    }

    if (minutos || horas) {
        partes.push(`${minutos} min`);
    }

    partes.push(`${segundos} s`);
    return partes.join(' ');
}

function crearTarjetaCodigo(codigo, info) {
    const article = document.createElement('article');
    const encabezado = document.createElement('div');
    const miniatura = document.createElement('div');
    const titulo = document.createElement('h3');
    const descripcion = document.createElement('p');
    const guia = document.createElement('p');
    const boton = document.createElement('button');

    article.className = `code-card code-${codigo}`;
    article.dataset.code = codigo;
    article.setAttribute('role', 'group');
    article.setAttribute('aria-label', info.nombre);

    encabezado.className = 'code-card-header';
    miniatura.className = 'code-thumb';
    miniatura.appendChild(crearIlustracionConcepto(info.concepto.escena, info.color));
    miniatura.setAttribute('aria-hidden', 'true');

    titulo.textContent = info.nombre;
    encabezado.append(miniatura, titulo);

    descripcion.className = 'code-summary';
    descripcion.textContent = info.descripcion;

    guia.className = 'code-guide';
    guia.textContent = info.guia;

    boton.className = 'activate-btn';
    boton.type = 'button';
    boton.dataset.code = codigo;
    boton.textContent = 'Activar y ver';
    boton.setAttribute('aria-label', `Activar ${info.nombre} y ver su lamina y checklist`);
    boton.setAttribute('aria-pressed', 'false');

    article.append(encabezado, descripcion, guia, boton);
    return article;
}

function renderizarCodigos() {
    const contenedor = obtenerElemento('codesGrid');
    limpiarElemento(contenedor);

    ordenCodigos.forEach(codigo => {
        contenedor.appendChild(crearTarjetaCodigo(codigo, codigosEmergencia[codigo]));
    });
}

function asegurarControlesVentanaModulo(seccion) {
    if (seccion.querySelector('.module-window-close')) {
        return;
    }

    const botonCerrar = document.createElement('button');
    botonCerrar.type = 'button';
    botonCerrar.className = 'module-window-close';
    botonCerrar.dataset.closeModuleWindow = '';
    botonCerrar.setAttribute('aria-label', 'Cerrar modulo y volver al inicio');
    botonCerrar.title = 'Cerrar modulo';
    botonCerrar.textContent = '×';
    seccion.prepend(botonCerrar);
}

function obtenerRutaNavegacionModulo(modulo) {
    const url = new URL(window.location.href);
    url.searchParams.delete('module');
    url.hash = modulo ? `modulo-${encodeURIComponent(modulo)}` : 'inicio';
    return `${url.pathname}${url.search}${url.hash}`;
}

function obtenerModuloDesdeRuta(estado) {
    if (estado?.urbaparkModule && obtenerElemento(`module-${estado.urbaparkModule}`)) {
        return estado.urbaparkModule;
    }

    const coincidencia = window.location.hash.match(/^#modulo-(.+)$/);
    if (!coincidencia) {
        return null;
    }

    try {
        const modulo = decodeURIComponent(coincidencia[1]);
        return obtenerElemento(`module-${modulo}`) ? modulo : null;
    } catch (error) {
        console.warn('No se pudo interpretar la ruta del modulo.', error);
        return null;
    }
}

function seleccionarModulo(modulo, opciones = {}) {
    const { desplazar = true, registrarHistorial = true } = opciones;
    if (modulo === 'abonados' && !usuarioPuedeAccederAbonados()) {
        mostrarToast('Este modulo esta disponible solo para administradores autorizados.');
        modulo = null;
    }
    const moduloValido = modulo && obtenerElemento(`module-${modulo}`);
    const moduloAnterior = moduloActivo;

    if (moduloValido && document.activeElement?.closest?.('button[data-module]')) {
        elementoRetornoModulo = document.activeElement;
    }

    moduloActivo = moduloValido ? modulo : null;

    document.querySelectorAll('.module-content').forEach(seccion => {
        const activa = seccion.id === `module-${moduloActivo}`;
        seccion.hidden = !activa;
        seccion.classList.toggle('module-window-active', activa);

        if (activa) {
            asegurarControlesVentanaModulo(seccion);
            seccion.setAttribute('role', 'dialog');
            seccion.setAttribute('aria-modal', 'true');
            seccion.setAttribute('tabindex', '-1');
        } else {
            seccion.removeAttribute('role');
            seccion.removeAttribute('aria-modal');
            seccion.removeAttribute('tabindex');
        }
    });

    document.body.classList.toggle('module-window-open', Boolean(moduloActivo));

    if (registrarHistorial && window.history.state?.urbaparkModule !== moduloActivo) {
        window.history.pushState({
            ...(window.history.state || {}),
            urbaparkApp: true,
            urbaparkModule: moduloActivo
        }, '', obtenerRutaNavegacionModulo(moduloActivo));
    }

    document.querySelectorAll('.module-button').forEach(boton => {
        const activo = boton.dataset.module === moduloActivo;
        boton.setAttribute('aria-pressed', activo ? 'true' : 'false');
    });

    actualizarBottomNav(moduloActivo);

    if (moduloActivo) {
        const destino = obtenerElemento(`module-${moduloActivo}`);
        destino.scrollTop = 0;
        if (desplazar) {
            destino.focus({ preventScroll: true });
        }
    } else if (moduloAnterior && elementoRetornoModulo?.isConnected) {
        elementoRetornoModulo.focus({ preventScroll: true });
        elementoRetornoModulo = null;
    }
}

function cerrarModuloConNavegacion() {
    const estado = window.history.state;

    if (moduloActivo && estado?.urbaparkApp && estado.urbaparkModule === moduloActivo) {
        window.history.back();
        return;
    }

    seleccionarModulo(null, { desplazar: false, registrarHistorial: false });
}

function actualizarBottomNav(modulo) {
    const nav = obtenerElemento('bottomNav');

    if (!nav) {
        return;
    }

    nav.querySelectorAll('button').forEach(boton => {
        const activo = boton.dataset.navModule === modulo
            || (boton.dataset.navAction === 'home' && !modulo);

        if (activo) {
            boton.setAttribute('aria-current', 'page');
        } else {
            boton.removeAttribute('aria-current');
        }
    });
}

function manejarNavegacionInferior(event) {
    const boton = event.target.closest('button');

    if (!boton) {
        return;
    }

    const modulo = boton.dataset.navModule;

    if (modulo) {
        seleccionarModulo(modulo);
        return;
    }

    if (boton.dataset.navAction === 'home') {
        cerrarModuloConNavegacion();
        obtenerElemento('modulePanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }

    if (boton.dataset.navAction === 'search') {
        obtenerElemento('globalSearchInput')?.focus();
        obtenerElemento('globalSearchPanel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    if (boton.dataset.navAction === 'admin') {
        if (usuarioEsAdmin()) {
            alternarPanelAdmin('guias');
        } else {
            mostrarToast('Solo los usuarios administradores pueden abrir este panel.');
        }
    }
}

function actualizarTarjetasActivas(codigo) {
    document.querySelectorAll('.code-card').forEach(card => {
        const boton = card.querySelector('button.activate-btn');
        const activa = card.dataset.code === codigo;
        card.classList.toggle('active', activa);

        if (boton) {
            boton.setAttribute('aria-pressed', activa ? 'true' : 'false');
        }
    });
}

function crearMensajeVacio(texto, clase) {
    const nodo = document.createElement('p');
    nodo.className = clase;
    nodo.textContent = texto;
    return nodo;
}

function obtenerNombreEncargadoActual() {
    const input = obtenerElemento('responsibleName');
    return input ? input.value.trim() : '';
}

function guardarEncargadoActual(codigo, nombre) {
    const estado = obtenerEstadoChecklist(codigo);
    if (!estado) {
        return;
    }

    estado.encargado = nombre;
    guardarChecklistEstado();
    programarSincronizacionEstadoOperativo();

    if (historial.length > 0 && historial[0].codigo === codigo && !historial[0].cerradoEn) {
        historial[0].encargado = nombre;
        guardarHistorial();
        actualizarHistorialUI();
        actualizarResumenUI();
    }
}

function estaChecklistCompleto(codigo, estado = obtenerEstadoChecklist(codigo)) {
    const pasos = obtenerPasosChecklist(codigo, estado);

    if (!estado || pasos.length === 0) {
        return false;
    }

    return estado.pasos.length === pasos.length && estado.pasos.every(paso => paso.completado);
}

function tieneEncargadoRegistrado(estado) {
    return Boolean(estado?.encargado && estado.encargado.trim());
}

function actualizarHistorialActual(codigo, cambios) {
    const entrada = historial.find(item => item.codigo === codigo && !item.cerradoEn);

    if (!entrada) {
        return;
    }

    Object.assign(entrada, cambios);
    guardarHistorial();
    actualizarHistorialUI();
    actualizarResumenUI();
}

function guardarCampoOperacion(codigo, campo, valor) {
    const estado = obtenerEstadoChecklist(codigo);

    if (!estado) {
        return;
    }

    estado[campo] = valor;
    guardarChecklistEstado();
    programarSincronizacionEstadoOperativo();
    actualizarHistorialActual(codigo, { [campo]: valor });

    if (codigoActivo === codigo) {
        actualizarCodigoActivo(codigo);
    }
}

function actualizarCodigoActivo(codigo) {
    const display = obtenerElemento('activeCodeDisplay');
    limpiarElemento(display);

    if (!codigo) {
        display.appendChild(crearMensajeVacio('Ningun codigo activo', 'active-empty'));
        display.classList.remove('has-code');
        return;
    }

    const info = codigosEmergencia[codigo];
    const icono = document.createElement('span');
    const contenido = document.createElement('div');
    const nombre = document.createElement('div');
    const descripcion = document.createElement('div');
    const guia = document.createElement('div');
    const meta = document.createElement('div');
    const estado = obtenerEstadoChecklist(codigo);

    icono.className = 'active-code-icon';
    if (info.icono.length > 2) {
        icono.classList.add('compact');
    }
    icono.textContent = info.icono;
    icono.style.backgroundColor = info.color;
    icono.setAttribute('aria-hidden', 'true');

    nombre.className = 'active-code-name';
    nombre.textContent = info.nombre;
    nombre.style.color = info.color;

    descripcion.className = 'active-code-description';
    descripcion.textContent = info.descripcion;

    guia.className = 'active-code-guide';
    guia.textContent = info.guia;

    meta.className = 'active-code-meta';
    meta.textContent = estado?.cerradoEn
        ? `Finalizado ${formatearFechaHoraISO(estado.cerradoEn)} · Duracion ${obtenerDuracionTexto(estado.activadoEn, estado.cerradoEn)}`
        : `${etiquetasModo[estado?.modo || 'real']} · Prioridad ${etiquetasPrioridad[estado?.prioridad || 'media']}`;

    contenido.append(nombre, descripcion, guia, meta);
    display.append(icono, contenido);
    display.classList.add('has-code');
}

function actualizarEncargadoUI(codigo) {
    const input = obtenerElemento('responsibleName');
    const hint = obtenerElemento('responsibleHint');
    const modo = obtenerElemento('operationMode');
    const prioridad = obtenerElemento('operationPriority');
    const finalizar = obtenerElemento('finishCode');
    const estado = codigo ? obtenerEstadoChecklist(codigo) : null;

    if (!input || !hint || !modo || !prioridad || !finalizar) {
        return;
    }

    if (!codigo || !estado) {
        input.value = '';
        input.disabled = true;
        modo.value = 'real';
        modo.disabled = true;
        prioridad.value = 'media';
        prioridad.disabled = true;
        finalizar.disabled = true;
        input.setAttribute('aria-describedby', 'responsibleHint');
        hint.textContent = 'Registra quien queda a cargo de la activacion actual.';
        return;
    }

    input.disabled = false;
    input.value = estado.encargado || '';
    modo.disabled = Boolean(estado.cerradoEn);
    modo.value = estado.modo || 'real';
    prioridad.disabled = Boolean(estado.cerradoEn);
    prioridad.value = estado.prioridad || 'media';
    finalizar.disabled = Boolean(estado.cerradoEn) || !estaChecklistCompleto(codigo, estado) || !tieneEncargadoRegistrado(estado);
    input.setAttribute('aria-describedby', 'responsibleHint');
    hint.textContent = estado.cerradoEn
        ? `Codigo finalizado: ${formatearFechaHoraISO(estado.cerradoEn)}`
        : !tieneEncargadoRegistrado(estado)
            ? 'Obligatorio: coloca el nombre de la persona a cargo para poder finalizar.'
            : estaChecklistCompleto(codigo, estado)
            ? 'Checklist completo. Ya puedes finalizar y registrar el historial.'
            : 'Completa todas las tareas para habilitar el cierre y registrar el historial.';
}

function actualizarLamina(codigo, { abrirModal = false } = {}) {
    const imagen = obtenerElemento('codeImage');
    const caption = obtenerElemento('codeImageCaption');
    const botonAbrir = obtenerElemento('openImageView');
    const info = codigo ? codigosEmergencia[codigo] : null;

    if (!info) {
        imagen.src = '';
        imagen.alt = 'Lamina de codigo de emergencia';
        imagen.hidden = true;
        caption.textContent = 'Activa un codigo para mostrar su lamina de respuesta.';
        botonAbrir.disabled = true;
        return;
    }

    imagen.hidden = false;
    imagen.src = info.image;
    imagen.alt = `${info.nombre} - lamina de emergencia`;
    caption.textContent = `${info.nombre}. ${info.guia}.`;
    botonAbrir.disabled = false;

    if (abrirModal) {
        abrirModalCodigo(codigo);
    }
}

function crearSVG(nombre, atributos = {}) {
    const elemento = document.createElementNS('http://www.w3.org/2000/svg', nombre);

    Object.entries(atributos).forEach(([clave, valor]) => {
        elemento.setAttribute(clave, valor);
    });

    return elemento;
}

function agregarSVG(padre, nombre, atributos = {}) {
    const elemento = crearSVG(nombre, atributos);
    padre.appendChild(elemento);
    return elemento;
}

function crearIlustracionConcepto(tipo, color) {
    const svg = crearSVG('svg', {
        class: `concept-illustration concept-illustration-${tipo}`,
        viewBox: '0 0 220 150',
        role: 'img',
        'aria-hidden': 'true',
        focusable: 'false'
    });
    const defs = agregarSVG(svg, 'defs');
    const gradientId = `sceneGradient-${tipo}`;
    const gradient = agregarSVG(defs, 'linearGradient', {
        id: gradientId,
        x1: '0%',
        y1: '0%',
        x2: '100%',
        y2: '100%'
    });

    agregarSVG(gradient, 'stop', { offset: '0%', 'stop-color': color, 'stop-opacity': '0.22' });
    agregarSVG(gradient, 'stop', { offset: '100%', 'stop-color': color, 'stop-opacity': '0.04' });
    agregarSVG(svg, 'rect', { x: '0', y: '0', width: '220', height: '150', rx: '18', fill: `url(#${gradientId})` });
    agregarSVG(svg, 'circle', { cx: '184', cy: '30', r: '22', fill: color, opacity: '0.12' });
    agregarSVG(svg, 'circle', { cx: '32', cy: '118', r: '16', fill: color, opacity: '0.10' });

    const strokeBase = {
        stroke: color,
        'stroke-width': '8',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        fill: 'none'
    };
    const fillBase = { fill: color };
    const paleFill = { fill: color, opacity: '0.14' };

    switch (tipo) {
        case 'fire':
            agregarSVG(svg, 'path', { d: 'M101 121 C75 107 79 80 99 60 C103 78 118 76 113 47 C143 70 151 102 125 121 Z', fill: color, opacity: '0.92' });
            agregarSVG(svg, 'path', { d: 'M107 119 C96 108 99 94 111 82 C113 94 124 94 122 78 C137 96 135 113 119 121 Z', fill: '#fff', opacity: '0.72' });
            agregarSVG(svg, 'rect', { x: '42', y: '75', width: '20', height: '48', rx: '6', ...fillBase });
            agregarSVG(svg, 'path', { d: 'M52 74 V58 H78', ...strokeBase, 'stroke-width': '6' });
            agregarSVG(svg, 'path', { d: 'M62 91 H82', ...strokeBase, 'stroke-width': '5' });
            break;
        case 'lift':
            agregarSVG(svg, 'rect', { x: '64', y: '30', width: '92', height: '98', rx: '12', ...paleFill });
            agregarSVG(svg, 'path', { d: 'M110 34 V126', ...strokeBase, 'stroke-width': '6' });
            agregarSVG(svg, 'rect', { x: '75', y: '44', width: '70', height: '70', rx: '8', fill: '#fff', opacity: '0.62' });
            agregarSVG(svg, 'circle', { cx: '94', cy: '70', r: '10', ...fillBase });
            agregarSVG(svg, 'path', { d: 'M82 103 C86 88 103 88 107 103', ...strokeBase, 'stroke-width': '6' });
            agregarSVG(svg, 'path', { d: 'M137 62 L148 50 L159 62', ...strokeBase, 'stroke-width': '5' });
            agregarSVG(svg, 'path', { d: 'M137 98 L148 110 L159 98', ...strokeBase, 'stroke-width': '5' });
            break;
        case 'spill':
            agregarSVG(svg, 'path', { d: 'M83 113 C64 96 78 74 103 41 C128 74 142 96 123 113 C112 123 94 123 83 113 Z', fill: color, opacity: '0.9' });
            agregarSVG(svg, 'path', { d: 'M125 92 C150 82 170 87 187 104', ...strokeBase, 'stroke-width': '7' });
            agregarSVG(svg, 'path', { d: 'M128 115 C151 105 171 108 190 122', ...strokeBase, 'stroke-width': '6', opacity: '0.7' });
            agregarSVG(svg, 'circle', { cx: '54', cy: '102', r: '10', ...paleFill });
            agregarSVG(svg, 'circle', { cx: '163', cy: '54', r: '8', ...fillBase, opacity: '0.32' });
            break;
        case 'medical':
            agregarSVG(svg, 'circle', { cx: '110', cy: '76', r: '48', ...paleFill });
            agregarSVG(svg, 'rect', { x: '98', y: '44', width: '24', height: '64', rx: '5', ...fillBase });
            agregarSVG(svg, 'rect', { x: '78', y: '64', width: '64', height: '24', rx: '5', ...fillBase });
            agregarSVG(svg, 'path', { d: 'M45 119 H175', ...strokeBase, 'stroke-width': '7' });
            agregarSVG(svg, 'circle', { cx: '72', cy: '124', r: '8', ...fillBase });
            agregarSVG(svg, 'circle', { cx: '148', cy: '124', r: '8', ...fillBase });
            break;
        case 'evac':
            agregarSVG(svg, 'rect', { x: '52', y: '38', width: '74', height: '82', rx: '7', ...paleFill });
            agregarSVG(svg, 'path', { d: 'M70 56 H108 M70 76 H108 M70 96 H92', ...strokeBase, 'stroke-width': '5' });
            agregarSVG(svg, 'path', { d: 'M126 100 H171', ...strokeBase, 'stroke-width': '8' });
            agregarSVG(svg, 'path', { d: 'M155 82 L176 100 L155 118', ...strokeBase, 'stroke-width': '8' });
            agregarSVG(svg, 'circle', { cx: '137', cy: '66', r: '12', ...fillBase });
            agregarSVG(svg, 'path', { d: 'M137 80 L125 101 M137 80 L154 98', ...strokeBase, 'stroke-width': '6' });
            break;
        case 'security':
            agregarSVG(svg, 'rect', { x: '54', y: '54', width: '76', height: '44', rx: '8', ...fillBase });
            agregarSVG(svg, 'path', { d: 'M130 65 L176 47 V105 L130 88 Z', fill: color, opacity: '0.38' });
            agregarSVG(svg, 'circle', { cx: '84', cy: '76', r: '13', fill: '#fff', opacity: '0.88' });
            agregarSVG(svg, 'path', { d: 'M64 104 L51 125 H107', ...strokeBase, 'stroke-width': '7' });
            agregarSVG(svg, 'path', { d: 'M152 44 C163 54 170 67 170 82', ...strokeBase, 'stroke-width': '5', opacity: '0.7' });
            break;
        case 'search':
            agregarSVG(svg, 'circle', { cx: '91', cy: '68', r: '34', ...strokeBase, 'stroke-width': '9' });
            agregarSVG(svg, 'path', { d: 'M116 94 L153 126', ...strokeBase, 'stroke-width': '10' });
            agregarSVG(svg, 'path', { d: 'M157 38 C178 38 190 54 190 69 C190 91 157 115 157 115 C157 115 124 91 124 69 C124 54 136 38 157 38 Z', ...paleFill });
            agregarSVG(svg, 'circle', { cx: '157', cy: '68', r: '9', ...fillBase });
            agregarSVG(svg, 'path', { d: 'M55 114 H95', ...strokeBase, 'stroke-width': '5', opacity: '0.55' });
            break;
        case 'calm':
            agregarSVG(svg, 'circle', { cx: '74', cy: '59', r: '17', ...fillBase });
            agregarSVG(svg, 'circle', { cx: '146', cy: '59', r: '17', ...fillBase, opacity: '0.72' });
            agregarSVG(svg, 'path', { d: 'M46 113 C54 89 91 89 101 113', ...strokeBase });
            agregarSVG(svg, 'path', { d: 'M119 113 C129 89 166 89 174 113', ...strokeBase, opacity: '0.72' });
            agregarSVG(svg, 'path', { d: 'M110 45 V121', stroke: '#ffffff', 'stroke-width': '10', 'stroke-linecap': 'round' });
            agregarSVG(svg, 'path', { d: 'M110 45 V121', ...strokeBase, 'stroke-width': '4', opacity: '0.42' });
            agregarSVG(svg, 'path', { d: 'M84 86 C97 96 123 96 136 86', ...strokeBase, 'stroke-width': '6', opacity: '0.7' });
            break;
        case 'shield':
            agregarSVG(svg, 'path', { d: 'M110 28 L160 48 V78 C160 108 137 126 110 136 C83 126 60 108 60 78 V48 Z', fill: color, opacity: '0.88' });
            agregarSVG(svg, 'path', { d: 'M84 79 L102 97 L139 58', stroke: '#ffffff', 'stroke-width': '12', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' });
            agregarSVG(svg, 'circle', { cx: '52', cy: '48', r: '9', ...paleFill });
            agregarSVG(svg, 'circle', { cx: '170', cy: '112', r: '11', ...paleFill });
            break;
        default:
            agregarSVG(svg, 'circle', { cx: '110', cy: '75', r: '44', ...paleFill });
            agregarSVG(svg, 'path', { d: 'M83 76 H137 M110 49 V103', ...strokeBase });
            break;
    }

    return svg;
}

function actualizarConceptoVisual(codigo) {
    const contenedor = obtenerElemento('conceptVisual');
    limpiarElemento(contenedor);

    const info = codigo ? codigosEmergencia[codigo] : null;

    if (!info) {
        contenedor.className = 'concept-visual';
        contenedor.appendChild(crearMensajeVacio('Activa un codigo para ver su imagen conceptual.', 'concept-empty'));
        return;
    }

    const concepto = info.concepto;
    const encabezado = document.createElement('div');
    const escena = document.createElement('div');
    const texto = document.createElement('div');
    const titulo = document.createElement('h3');
    const foco = document.createElement('p');
    const etiquetas = document.createElement('div');

    contenedor.className = `concept-visual concept-${codigo}`;
    contenedor.style.setProperty('--code-color', info.color);

    encabezado.className = 'concept-main';

    escena.className = 'concept-scene';
    escena.appendChild(crearIlustracionConcepto(concepto.escena, info.color));

    titulo.textContent = concepto.titulo;
    foco.textContent = concepto.foco;

    texto.append(titulo, foco);
    encabezado.append(escena, texto);

    etiquetas.className = 'concept-tags';
    concepto.etiquetas.forEach(etiqueta => {
        const chip = document.createElement('span');
        chip.textContent = etiqueta;
        etiquetas.appendChild(chip);
    });

    contenedor.append(encabezado, etiquetas);
    contenedor.setAttribute('aria-label', `Concepto de ${info.nombre}: ${concepto.titulo}`);
}

function actualizarChecklistUI(codigo) {
    const lista = obtenerElemento('checklistList');
    const intro = obtenerElemento('checklistIntro');
    const progreso = obtenerElemento('checklistProgressText');
    const botonReiniciar = obtenerElemento('resetChecklist');
    limpiarElemento(lista);

    if (!codigo) {
        intro.textContent = 'Activa un codigo para ver las actividades a completar.';
        progreso.textContent = '0 de 0';
        botonReiniciar.disabled = true;
        lista.appendChild(crearMensajeVacio('Sin codigo activo', 'checklist-empty'));
        return;
    }

    const info = codigosEmergencia[codigo];
    const estado = obtenerEstadoChecklist(codigo);
    const pasosChecklist = obtenerPasosChecklist(codigo, estado);
    const completadas = estado.pasos.filter(paso => paso.completado).length;
    const controles = info.controles || [];
    const controlCondicional = obtenerControlCondicional(info);
    const seleccionCondicional = controlCondicional ? estado.controles?.[controlCondicional]?.valor : '';

    intro.textContent = controlCondicional && !seleccionCondicional
        ? `Selecciona el tipo de incidente para ver las actividades de ${info.nombre}.`
        : `Pasos operativos para ${info.nombre}. Marca cada casillero al completarlo.`;
    progreso.textContent = `${completadas} de ${pasosChecklist.length}`;
    botonReiniciar.disabled = false;

    const agregarControl = control => {
        const item = document.createElement('li');
        const fieldset = document.createElement('fieldset');
        const legend = document.createElement('legend');
        const opciones = document.createElement('div');
        const timestamp = document.createElement('time');
        const controlEstado = estado.controles?.[control.id] || { valor: '', actualizadoEn: null };

        item.className = 'checklist-item checklist-control-item';
        fieldset.className = 'checklist-control-fieldset';
        legend.className = 'checklist-control-legend';
        legend.textContent = control.pregunta;
        opciones.className = 'checklist-choice-group';

        control.opciones.forEach(opcion => {
            const etiqueta = document.createElement('label');
            const radio = document.createElement('input');
            const texto = document.createElement('span');
            const idOpcion = opcion.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const id = `control-${codigo}-${control.id}-${idOpcion}`;

            etiqueta.className = 'checklist-choice';
            etiqueta.htmlFor = id;

            radio.type = 'radio';
            radio.id = id;
            radio.name = `control-${codigo}-${control.id}`;
            radio.value = opcion;
            radio.dataset.codigo = codigo;
            radio.dataset.controlId = control.id;
            radio.checked = controlEstado.valor === opcion;
            radio.setAttribute('aria-label', `${control.pregunta} ${opcion}`);

            texto.textContent = opcion;
            etiqueta.append(radio, texto);
            opciones.appendChild(etiqueta);
        });

        timestamp.className = 'checklist-timestamp checklist-control-timestamp';
        if (controlEstado.actualizadoEn) {
            const fechaHoraTexto = formatearFechaHoraISO(controlEstado.actualizadoEn);
            timestamp.dateTime = controlEstado.actualizadoEn;
            timestamp.textContent = fechaHoraTexto ? `Registrado ${fechaHoraTexto}` : 'Registrado';
        } else {
            timestamp.textContent = 'Pendiente de registro';
        }

        fieldset.append(legend, opciones, timestamp);
        item.appendChild(fieldset);
        lista.appendChild(item);
    };

    controles
        .filter(control => control.posicion === 'antes')
        .forEach(agregarControl);

    if (controlCondicional && !seleccionCondicional) {
        const item = document.createElement('li');
        item.className = 'checklist-empty';
        item.textContent = 'Elige Gas o Gasolina/Petroleo para cargar el checklist correspondiente.';
        lista.appendChild(item);
    }

    pasosChecklist.forEach((paso, indice) => {
        const item = document.createElement('li');
        const etiqueta = document.createElement('label');
        const checkbox = document.createElement('input');
        const numero = document.createElement('span');
        const contenido = document.createElement('div');
        const texto = document.createElement('span');
        const timestamp = document.createElement('time');
        const observacion = document.createElement('textarea');
        const evidencia = document.createElement('div');
        const evidenciaAcciones = document.createElement('div');
        const fotoLabel = document.createElement('label');
        const fotoInput = document.createElement('input');
        const fotoEstado = document.createElement('span');

        const pasoEstado = estado.pasos[indice] || { completado: false, completadoEn: null };

        item.className = 'checklist-item';
        etiqueta.className = 'checklist-label';
        etiqueta.htmlFor = `check-${codigo}-${indice}`;

        checkbox.type = 'checkbox';
        checkbox.id = `check-${codigo}-${indice}`;
        checkbox.dataset.codigo = codigo;
        checkbox.dataset.index = String(indice);
        checkbox.checked = Boolean(pasoEstado.completado);
        checkbox.setAttribute('aria-label', `${info.nombre}: paso ${indice + 1}`);

        numero.className = 'checklist-step';
        numero.textContent = `${indice + 1}`;

        contenido.className = 'checklist-content';

        texto.className = 'checklist-text';
        texto.textContent = paso;

        timestamp.className = 'checklist-timestamp';

        if (pasoEstado.completadoEn) {
            const fechaHoraTexto = formatearFechaHoraISO(pasoEstado.completadoEn);
            timestamp.dateTime = pasoEstado.completadoEn;
            timestamp.textContent = fechaHoraTexto ? `Hecho ${fechaHoraTexto}` : 'Hecho';
        } else {
            timestamp.textContent = 'Pendiente';
        }

        observacion.className = 'checklist-observation';
        observacion.value = pasoEstado.observacion || '';
        observacion.placeholder = 'Observacion de la tarea';
        observacion.rows = 2;
        observacion.dataset.codigo = codigo;
        observacion.dataset.index = String(indice);
        observacion.setAttribute('aria-label', `${info.nombre}: observacion del paso ${indice + 1}`);

        contenido.append(texto, timestamp, observacion);
        etiqueta.append(checkbox, numero, contenido);
        item.appendChild(etiqueta);

        evidencia.className = 'checklist-evidence';
        evidenciaAcciones.className = 'checklist-evidence-actions';
        fotoLabel.className = 'photo-capture-btn';
        fotoLabel.textContent = pasoEstado.foto ? 'Cambiar foto' : 'Tomar foto';
        fotoInput.type = 'file';
        fotoInput.accept = 'image/*';
        fotoInput.capture = 'environment';
        fotoInput.dataset.codigo = codigo;
        fotoInput.dataset.index = String(indice);
        fotoInput.setAttribute('aria-label', `${info.nombre}: tomar foto del paso ${indice + 1}`);
        fotoLabel.appendChild(fotoInput);

        fotoEstado.className = 'photo-status';
        fotoEstado.textContent = pasoEstado.foto ? 'Foto adjunta' : 'Sin foto adjunta';
        evidenciaAcciones.append(fotoLabel, fotoEstado);
        evidencia.appendChild(evidenciaAcciones);

        const fuenteFoto = pasoEstado.foto?.dataUrl || pasoEstado.foto?.url || '';
        if (fuenteFoto) {
            const preview = document.createElement('img');
            const quitar = document.createElement('button');

            preview.className = 'photo-preview';
            preview.src = fuenteFoto;
            preview.alt = `Evidencia fotografica del paso ${indice + 1}`;

            quitar.className = 'remove-photo-btn';
            quitar.type = 'button';
            quitar.dataset.codigo = codigo;
            quitar.dataset.index = String(indice);
            quitar.textContent = 'Quitar foto';

            evidencia.append(preview, quitar);
        }

        item.appendChild(evidencia);
        lista.appendChild(item);
    });

    controles
        .filter(control => control.posicion !== 'antes')
        .forEach(agregarControl);

    if (info.notaChecklist) {
        const item = document.createElement('li');
        const etiqueta = document.createElement('strong');
        const texto = document.createElement('span');

        item.className = 'checklist-note';
        etiqueta.textContent = 'Nota operativa';
        texto.textContent = info.notaChecklist;

        item.append(etiqueta, texto);
        lista.appendChild(item);
    }
}

function actualizarProgresoChecklist(codigo) {
    const progreso = obtenerElemento('checklistProgressText');
    const estado = obtenerEstadoChecklist(codigo);

    if (!progreso || !estado) {
        return;
    }

    const pasosChecklist = obtenerPasosChecklist(codigo, estado);
    const completadas = estado.pasos.filter(paso => paso.completado).length;
    progreso.textContent = `${completadas} de ${pasosChecklist.length}`;
}

function actualizarPasoChecklistEnPantalla(codigo, indice) {
    const estado = obtenerEstadoChecklist(codigo);
    const pasoEstado = estado?.pasos[indice];
    const checkbox = document.getElementById(`check-${codigo}-${indice}`);
    const item = checkbox?.closest('.checklist-item');
    const timestamp = item?.querySelector('.checklist-timestamp');

    if (!pasoEstado || !checkbox || !timestamp) {
        return;
    }

    checkbox.checked = Boolean(pasoEstado.completado);

    if (pasoEstado.completadoEn) {
        const fechaHoraTexto = formatearFechaHoraISO(pasoEstado.completadoEn);
        timestamp.dateTime = pasoEstado.completadoEn;
        timestamp.textContent = fechaHoraTexto ? `Hecho ${fechaHoraTexto}` : 'Hecho';
    } else {
        timestamp.removeAttribute('datetime');
        timestamp.textContent = 'Pendiente';
    }
}

function guardarHistorial() {
    guardarEstadoLocalStorage(obtenerClaveLocalPorSede(STORAGE_KEYS.history), historial);
}

function agregarAlHistorial(codigo, encargado) {
    const info = codigosEmergencia[codigo];
    const tiempo = obtenerFechaHoraActual();
    const estado = obtenerEstadoChecklist(codigo);
    const cerradoEn = estado?.cerradoEn || tiempo.iso;

    const entrada = {
        codigo,
        nombre: info.nombre,
        descripcion: info.descripcion,
        fecha: tiempo.fecha,
        hora: tiempo.hora,
        encargado: encargado || '',
        modo: estado?.modo || 'real',
        prioridad: estado?.prioridad || 'media',
        sede: obtenerSedeActual() || '',
        activadoEn: estado?.activadoEn || tiempo.iso,
        cerradoEn
    };

    historial.unshift(entrada);

    historial = historial.slice(0, MAX_HISTORIAL);
    guardarHistorial();
    actualizarHistorialUI();
    actualizarResumenUI();
    guardarRegistroRemoto(entrada, estado);
}

function actualizarHistorialUI() {
    const lista = obtenerElemento('historyList');
    limpiarElemento(lista);
    const entradasFiltradas = filtrarHistorial();

    if (historial.length === 0) {
        const itemVacio = document.createElement('li');
        itemVacio.className = 'history-empty';
        itemVacio.textContent = 'Sin codigos finalizados registrados';
        lista.appendChild(itemVacio);
        return;
    }

    if (entradasFiltradas.length === 0) {
        const itemVacio = document.createElement('li');
        itemVacio.className = 'history-empty';
        itemVacio.textContent = 'Sin resultados para los filtros seleccionados';
        lista.appendChild(itemVacio);
        return;
    }

    entradasFiltradas.forEach(entrada => {
        const li = document.createElement('li');
        const fecha = document.createElement('span');
        const detalle = document.createElement('span');
        const nombre = document.createElement('span');
        const descripcion = document.createElement('span');
        const encargado = document.createElement('span');
        const meta = document.createElement('span');

        fecha.className = 'history-datetime';
        fecha.textContent = `${entrada.fecha || ''} ${entrada.hora || ''}`.trim();

        detalle.className = 'history-detail';

        nombre.className = 'history-code';
        nombre.textContent = entrada.nombre;
        nombre.style.backgroundColor = codigosEmergencia[entrada.codigo].color;

        descripcion.className = 'history-description';
        descripcion.textContent = entrada.descripcion || '';

        meta.className = 'history-meta';
        meta.textContent = `${etiquetasModo[entrada.modo] || 'Emergencia real'} · Prioridad ${etiquetasPrioridad[entrada.prioridad] || 'Media'} · ${entrada.cerradoEn ? `Cerrado ${obtenerDuracionTexto(entrada.activadoEn, entrada.cerradoEn)}` : 'En curso'}`;

        detalle.append(nombre, descripcion, meta);

        if (entrada.encargado) {
            encargado.className = 'history-responsible';
            encargado.textContent = `Encargado: ${entrada.encargado}`;
        } else {
            encargado.className = 'history-responsible muted';
            encargado.textContent = 'Encargado: pendiente';
        }

        li.append(fecha, detalle, encargado);
        lista.appendChild(li);
    });
}

function obtenerFechaFiltroHistorial(entrada) {
    const fuente = entrada.cerradoEn || entrada.activadoEn;

    if (!fuente) {
        return '';
    }

    const fecha = new Date(fuente);

    if (Number.isNaN(fecha.getTime())) {
        return '';
    }

    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function filtrarHistorial() {
    const texto = filtrosHistorial.texto.trim().toLowerCase();

    return historial.filter(entrada => {
        if (filtrosHistorial.fecha && obtenerFechaFiltroHistorial(entrada) !== filtrosHistorial.fecha) {
            return false;
        }

        if (filtrosHistorial.codigo && entrada.codigo !== filtrosHistorial.codigo) {
            return false;
        }

        if (filtrosHistorial.modo && entrada.modo !== filtrosHistorial.modo) {
            return false;
        }

        if (filtrosHistorial.prioridad && entrada.prioridad !== filtrosHistorial.prioridad) {
            return false;
        }

        if (!texto) {
            return true;
        }

        const contenido = [
            entrada.nombre,
            entrada.descripcion,
            entrada.encargado,
            etiquetasModo[entrada.modo],
            etiquetasPrioridad[entrada.prioridad]
        ].join(' ').toLowerCase();

        return contenido.includes(texto);
    });
}

function poblarFiltroCodigos() {
    const select = obtenerElemento('historyFilterCode');

    if (!select) {
        return;
    }

    ordenCodigos.forEach(codigo => {
        const option = document.createElement('option');
        option.value = codigo;
        option.textContent = codigosEmergencia[codigo].nombre;
        select.appendChild(option);
    });
}

function actualizarFiltrosHistorial() {
    filtrosHistorial = {
        fecha: obtenerElemento('historyFilterDate')?.value || '',
        codigo: obtenerElemento('historyFilterCode')?.value || '',
        modo: obtenerElemento('historyFilterMode')?.value || '',
        prioridad: obtenerElemento('historyFilterPriority')?.value || '',
        texto: obtenerElemento('historyFilterText')?.value || ''
    };

    actualizarHistorialUI();
}

function limpiarFiltrosHistorial() {
    ['historyFilterDate', 'historyFilterCode', 'historyFilterMode', 'historyFilterPriority', 'historyFilterText'].forEach(id => {
        const elemento = obtenerElemento(id);
        if (elemento) {
            elemento.value = '';
        }
    });

    actualizarFiltrosHistorial();
}

function alternarFiltrosHistorial() {
    const panel = obtenerElemento('historyFilters');
    const boton = obtenerElemento('toggleHistoryFilters');

    if (!panel || !boton) {
        return;
    }

    const mostrar = panel.hidden;
    panel.hidden = !mostrar;
    boton.setAttribute('aria-expanded', String(mostrar));
    boton.textContent = mostrar ? 'Ocultar busqueda' : 'Buscar codigo finalizado';

    if (mostrar) {
        obtenerElemento('historyFilterText')?.focus();
    }
}

function alternarPanelActividad() {
    const panel = obtenerElemento('activityPanel');
    const boton = obtenerElemento('toggleActivityPanel');

    if (!panel || !boton) {
        return;
    }

    const mostrar = panel.hidden;
    panel.hidden = !mostrar;
    boton.setAttribute('aria-expanded', String(mostrar));
    boton.textContent = mostrar ? 'Ocultar historial' : 'Historial de actividades';

    if (mostrar) {
        actualizarResumenUI();
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function actualizarResumenUI() {
    const contenedor = obtenerElemento('summaryGrid');

    if (!contenedor) {
        return;
    }

    limpiarElemento(contenedor);

    const hoy = dateFormatter.format(new Date());
    const registrosHoy = historial.filter(entrada => entrada.fecha === hoy).length;
    const cerradas = historial.filter(entrada => entrada.cerradoEn);
    const duraciones = cerradas
        .map(entrada => {
            const inicio = new Date(entrada.activadoEn);
            const fin = new Date(entrada.cerradoEn);
            return Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime()) || fin < inicio
                ? null
                : fin - inicio;
        })
        .filter(valor => typeof valor === 'number');
    const promedioMs = duraciones.length
        ? Math.round(duraciones.reduce((total, valor) => total + valor, 0) / duraciones.length)
        : null;
    const codigoActivoTexto = codigoActivo && codigosEmergencia[codigoActivo]
        ? codigosEmergencia[codigoActivo].nombre
        : 'Sin codigo activo';
    const ultimoCodigo = historial[0]?.nombre || 'Sin registros';

    [
        ['Hoy', String(registrosHoy), 'codigos finalizados'],
        ['En curso', codigoActivoTexto, 'seguimiento actual'],
        ['Ultima actividad', ultimoCodigo, historial[0]?.cerradoEn ? 'cerrada correctamente' : historial[0] ? 'pendiente de cierre' : 'sin movimientos'],
        ['Tiempo prom.', promedioMs ? formatearDuracionMs(promedioMs) : 'Sin cierres', `${cerradas.length} cierre(s) registrados`]
    ].forEach(([titulo, valor, detalle]) => {
        const tarjeta = document.createElement('article');
        const etiqueta = document.createElement('span');
        const numero = document.createElement('strong');
        const descripcion = document.createElement('span');

        tarjeta.className = 'summary-card';
        etiqueta.textContent = titulo;
        numero.textContent = valor;
        descripcion.textContent = detalle;

        tarjeta.append(etiqueta, numero, descripcion);
        contenedor.appendChild(tarjeta);
    });

    actualizarActividadGeneralUI();
}

function actualizarActividadGeneralUI() {
    const contenedor = obtenerElemento('activityLog');
    if (!contenedor) {
        return;
    }

    limpiarElemento(contenedor);

    const guiasVisibles = guiasOperativas.filter(usuarioPuedeVerGuia);
    const totalGuias = guiasVisibles.length;
    const revisadas = guiasVisibles.filter(guia => progresoGuias[guia.id]?.revisada).length;
    const ultimasGuias = guiasVisibles.slice(0, 3);
    const entradas = [
        `Guias operativas: ${totalGuias}. Revisadas en este dispositivo: ${revisadas}.`,
        ...ultimasGuias.map(guia => `Guia reciente en ${guia.modulo}: ${guia.titulo}.`)
    ];

    if (!entradas.length) {
        return;
    }

    entradas.forEach(texto => {
        const item = document.createElement('div');
        item.className = 'activity-log-item';
        item.textContent = texto;
        contenedor.appendChild(item);
    });
}

function limpiarHistorial() {
    historial = [];
    guardarHistorial();
    actualizarHistorialUI();
    actualizarResumenUI();
}

function escaparHTML(valor) {
    return String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function obtenerLogoReporteURL() {
    return new URL('assets/urbapark-logo.png', window.location.href).href;
}

function crearContenidoPdfGuias(guias) {
    const etiquetasModulo = {
        mantenimiento: 'Mantenimiento',
        operaciones: 'Operaciones',
        caja: 'Caja',
        ronda: 'Ronda'
    };
    const fechaGeneracion = formatearFechaHoraISO(new Date().toISOString());
    const logoURL = obtenerLogoReporteURL();
    const secciones = guias.map((guia, indiceGuia) => {
        const pasos = guia.pasos.map((paso, indicePaso) => {
            const fuenteFoto = obtenerFuenteFotoGuia(paso.foto);
            const foto = fuenteFoto
                ? `<img src="${escaparHTML(fuenteFoto)}" alt="Foto de la tarea ${indicePaso + 1}">`
                : '';
            const claseFoto = foto ? ' class="has-photo"' : '';

            return `
                <li${claseFoto}>
                    <div class="step-copy">
                        <h3>${escaparHTML(paso.titulo || `Tarea ${indicePaso + 1}`)}</h3>
                        <p>${escaparHTML(paso.descripcion)}</p>
                    </div>
                    ${foto}
                </li>
            `;
        }).join('');

        return `
            <article class="guide${indiceGuia === 0 ? ' first-guide' : ''}">
                <header class="guide-header">
                    <div>
                        <p class="module">${escaparHTML(`${etiquetasModulo[guia.modulo] || guia.modulo} - ${obtenerTextoSedesGuia(guia)}`)}</p>
                        <h2>${escaparHTML(guia.titulo)}</h2>
                        ${guia.descripcion ? `<p class="description">${escaparHTML(guia.descripcion)}</p>` : ''}
                        <p class="generated">Generado: ${escaparHTML(fechaGeneracion)}</p>
                    </div>
                    <img class="guide-logo" src="${escaparHTML(logoURL)}" alt="UrbaPark">
                </header>
                <ol>${pasos}</ol>
                <footer>Guia ${indiceGuia + 1} de ${guias.length}</footer>
            </article>
        `;
    }).join('');

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escaparHTML(guias.length === 1 ? guias[0].titulo : 'Guias operativas UrbaPark')}</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 28px; color: #172033; font-family: Arial, sans-serif; background: #eef5f8; }
        main { max-width: 920px; margin: 0 auto; }
        .actions { margin-bottom: 18px; text-align: right; }
        button { min-height: 42px; padding: 10px 16px; border: 0; border-radius: 6px; background: #1474a8; color: #fff; font-weight: 700; cursor: pointer; }
        .guide { padding: 28px; border: 1px solid #ccd8df; border-top: 8px solid #f04b23; border-radius: 8px; background: #fff; }
        .guide-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; padding-bottom: 18px; border-bottom: 1px solid #dce5ea; }
        .guide-logo { width: 180px; max-width: 38%; height: auto; object-fit: contain; }
        h1, h2, h3, p { margin-top: 0; }
        h1 { margin-bottom: 8px; color: #1474a8; font-size: 30px; }
        h2 { margin-bottom: 8px; color: #172033; font-size: 26px; }
        h3 { margin-bottom: 6px; font-size: 17px; }
        .generated, .description { color: #526273; line-height: 1.5; }
        .module { display: inline-block; margin-bottom: 12px; padding: 5px 9px; border-radius: 4px; background: #e7f5fb; color: #0f668f; font-size: 12px; font-weight: 800; text-transform: uppercase; }
        .guide { margin-bottom: 22px; }
        ol { margin: 22px 0 0; padding-left: 28px; }
        li { margin-bottom: 14px; padding: 14px; border: 1px solid #dce5ea; border-radius: 7px; background: #f8fbfc; break-inside: avoid; }
        li.has-photo { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 240px); gap: 18px; }
        li::marker { color: #f04b23; font-weight: 800; }
        li p { margin-bottom: 0; line-height: 1.55; white-space: pre-wrap; }
        li img { width: 100%; max-height: 180px; border-radius: 6px; object-fit: cover; }
        footer { margin-top: 18px; padding-top: 12px; border-top: 1px solid #dce5ea; color: #667785; font-size: 12px; text-align: right; }
        @media (max-width: 620px) { li.has-photo { grid-template-columns: 1fr; } }
        @page { size: A4; margin: 14mm; }
        @media print {
            body { padding: 0; background: #fff; }
            .actions { display: none; }
            .guide { padding: 0; border-right: 0; border-bottom: 0; border-left: 0; box-shadow: none; }
            .guide:not(.first-guide) { break-before: page; }
        }
    </style>
</head>
<body>
    <main>
        <div class="actions"><button type="button" onclick="window.print()">Imprimir / guardar PDF</button></div>
        ${secciones}
    </main>
</body>
</html>`;
}

function generarPdfGuia(id) {
    const guia = guiasOperativas.find(item => item.id === id);
    if (!guia) {
        mostrarToast('No se encontro la guia seleccionada.');
        return;
    }

    const ventana = window.open('', '_blank');
    if (!ventana) {
        mostrarToast('Permite ventanas emergentes para generar el PDF.');
        return;
    }

    const html = crearContenidoPdfGuias([guia]);
    ventana.addEventListener('load', () => {
        ventana.setTimeout(() => ventana.print(), 500);
    }, { once: true });
    ventana.document.open();
    ventana.document.write(html);
    ventana.document.close();
    ventana.focus();
}

function crearContenidoInforme(codigo) {
    const info = codigosEmergencia[codigo];
    const estado = obtenerEstadoChecklist(codigo);
    const generacion = obtenerFechaHoraActual();
    const ultimaActivacion = historial.find(entrada => entrada.codigo === codigo);
    const pasosChecklist = obtenerPasosChecklist(codigo, estado);
    const total = pasosChecklist.length;
    const completadas = estado.pasos.filter(paso => paso.completado).length;
    const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;
    const encargado = estado.encargado || ultimaActivacion?.encargado || 'Pendiente';
    const fechaActivacion = estado.activadoEn
        ? formatearFechaHoraISO(estado.activadoEn)
        : ultimaActivacion
            ? `${ultimaActivacion.fecha || ''} ${ultimaActivacion.hora || ''}`.trim()
            : 'Sin activacion registrada';
    const fechaCierre = estado.cerradoEn ? formatearFechaHoraISO(estado.cerradoEn) : 'En curso';
    const duracion = obtenerDuracionTexto(estado.activadoEn, estado.cerradoEn);
    const logoURL = obtenerLogoReporteURL();

    const filas = pasosChecklist.map((paso, indice) => {
        const pasoEstado = estado.pasos[indice] || { completado: false, completadoEn: null };
        const estadoTexto = pasoEstado.completado ? 'Completado' : 'Pendiente';
        const hora = pasoEstado.completadoEn ? formatearFechaHoraISO(pasoEstado.completadoEn) : '-';
        const observacion = pasoEstado.observacion || '-';
        const fuenteFoto = pasoEstado.foto?.dataUrl || pasoEstado.foto?.url || '';
        const foto = fuenteFoto
            ? `<img class="evidence-photo" src="${fuenteFoto}" alt="Evidencia fotografica del paso ${indice + 1}">`
            : '-';

        return `
            <tr>
                <td>${indice + 1}</td>
                <td>${escaparHTML(paso)}</td>
                <td>${estadoTexto}</td>
                <td>${escaparHTML(hora)}</td>
                <td>${escaparHTML(observacion)}</td>
                <td>${foto}</td>
            </tr>
        `;
    }).join('');
    const controlesFilas = (info.controles || []).map(control => {
        const controlEstado = estado.controles?.[control.id] || { valor: '', actualizadoEn: null };
        const respuesta = controlEstado.valor || 'Pendiente';
        const hora = controlEstado.actualizadoEn ? formatearFechaHoraISO(controlEstado.actualizadoEn) : '-';

        return `
            <tr>
                <td>${escaparHTML(control.pregunta)}</td>
                <td>${escaparHTML(respuesta)}</td>
                <td>${escaparHTML(hora)}</td>
            </tr>
        `;
    }).join('');
    const seccionControles = controlesFilas
        ? `
        <h2>Datos adicionales</h2>
        <table>
            <thead>
                <tr>
                    <th>Registro</th>
                    <th>Respuesta</th>
                    <th>Fecha y hora</th>
                </tr>
            </thead>
            <tbody>${controlesFilas}</tbody>
        </table>
        `
        : '';
    const seccionNota = info.notaChecklist
        ? `
        <section class="note">
            <strong>Nota operativa</strong>
            <p>${escaparHTML(info.notaChecklist)}</p>
        </section>
        `
        : '';

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Informe ${escaparHTML(info.nombre)}</title>
    <style>
        body {
            margin: 0;
            padding: 28px;
            color: #101828;
            font-family: Arial, sans-serif;
            background: #f8fafc;
        }

        main {
            max-width: 980px;
            margin: 0 auto;
            padding: 28px;
            border: 1px solid #d0d5dd;
            border-top: 10px solid ${info.color};
            border-radius: 8px;
            background: #ffffff;
        }

        .report-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 18px;
            margin-bottom: 18px;
            padding-bottom: 18px;
            border-bottom: 1px solid #d0d5dd;
        }

        .report-logo {
            width: 180px;
            height: auto;
            object-fit: contain;
        }

        h1,
        h2 {
            margin: 0;
        }

        h1 {
            color: ${info.color};
            font-size: 30px;
        }

        h2 {
            margin-top: 26px;
            font-size: 20px;
        }

        .meta,
        .summary {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            margin-top: 20px;
        }

        .box {
            padding: 14px;
            border: 1px solid #eaecf0;
            border-radius: 8px;
            background: #f8fafc;
        }

        .label {
            display: block;
            color: #475467;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
        }

        .value {
            display: block;
            margin-top: 6px;
            font-size: 16px;
            font-weight: 700;
        }

        .concept {
            margin-top: 20px;
            padding: 18px;
            border-radius: 8px;
            background: ${info.color};
            color: #ffffff;
        }

        .note {
            margin-top: 18px;
            padding: 16px;
            border: 2px solid #f79009;
            border-radius: 8px;
            background: #fffaeb;
        }

        .note strong {
            color: #93370d;
            text-transform: uppercase;
        }

        table {
            width: 100%;
            margin-top: 14px;
            border-collapse: collapse;
        }

        th,
        td {
            padding: 10px;
            border: 1px solid #d0d5dd;
            text-align: left;
            vertical-align: top;
        }

        th {
            background: #eef2f6;
        }

        .evidence-photo {
            display: block;
            width: 120px;
            max-height: 90px;
            object-fit: cover;
            border: 1px solid #d0d5dd;
            border-radius: 6px;
        }

        .actions {
            margin-bottom: 18px;
            text-align: right;
        }

        button {
            min-height: 40px;
            padding: 9px 14px;
            border: 0;
            border-radius: 6px;
            background: #1474a8;
            color: #ffffff;
            font-weight: 700;
            cursor: pointer;
        }

        @media print {
            body {
                padding: 0;
                background: #ffffff;
            }

            main {
                border: 0;
                border-top: 8px solid ${info.color};
            }

            .actions {
                display: none;
            }
        }
    </style>
</head>
<body>
    <main>
        <div class="actions">
            <button type="button" onclick="window.print()">Imprimir / guardar PDF</button>
        </div>
        <header class="report-header">
            <div>
                <h1>${escaparHTML(info.nombre)}</h1>
                <p>${escaparHTML(info.descripcion)}</p>
            </div>
            <img class="report-logo" src="${escaparHTML(logoURL)}" alt="UrbaPark">
        </header>
        <section class="meta">
            <div class="box">
                <span class="label">Fecha y hora de activacion</span>
                <span class="value">${escaparHTML(fechaActivacion)}</span>
            </div>
            <div class="box">
                <span class="label">Fecha y hora de cierre</span>
                <span class="value">${escaparHTML(fechaCierre)}</span>
            </div>
            <div class="box">
                <span class="label">Encargado</span>
                <span class="value">${escaparHTML(encargado)}</span>
            </div>
            <div class="box">
                <span class="label">Modo</span>
                <span class="value">${escaparHTML(etiquetasModo[estado.modo] || 'Emergencia real')}</span>
            </div>
            <div class="box">
                <span class="label">Prioridad</span>
                <span class="value">${escaparHTML(etiquetasPrioridad[estado.prioridad] || 'Media')}</span>
            </div>
            <div class="box">
                <span class="label">Sede</span>
                <span class="value">${escaparHTML(obtenerNombreSede(obtenerSedeActual()))}</span>
            </div>
            <div class="box">
                <span class="label">Duracion</span>
                <span class="value">${escaparHTML(duracion)}</span>
            </div>
            <div class="box">
                <span class="label">Generado</span>
                <span class="value">${escaparHTML(`${generacion.fecha} ${generacion.hora}`)}</span>
            </div>
            <div class="box">
                <span class="label">Avance</span>
                <span class="value">${completadas} de ${total} (${porcentaje}%)</span>
            </div>
        </section>
        <section class="concept">
            <strong>${escaparHTML(info.concepto.titulo)}</strong>
            <p>${escaparHTML(info.concepto.foco)}</p>
        </section>
        ${seccionNota}
        <h2>Checklist operativo</h2>
        <table>
            <thead>
                <tr>
                    <th>Paso</th>
                    <th>Actividad</th>
                    <th>Estado</th>
                    <th>Fecha y hora</th>
                    <th>Observacion</th>
                    <th>Foto</th>
                </tr>
            </thead>
            <tbody>${filas}</tbody>
        </table>
        ${seccionControles}
    </main>
</body>
</html>`;
}

function descargarInforme(codigo, html) {
    const nombreCodigo = codigo.replace(/[^a-z0-9-]/gi, '-');
    const fecha = new Date().toISOString().slice(0, 10);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');

    enlace.href = url;
    enlace.download = `informe-${nombreCodigo}-${fecha}.html`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
}

function generarInformeActual() {
    if (!codigoActivo) {
        return;
    }

    const html = crearContenidoInforme(codigoActivo);
    const ventana = window.open('', '_blank');

    if (ventana) {
        ventana.document.open();
        ventana.document.write(html);
        ventana.document.close();
    }

    descargarInforme(codigoActivo, html);
}

function actualizarEstadoChecklist(codigo, indice, valor) {
    const estado = obtenerEstadoChecklist(codigo);

    if (!estado || !estado.pasos[indice]) {
        return;
    }

    estado.pasos[indice].completado = valor;
    estado.pasos[indice].completadoEn = valor ? obtenerFechaHoraActual().iso : null;
    guardarChecklistEstado();
    programarSincronizacionEstadoOperativo(100);

    if (valor) {
        reproducirSonidoAprobado();
    }

    if (codigoActivo === codigo) {
        actualizarPasoChecklistEnPantalla(codigo, indice);
        actualizarProgresoChecklist(codigo);
        actualizarEncargadoUI(codigo);
    }
}

function actualizarObservacionChecklist(codigo, indice, valor) {
    const estado = obtenerEstadoChecklist(codigo);

    if (!estado || !estado.pasos[indice]) {
        return;
    }

    estado.pasos[indice].observacion = valor;
    guardarChecklistEstado();
    programarSincronizacionEstadoOperativo(700);
}

function comprimirFoto(file, maxDimension = 960, calidad = 0.72) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onerror = () => reject(new Error('No se pudo leer la foto.'));
        reader.onload = () => {
            const imagen = new Image();

            imagen.onerror = () => reject(new Error('No se pudo procesar la foto.'));
            imagen.onload = () => {
                const escala = Math.min(1, maxDimension / Math.max(imagen.width, imagen.height));
                const ancho = Math.max(1, Math.round(imagen.width * escala));
                const alto = Math.max(1, Math.round(imagen.height * escala));
                const canvas = document.createElement('canvas');
                const contexto = canvas.getContext('2d');

                canvas.width = ancho;
                canvas.height = alto;
                contexto.drawImage(imagen, 0, 0, ancho, alto);
                resolve(canvas.toDataURL('image/jpeg', calidad));
            };

            imagen.src = reader.result;
        };

        reader.readAsDataURL(file);
    });
}

function obtenerClaveFotoCodigo(codigo, indice, activadoEn = '') {
    const sede = obtenerSedeActual() || 'sin-sede';
    const activacion = activadoEn || 'actual';
    return `codigo:${sede}:${codigo}:${activacion}:${indice}`;
}

async function obtenerUrlRemotaFoto(path) {
    if (!path || !supabaseClient) return '';
    const { data, error } = await supabaseClient.storage
        .from(OPERATIONS_CHECKLIST_BUCKET)
        .createSignedUrl(path, 60 * 60);
    return error ? '' : data?.signedUrl || '';
}

async function hidratarFotosChecklistCodigos() {
    if (hidratandoFotosCodigos) return;
    hidratandoFotosCodigos = true;
    let huboCambios = false;
    try {
        for (const estado of Object.values(checklistEstado || {})) {
            for (const paso of estado?.pasos || []) {
                const foto = paso?.foto;
                if (!foto || foto.dataUrl || foto.url) continue;
                try {
                    const local = await leerMediaLocal(foto.storageKey);
                    if (local?.dataUrl) {
                        foto.dataUrl = local.dataUrl;
                        huboCambios = true;
                        continue;
                    }
                    const url = await obtenerUrlRemotaFoto(foto.path);
                    if (url) {
                        foto.url = url;
                        huboCambios = true;
                    }
                } catch (error) {
                    console.warn('No se pudo recuperar una evidencia de codigo:', error);
                }
            }
        }
    } finally {
        hidratandoFotosCodigos = false;
    }
    if (huboCambios && codigoActivo) actualizarChecklistUI(codigoActivo);
}

async function sincronizarFotoCodigo(codigo, indice, foto, pathAnterior = '') {
    if (!foto?.dataUrl || !supabaseClient || !sesionActual?.user || !obtenerSedeActual()) return;
    try {
        const blob = await fetch(foto.dataUrl).then(respuesta => respuesta.blob());
        const activacion = String(obtenerEstadoChecklist(codigo)?.activadoEn || Date.now()).replace(/[^0-9A-Za-z_-]/g, '-');
        const ruta = `${obtenerSedeActual()}/${sesionActual.user.id}/codigos/${codigo}/${activacion}/paso-${indice + 1}-${Date.now()}.jpg`;
        const { error } = await supabaseClient.storage
            .from(OPERATIONS_CHECKLIST_BUCKET)
            .upload(ruta, blob, { contentType: 'image/jpeg', upsert: false });
        if (error) throw error;
        foto.path = ruta;
        const estadoActual = obtenerEstadoChecklist(codigo);
        if (estadoActual?.pasos?.[indice]) {
            estadoActual.pasos[indice].foto = {
                ...(estadoActual.pasos[indice].foto || {}),
                ...foto,
                path: ruta
            };
        }
        if (pathAnterior && pathAnterior !== ruta) {
            await supabaseClient.storage.from(OPERATIONS_CHECKLIST_BUCKET).remove([pathAnterior]);
        }
        guardarChecklistEstado();
        programarSincronizacionEstadoOperativo(100);
    } catch (error) {
        console.warn('La foto de codigo queda protegida localmente y pendiente de sincronizar:', error);
    }
}

async function actualizarFotoChecklist(codigo, indice, foto) {
    const estado = obtenerEstadoChecklist(codigo);

    if (!estado || !estado.pasos[indice]) {
        return;
    }

    const anterior = estado.pasos[indice].foto;
    if (foto?.dataUrl) {
        foto.storageKey = foto.storageKey || obtenerClaveFotoCodigo(codigo, indice, estado.activadoEn);
        await guardarMediaLocal(foto.storageKey, foto.dataUrl, 'codigo', { codigo, indice });
    }
    estado.pasos[indice].foto = foto;
    guardarChecklistEstado();
    programarSincronizacionEstadoOperativo(100);

    if (!foto && anterior?.storageKey) {
        eliminarMediaLocal(anterior.storageKey).catch(error => console.warn('No se pudo retirar el respaldo anterior:', error));
        if (anterior.path && supabaseClient) {
            supabaseClient.storage.from(OPERATIONS_CHECKLIST_BUCKET).remove([anterior.path])
                .catch(error => console.warn('No se pudo retirar la foto remota anterior:', error));
        }
    } else if (foto) {
        sincronizarFotoCodigo(codigo, indice, foto, anterior?.path || '');
    }

    if (codigoActivo === codigo) {
        actualizarChecklistUI(codigo);
        actualizarEncargadoUI(codigo);
    }
}

function actualizarControlChecklist(codigo, controlId, valor) {
    const estado = obtenerEstadoChecklist(codigo);

    if (!estado || !estado.controles || !estado.controles[controlId]) {
        return;
    }

    const valorAnterior = estado.controles[controlId].valor;
    estado.controles[controlId].valor = valor;
    estado.controles[controlId].actualizadoEn = obtenerFechaHoraActual().iso;

    if (codigosEmergencia[codigo].checklistsCondicionales?.[controlId] && valorAnterior !== valor) {
        sincronizarPasosChecklist(codigo, estado, true);
    }

    guardarChecklistEstado();
    programarSincronizacionEstadoOperativo(100);

    if (codigoActivo === codigo) {
        actualizarChecklistUI(codigo);
        actualizarEncargadoUI(codigo);
    }
}

function finalizarCodigoActual() {
    if (!codigoActivo) {
        return;
    }

    const estado = obtenerEstadoChecklist(codigoActivo);

    if (!estado || estado.cerradoEn) {
        return;
    }

    if (!estaChecklistCompleto(codigoActivo, estado)) {
        const hint = obtenerElemento('responsibleHint');
        if (hint) {
            hint.textContent = 'Antes de finalizar, completa todas las tareas del checklist.';
        }
        return;
    }

    if (!tieneEncargadoRegistrado(estado)) {
        const hint = obtenerElemento('responsibleHint');
        const input = obtenerElemento('responsibleName');
        if (hint) {
            hint.textContent = 'Antes de finalizar, coloca el nombre de la persona a cargo.';
        }
        if (input) {
            input.focus();
        }
        return;
    }

    const tiempo = obtenerFechaHoraActual();
    estado.cerradoEn = tiempo.iso;
    guardarChecklistEstado();
    programarSincronizacionEstadoOperativo(100);
    agregarAlHistorial(codigoActivo, estado.encargado || obtenerNombreEncargadoActual());
    actualizarEncargadoUI(codigoActivo);
    actualizarCodigoActivo(codigoActivo);
    actualizarResumenUI();
}

function reiniciarChecklistActual() {
    if (!codigoActivo) {
        return;
    }

    const estado = obtenerEstadoChecklist(codigoActivo);
    estado.pasos = estado.pasos.map(() => ({
        completado: false,
        completadoEn: null,
        observacion: '',
        foto: null
    }));
    Object.keys(estado.controles || {}).forEach(controlId => {
        estado.controles[controlId] = {
            valor: '',
            actualizadoEn: null
        };
    });
    guardarChecklistEstado();
    programarSincronizacionEstadoOperativo(100);
    actualizarChecklistUI(codigoActivo);
}

function obtenerAudioContexto() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;

        if (!AudioContext) {
            return null;
        }

        if (!window.__codigosAudioContext) {
            window.__codigosAudioContext = new AudioContext();
        }

        if (window.__codigosAudioContext.state === 'suspended') {
            window.__codigosAudioContext.resume();
        }

        return window.__codigosAudioContext;
    } catch (error) {
        console.warn('No se pudo preparar el audio:', error);
        return null;
    }
}

function reproducirTono(frecuencia, duracion = 0.2, volumen = 0.18, tipo = 'sine', retraso = 0) {
    try {
        const audioContext = obtenerAudioContexto();

        if (!audioContext) {
            return;
        }

        const inicio = audioContext.currentTime + retraso;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(frecuencia, inicio);
        oscillator.type = tipo;
        gainNode.gain.setValueAtTime(0.0001, inicio);
        gainNode.gain.exponentialRampToValueAtTime(volumen, inicio + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion);
        oscillator.start(inicio);
        oscillator.stop(inicio + duracion + 0.02);
    } catch (error) {
        console.warn('No se pudo reproducir el sonido:', error);
    }
}

function reproducirSonidoAlerta() {
    reproducirTono(760, 0.22, 0.18, 'sine');
    reproducirTono(980, 0.28, 0.14, 'sine', 0.16);
}

function reproducirSonidoAprobado() {
    reproducirTono(660, 0.12, 0.12, 'triangle');
    reproducirTono(920, 0.18, 0.14, 'triangle', 0.1);
}

function obtenerVozHumanaEspanol() {
    if (!window.speechSynthesis?.getVoices) {
        return null;
    }

    const voces = window.speechSynthesis.getVoices();
    const candidatas = voces.filter(voz => /^es([-_]|$)/i.test(voz.lang));

    return candidatas.find(voz => /natural|online|microsoft|google|paulina|helena|sabina|monica|laura|elvira|alvaro/i.test(voz.name))
        || candidatas.find(voz => /es[-_]?(pe|mx|us|co|cl|ar|419)/i.test(voz.lang))
        || candidatas[0]
        || voces.find(voz => /spanish|espanol/i.test(voz.name))
        || null;
}

function prepararVoces() {
    if (!window.speechSynthesis?.getVoices) {
        return;
    }

    window.speechSynthesis.getVoices();
}

function anunciarCodigo(codigo) {
    const info = codigosEmergencia[codigo];

    if (!info || !window.speechSynthesis || !window.SpeechSynthesisUtterance) {
        return;
    }

    try {
        window.speechSynthesis.cancel();

        const mensaje = new SpeechSynthesisUtterance(`Activando ${info.nombre}.`);
        const voz = obtenerVozHumanaEspanol();

        if (voz) {
            mensaje.voice = voz;
            mensaje.lang = voz.lang;
        } else {
            mensaje.lang = 'es-PE';
        }

        mensaje.rate = 0.92;
        mensaje.pitch = 1.03;
        mensaje.volume = 1;
        window.speechSynthesis.speak(mensaje);
    } catch (error) {
        console.warn('No se pudo anunciar el codigo:', error);
    }
}

const visorLamina = {
    escala: 1,
    escalaAjuste: 1,
    x: 0,
    y: 0,
    ancho: 0,
    alto: 0,
    punteros: new Map(),
    distanciaInicial: 0,
    escalaInicial: 1
};

function aplicarTransformacionLamina() {
    const imagen = obtenerElemento('modalImage');

    imagen.style.transform = `translate(${visorLamina.x}px, ${visorLamina.y}px) scale(${visorLamina.escala})`;

    if (visorLamina.escalaAjuste > 0) {
        obtenerElemento('zoomLevel').textContent = `${Math.round((visorLamina.escala / visorLamina.escalaAjuste) * 100)}%`;
    }
}

function limitarEncuadreLamina() {
    const viewport = obtenerElemento('zoomViewport');
    const anchoVisible = viewport.clientWidth;
    const altoVisible = viewport.clientHeight;
    const anchoEscalado = visorLamina.ancho * visorLamina.escala;
    const altoEscalado = visorLamina.alto * visorLamina.escala;

    visorLamina.x = anchoEscalado <= anchoVisible
        ? (anchoVisible - anchoEscalado) / 2
        : Math.min(0, Math.max(anchoVisible - anchoEscalado, visorLamina.x));

    visorLamina.y = altoEscalado <= altoVisible
        ? (altoVisible - altoEscalado) / 2
        : Math.min(0, Math.max(altoVisible - altoEscalado, visorLamina.y));
}

function escalaMaximaLamina() {
    // Escala 1 = pixeles originales de la lamina. El tope permite pasar de ahi
    // para que el texto del protocolo siga siendo legible en pantallas chicas.
    return Math.max(1, visorLamina.escalaAjuste) * 4;
}

function escalarLamina(objetivo, focoX, focoY) {
    const limitada = Math.min(escalaMaximaLamina(), Math.max(visorLamina.escalaAjuste, objetivo));
    const factor = limitada / visorLamina.escala;

    visorLamina.x = focoX - (focoX - visorLamina.x) * factor;
    visorLamina.y = focoY - (focoY - visorLamina.y) * factor;
    visorLamina.escala = limitada;

    limitarEncuadreLamina();
    aplicarTransformacionLamina();
}

function ajustarLaminaAlVisor() {
    const viewport = obtenerElemento('zoomViewport');
    const imagen = obtenerElemento('modalImage');

    if (!imagen.naturalWidth || !imagen.naturalHeight || !viewport.clientWidth) {
        return;
    }

    visorLamina.ancho = imagen.naturalWidth;
    visorLamina.alto = imagen.naturalHeight;
    imagen.style.width = `${visorLamina.ancho}px`;
    imagen.style.height = `${visorLamina.alto}px`;

    visorLamina.escalaAjuste = Math.min(
        viewport.clientWidth / visorLamina.ancho,
        viewport.clientHeight / visorLamina.alto
    );
    visorLamina.escala = visorLamina.escalaAjuste;

    limitarEncuadreLamina();
    aplicarTransformacionLamina();
}

function prepararVisorLamina() {
    const viewport = obtenerElemento('zoomViewport');
    const imagen = obtenerElemento('modalImage');
    const centro = () => [viewport.clientWidth / 2, viewport.clientHeight / 2];

    imagen.addEventListener('load', ajustarLaminaAlVisor);

    obtenerElemento('zoomIn').addEventListener('click', () => escalarLamina(visorLamina.escala * 1.4, ...centro()));
    obtenerElemento('zoomOut').addEventListener('click', () => escalarLamina(visorLamina.escala / 1.4, ...centro()));
    obtenerElemento('zoomReset').addEventListener('click', ajustarLaminaAlVisor);

    viewport.addEventListener('wheel', evento => {
        evento.preventDefault();

        const rect = viewport.getBoundingClientRect();
        escalarLamina(
            visorLamina.escala * (evento.deltaY < 0 ? 1.18 : 1 / 1.18),
            evento.clientX - rect.left,
            evento.clientY - rect.top
        );
    }, { passive: false });

    viewport.addEventListener('dblclick', evento => {
        const rect = viewport.getBoundingClientRect();
        const ampliada = visorLamina.escala > visorLamina.escalaAjuste * 1.05;

        escalarLamina(
            ampliada ? visorLamina.escalaAjuste : Math.max(1, visorLamina.escalaAjuste * 3),
            evento.clientX - rect.left,
            evento.clientY - rect.top
        );
    });

    viewport.addEventListener('pointerdown', evento => {
        viewport.setPointerCapture(evento.pointerId);
        visorLamina.punteros.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });

        if (visorLamina.punteros.size === 2) {
            const [a, b] = [...visorLamina.punteros.values()];
            visorLamina.distanciaInicial = Math.hypot(a.x - b.x, a.y - b.y);
            visorLamina.escalaInicial = visorLamina.escala;
        }

        viewport.classList.add('is-dragging');
    });

    viewport.addEventListener('pointermove', evento => {
        if (!visorLamina.punteros.has(evento.pointerId)) {
            return;
        }

        const anterior = visorLamina.punteros.get(evento.pointerId);
        visorLamina.punteros.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });

        if (visorLamina.punteros.size >= 2) {
            const [a, b] = [...visorLamina.punteros.values()];
            const distancia = Math.hypot(a.x - b.x, a.y - b.y);

            if (visorLamina.distanciaInicial > 0) {
                const rect = viewport.getBoundingClientRect();
                escalarLamina(
                    visorLamina.escalaInicial * (distancia / visorLamina.distanciaInicial),
                    (a.x + b.x) / 2 - rect.left,
                    (a.y + b.y) / 2 - rect.top
                );
            }

            return;
        }

        visorLamina.x += evento.clientX - anterior.x;
        visorLamina.y += evento.clientY - anterior.y;
        limitarEncuadreLamina();
        aplicarTransformacionLamina();
    });

    ['pointerup', 'pointercancel'].forEach(tipo => {
        viewport.addEventListener(tipo, evento => {
            visorLamina.punteros.delete(evento.pointerId);

            if (visorLamina.punteros.size < 2) {
                visorLamina.distanciaInicial = 0;
            }

            if (!visorLamina.punteros.size) {
                viewport.classList.remove('is-dragging');
            }
        });
    });

    window.addEventListener('resize', () => {
        if (obtenerElemento('codeModal').classList.contains('open')) {
            ajustarLaminaAlVisor();
        }
    });
}

function mostrarLaminaEnModal(fuente, respaldo, textoAlternativo) {
    const imagen = obtenerElemento('modalImage');

    // Si la version a resolucion completa no esta disponible (sin red y sin
    // cache), cae a la version liviana que si viene precargada.
    imagen.onerror = respaldo && respaldo !== fuente
        ? () => {
            imagen.onerror = null;
            imagen.src = respaldo;
        }
        : null;
    imagen.alt = textoAlternativo;
    imagen.src = fuente;
}

function abrirModalCodigo(codigo) {
    const info = codigosEmergencia[codigo];
    if (!info) {
        return;
    }

    const modal = obtenerElemento('codeModal');
    const modalTitle = obtenerElemento('modalTitle');
    const modalImage = obtenerElemento('modalImage');
    const modalSubtitle = obtenerElemento('modalSubtitle');

    modalTitle.textContent = 'Lamina del codigo';
    mostrarLaminaEnModal(info.imagenAmpliada || info.image, info.image, `${info.nombre} - lamina ampliada`);
    modalSubtitle.textContent = `${info.nombre}. ${info.guia}.`;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    // Reabrir la misma lamina no dispara `load`, asi que reencuadra a mano.
    if (modalImage.complete && modalImage.naturalWidth) {
        ajustarLaminaAlVisor();
    }
}

function abrirPreviewFoto(dataUrl, titulo = 'Foto') {
    if (!dataUrl) {
        return;
    }

    const modal = obtenerElemento('codeModal');
    const modalTitle = obtenerElemento('modalTitle');
    const modalImage = obtenerElemento('modalImage');
    const modalSubtitle = obtenerElemento('modalSubtitle');

    modalTitle.textContent = titulo;
    mostrarLaminaEnModal(dataUrl, '', titulo);
    modalSubtitle.textContent = 'Foto referencial de la guia operativa.';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    if (modalImage.complete && modalImage.naturalWidth) {
        ajustarLaminaAlVisor();
    }
}

function cerrarModal() {
    const modal = obtenerElemento('codeModal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
}

function desplazarseALamina() {
    const panel = document.querySelector('.image-panel');
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}

function actualizarInterfazCodigo(codigo) {
    actualizarTarjetasActivas(codigo);
    actualizarCodigoActivo(codigo);
    actualizarEncargadoUI(codigo);
    actualizarLamina(codigo);
    actualizarConceptoVisual(codigo);
    actualizarChecklistUI(codigo);

    const botonInforme = obtenerElemento('generateReport');
    if (botonInforme) {
        botonInforme.disabled = !codigo;
    }
}

function activarCodigo(codigo, opciones = {}) {
    if (!codigosEmergencia[codigo]) {
        return;
    }

    seleccionarModulo('codigos', { desplazar: false });
    const estado = obtenerEstadoChecklist(codigo);
    const tiempo = obtenerFechaHoraActual();

    estado.activadoEn = tiempo.iso;
    estado.cerradoEn = null;
    guardarChecklistEstado();

    codigoActivo = codigo;
    actualizarInterfazCodigo(codigo);

    const encargado = obtenerNombreEncargadoActual();
    guardarEncargadoActual(codigo, encargado);
    reproducirSonidoAlerta();
    anunciarCodigo(codigo);
    desplazarseALamina();
    actualizarResumenUI();
    programarSincronizacionEstadoOperativo(100);
    enviarAlertaPushCodigo(codigo);

    if (opciones.abrirModal) {
        abrirModalCodigo(codigo);
    }
}

function desactivarTodos() {
    codigoActivo = null;
    actualizarTarjetasActivas(null);
    actualizarCodigoActivo(null);
    actualizarEncargadoUI(null);
    actualizarLamina(null);
    actualizarConceptoVisual(null);
    actualizarChecklistUI(null);

    const botonInforme = obtenerElemento('generateReport');
    if (botonInforme) {
        botonInforme.disabled = true;
    }

    actualizarResumenUI();
    programarSincronizacionEstadoOperativo(100);
}

function configurarEventos() {
    const contenedor = obtenerElemento('codesGrid');

    obtenerElemento('authForm').addEventListener('submit', iniciarSesion);
    obtenerElemento('signOutButton').addEventListener('click', cerrarSesion);
    obtenerElemento('changePasswordButton')?.addEventListener('click', () => abrirModalCambioPassword(false));
    obtenerElemento('closePasswordModal')?.addEventListener('click', cerrarModalCambioPassword);
    obtenerElemento('passwordChangeForm')?.addEventListener('submit', cambiarPasswordPersonal);
    obtenerElemento('confirmMandatoryAnnouncement')?.addEventListener('click', confirmarComunicadoObligatorio);
    obtenerElemento('declineMandatoryAnnouncement')?.addEventListener('click', () => {
        const estado = obtenerElemento('mandatoryAnnouncementStatus');
        if (estado) estado.textContent = 'La confirmacion sigue pendiente. Debes leer y confirmar para continuar.';
    });
    obtenerElemento('enableAlertsButton').addEventListener('click', solicitarPermisoAlertas);
    obtenerElemento('remoteAlertOpen').addEventListener('click', abrirChecklistDesdeAlerta);
    obtenerElemento('remoteAlertDismiss').addEventListener('click', cerrarAlertaRemota);
    obtenerElemento('remoteAlertClose').addEventListener('click', cerrarAlertaRemota);
    obtenerElemento('toggleActivityPanel').addEventListener('click', alternarPanelActividad);
    obtenerElemento('toggleThemeButton')?.addEventListener('click', alternarTema);
    obtenerElemento('bottomNav')?.addEventListener('click', manejarNavegacionInferior);
    obtenerElemento('adminGuideForm')?.addEventListener('submit', guardarGuiaOperativa);
    obtenerElemento('guideModule')?.addEventListener('change', () => {
        actualizarCampoSedeGuia();
        programarGuardadoBorradorGuia();
    });
    obtenerElemento('addGuideTask')?.addEventListener('click', agregarTareaBorrador);
    obtenerElemento('cancelGuideEdit')?.addEventListener('click', cancelarEdicionGuia);
    obtenerElemento('refreshUsers')?.addEventListener('click', cargarUsuariosAdmin);
    obtenerElemento('copyResetPassword')?.addEventListener('click', copiarPasswordRestablecida);
    obtenerElemento('closeResetPassword')?.addEventListener('click', ocultarResultadoRestablecimiento);
    obtenerElemento('toggleGuideAdmin')?.addEventListener('click', () => alternarPanelAdmin('guias'));
    obtenerElemento('toggleUsersAdmin')?.addEventListener('click', () => alternarPanelAdmin('usuarios'));
    obtenerElemento('openPasswordResetModule')?.addEventListener('click', () => alternarPanelAdmin('usuarios'));
    obtenerElemento('toggleSystemHealth')?.addEventListener('click', () => alternarPanelAdmin('salud'));
    obtenerElemento('refreshSystemHealth')?.addEventListener('click', cargarSaludSupabase);
    obtenerElemento('createUserForm')?.addEventListener('submit', crearUsuarioDesdeAdmin);
    obtenerElemento('subscriberForm')?.addEventListener('submit', guardarSolicitudAbonado);
    obtenerElemento('openOperationsOccupancy')?.addEventListener('click', () => establecerPanelOcupabilidadOperaciones(true));
    obtenerElemento('closeOperationsOccupancy')?.addEventListener('click', cerrarPanelOcupabilidadOperaciones);
    obtenerElemento('loadOperationsOccupancy')?.addEventListener('click', cargarOcupabilidadDiaria);
    obtenerElemento('exportOperationsOccupancyExcel')?.addEventListener('click', () => exportarCorteOcupabilidadExcel());
    obtenerElemento('shareOperationsOccupancyWhatsApp')?.addEventListener('click', () => exportarCorteOcupabilidadExcel('', true));
    obtenerElemento('operationsOccupancyZones')?.addEventListener('input', event => {
        const campo = event.target.closest('[data-occupancy-zone][data-occupancy-field]');
        if (campo) actualizarZonaOcupabilidadDesdeCampo(campo);
    });
    obtenerElemento('operationsOccupancyZones')?.addEventListener('click', event => {
        const guardar = event.target.closest('[data-save-occupancy-zone]');
        if (guardar) guardarZonaOcupabilidad(guardar.dataset.saveOccupancyZone);
    });
    obtenerElemento('operationsOccupancyHistory')?.addEventListener('click', event => {
        const exportar = event.target.closest('[data-export-occupancy-hour]');
        if (exportar) exportarCorteOcupabilidadExcel(exportar.dataset.exportOccupancyHour);
        const compartir = event.target.closest('[data-share-occupancy-hour]');
        if (compartir) exportarCorteOcupabilidadExcel(compartir.dataset.shareOccupancyHour, true);
    });
    obtenerElemento('openOperationsChecklist')?.addEventListener('click', () => establecerPanelChecklistOperaciones(true));
    obtenerElemento('closeOperationsChecklist')?.addEventListener('click', cerrarPanelChecklistOperaciones);
    obtenerElemento('operationsChecklistForm')?.addEventListener('submit', finalizarChecklistOperaciones);
    obtenerElemento('discardOperationsChecklist')?.addEventListener('click', descartarBorradorChecklistOperaciones);
    obtenerElemento('operationsChecklistSite')?.addEventListener('change', event => cargarBorradorChecklistOperaciones(event.target.value));
    obtenerElemento('operationsChecklistSections')?.addEventListener('change', async event => {
        const fotos = event.target.closest('input[type="file"][data-operations-evidence-input]');
        if (fotos) {
            await adjuntarFotosChecklistOperaciones(fotos.dataset.operationsEvidenceInput, fotos.files);
            fotos.value = '';
            return;
        }
        const resultado = event.target.closest('input[type="radio"][data-operations-item]');
        if (resultado && checklistOperacionesActual) {
            checklistOperacionesActual.respuestas[`${resultado.dataset.operationsSection}:${resultado.dataset.operationsItem}`] = resultado.value;
            actualizarProgresoChecklistOperaciones();
            programarGuardadoChecklistOperaciones();
            return;
        }
    });
    obtenerElemento('operationsChecklistSections')?.addEventListener('input', event => {
        const observacion = event.target.closest('textarea[data-operations-observation]');
        if (!observacion || !checklistOperacionesActual) return;
        checklistOperacionesActual.observaciones[observacion.dataset.operationsObservation] = observacion.value;
        programarGuardadoChecklistOperaciones();
    });
    obtenerElemento('shareLastOperationsChecklist')?.addEventListener('click', () => compartirPdfChecklistOperaciones(ultimoChecklistOperacionesFinalizado));
    obtenerElemento('openOperationsDashboard')?.addEventListener('click', () => establecerPanelDashboardOperaciones(true));
    obtenerElemento('closeOperationsDashboard')?.addEventListener('click', () => establecerPanelDashboardOperaciones(false));
    obtenerElemento('refreshOperationsDashboard')?.addEventListener('click', cargarDashboardOperaciones);
    obtenerElemento('operationsDashboardMonth')?.addEventListener('change', cargarDashboardOperaciones);
    obtenerElemento('operationsDashboardSite')?.addEventListener('change', cargarDashboardOperaciones);
    obtenerElemento('exportOperationsChecklistExcel')?.addEventListener('click', exportarChecklistOperacionesExcel);
    obtenerElemento('operationsChecklistHistory')?.addEventListener('click', event => {
        const boton = event.target.closest('button[data-share-operations-checklist]');
        if (!boton) return;
        compartirPdfChecklistOperaciones(historialChecklistsOperaciones.find(item => item.id === boton.dataset.shareOperationsChecklist));
    });
    obtenerElemento('openOperationsGeneralReport')?.addEventListener('click', () => establecerPanelInformeGeneralOperaciones(true));
    obtenerElemento('closeOperationsGeneralReport')?.addEventListener('click', cerrarPanelInformeGeneralOperaciones);
    obtenerElemento('refreshOperationsGeneralReport')?.addEventListener('click', cargarInformeGeneralOperaciones);
    obtenerElemento('operationsGeneralMonth')?.addEventListener('change', cargarInformeGeneralOperaciones);
    obtenerElemento('exportOperationsGeneralPdf')?.addEventListener('click', exportarInformeGeneralOperacionesPdf);
    obtenerElemento('exportOperationsGeneralPptx')?.addEventListener('click', exportarInformeGeneralOperacionesPptx);
    obtenerElemento('openOperationsAssets')?.addEventListener('click', () => establecerPanelActivosOperaciones(true));
    obtenerElemento('closeOperationsAssets')?.addEventListener('click', () => establecerPanelActivosOperaciones(false));
    obtenerElemento('addOperationsAsset')?.addEventListener('click', () => establecerFormularioActivoOperaciones(true));
    obtenerElemento('exportOperationsAssetsPdf')?.addEventListener('click', generarPdfActivosOperaciones);
    obtenerElemento('exportOperationsAssetsExcel')?.addEventListener('click', exportarActivosOperacionesExcel);
    obtenerElemento('cancelOperationsAsset')?.addEventListener('click', () => establecerFormularioActivoOperaciones(false));
    obtenerElemento('operationsAssetForm')?.addEventListener('submit', guardarActivoOperaciones);
    obtenerElemento('operationsAssetsSearch')?.addEventListener('input', renderizarActivosOperaciones);
    obtenerElemento('operationsAssetsSite')?.addEventListener('change', async () => {
        establecerFormularioActivoOperaciones(false);
        await cargarActivosOperaciones();
        suscribirActivosOperaciones();
    });
    obtenerElemento('operationsAssetsList')?.addEventListener('click', event => {
        const editar = event.target.closest('button[data-edit-operations-asset]');
        if (editar) {
            establecerFormularioActivoOperaciones(
                true,
                activosOperaciones.find(item => item.id === editar.dataset.editOperationsAsset)
            );
            return;
        }
        const eliminar = event.target.closest('button[data-delete-operations-asset]');
        if (eliminar) eliminarActivoOperaciones(eliminar.dataset.deleteOperationsAsset);
    });
    obtenerElemento('subscriberMonth')?.addEventListener('change', cargarSolicitudesAbonados);
    obtenerElemento('subscriberSite')?.addEventListener('change', cargarSolicitudesAbonados);
    obtenerElemento('refreshSubscribers')?.addEventListener('click', cargarSolicitudesAbonados);
    obtenerElemento('subscribersList')?.addEventListener('click', event => {
        const boton = event.target.closest('button[data-update-subscriber]');
        if (boton) actualizarSolicitudAbonado(boton.dataset.updateSubscriber);
    });
    obtenerElemento('openMaintenanceReport')?.addEventListener('click', prepararEnlaceInformeMantenimiento);
    obtenerElemento('maintenanceAccessForm')?.addEventListener('submit', validarAccesoMantenimiento);
    obtenerElemento('lockMaintenanceArea')?.addEventListener('click', bloquearAreaMantenimiento);
    obtenerElemento('refreshInventory')?.addEventListener('click', cargarInventarioRepuestos);
    obtenerElemento('toggleManagementDashboard')?.addEventListener('click', event => {
        establecerDashboardGerencial(event.currentTarget.getAttribute('aria-expanded') !== 'true', { enfocar: true });
    });
    obtenerElemento('closeManagementDashboard')?.addEventListener('click', () => {
        establecerDashboardGerencial(false, { enfocar: true });
    });
    obtenerElemento('managementMonth')?.addEventListener('change', renderizarDashboardGerencial);
    obtenerElemento('exportMonthlyMaintenance')?.addEventListener('click', exportarMantenimientoMensual);
    obtenerElemento('toggleMaintenanceKpis')?.addEventListener('click', event => {
        establecerPanelKpisMantenimiento(event.currentTarget.getAttribute('aria-expanded') !== 'true', { enfocar: true });
    });
    obtenerElemento('closeMaintenanceKpis')?.addEventListener('click', () => {
        establecerPanelKpisMantenimiento(false, { enfocar: true });
    });
    obtenerElemento('inventoryForm')?.addEventListener('submit', guardarRepuestoInventario);
    obtenerElemento('maintenanceTaskForm')?.addEventListener('submit', guardarTareaMantenimiento);
    obtenerElemento('maintenanceTaskSite')?.addEventListener('change', actualizarEquiposAsignacionMantenimiento);
    obtenerElemento('maintenanceTasksMonth')?.addEventListener('change', cargarTareasMantenimiento);
    obtenerElemento('toggleMaintenanceTasks')?.addEventListener('click', () => {
        const panel = obtenerElemento('maintenanceTasksPanel');
        const boton = obtenerElemento('toggleMaintenanceTasks');
        if (!panel || !boton) return;
        const abrir = panel.hidden;
        panel.hidden = !abrir;
        boton.setAttribute('aria-expanded', String(abrir));
        if (abrir) {
            cargarTareasMantenimiento();
            cargarTecnicosMantenimiento();
            panel.focus({ preventScroll: true });
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
    obtenerElemento('closeMaintenanceTasks')?.addEventListener('click', () => {
        const panel = obtenerElemento('maintenanceTasksPanel');
        const boton = obtenerElemento('toggleMaintenanceTasks');
        if (panel) panel.hidden = true;
        if (boton) {
            boton.setAttribute('aria-expanded', 'false');
            boton.focus();
        }
    });
    obtenerElemento('equipmentHistorySelect')?.addEventListener('change', renderizarHistorialEquipos);
    obtenerElemento('repeatedFailuresSummary')?.addEventListener('click', event => {
        const boton = event.target.closest('button[data-history-equipment]');
        if (!boton) return;
        obtenerElemento('equipmentHistorySelect').value = boton.dataset.historyEquipment;
        renderizarHistorialEquipos();
    });
    obtenerElemento('maintenanceTasksList')?.addEventListener('click', event => {
        const actualizar = event.target.closest('button[data-update-maintenance-task]');
        if (actualizar) {
            actualizarEstadoTareaMantenimiento(actualizar.dataset.updateMaintenanceTask, actualizar.dataset.taskState);
            return;
        }
        const gestionar = event.target.closest('button[data-manage-maintenance-task]');
        if (gestionar) {
            const selector = obtenerElemento('maintenanceTasksList')?.querySelector(`select[data-task-status-select="${gestionar.dataset.manageMaintenanceTask}"]`);
            if (selector) actualizarEstadoTareaMantenimiento(gestionar.dataset.manageMaintenanceTask, selector.value);
            return;
        }
        const eliminar = event.target.closest('button[data-delete-maintenance-task]');
        if (eliminar) eliminarTareaMantenimiento(eliminar.dataset.deleteMaintenanceTask);
    });
    obtenerElemento('inventorySearch')?.addEventListener('input', renderizarInventarioRepuestos);
    obtenerElemento('inventoryList')?.addEventListener('click', event => {
        const boton = event.target.closest('button[data-delete-inventory]');
        if (boton) {
            eliminarRepuestoInventario(boton.dataset.deleteInventory);
        }
    });
    obtenerElemento('adminGuideForm')?.addEventListener('input', event => {
        if (!event.target.matches('input[type="file"]')) {
            programarGuardadoBorradorGuia();
        }
    });
    obtenerElemento('adminGuideForm')?.addEventListener('change', event => {
        if (!event.target.matches('input[type="file"]')) {
            programarGuardadoBorradorGuia();
        }
    });
    window.addEventListener('pagehide', guardarBorradorGuia);
    obtenerElemento('globalSearchInput')?.addEventListener('input', event => {
        busquedaGlobal = event.target.value;
        actualizarResultadosBusquedaGlobal();
    });
    obtenerElemento('globalSearchResults')?.addEventListener('click', event => {
        const boton = event.target.closest('.search-result-card');
        if (boton?.__searchAction) {
            boton.__searchAction();
        }
    });

    document.querySelector('.module-grid').addEventListener('click', event => {
        const boton = event.target.closest('button[data-module]');
        if (!boton) {
            return;
        }

        seleccionarModulo(boton.dataset.module);
    });

    document.querySelector('main').addEventListener('click', event => {
        if (event.target.closest('[data-close-module-window]')) {
            cerrarModuloConNavegacion();
            return;
        }

        const botonSede = event.target.closest('button[data-select-site][data-site-module]');
        if (botonSede) {
            seleccionarSedeModulo(botonSede.dataset.siteModule, botonSede.dataset.selectSite);
            return;
        }

        if (event.target.closest('[data-close-admin-panel]')) {
            cerrarPanelesAdmin();
            return;
        }

        const boton = event.target.closest('button[data-delete-guide]');
        if (boton) {
            eliminarGuiaOperativa(boton.dataset.deleteGuide);
            return;
        }

        const editar = event.target.closest('button[data-edit-guide]');
        if (editar) {
            cargarGuiaEnEditor(editar.dataset.editGuide);
            return;
        }

        const revisada = event.target.closest('button[data-mark-guide-read]');
        if (revisada) {
            marcarGuiaRevisada(revisada.dataset.markGuideRead);
            return;
        }

        const exportarGuia = event.target.closest('button[data-export-guide-pdf]');
        if (exportarGuia) {
            generarPdfGuia(exportarGuia.dataset.exportGuidePdf);
            return;
        }

        const guardarUsuario = event.target.closest('button[data-save-user]');
        if (guardarUsuario) {
            guardarUsuarioAdmin(guardarUsuario.dataset.saveUser);
            return;
        }

        const restablecerUsuario = event.target.closest('button[data-reset-user-password]');
        if (restablecerUsuario) {
            restablecerPasswordUsuario(restablecerUsuario.dataset.resetUserPassword);
            return;
        }

        const eliminarUsuario = event.target.closest('button[data-delete-user]');
        if (eliminarUsuario) {
            eliminarUsuarioAdmin(eliminarUsuario.dataset.deleteUser);
            return;
        }

        const foto = event.target.closest('[data-preview-photo]');
        if (foto) {
            abrirPreviewFoto(foto.dataset.previewPhoto, foto.dataset.previewTitle || 'Foto');
        }
    });

    document.addEventListener('click', event => {
        if (!document.body.classList.contains('admin-panel-open')) {
            return;
        }

        const dentroDelPanel = event.target.closest('.admin-guide-panel.panel-open');
        const botonApertura = event.target.closest('#toggleGuideAdmin, #toggleUsersAdmin, #toggleSystemHealth, #openPasswordResetModule');
        if (!dentroDelPanel && !botonApertura) {
            cerrarPanelesAdmin();
        }
    });

    obtenerElemento('guideTasksList')?.addEventListener('input', event => {
        const campo = event.target.closest('textarea[data-task-description]');
        if (!campo) {
            return;
        }

        const tarea = guiaTareasBorrador.find(item => item.id === campo.dataset.taskDescription);
        if (tarea) {
            tarea.descripcion = campo.value;
            programarGuardadoBorradorGuia();
        }
    });

    obtenerElemento('guideTasksList')?.addEventListener('change', event => {
        const input = event.target.closest('input[type="file"][data-task-photo]');
        if (input) {
            actualizarFotoTareaBorrador(input);
        }
    });

    obtenerElemento('guideTasksList')?.addEventListener('click', event => {
        const abrirCamara = event.target.closest('button[data-open-task-camera]');
        if (abrirCamara) {
            const input = obtenerElemento('guideTasksList')?.querySelector(
                `input[data-task-photo="${CSS.escape(abrirCamara.dataset.openTaskCamera)}"][data-photo-source="camera"]`
            );
            input?.click();
            return;
        }

        const abrirGaleria = event.target.closest('button[data-open-task-gallery]');
        if (abrirGaleria) {
            const input = obtenerElemento('guideTasksList')?.querySelector(
                `input[data-task-photo="${CSS.escape(abrirGaleria.dataset.openTaskGallery)}"][data-photo-source="gallery"]`
            );
            input?.click();
            return;
        }

        const boton = event.target.closest('button[data-remove-guide-task]');
        if (boton) {
            guiaTareasBorrador = guiaTareasBorrador.filter(tarea => tarea.id !== boton.dataset.removeGuideTask);
            if (!guiaTareasBorrador.length) {
                guiaTareasBorrador.push(crearTareaBorrador());
            }
            renderizarTareasBorrador();
            programarGuardadoBorradorGuia();
            return;
        }

        const mover = event.target.closest('button[data-move-guide-task]');
        if (mover) {
            const indice = guiaTareasBorrador.findIndex(tarea => tarea.id === mover.dataset.moveGuideTask);
            const destino = mover.dataset.direction === 'up' ? indice - 1 : indice + 1;
            if (indice >= 0 && destino >= 0 && destino < guiaTareasBorrador.length) {
                const [tarea] = guiaTareasBorrador.splice(indice, 1);
                guiaTareasBorrador.splice(destino, 0, tarea);
                renderizarTareasBorrador();
                programarGuardadoBorradorGuia();
            }
        }
    });

    contenedor.addEventListener('click', event => {
        const boton = event.target.closest('button.activate-btn');
        if (!boton) {
            return;
        }

        activarCodigo(boton.dataset.code);
    });

    obtenerElemento('deactivateAll').addEventListener('click', desactivarTodos);
    obtenerElemento('clearHistory').addEventListener('click', limpiarHistorial);
    obtenerElemento('resetChecklist').addEventListener('click', reiniciarChecklistActual);
    obtenerElemento('generateReport').addEventListener('click', generarInformeActual);
    obtenerElemento('finishCode').addEventListener('click', finalizarCodigoActual);
    obtenerElemento('toggleHistoryFilters').addEventListener('click', alternarFiltrosHistorial);
    ['historyFilterDate', 'historyFilterCode', 'historyFilterMode', 'historyFilterPriority'].forEach(id => {
        obtenerElemento(id).addEventListener('change', actualizarFiltrosHistorial);
    });
    obtenerElemento('historyFilterText').addEventListener('input', actualizarFiltrosHistorial);
    obtenerElemento('clearHistoryFilters').addEventListener('click', limpiarFiltrosHistorial);
    obtenerElemento('operationMode').addEventListener('change', event => {
        if (!codigoActivo) {
            return;
        }

        guardarCampoOperacion(codigoActivo, 'modo', event.target.value);
        actualizarResumenUI();
    });
    obtenerElemento('operationPriority').addEventListener('change', event => {
        if (!codigoActivo) {
            return;
        }

        guardarCampoOperacion(codigoActivo, 'prioridad', event.target.value);
        actualizarResumenUI();
    });

    obtenerElemento('responsibleName').addEventListener('input', event => {
        if (!codigoActivo) {
            return;
        }

        guardarEncargadoActual(codigoActivo, event.target.value.trim());
        actualizarEncargadoUI(codigoActivo);
    });

    obtenerElemento('responsibleName').addEventListener('change', event => {
        if (!codigoActivo) {
            return;
        }

        guardarEncargadoActual(codigoActivo, event.target.value.trim());
        actualizarEncargadoUI(codigoActivo);
    });

    obtenerElemento('openImageView').addEventListener('click', () => {
        if (codigoActivo) {
            abrirModalCodigo(codigoActivo);
        }
    });

    prepararVisorLamina();

    obtenerElemento('codeImage').addEventListener('click', () => {
        if (codigoActivo) {
            abrirModalCodigo(codigoActivo);
        }
    });

    obtenerElemento('checklistList').addEventListener('change', event => {
        const radio = event.target.closest('input[type="radio"][data-control-id]');
        if (radio) {
            actualizarControlChecklist(radio.dataset.codigo, radio.dataset.controlId, radio.value);
            return;
        }

        const checkbox = event.target.closest('input[type="checkbox"]');
        if (!checkbox) {
            return;
        }

        actualizarEstadoChecklist(
            checkbox.dataset.codigo,
            Number(checkbox.dataset.index),
            checkbox.checked
        );
    });

    obtenerElemento('checklistList').addEventListener('input', event => {
        const observacion = event.target.closest('textarea[data-index]');
        if (!observacion) {
            return;
        }

        actualizarObservacionChecklist(
            observacion.dataset.codigo,
            Number(observacion.dataset.index),
            observacion.value
        );
    });

    obtenerElemento('checklistList').addEventListener('change', async event => {
        const fotoInput = event.target.closest('input[type="file"][data-index]');
        if (!fotoInput || !fotoInput.files || fotoInput.files.length === 0) {
            return;
        }

        try {
            const file = fotoInput.files[0];
            const dataUrl = await comprimirFoto(file);
            await actualizarFotoChecklist(
                fotoInput.dataset.codigo,
                Number(fotoInput.dataset.index),
                {
                    dataUrl,
                    nombre: file.name || 'foto-evidencia.jpg',
                    tomadaEn: obtenerFechaHoraActual().iso
                }
            );
        } catch (error) {
            console.warn('No se pudo adjuntar la foto:', error);
            mostrarToast('No se pudo proteger la foto. Revisa el espacio disponible del celular.');
        } finally {
            fotoInput.value = '';
        }
    });

    obtenerElemento('checklistList').addEventListener('click', event => {
        const quitarFoto = event.target.closest('button.remove-photo-btn');
        if (!quitarFoto) {
            return;
        }

        actualizarFotoChecklist(
            quitarFoto.dataset.codigo,
            Number(quitarFoto.dataset.index),
            null
        );
    });

    obtenerElemento('checklistList').addEventListener('click', event => {
        if (event.target.closest('textarea[data-index]')) {
            event.stopPropagation();
        }
    });

    obtenerElemento('codeModal').addEventListener('click', event => {
        if (event.target.matches('[data-close-modal]')) {
            cerrarModal();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && obtenerElemento('codeModal').classList.contains('open')) {
            cerrarModal();
            return;
        }

        if (event.key === 'Escape' && document.body.classList.contains('admin-panel-open')) {
            cerrarPanelesAdmin();
            return;
        }

        if (event.key === 'Escape' && document.body.classList.contains('module-window-open')) {
            cerrarModuloConNavegacion();
            return;
        }

        const elementoActivo = document.activeElement;
        const escribiendo = elementoActivo && ['INPUT', 'TEXTAREA', 'SELECT'].includes(elementoActivo.tagName);

        if (escribiendo || event.ctrlKey || event.altKey || event.metaKey) {
            return;
        }

        const indice = Number(event.key) - 1;
        if (indice >= 0 && indice < ordenCodigos.length) {
            activarCodigo(ordenCodigos[indice]);
            return;
        }

        if (event.key === '0') {
            desactivarTodos();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const urlInicial = new URL(window.location.href);
    urlInicial.hash = 'inicio';
    window.history.replaceState({
        ...(window.history.state || {}),
        urbaparkApp: true,
        urbaparkModule: null
    }, '', `${urlInicial.pathname}${urlInicial.search}${urlInicial.hash}`);
    aplicarTemaGuardado();
    solicitarAlmacenPersistenteMultimedia();
    prepararVoces();
    if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = prepararVoces;
    }

    renderizarCodigos();
    poblarFiltroCodigos();
    historial = cargarHistorial();
    checklistEstado = cargarChecklistEstado();
    hidratarFotosChecklistCodigos();
    cargarProgresoGuias();
    cargarGuiasLocales();
    reiniciarTareasBorrador();
    actualizarCampoSedeGuia();
    configurarEventos();
    desactivarTodos();
    seleccionarModulo(null, { desplazar: false, registrarHistorial: false });
    actualizarHistorialUI();
    actualizarResumenUI();
    actualizarProgresoCapacitacionUI();
    inicializarAutenticacion();
});

window.addEventListener('popstate', event => {
    seleccionarModulo(obtenerModuloDesdeRuta(event.state), {
        desplazar: false,
        registrarHistorial: false
    });
    const panelOperaciones = event.state?.urbaparkOperationsPanel || '';
    const checklist = obtenerElemento('operationsChecklistPanel');
    const general = obtenerElemento('operationsGeneralReportPanel');
    const occupancy = obtenerElemento('operationsOccupancyPanel');
    if (checklist) {
        checklist.hidden = panelOperaciones !== 'checklist';
        checklist.classList.toggle('operations-subwindow-active', panelOperaciones === 'checklist');
    }
    if (general) {
        general.hidden = panelOperaciones !== 'general';
        general.classList.toggle('operations-subwindow-active', panelOperaciones === 'general');
    }
    if (occupancy) {
        occupancy.hidden = panelOperaciones !== 'occupancy';
        occupancy.classList.toggle('operations-subwindow-active', panelOperaciones === 'occupancy');
    }
    document.body.classList.toggle('operations-subwindow-open', ['checklist', 'general', 'occupancy'].includes(panelOperaciones));
    obtenerElemento('openOperationsChecklist')?.setAttribute('aria-expanded', String(panelOperaciones === 'checklist'));
    obtenerElemento('openOperationsGeneralReport')?.setAttribute('aria-expanded', String(panelOperaciones === 'general'));
    obtenerElemento('openOperationsOccupancy')?.setAttribute('aria-expanded', String(panelOperaciones === 'occupancy'));
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js', { updateViaCache: 'none' })
            .then(registro => registro.update())
            .catch(error => console.warn('No se pudo registrar el service worker:', error));
    });
}
