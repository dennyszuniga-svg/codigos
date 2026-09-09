const {
    STORAGE_KEYS,
    SUPABASE_CONFIG,
    SUPABASE_ESM_SOURCES,
    VAPID_PUBLIC_KEY,
    GUIDE_IMAGE_BUCKET,
    GUIDE_IMAGE_URL_TTL,
    GDH_DOCUMENT_BUCKET,
    GDH_ANNOUNCEMENT_BUCKET,
    MEDIA_VAULT_DB_NAME,
    MEDIA_VAULT_DB_VERSION,
    MEDIA_VAULT_STORE,
    MAINTENANCE_ACCESS_SESSION_KEY,
    SEDES_OPERACION,
    MODULOS_POR_SEDE,
    ROL_SUPERIOR,
    ROLES_OPERACION_GLOBAL,
    ROLES_GLOBALES,
    ROLES_CREABLES_POR_ADMIN,
    ROLES_USUARIO,
    ETIQUETAS_ROL,
    TIPOS_ABONO
} = window.UrbaparkCoreConfig;
const { EQUIPOS_MANTENIMIENTO } = window.UrbaparkMaintenanceCatalog;
const {
    MAX_HISTORIAL,
    dateFormatter,
    timeFormatter,
    etiquetasModo,
    etiquetasPrioridad,
    codigosEmergencia,
    ordenCodigos
} = window.UrbaparkEmergencyCodes;
const {
    OPERATIONS_CHECKLIST_BUCKET,
    OPERATIONS_CHECKLIST_SECTIONS
} = window.UrbaparkOperationsConfig;

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
let canalEncuestasSatisfaccion = null;
let encuestasSatisfaccion = [];
let encuestasNuevas = 0;
let comunicadosGdh = [];
let lecturasGdh = [];
let comunicadoObligatorioActual = null;
let checklistOperacionesActual = null;
let historialChecklistsOperaciones = [];
let ultimoChecklistOperacionesFinalizado = null;
const HOST_PREVIEW_SESSION_KEY = 'urbapark-host-preview';
let vistaAnfitrionActiva = false;
const cachePdfChecklistOperaciones = new WeakMap();
let informeGeneralOperaciones = [];
let temporizadorChecklistOperaciones = null;
let temporizadorVentanaChecklistOperaciones = null;
let capturaFotoChecklistOperacionesEnCurso = false;
let temporizadorCapturaFotoChecklistOperaciones = null;
let registroOcupabilidadDiaria = null;
let zonasOcupabilidadActual = [];
let temporizadorBorradorOcupabilidad = null;
const TIPOS_REPORTERIA = {
    plumillas: {
        nombre: 'Reporte de ordenes manuales',
        tituloExcel: 'REPORTE DE ORDENES MANUALES',
        encabezados: ['FECHA', 'PUMA', 'PLACA', 'MOTIVO'],
        anchos: [14, 13, 14, 72]
    },
    tickets: {
        nombre: 'Analisis de tickets abiertos',
        tituloExcel: 'ANÁLISIS DE TICKETS ABIERTOS',
        encabezados: ['FECHA DE EMISIÓN', 'MATRÍCULA', 'SÍ/NO', 'NÚMERO DE TICKET', 'OBSERVACIÓN', 'REFERENCIA'],
        anchos: [20, 16, 10, 20, 58, 58]
    }
};
let reporteCapturaActual = {
    tipo: 'plumillas',
    archivos: [],
    fuenteExcel: '',
    urlVistaPrevia: '',
    encabezados: [...TIPOS_REPORTERIA.plumillas.encabezados],
    filas: []
};
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

