const STORAGE_KEYS = {
    history: 'historialCodigos',
    checklist: 'estadoChecklistCodigos',
    guides: 'guiasOperativas',
    guideProgress: 'progresoGuiasOperativas',
    theme: 'temaCodigosUrbapark'
};

const SUPABASE_CONFIG = {
    url: 'https://uibiwhkxlyxdfytvudbn.supabase.co',
    publishableKey: 'sb_publishable_R-auhGcSmwSl-1U9WdGe3g_ZYm5BZEt'
};

const SUPABASE_ESM_SOURCES = [
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm',
    'https://esm.sh/@supabase/supabase-js@2'
];

const VAPID_PUBLIC_KEY = 'BPA1HvZlxREjSH6MTsm1lK150EAsO-rk6v_ANrYesBXgnCDfBpFQ5HrHnvvGUvvT7ObMR21kRIpD98uwXIBFbjE';

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
        image: 'assets/codigo-rojo.png',
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
        image: 'assets/codigo-naranja.png',
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
        image: 'assets/codigo-3d.png',
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
        image: 'assets/codigo-cat.png',
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
        image: 'assets/codigo-verde.png',
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
        image: 'assets/codigo-croc.png',
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
        image: 'assets/codigo-adam.png',
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
        image: 'assets/codigo-calma.png',
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
        image: 'assets/codigo-capta.png',
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
let moduloActivo = null;
let guiasOperativas = [];
let guiasRemotasActivas = false;
let guiaTareasBorrador = [];
let progresoGuias = {};
let progresoUsuariosAdmin = {};
let usuariosAdmin = [];
let canalGuiasOperativas = null;
let busquedaGlobal = '';
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

function actualizarBotonTema() {
    const boton = obtenerElemento('toggleThemeButton');

    if (!boton) {
        return;
    }

    const oscuro = document.body.classList.contains('dark-theme');
    boton.textContent = oscuro ? 'Modo claro' : 'Modo oscuro';
    boton.setAttribute('aria-pressed', String(oscuro));
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
    return perfilActual?.nombre || sesionActual?.user?.email || 'Usuario conectado';
}

function actualizarSesionUI() {
    const etiqueta = obtenerElemento('authUserLabel');

    if (!etiqueta) {
        return;
    }

    if (!sesionActual?.user) {
        etiqueta.textContent = 'Sin usuario';
        return;
    }

    const rol = perfilActual?.rol ? ` - ${perfilActual.rol}` : '';
    etiqueta.textContent = `${obtenerNombreUsuarioActivo()}${rol}`;
}

function usuarioEsAdmin() {
    return perfilActual?.rol === 'admin' && perfilActual?.activo !== false;
}

function actualizarPanelAdminGuias() {
    const acciones = obtenerElemento('adminActionsPanel');
    const panel = obtenerElemento('adminGuidePanel');
    const usuarios = obtenerElemento('adminUsersPanel');
    const botonGuias = obtenerElemento('toggleGuideAdmin');
    const botonUsuarios = obtenerElemento('toggleUsersAdmin');

    if (!acciones || !panel || !usuarios) {
        return;
    }

    const admin = usuarioEsAdmin();
    acciones.hidden = !admin;

    if (!admin) {
        panel.hidden = true;
        usuarios.hidden = true;
        panel.classList.remove('panel-open');
        usuarios.classList.remove('panel-open');
        document.body.classList.remove('admin-panel-open');
        botonGuias?.setAttribute('aria-expanded', 'false');
        botonUsuarios?.setAttribute('aria-expanded', 'false');
        return;
    }

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
    const botonGuias = obtenerElemento('toggleGuideAdmin');
    const botonUsuarios = obtenerElemento('toggleUsersAdmin');

    if (panelGuias) {
        panelGuias.hidden = true;
        panelGuias.classList.remove('panel-open');
    }

    if (panelUsuarios) {
        panelUsuarios.hidden = true;
        panelUsuarios.classList.remove('panel-open');
    }

    if (botonGuias) {
        botonGuias.textContent = 'Crear guias';
        botonGuias.setAttribute('aria-expanded', 'false');
    }

    if (botonUsuarios) {
        botonUsuarios.textContent = 'Usuarios y roles';
        botonUsuarios.setAttribute('aria-expanded', 'false');
    }

    document.body.classList.remove('admin-panel-open');
}