function aplicarModuloSolicitadoDesdeURL() {
    const parametros = new URLSearchParams(window.location.search);
    const panel = parametros.get('panel');
    if (panel === 'usuarios' && usuarioEsAdmin()) {
        const panelUsuarios = obtenerElemento('adminUsersPanel');
        if (panelUsuarios?.hidden) alternarPanelAdmin('usuarios');
        window.history.replaceState(window.history.state, '', window.location.pathname);
        return;
    }
    const modulo = parametros.get('module');
    if (!modulo || !obtenerElemento(`module-${modulo}`)) {
        return;
    }
    seleccionarModulo(modulo, { desplazar: false });
    window.history.replaceState(window.history.state, '', obtenerRutaNavegacionModulo(modulo));
}

function actualizarSesionUI() {
    const etiqueta = obtenerElemento('authUserLabel');
    const rolActual = vistaAnfitrionActiva ? 'anfitrion' : (perfilActual?.rol || 'sin-rol');
    const roles = ROLES_USUARIO;

    document.body.classList.remove('operational-mode', 'admin-mode', 'technical-mode', ...roles.map(rol => `role-${rol}`));
    document.body.classList.toggle('host-preview-mode', vistaAnfitrionActiva);
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

    const nombreRol = vistaAnfitrionActiva ? 'Vista previa: Anfitrión' : obtenerEtiquetaRol(perfilActual?.rol);
    const rol = nombreRol ? ` - ${nombreRol}` : '';
    const sede = perfilActual?.sede ? ` - ${obtenerNombreSede(perfilActual.sede)}` : '';
    etiqueta.textContent = `${obtenerNombreUsuarioActivo()}${rol}${sede}`;
    actualizarControlVistaAnfitrion();
}

function usuarioEsAdmin() {
    return !vistaAnfitrionActiva
        && [ROL_SUPERIOR, 'admin', ...ROLES_OPERACION_GLOBAL].includes(perfilActual?.rol)
        && perfilActual?.activo !== false;
}

function usuarioEsAdminGlobal() {
    return !vistaAnfitrionActiva
        && [ROL_SUPERIOR, ...ROLES_OPERACION_GLOBAL].includes(perfilActual?.rol)
        && perfilActual?.activo !== false;
}

function usuarioEsSuperior() {
    return !vistaAnfitrionActiva && perfilActual?.rol === ROL_SUPERIOR && perfilActual?.activo !== false;
}

function usuarioPuedeRestablecerPassword() {
    return !vistaAnfitrionActiva
        && perfilActual?.activo !== false
        && [ROL_SUPERIOR, 'gdh', 'admin'].includes(perfilActual?.rol);
}

function usuarioPuedeRestablecerCuenta(usuario) {
    if (!usuarioPuedeRestablecerPassword() || !usuario?.activo || !usuario?.dni || usuario.id === sesionActual?.user?.id) {
        return false;
    }
    if (usuarioEsSuperior()) {
        return true;
    }
    if (perfilActual?.rol === 'admin') {
        return usuario.sede === obtenerSedeActual()
            && ['tecnico', 'supervisor', 'fortaleza', 'eco', 'charly', 'anfitrion', 'marcador'].includes(usuario.rol);
    }
    return ['comercial_abonados', 'tecnico', 'supervisor', 'fortaleza', 'eco', 'charly', 'anfitrion', 'marcador'].includes(usuario.rol);
}

function usuarioPuedeVerSaludSupabase() {
    const nombre = String(perfilActual?.nombre || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
    return usuarioEsSuperior() && nombre.includes('dennys');
}

function usuarioEsRolGlobal(rol = vistaAnfitrionActiva ? 'anfitrion' : perfilActual?.rol) {
    return ROLES_GLOBALES.includes(rol);
}

const MODULOS_RESTRINGIDOS_ANFITRION = new Set(['mantenimiento', 'reporteria']);

function usuarioEsAnfitrion() {
    return (vistaAnfitrionActiva || perfilActual?.rol === 'anfitrion') && perfilActual?.activo !== false;
}

function usuarioPuedeUsarVistaAnfitrion() {
    const identidad = `${perfilActual?.nombre || ''} ${perfilActual?.apellidos_nombres || ''}`
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
    return perfilActual?.activo !== false
        && perfilActual?.rol === ROL_SUPERIOR
        && identidad.includes('dennys');
}

function actualizarControlVistaAnfitrion() {
    const boton = obtenerElemento('toggleHostPreview');
    const banner = obtenerElemento('hostPreviewBanner');
    const enlaceAsistencia = document.querySelector('.attendance-open-link');
    if (!boton) return;
    const permitido = usuarioPuedeUsarVistaAnfitrion();
    boton.hidden = !permitido;
    boton.setAttribute('aria-pressed', vistaAnfitrionActiva ? 'true' : 'false');
    const texto = boton.querySelector('span');
    if (texto) texto.textContent = vistaAnfitrionActiva ? 'Volver a mi vista' : 'Ver app como anfitrión';
    if (banner) banner.hidden = !vistaAnfitrionActiva;
    if (enlaceAsistencia) {
        enlaceAsistencia.href = vistaAnfitrionActiva
            ? 'asistencia.html?vista=anfitrion'
            : 'asistencia.html';
    }
}

function establecerVistaAnfitrion(activa) {
    if (activa && !usuarioPuedeUsarVistaAnfitrion()) return;
    vistaAnfitrionActiva = Boolean(activa);
    try {
        if (vistaAnfitrionActiva) sessionStorage.setItem(HOST_PREVIEW_SESSION_KEY, '1');
        else sessionStorage.removeItem(HOST_PREVIEW_SESSION_KEY);
    } catch (error) {
        console.warn('No se pudo conservar la vista de anfitrión:', error);
    }
    seleccionarModulo(null, { desplazar: false });
    cerrarPanelesAdmin();
    actualizarSesionUI();
    actualizarPanelAdminGuias();
    actualizarAccesoAbonados();
    configurarAccesoEncuestas();
    configurarAccesosAnfitrion();
    configurarSelectSedesOperaciones();
    renderizarGuiasOperativas();
    mostrarToast(vistaAnfitrionActiva
        ? 'Vista global de Anfitrión activada.'
        : 'Tu vista administrativa fue restaurada.');
}

function usuarioPuedeAbrirModulo(modulo) {
    return !usuarioEsAnfitrion() || !MODULOS_RESTRINGIDOS_ANFITRION.has(modulo);
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
    vistaAnfitrionActiva = false;

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
        try {
            vistaAnfitrionActiva = usuarioPuedeUsarVistaAnfitrion()
                && sessionStorage.getItem(HOST_PREVIEW_SESSION_KEY) === '1';
            if (!usuarioPuedeUsarVistaAnfitrion()) sessionStorage.removeItem(HOST_PREVIEW_SESSION_KEY);
        } catch (errorVista) {
            vistaAnfitrionActiva = false;
        }
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
    configurarAccesoEncuestas();
    configurarAccesosAnfitrion();
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

    return !usuarioEsAnfitrion()
        && [ROL_SUPERIOR, 'admin', 'supervisor', 'fortaleza', ...ROLES_OPERACION_GLOBAL].includes(perfilActual?.rol);
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
    const acceso = guia.audiencia === 'supervision' ? 'Solo supervisión y administración' : 'Todos los usuarios';
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
            estado.textContent = `${nombre} fue creado. DNI: ${dni}. Contraseña temporal: ${data.temporaryPassword}`;
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

    const guias = guiasOperativas.filter(usuarioPuedeVerGuia).filter(guia => usuarioPuedeAbrirModulo(guia.modulo)).map(guia => ({
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
    ].filter(([, , modulo]) => usuarioPuedeAbrirModulo(modulo)).map(([titulo, detalle, modulo]) => ({
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
            ? 'Estás usando una contraseña temporal. Puedes crear ahora una clave personal de al menos 8 caracteres.'
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
                ? 'Las contraseñas no coinciden.'
                : 'La contraseña debe tener al menos 8 caracteres.';
            estado.dataset.status = 'error';
        }
        return;
    }
    if (estado) {
        estado.textContent = 'Actualizando contraseña...';
        estado.dataset.status = 'info';
    }
    const { error } = await supabaseClient.auth.updateUser({ password });
    if (error) {
        if (estado) {
            estado.textContent = 'No se pudo actualizar la contraseña.';
            estado.dataset.status = 'error';
        }
        return;
    }
    await supabaseClient.rpc('confirmar_cambio_password');
    if (perfilActual) perfilActual.debe_cambiar_password = false;
    mostrarToast('Contraseña personal actualizada.');
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
        vistaAnfitrionActiva = false;
        try {
            sessionStorage.removeItem(HOST_PREVIEW_SESSION_KEY);
        } catch (error) {
            console.warn('No se pudo limpiar la vista de anfitrión:', error);
        }
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
        if (canalEncuestasSatisfaccion && supabaseClient) {
            supabaseClient.removeChannel(canalEncuestasSatisfaccion);
            canalEncuestasSatisfaccion = null;
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
    actualizarBotonesPermisos();
    await cargarPerfilActual();
    if (perfilActual?.rol === 'marcador') {
        window.location.replace('asistencia.html');
        return;
    }
    await cargarComunicadosGdh();
    suscribirComunicadosGdh();
    if (perfilActual?.debe_cambiar_password) {
        abrirModalCambioPassword(true);
    }
    limpiarEvidenciasOperacionesVencidas();
    configurarSelectSedesOperaciones();
    configurarSelectSedesOcupabilidad();
    if (usuarioPuedeVerActivosOperaciones()) {
        configurarSedeActivosOperaciones();
        await cargarActivosOperaciones();
        suscribirActivosOperaciones();
    }
    if (usuarioPuedeGestionarAbonados()) {
        await cargarSolicitudesAbonados();
        suscribirSolicitudesAbonados();
    }
    if (usuarioPuedeVerEncuestas()) {
        await cargarEncuestasSatisfaccion();
        suscribirEncuestasSatisfaccion();
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
        actualizarEstadoAuth('Completa usuario y contraseña.', 'error');
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
        actualizarEstadoAuth('No se pudo iniciar sesión. Revisa DNI y contraseña.', 'error');
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

    vistaAnfitrionActiva = false;
    try {
        sessionStorage.removeItem(HOST_PREVIEW_SESSION_KEY);
    } catch (error) {
        console.warn('No se pudo limpiar la vista de anfitrión:', error);
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
    if (modulo === 'encuestas' && !usuarioPuedeVerEncuestas()) {
        mostrarToast('Este modulo esta disponible solo para administradores autorizados.');
        modulo = null;
    }
    if (modulo && !usuarioPuedeAbrirModulo(modulo)) {
        mostrarToast('Tu rol no tiene acceso a este módulo.');
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
        if (moduloActivo === 'encuestas') {
            cargarEncuestasSatisfaccion();
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
        display.appendChild(crearMensajeVacio('Ningún código activo', 'active-empty'));
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
        ? `Código finalizado: ${formatearFechaHoraISO(estado.cerradoEn)}`
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
        imagen.alt = 'Lámina de código de emergencia';
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
        fotoInput.addEventListener('change', () => procesarFotoChecklistCodigo(fotoInput));
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

const CAMPOS_ENCUESTA = [
    ['atencion', 'Atención'],
    ['uniforme', 'Uniforme'],
    ['saludo', 'Saludo'],
    ['informacion', 'Información'],
    ['solucion', 'Solución']
];

function usuarioPuedeVerEncuestas() {
    return usuarioEsAdmin() && perfilActual?.activo !== false;
}

function obtenerSedeEncuestasActiva() {
    if (!usuarioEsAdminGlobal()) return perfilActual?.sede || '';
    return obtenerElemento('surveyAdminSite')?.value || SEDES_OPERACION[0].id;
}

function actualizarBadgeEncuestas() {
    const texto = obtenerElemento('surveyModuleCount');
    if (!texto) return;
    texto.innerHTML = '';
    if (!encuestasNuevas) {
        texto.textContent = 'QR y satisfacción';
        return;
    }
    texto.append(document.createTextNode('Nueva encuesta '));
    const badge = document.createElement('span');
    badge.className = 'survey-new-badge';
    badge.textContent = String(encuestasNuevas);
    texto.appendChild(badge);
}

function configurarAccesoEncuestas() {
    const permitido = usuarioPuedeVerEncuestas();
    const boton = document.querySelector('.survey-module-button');
    if (boton) boton.hidden = !permitido;
    if (!permitido) return;
    const selector = obtenerElemento('surveyAdminSite');
    if (selector && !selector.options.length) {
        SEDES_OPERACION.forEach(sede => selector.add(new Option(sede.nombre, sede.id)));
    }
    if (selector) {
        selector.value = usuarioEsAdminGlobal() ? (selector.value || SEDES_OPERACION[0].id) : perfilActual.sede;
        selector.disabled = !usuarioEsAdminGlobal();
    }
    const month = obtenerElemento('surveyAdminMonth');
    if (month && !month.value) month.value = fechaLocalISO().slice(0, 7);
    actualizarBadgeEncuestas();
    renderizarQrEncuestas();
}

function obtenerUrlEncuestaSede(sede = obtenerSedeEncuestasActiva()) {
    const url = new URL('encuesta.html', window.location.href);
    url.search = new URLSearchParams({ sede }).toString();
    url.hash = '';
    return url.toString();
}

function renderizarQrEncuestas() {
    const container = obtenerElemento('surveyQrCode');
    const siteName = obtenerElemento('surveyQrSiteName');
    if (!container || !window.QRCode) return;
    limpiarElemento(container);
    const sede = obtenerSedeEncuestasActiva();
    new QRCode(container, { text: obtenerUrlEncuestaSede(sede), width: 214, height: 214, correctLevel: QRCode.CorrectLevel.M });
    if (siteName) siteName.textContent = obtenerNombreSede(sede);
}

function descargarQrEncuestas() {
    const container = obtenerElemento('surveyQrCode');
    const canvas = container?.querySelector('canvas');
    const image = container?.querySelector('img');
    const nombre = `QR-Encuesta-${obtenerSedeEncuestasActiva()}.png`;
    if (canvas) {
        canvas.toBlob(blob => blob && descargarBlob(blob, nombre), 'image/png');
    } else if (image?.src) {
        const link = document.createElement('a');
        link.href = image.src;
        link.download = nombre;
        link.click();
    }
}

function rangoMesEncuestas() {
    const month = obtenerElemento('surveyAdminMonth')?.value || fechaLocalISO().slice(0, 7);
    const [year, number] = month.split('-').map(Number);
    return { start: `${month}-01`, end: new Date(Date.UTC(year, number, 1)).toISOString().slice(0, 10) };
}

function textoResultadoEncuesta(value) {
    return Number(value) === 1 ? 'Cumple' : Number(value) === 0 ? 'No cumple' : 'No aplica';
}

function renderizarEncuestasSatisfaccion() {
    const list = obtenerElemento('surveyAdminList');
    if (!list) return;
    limpiarElemento(list);
    let comply = 0;
    let failures = 0;
    let applicable = 0;
    encuestasSatisfaccion.forEach(item => CAMPOS_ENCUESTA.forEach(([key]) => {
        if (Number(item[key]) === 2) return;
        applicable += 1;
        if (Number(item[key]) === 1) comply += 1;
        else failures += 1;
    }));
    obtenerElemento('surveyKpiTotal').textContent = String(encuestasSatisfaccion.length);
    obtenerElemento('surveyKpiCompliance').textContent = `${applicable ? Math.round(comply * 100 / applicable) : 0}%`;
    obtenerElemento('surveyKpiFailures').textContent = String(failures);
    obtenerElemento('surveyKpiLatest').textContent = encuestasSatisfaccion[0]?.created_at
        ? new Date(encuestasSatisfaccion[0].created_at).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })
        : '-';
    if (!encuestasSatisfaccion.length) {
        const empty = document.createElement('p');
        empty.className = 'survey-empty';
        empty.textContent = 'No hay encuestas registradas en este mes.';
        list.appendChild(empty);
        return;
    }
    encuestasSatisfaccion.forEach(item => {
        const card = document.createElement('article');
        card.className = 'survey-result-item';
        const heading = document.createElement('div');
        heading.className = 'survey-result-heading';
        const name = document.createElement('strong');
        name.textContent = item.colaborador_nombre;
        const date = document.createElement('span');
        date.textContent = new Date(item.created_at).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
        heading.append(name, date);
        const scores = document.createElement('div');
        scores.className = 'survey-result-scores';
        CAMPOS_ENCUESTA.forEach(([key, label]) => {
            const score = document.createElement('span');
            const value = Number(item[key]);
            score.textContent = `${label}: ${textoResultadoEncuesta(value)}`;
            score.classList.toggle('is-fail', value === 0);
            score.classList.toggle('is-na', value === 2);
            scores.appendChild(score);
        });
        card.append(heading, scores);
        if (item.observacion) {
            const observation = document.createElement('p');
            observation.textContent = item.observacion;
            card.appendChild(observation);
        }
        list.appendChild(card);
    });
}

async function cargarEncuestasSatisfaccion() {
    if (!usuarioPuedeVerEncuestas() || !supabaseClient) return;
    const { start, end } = rangoMesEncuestas();
    const { data, error } = await supabaseClient.from('encuestas_satisfaccion')
        .select('id,sede,fecha,colaborador_nombre,atencion,uniforme,saludo,informacion,solucion,observacion,created_at')
        .eq('sede', obtenerSedeEncuestasActiva()).gte('fecha', start).lt('fecha', end)
        .order('created_at', { ascending: false }).limit(500);
    if (error) {
        console.warn('No se pudieron cargar las encuestas:', error);
        mostrarToast('No se pudieron cargar las encuestas.');
        return;
    }
    encuestasSatisfaccion = data || [];
    encuestasNuevas = 0;
    actualizarBadgeEncuestas();
    renderizarEncuestasSatisfaccion();
    renderizarQrEncuestas();
}

function notificarNuevaEncuesta(item) {
    encuestasNuevas += 1;
    actualizarBadgeEncuestas();
    const mensaje = `Nueva encuesta para ${item.colaborador_nombre} en ${obtenerNombreSede(item.sede)}.`;
    mostrarToast(mensaje);
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Nueva encuesta de satisfacción', { body: mensaje, icon: 'assets/icons/icon-192.png' });
    }
    if (item.sede === obtenerSedeEncuestasActiva()) {
        encuestasSatisfaccion.unshift(item);
        renderizarEncuestasSatisfaccion();
    }
}

function suscribirEncuestasSatisfaccion() {
    if (!supabaseClient || !sesionActual?.user || !usuarioPuedeVerEncuestas()) return;
    if (canalEncuestasSatisfaccion) supabaseClient.removeChannel(canalEncuestasSatisfaccion);
    const options = { event: 'INSERT', schema: 'public', table: 'encuestas_satisfaccion' };
    if (!usuarioEsAdminGlobal()) options.filter = `sede=eq.${perfilActual.sede}`;
    canalEncuestasSatisfaccion = supabaseClient.channel(`encuestas-${sesionActual.user.id}`)
        .on('postgres_changes', options, payload => notificarNuevaEncuesta(payload.new))
        .subscribe();
}

async function procesarFotoChecklistCodigo(input) {
    const file = input?.files?.[0];
    if (!file) return;
    try {
        const dataUrl = await comprimirFoto(file);
        await actualizarFotoChecklist(
            input.dataset.codigo,
            Number(input.dataset.index),
            {
                dataUrl,
                nombre: file.name || 'foto-evidencia.jpg',
                tomadaEn: obtenerFechaHoraActual().iso
            }
        );
        mostrarToast('Foto agregada correctamente.');
    } catch (error) {
        console.warn('No se pudo adjuntar la foto:', error);
        mostrarToast(`No se pudo guardar la foto: ${error?.message || 'formato no compatible'}.`);
    } finally {
        input.value = '';
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
        try {
            await guardarMediaLocal(foto.storageKey, foto.dataUrl, 'codigo', { codigo, indice });
        } catch (error) {
            console.warn('El celular no permitio el respaldo local de la foto; se intentara la subida directa:', error);
            foto.storageKey = '';
        }
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

    modalTitle.textContent = 'Lámina del código';
    mostrarLaminaEnModal(info.imagenAmpliada || info.image, info.image, `${info.nombre} - lámina ampliada`);
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
    obtenerElemento('toggleHostPreview')?.addEventListener('click', () => establecerVistaAnfitrion(!vistaAnfitrionActiva));
    obtenerElemento('changePasswordButton')?.addEventListener('click', () => abrirModalCambioPassword(false));
    obtenerElemento('closePasswordModal')?.addEventListener('click', cerrarModalCambioPassword);
    obtenerElemento('passwordChangeForm')?.addEventListener('submit', cambiarPasswordPersonal);
    obtenerElemento('confirmMandatoryAnnouncement')?.addEventListener('click', confirmarComunicadoObligatorio);
    obtenerElemento('declineMandatoryAnnouncement')?.addEventListener('click', () => {
        const estado = obtenerElemento('mandatoryAnnouncementStatus');
        if (estado) estado.textContent = 'La confirmación sigue pendiente. Debes leer y confirmar para continuar.';
    });
    obtenerElemento('enableAlertsButton').addEventListener('click', solicitarPermisoAlertas);
    obtenerElemento('enableGpsButton')?.addEventListener('click', solicitarPermisoGps);
    obtenerElemento('enableCameraButton')?.addEventListener('click', solicitarPermisoCamara);
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
    obtenerElemento('refreshSurveys')?.addEventListener('click', cargarEncuestasSatisfaccion);
    obtenerElemento('surveyAdminMonth')?.addEventListener('change', cargarEncuestasSatisfaccion);
    obtenerElemento('surveyAdminSite')?.addEventListener('change', cargarEncuestasSatisfaccion);
    obtenerElemento('downloadSurveyQr')?.addEventListener('click', descargarQrEncuestas);
    obtenerElemento('openOperationsOccupancy')?.addEventListener('click', () => establecerPanelOcupabilidadOperaciones(true));
    obtenerElemento('closeOperationsOccupancy')?.addEventListener('click', cerrarPanelOcupabilidadOperaciones);
    obtenerElemento('loadOperationsOccupancy')?.addEventListener('click', cargarOcupabilidadDiaria);
    obtenerElemento('operationsOccupancySite')?.addEventListener('change', cargarOcupabilidadDiaria);
    obtenerElemento('exportOperationsOccupancyExcel')?.addEventListener('click', () => exportarCorteOcupabilidadExcel());
    obtenerElemento('shareOperationsOccupancyWhatsApp')?.addEventListener('click', () => exportarCorteOcupabilidadExcel('', true));
    obtenerElemento('reportingTypeSelector')?.addEventListener('click', event => {
        const boton = event.target.closest('[data-reporting-type]');
        if (boton) seleccionarTipoReporteria(boton.dataset.reportingType);
    });
    obtenerElemento('takeReportingPhoto')?.addEventListener('click', () => obtenerElemento('reportingCameraInput').click());
    obtenerElemento('chooseReportingExcel')?.addEventListener('click', () => obtenerElemento('reportingExcelInput').click());
    obtenerElemento('reportingExcelInput')?.addEventListener('change', event => cargarExcelReporteria(event.target.files));
    obtenerElemento('chooseReportingImage')?.addEventListener('click', () => obtenerElemento('reportingGalleryInput').click());
    obtenerElemento('pasteReportingImage')?.addEventListener('click', pegarCapturaReporteria);
    obtenerElemento('reportingCameraInput')?.addEventListener('change', event => seleccionarCapturaReporteria(event.target.files, { agregar: true }));
    obtenerElemento('reportingGalleryInput')?.addEventListener('change', event => seleccionarCapturaReporteria(event.target.files));
    obtenerElemento('processReportingImage')?.addEventListener('click', procesarCapturaReporteria);
    obtenerElemento('buildReportingTable')?.addEventListener('click', convertirTextoReporteriaEnTabla);
    obtenerElemento('addReportingRow')?.addEventListener('click', agregarFilaReporteria);
    obtenerElemento('reportingTableCard')?.addEventListener('input', event => {
        const campo = event.target.closest('[data-reporting-column]');
        if (campo) actualizarDatoTablaReporteria(campo);
    });
    obtenerElemento('reportingTableCard')?.addEventListener('click', event => {
        const eliminar = event.target.closest('[data-delete-reporting-row]');
        if (eliminar) eliminarFilaReporteria(eliminar.dataset.deleteReportingRow);
    });
    obtenerElemento('exportReportingExcel')?.addEventListener('click', exportarExcelReporteria);
    obtenerElemento('clearReportingWorkspace')?.addEventListener('click', () => limpiarReporteria(true));
    document.addEventListener('paste', manejarPegadoCapturaReporteria);
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
    obtenerElemento('downloadLastOperationsChecklist')?.addEventListener('click', () => descargarPdfChecklistOperaciones(ultimoChecklistOperacionesFinalizado));
    obtenerElemento('openOperationsDashboard')?.addEventListener('click', () => establecerPanelDashboardOperaciones(true));
    obtenerElemento('closeOperationsDashboard')?.addEventListener('click', () => establecerPanelDashboardOperaciones(false));
    obtenerElemento('refreshOperationsDashboard')?.addEventListener('click', cargarDashboardOperaciones);
    obtenerElemento('operationsDashboardMonth')?.addEventListener('change', cargarDashboardOperaciones);
    obtenerElemento('operationsDashboardSite')?.addEventListener('change', cargarDashboardOperaciones);
    obtenerElemento('exportOperationsChecklistExcel')?.addEventListener('click', exportarChecklistOperacionesExcel);
    obtenerElemento('operationsChecklistHistory')?.addEventListener('click', event => {
        const boton = event.target.closest('button[data-share-operations-checklist], button[data-download-operations-checklist]');
        if (!boton) return;
        const id = boton.dataset.shareOperationsChecklist || boton.dataset.downloadOperationsChecklist;
        const registro = historialChecklistsOperaciones.find(item => item.id === id);
        if (boton.dataset.downloadOperationsChecklist) descargarPdfChecklistOperaciones(registro);
        else compartirPdfChecklistOperaciones(registro);
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
    window.setInterval(limpiarEvidenciasOperacionesVencidas, 5 * 60 * 1000);
});

window.addEventListener('popstate', event => {
    seleccionarModulo(obtenerModuloDesdeRuta(event.state), {
        desplazar: false,
        registrarHistorial: false
    });
    const panelSolicitado = event.state?.urbaparkOperationsPanel || '';
    const panelOperaciones = panelSolicitado === 'general' && !usuarioPuedeVerReporteriaOperaciones()
        ? ''
        : panelSolicitado;
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