function alternarPanelAdmin(tipo) {
    if (!usuarioEsAdmin()) {
        return;
    }

    const panelGuias = obtenerElemento('adminGuidePanel');
    const panelUsuarios = obtenerElemento('adminUsersPanel');
    const botonGuias = obtenerElemento('toggleGuideAdmin');
    const botonUsuarios = obtenerElemento('toggleUsersAdmin');
    const abrirGuias = tipo === 'guias' ? panelGuias.hidden : false;
    const abrirUsuarios = tipo === 'usuarios' ? panelUsuarios.hidden : false;

    panelGuias.hidden = !abrirGuias;
    panelUsuarios.hidden = !abrirUsuarios;
    panelGuias.classList.toggle('panel-open', abrirGuias);
    panelUsuarios.classList.toggle('panel-open', abrirUsuarios);
    document.body.classList.toggle('admin-panel-open', abrirGuias || abrirUsuarios);
    botonGuias?.setAttribute('aria-expanded', String(abrirGuias));
    botonUsuarios?.setAttribute('aria-expanded', String(abrirUsuarios));
    botonGuias.textContent = abrirGuias ? 'Ocultar crear guias' : 'Crear guias';
    botonUsuarios.textContent = abrirUsuarios ? 'Ocultar usuarios y roles' : 'Usuarios y roles';

    if (abrirGuias) {
        renderizarTareasBorrador();
    }

    if (abrirUsuarios) {
        cargarUsuariosAdmin();
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
    const existente = await registro.pushManager.getSubscription();
    const suscripcion = existente || await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertirBase64UrlAUint8Array(VAPID_PUBLIC_KEY)
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
        .select('nombre, rol, activo')
        .eq('id', sesionActual.user.id)
        .maybeSingle();

    if (error) {
        console.warn('No se pudo cargar perfil:', error);
    } else if (data) {
        perfilActual = data;
    }

    actualizarSesionUI();
    actualizarPanelAdminGuias();
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
        .select('id,codigo,nombre,descripcion,encargado,modo,prioridad,activado_en,cerrado_en,created_at,creado_por_email')
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
                    return {
                        titulo: paso.titulo || `Tarea ${indice + 1}`,
                        descripcion: paso.descripcion || paso.texto || '',
                        foto: paso.foto && typeof paso.foto === 'object' ? paso.foto : null
                    };
                }

                return null;
            })
            .filter(paso => paso && paso.descripcion)
        : [];

    return {
        id: guia.id || `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        modulo: guia.modulo,
        titulo: guia.titulo || 'Guia sin titulo',
        descripcion: guia.descripcion || '',
        pasos,
        creadoPorEmail: guia.creado_por_email || guia.creadoPorEmail || '',
        createdAt: guia.created_at || guia.createdAt || new Date().toISOString(),
        updatedAt: guia.updated_at || guia.updatedAt || guia.created_at || guia.createdAt || new Date().toISOString(),
        remoto: Boolean(guia.id && !String(guia.id).startsWith('local-'))
    };
}

async function cargarGuiasRemotas() {
    if (!supabaseClient || !sesionActual?.user) {
        return;
    }

    const { data, error } = await supabaseClient
        .from('guias_operativas')
        .select('id,modulo,titulo,descripcion,pasos,creado_por_email,created_at,updated_at')
        .order('updated_at', { ascending: false });

    if (error) {
        guiasRemotasActivas = false;
        console.warn('No se pudieron cargar guias operativas:', error);
        renderizarGuiasOperativas();
        return;
    }

    guiasRemotasActivas = true;
    guiasOperativas = data.map(normalizarGuiaOperativa);
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
    const cuerpo = document.createElement('div');
    const lista = document.createElement('ol');
    const meta = document.createElement('p');

    details.className = 'procedure-card';
    details.dataset.guideId = guia.id;
    icono.className = 'procedure-icon';
    icono.setAttribute('aria-hidden', 'true');
    iconSvg.setAttribute('viewBox', '0 0 64 64');
    iconSvg.setAttribute('focusable', 'false');
    iconPath.setAttribute('d', 'M14 12h36v40H14zM22 24h20M22 34h20M22 44h12');
    iconSvg.appendChild(iconPath);
    icono.appendChild(iconSvg);

    titulo.textContent = guia.titulo;
    descripcion.textContent = guia.descripcion || 'Guia operativa agregada por administrador.';
    texto.append(titulo, descripcion);
    summary.append(icono, texto);

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

        if (paso.foto?.dataUrl) {
            const imagen = document.createElement('img');
            const caption = document.createElement('figcaption');
            imagen.src = paso.foto.dataUrl;
            imagen.alt = `Foto referencial de ${pasoTitulo.textContent}`;
            imagen.tabIndex = 0;
            imagen.dataset.previewPhoto = paso.foto.dataUrl;
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
    meta.textContent = guia.creadoPorEmail
        ? `Creado por ${guia.creadoPorEmail}`
        : 'Guia agregada por administrador';

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
    progreso.className = 'guide-actions';
    revisar.className = progresoGuias[guia.id]?.revisada ? 'finish-btn' : 'clear-btn';
    revisar.type = 'button';
    revisar.dataset.markGuideRead = guia.id;
    revisar.textContent = progresoGuias[guia.id]?.revisada ? 'Guia revisada' : 'Marcar como revisada';
    progreso.appendChild(revisar);
    cuerpo.appendChild(progreso);

    details.append(summary, cuerpo);
    return details;
}

function renderizarGuiasOperativas() {
    ['mantenimiento', 'operaciones', 'caja', 'ronda'].forEach(modulo => {
        const contenedor = obtenerElemento(`dynamicGuides-${modulo}`);
        if (!contenedor) {
            return;
        }

        limpiarElemento(contenedor);
        guiasOperativas
            .filter(guia => guia.modulo === modulo)
            .forEach(guia => contenedor.appendChild(crearGuiaElemento(guia)));
    });
}

function crearTareaBorrador(descripcion = '', foto = null) {
    return {
        id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        descripcion,
        foto
    };
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
        const fotoLabel = document.createElement('label');
        const fotoInput = document.createElement('input');
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
        fotoLabel.className = 'photo-capture-btn';
        fotoLabel.textContent = tarea.foto ? 'Cambiar foto de tarea' : 'Agregar foto a tarea';
        fotoInput.type = 'file';
        fotoInput.accept = 'image/*';
        fotoInput.capture = 'environment';
        fotoInput.dataset.taskPhoto = tarea.id;
        fotoLabel.appendChild(fotoInput);
        fotoEstado.className = 'photo-status';
        fotoEstado.textContent = tarea.foto ? 'Foto agregada' : 'Sin foto';
        fotoArea.append(fotoLabel, fotoEstado);

        if (tarea.foto?.dataUrl) {
            const preview = document.createElement('img');
            preview.className = 'guide-task-preview';
            preview.src = tarea.foto.dataUrl;
            preview.alt = `Foto de la tarea ${indice + 1}`;
            preview.tabIndex = 0;
            preview.dataset.previewPhoto = tarea.foto.dataUrl;
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
            botonUsuarios.textContent = 'Usuarios y roles';
        }
    }

    obtenerElemento('guideEditingId').value = guia.id;
    obtenerElemento('guideModule').value = guia.modulo;
    obtenerElemento('guideTitle').value = guia.titulo;
    obtenerElemento('guideDescription').value = guia.descripcion || '';
    guiaTareasBorrador = guia.pasos.map(paso => crearTareaBorrador(paso.descripcion, paso.foto));
    if (!guiaTareasBorrador.length) {
        guiaTareasBorrador.push(crearTareaBorrador());
    }
    renderizarTareasBorrador();
    obtenerElemento('cancelGuideEdit').hidden = false;

    if (estado) {
        estado.textContent = 'Editando guia existente.';
        estado.dataset.status = 'info';
    }

    obtenerElemento('adminGuidePanel')?.focus?.();
}

function cancelarEdicionGuia() {
    obtenerElemento('adminGuideForm')?.reset();
    obtenerElemento('guideEditingId').value = '';
    obtenerElemento('cancelGuideEdit').hidden = true;
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
        const dataUrl = await comprimirFoto(file, 860, 0.68);
        tarea.foto = {
            dataUrl,
            nombre: file.name || 'foto-guia.jpg',
            agregadaEn: obtenerFechaHoraActual().iso
        };
        renderizarTareasBorrador();

        if (estado) {
            estado.textContent = 'Foto agregada a la tarea.';
            estado.dataset.status = 'success';
        }
    } catch (error) {
        console.warn('No se pudo agregar foto a la guia:', error);
        if (estado) {
            estado.textContent = 'No se pudo agregar la foto.';
            estado.dataset.status = 'error';
        }
    } finally {
        input.value = '';
    }
}

async function guardarGuiaOperativa(event) {
    event.preventDefault();

    if (!usuarioEsAdmin()) {
        return;
    }

    const estado = obtenerElemento('guideEditorStatus');
    const modulo = obtenerElemento('guideModule')?.value;
    const titulo = obtenerElemento('guideTitle')?.value.trim();
    const descripcion = obtenerElemento('guideDescription')?.value.trim();
    const pasos = obtenerPasosBorrador();
    const editandoId = obtenerElemento('guideEditingId')?.value;

    if (!modulo || !titulo || !pasos.length) {
        if (estado) {
            estado.textContent = 'Completa titulo y al menos un paso.';
            estado.dataset.status = 'error';
        }
        return;
    }

    const guia = {
        modulo,
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

    if (supabaseClient) {
        const consulta = editandoId
            ? supabaseClient
                .from('guias_operativas')
                .update({
                    modulo,
                    titulo,
                    descripcion,
                    pasos
                })
                .eq('id', editandoId)
            : supabaseClient
                .from('guias_operativas')
                .insert(guia);

        const { error } = await consulta;

        if (!error) {
            cancelarEdicionGuia();
            if (estado) {
                estado.textContent = editandoId ? 'Guia actualizada para todos.' : 'Guia guardada y compartida.';
                estado.dataset.status = 'success';
            }
            await cargarGuiasRemotas();
            seleccionarModulo(modulo, { desplazar: false });
            return;
        }

        console.warn('No se pudo guardar guia remota:', error);
    }

    const local = normalizarGuiaOperativa({
        ...guia,
        id: editandoId || `local-${Date.now()}`,
        createdAt: new Date().toISOString()
    });
    if (editandoId) {
        guiasOperativas = guiasOperativas.map(item => item.id === editandoId ? local : item);
    } else {
        guiasOperativas.unshift(local);
    }
    guardarGuiasLocales();
    renderizarGuiasOperativas();
    cancelarEdicionGuia();

    if (estado) {
        estado.textContent = 'Guia guardada en este dispositivo. Ejecuta la actualizacion SQL para compartirla.';
        estado.dataset.status = 'warning';
    }
}

async function eliminarGuiaOperativa(id) {
    if (!usuarioEsAdmin() || !id) {
        return;
    }

    if (supabaseClient && !String(id).startsWith('local-')) {
        const { error } = await supabaseClient
            .from('guias_operativas')
            .delete()
            .eq('id', id);

        if (!error) {
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

    const total = guiasOperativas.length;
    const revisadas = guiasOperativas.filter(guia => progresoGuias[guia.id]?.revisada).length;
    texto.textContent = total
        ? `${revisadas} de ${total} guias revisadas en este dispositivo.`
        : 'Aun no hay guias operativas agregadas.';
}

async function cargarUsuariosAdmin() {
    if (!usuarioEsAdmin() || !supabaseClient) {
        return;
    }

    const lista = obtenerElemento('usersAdminList');
    if (lista) {
        lista.textContent = 'Cargando usuarios...';
    }

    const { data, error } = await supabaseClient
        .from('profiles')
        .select('id,email,nombre,rol,activo,created_at')
        .order('created_at', { ascending: true });

    if (error) {
        if (lista) {
            lista.textContent = 'No se pudieron cargar usuarios.';
        }
        console.warn('No se pudieron cargar usuarios:', error);
        return;
    }

    usuariosAdmin = data || [];
    const { data: progreso } = await supabaseClient
        .from('guia_progreso')
        .select('user_id,revisada');
    progresoUsuariosAdmin = {};
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

    usuariosAdmin.forEach(usuario => {
        const fila = document.createElement('article');
        const datos = document.createElement('div');
        const nombre = document.createElement('strong');
        const email = document.createElement('span');
        const rol = document.createElement('select');
        const activo = document.createElement('select');
        const guardar = document.createElement('button');

        fila.className = 'user-admin-row';
        fila.dataset.userId = usuario.id;
        nombre.textContent = usuario.nombre || 'Sin nombre';
        const progreso = progresoUsuariosAdmin[usuario.id];
        email.textContent = progreso
            ? `${usuario.email} - ${progreso.revisadas}/${guiasOperativas.length || progreso.total} guias revisadas`
            : `${usuario.email} - sin avance registrado`;
        datos.append(nombre, email);

        ['admin', 'supervisor', 'eco', 'charly', 'anfitrion'].forEach(opcion => {
            const option = document.createElement('option');
            option.value = opcion;
            option.textContent = opcion;
            option.selected = usuario.rol === opcion;
            rol.appendChild(option);
        });
        rol.dataset.userRole = usuario.id;

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

        guardar.className = 'clear-btn';
        guardar.type = 'button';
        guardar.dataset.saveUser = usuario.id;
        guardar.textContent = 'Guardar';

        fila.append(datos, rol, activo, guardar);
        lista.appendChild(fila);
    });
}

async function guardarUsuarioAdmin(id) {
    if (!usuarioEsAdmin() || !supabaseClient || !id) {
        return;
    }

    const rol = document.querySelector(`[data-user-role="${id}"]`)?.value;
    const activo = document.querySelector(`[data-user-active="${id}"]`)?.value === 'true';

    const { error } = await supabaseClient
        .from('profiles')
        .update({ rol, activo })
        .eq('id', id);

    if (error) {
        mostrarToast('No se pudo actualizar el usuario.');
        console.warn('No se pudo actualizar usuario:', error);
        return;
    }

    mostrarToast('Usuario actualizado.');
    await cargarUsuariosAdmin();
}

async function crearUsuarioDesdeAdmin(event) {
    event.preventDefault();

    if (!usuarioEsAdmin() || !supabaseClient) {
        return;
    }

    const estado = obtenerElemento('createUserStatus');
    const nombre = obtenerElemento('newUserName')?.value.trim();
    const email = obtenerElemento('newUserEmail')?.value.trim();
    const password = obtenerElemento('newUserPassword')?.value;
    const rol = obtenerElemento('newUserRole')?.value;

    if (!nombre || !email || !password || !rol) {
        if (estado) {
            estado.textContent = 'Completa todos los datos del usuario.';
            estado.dataset.status = 'error';
        }
        return;
    }

    if (estado) {
        estado.textContent = 'Creando usuario...';
        estado.dataset.status = 'info';
    }

    try {
        const { error } = await supabaseClient.functions.invoke('create-user', {
            body: { nombre, email, password, rol }
        });

        if (error) {
            throw error;
        }

        obtenerElemento('createUserForm')?.reset();
        if (estado) {
            estado.textContent = 'Usuario creado correctamente.';
            estado.dataset.status = 'success';
        }
        mostrarToast(`Usuario creado: ${email}`);
        await cargarUsuariosAdmin();
    } catch (error) {
        console.warn('No se pudo crear usuario:', error);
        if (estado) {
            estado.textContent = 'No se pudo crear usuario. Revisa correo, contrasena o permisos.';
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

    const guias = guiasOperativas.map(guia => ({
        tipo: `Guia - ${guia.modulo}`,
        titulo: guia.titulo,
        detalle: `${guia.descripcion || ''} ${guia.pasos.map(paso => paso.descripcion).join(' ')}`,
        accion: () => seleccionarModulo(guia.modulo)
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
    if (!supabaseClient || !sesionActual?.user) {
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
            pasos: estado?.pasos || [],
            controles: estado?.controles || {},
            creado_por: sesionActual.user.id,
            creado_por_email: sesionActual.user.email || ''
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
        codigo_activo: codigoActivo,
        checklist_estado: checklistEstado,
        actualizado_por: sesionActual?.user?.id || null,
        actualizado_por_email: sesionActual?.user?.email || null
    };
}

async function sincronizarEstadoOperativoRemoto() {
    if (aplicandoEstadoRemoto || !supabaseClient || !sesionActual?.user) {
        return;
    }

    const snapshot = crearSnapshotEstadoOperativo();
    const { error } = await supabaseClient
        .from('estado_operativo')
        .upsert({
            id: 'global',
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
    if (aplicandoEstadoRemoto || !supabaseClient || !sesionActual?.user) {
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

function aplicarEstadoOperativoRemoto(registro) {
    if (!registro) {
        return;
    }

    const codigoPrevio = codigoActivo;
    const codigoRemoto = codigosEmergencia[registro.codigo_activo]
        ? registro.codigo_activo
        : null;

    aplicandoEstadoRemoto = true;
    checklistEstado = normalizarEstadoOperativoRemoto(registro.checklist_estado);
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

    if (codigoRemoto && codigoRemoto !== codigoPrevio) {
        mostrarAlertaRemota(codigoRemoto, registro.actualizado_por_email);
        notificarCodigoRemoto(codigoRemoto, registro.actualizado_por_email);
    }

    if (!codigoRemoto) {
        ultimoCodigoRemotoAlertado = null;
    }
}

async function cargarEstadoOperativoRemoto() {
    if (!supabaseClient || !sesionActual?.user) {
        return;
    }

    const { data, error } = await supabaseClient
        .from('estado_operativo')
        .select('id,codigo_activo,checklist_estado,actualizado_por,actualizado_por_email,updated_at')
        .eq('id', 'global')
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
    if (!supabaseClient || !sesionActual?.user) {
        return;
    }

    if (canalEstadoOperativo) {
        supabaseClient.removeChannel(canalEstadoOperativo);
        canalEstadoOperativo = null;
    }

    canalEstadoOperativo = supabaseClient
        .channel('estado-operativo-global')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'estado_operativo',
                filter: 'id=eq.global'
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

async function aplicarSesion(session) {
    sesionActual = session;

    if (!session?.user) {
        perfilActual = null;
        if (canalEstadoOperativo && supabaseClient) {
            supabaseClient.removeChannel(canalEstadoOperativo);
            canalEstadoOperativo = null;
        }
        if (canalGuiasOperativas && supabaseClient) {
            supabaseClient.removeChannel(canalGuiasOperativas);
            canalGuiasOperativas = null;
        }
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
    if ('Notification' in window && Notification.permission === 'granted') {
        registrarSuscripcionPush();
    }
    await cargarPerfilActual();
    await cargarGuiasRemotas();
    await cargarProgresoGuiasRemoto();
    await cargarHistorialRemoto();
    await cargarEstadoOperativoRemoto();
    suscribirEstadoOperativo();
    suscribirGuiasOperativas();
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
        actualizarEstadoAuth('No se encontro ese usuario. Prueba con tu correo asignado.', 'error');
        return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (boton) {
        boton.disabled = false;
    }

    if (error) {
        actualizarEstadoAuth('No se pudo iniciar sesion. Revisa correo y contrasena.', 'error');
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
    const datos = safeParseJSON(localStorage.getItem(STORAGE_KEYS.history), []);

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
            activadoEn: entrada.activadoEn || null,
            cerradoEn: entrada.cerradoEn || null
        }));
}

function cargarChecklistEstado() {
    const datos = safeParseJSON(localStorage.getItem(STORAGE_KEYS.checklist), {});

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

function guardarChecklistEstado() {
    guardarEstadoLocalStorage(STORAGE_KEYS.checklist, checklistEstado);
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

function seleccionarModulo(modulo, opciones = {}) {
    const { desplazar = true } = opciones;
    const moduloValido = modulo && obtenerElemento(`module-${modulo}`);
    moduloActivo = moduloValido ? modulo : null;

    document.querySelectorAll('.module-content').forEach(seccion => {
        seccion.hidden = seccion.id !== `module-${moduloActivo}`;
    });

    document.querySelectorAll('.module-button').forEach(boton => {
        const activo = boton.dataset.module === moduloActivo;
        boton.setAttribute('aria-pressed', activo ? 'true' : 'false');
    });

    actualizarBottomNav(moduloActivo);

    if (desplazar && moduloActivo) {
        const destino = obtenerElemento(`module-${moduloActivo}`);
        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        destino.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
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
        seleccionarModulo(null, { desplazar: false });
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

        if (pasoEstado.foto?.dataUrl) {
            const preview = document.createElement('img');
            const quitar = document.createElement('button');

            preview.className = 'photo-preview';
            preview.src = pasoEstado.foto.dataUrl;
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
    guardarEstadoLocalStorage(STORAGE_KEYS.history, historial);
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

    const totalGuias = guiasOperativas.length;
    const revisadas = guiasOperativas.filter(guia => progresoGuias[guia.id]?.revisada).length;
    const ultimasGuias = guiasOperativas.slice(0, 3);
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
        const foto = pasoEstado.foto?.dataUrl
            ? `<img class="evidence-photo" src="${pasoEstado.foto.dataUrl}" alt="Evidencia fotografica del paso ${indice + 1}">`
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

function actualizarFotoChecklist(codigo, indice, foto) {
    const estado = obtenerEstadoChecklist(codigo);

    if (!estado || !estado.pasos[indice]) {
        return;
    }

    estado.pasos[indice].foto = foto;
    guardarChecklistEstado();
    programarSincronizacionEstadoOperativo(100);

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
    modalImage.src = info.image;
    modalImage.alt = `${info.nombre} - lamina ampliada`;
    modalSubtitle.textContent = `${info.nombre}. ${info.guia}.`;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
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
    modalImage.src = dataUrl;
    modalImage.alt = titulo;
    modalSubtitle.textContent = 'Foto referencial de la guia operativa.';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
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
    obtenerElemento('enableAlertsButton').addEventListener('click', solicitarPermisoAlertas);
    obtenerElemento('remoteAlertOpen').addEventListener('click', abrirChecklistDesdeAlerta);
    obtenerElemento('remoteAlertDismiss').addEventListener('click', cerrarAlertaRemota);
    obtenerElemento('remoteAlertClose').addEventListener('click', cerrarAlertaRemota);
    obtenerElemento('toggleActivityPanel').addEventListener('click', alternarPanelActividad);
    obtenerElemento('toggleThemeButton')?.addEventListener('click', alternarTema);
    obtenerElemento('bottomNav')?.addEventListener('click', manejarNavegacionInferior);
    obtenerElemento('adminGuideForm')?.addEventListener('submit', guardarGuiaOperativa);
    obtenerElemento('addGuideTask')?.addEventListener('click', agregarTareaBorrador);
    obtenerElemento('cancelGuideEdit')?.addEventListener('click', cancelarEdicionGuia);
    obtenerElemento('refreshUsers')?.addEventListener('click', cargarUsuariosAdmin);
    obtenerElemento('toggleGuideAdmin')?.addEventListener('click', () => alternarPanelAdmin('guias'));
    obtenerElemento('toggleUsersAdmin')?.addEventListener('click', () => alternarPanelAdmin('usuarios'));
    obtenerElemento('createUserForm')?.addEventListener('submit', crearUsuarioDesdeAdmin);
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

        const guardarUsuario = event.target.closest('button[data-save-user]');
        if (guardarUsuario) {
            guardarUsuarioAdmin(guardarUsuario.dataset.saveUser);
            return;
        }

        const foto = event.target.closest('[data-preview-photo]');
        if (foto) {
            abrirPreviewFoto(foto.dataset.previewPhoto, foto.dataset.previewTitle || 'Foto');
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
        }
    });

    obtenerElemento('guideTasksList')?.addEventListener('change', event => {
        const input = event.target.closest('input[type="file"][data-task-photo]');
        if (input) {
            actualizarFotoTareaBorrador(input);
        }
    });

    obtenerElemento('guideTasksList')?.addEventListener('click', event => {
        const boton = event.target.closest('button[data-remove-guide-task]');
        if (boton) {
            guiaTareasBorrador = guiaTareasBorrador.filter(tarea => tarea.id !== boton.dataset.removeGuideTask);
            if (!guiaTareasBorrador.length) {
                guiaTareasBorrador.push(crearTareaBorrador());
            }
            renderizarTareasBorrador();
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
            actualizarFotoChecklist(
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
    aplicarTemaGuardado();
    prepararVoces();
    if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = prepararVoces;
    }

    renderizarCodigos();
    poblarFiltroCodigos();
    historial = cargarHistorial();
    checklistEstado = cargarChecklistEstado();
    cargarProgresoGuias();
    cargarGuiasLocales();
    reiniciarTareasBorrador();
    configurarEventos();
    desactivarTodos();
    seleccionarModulo(null, { desplazar: false });
    actualizarHistorialUI();
    actualizarResumenUI();
    actualizarProgresoCapacitacionUI();
    inicializarAutenticacion();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .catch(error => console.warn('No se pudo registrar el service worker:', error));
    });
}
