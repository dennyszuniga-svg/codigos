const LOGO_SRC = 'assets/urbapark-logo.png';
const PUBLIC_LOGO_SRC = 'https://dennyszuniga-svg.github.io/codigos/assets/urbapark-logo.png';
const APP_CONTEXT = readAppContext();
const DRAFT_KEY = `urbapark-intervention-draft-v3:${APP_CONTEXT.usuarioId || 'sin-usuario'}`;
const COUNTER_KEY = 'urbapark-report-counter';
const MAINTENANCE_REPORTS_KEY = 'urbapark-maintenance-reports';
const DRAFT_MAX_BYTES = 4_200_000;
const PHOTO_COMPRESSION = {
    normal: { maxSize: 1280, quality: 0.66 },
    bulk: { maxSize: 960, quality: 0.58 }
};
const REPORT_PREFIX = `UP-${new Date().getFullYear()}`;
const SUPABASE_CONFIG = {
    url: 'https://uibiwhkxlyxdfytvudbn.supabase.co',
    publishableKey: 'sb_publishable_R-auhGcSmwSl-1U9WdGe3g_ZYm5BZEt'
};
const SEDES = {
    puruchuco: 'Real Plaza Puruchuco',
    salaverry: 'Real Plaza Salaverry',
    primavera: 'Real Plaza Primavera',
    civico: 'Real Plaza Civico',
    gama: 'GAMA'
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
    { sede: 'puruchuco', codigo: 'SALIDA JAVIER PRADO PROVEEDORES', nombre: 'Carril de salida Javier Prado Proveedores', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'puruchuco', codigo: 'SALIDA 1 DE SMARTFIT', nombre: 'Carril de salida 1 Smartfit', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'puruchuco', codigo: 'SALIDA 1 VISTA ALEGRE', nombre: 'Carril de salida 1 Vista Alegre', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'puruchuco', codigo: 'SALIDA 2 VISTA ALEGRE', nombre: 'Carril de salida 2 Vista Alegre', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'puruchuco', codigo: 'SALIDA DE NICOLAS AYLLON', nombre: 'Carril de salida Nicolas Ayllon', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'puruchuco', codigo: 'SALIDA 2 CARRETERA CENTRAL', nombre: 'Carril de salida 2 Carretera Central', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
    { sede: 'puruchuco', codigo: 'SALIDA 3 CARRETERA CENTRAL', nombre: 'Carril de salida 3 Carretera Central', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 }
];
Object.keys(SEDES).forEach(sede => {
    EQUIPOS_MANTENIMIENTO.push(
        { sede, codigo: 'ESTACIONAMIENTO', nombre: 'Mejoras generales de estacionamiento', tipo: 'Infraestructura', componentes: ['Infraestructura del estacionamiento'], preventivoMinutos: 0 },
        { sede, codigo: 'FORTALEZA', nombre: 'Trabajos de Fortaleza', tipo: 'Infraestructura', componentes: ['Infraestructura y seguridad vial'], preventivoMinutos: 0 }
    );
});

const form = document.getElementById('incidentForm');
const previewSection = document.getElementById('previewSection');
const statusMessage = document.getElementById('statusMessage');
const taskList = document.getElementById('taskList');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const reportNumberLabel = document.getElementById('reportNumberLabel');

const fields = {
    numeroInforme: document.getElementById('numeroInforme'),
    clienteArea: document.getElementById('clienteArea'),
    personal: document.getElementById('personal'),
    firmaTecnicoNombre: document.getElementById('firmaTecnicoNombre'),
    firmaSupervisorNombre: document.getElementById('firmaSupervisorNombre'),
    sede: document.getElementById('sede'),
    equipo: document.getElementById('equipo'),
    prioridad: document.getElementById('prioridad'),
    tipoMantenimiento: document.getElementById('tipoMantenimiento'),
    impactoOperativo: document.getElementById('impactoOperativo'),
    estadoInicial: document.getElementById('estadoInicial'),
    estadoInicialOtro: document.getElementById('estadoInicialOtro'),
    horaInicio: document.getElementById('horaInicio'),
    horaFinal: document.getElementById('horaFinal'),
    duracion: document.getElementById('duracion'),
    incidente: document.getElementById('incidente'),
    solucion: document.getElementById('solucion'),
    resultadoFinal: document.getElementById('resultadoFinal'),
    repuestos: document.getElementById('repuestos'),
    observaciones: document.getElementById('observaciones'),
    conclusiones: document.getElementById('conclusiones')
};

const groups = {
    clienteArea: document.getElementById('clienteAreaGroup'),
    personal: document.getElementById('personalGroup'),
    sede: document.getElementById('sedeGroup'),
    equipo: document.getElementById('equipoGroup'),
    prioridad: document.getElementById('prioridadGroup'),
    tipoMantenimiento: document.getElementById('tipoMantenimientoGroup'),
    impactoOperativo: document.getElementById('impactoOperativoGroup'),
    estadoInicial: document.getElementById('estadoInicialGroup'),
    estadoInicialOtro: document.getElementById('estadoInicialOtroGroup'),
    horaInicio: document.getElementById('horaInicioGroup'),
    horaFinal: document.getElementById('horaFinalGroup'),
    incidente: document.getElementById('incidenteGroup'),
    solucion: document.getElementById('solucionGroup'),
    resultadoFinal: document.getElementById('resultadoFinalGroup'),
    conclusiones: document.getElementById('conclusionesGroup'),
    actividades: document.getElementById('activityTasksGroup'),
    firmaTecnico: document.getElementById('firmaTecnicoGroup'),
    firmaSupervisor: document.getElementById('firmaSupervisorGroup'),
    firmaSupervisorNombre: document.getElementById('firmaSupervisorGroup')
};

const preview = {
    fechaGuardado: document.getElementById('previewFechaGuardado'),
    datosGenerales: document.getElementById('previewDatosGenerales'),
    incidente: document.getElementById('previewIncidente'),
    actividades: document.getElementById('previewActividades'),
    solucion: document.getElementById('previewSolucion'),
    observaciones: document.getElementById('previewObservaciones'),
    conclusiones: document.getElementById('previewConclusiones'),
    firmas: document.getElementById('previewFirmas')
};

let nextTaskId = 1;
let tasks = [];
let reportSequence = 1;
let reportSaved = false;
let lastGeneratedAt = null;
let draftTimer = null;
let signaturePads = {};
let supabaseClient = null;
let inventarioInforme = [];
let repuestosUsados = [];
let nextRepuestoUsoId = 1;

initSignaturePads();
initForm();
validarAccesoInforme();

document.getElementById('btnLimpiar').addEventListener('click', confirmResetForm);
document.getElementById('btnPrevisualizar').addEventListener('click', () => {
    if (renderPreview()) {
        previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});
document.getElementById('btnCopiar').addEventListener('click', copyReport);
document.getElementById('btnDescargar').addEventListener('click', downloadReport);
document.getElementById('addInventoryUsage')?.addEventListener('click', () => {
    agregarUsoInventario();
    renderizarUsoInventario();
    scheduleDraftSave();
});

form.addEventListener('submit', (event) => {
    event.preventDefault();
    exportPdf();
});
window.addEventListener('pagehide', saveDraft);

Object.entries(fields).forEach(([name, field]) => {
    field.addEventListener('input', () => {
        if (groups[name] && field.value.trim()) {
            setFieldError(name, false);
        }

        if (name === 'sede') {
            fields.equipo.value = '';
            renderEquipmentCatalog();
            cargarInventarioInforme();
        }
        if (name === 'equipo' || name === 'tipoMantenimiento') {
            actualizarImpactoOperativoSugerido();
        }
        syncSignatureNames();
        updateComputedFields();
        scheduleDraftSave();
    });
    field.addEventListener('change', () => {
        updateEstadoInicialOtroVisibility();
        if (name === 'sede') {
            renderEquipmentCatalog();
            cargarInventarioInforme();
        }
        if (name === 'equipo' || name === 'tipoMantenimiento') {
            actualizarImpactoOperativoSugerido();
        }
        syncSignatureNames();
        updateComputedFields();
        scheduleDraftSave();
    });
});

document.querySelectorAll('[data-clear-signature]').forEach((button) => {
    button.addEventListener('click', () => {
        const id = button.dataset.clearSignature;
        signaturePads[id].clear();
        if (id === 'firmaSupervisor') {
            fields.horaFinal.value = '';
            updateDuration();
        }
        setFieldError(id, false);
        scheduleDraftSave();
    });
});

taskList.addEventListener('change', async (event) => {
    const task = getTaskFromEvent(event);

    if (!task) {
        return;
    }

    if (event.target.dataset.action === 'toggle-task') {
        task.done = event.target.checked;
        renderTasks();
        updateProgress();
        scheduleDraftSave();
        clearStatus();
    }

    if (event.target.dataset.action === 'task-photos') {
        const photos = await readImageFiles([...event.target.files]);
        task.photos.push(...photos);
        renderTasks();
        updateProgress();
        scheduleDraftSave();
        setStatus(`${photos.length} foto${photos.length === 1 ? '' : 's'} agregada${photos.length === 1 ? '' : 's'}. Complete tipo y subtitulo.`);
    }

    if (event.target.dataset.action === 'photo-stage') {
        const photo = task.photos.find((item) => item.id === Number(event.target.dataset.photoId));

        if (photo) {
            photo.stage = event.target.value;
            if (ensureNextTaskIfReady(task)) {
                renderTasks();
            }
            updateProgress();
            scheduleDraftSave();
            clearStatus();
        }
    }
});

taskList.addEventListener('input', (event) => {
    const task = getTaskFromEvent(event);

    if (!task) {
        return;
    }

    if (event.target.dataset.action === 'task-description') {
        task.description = event.target.value;
        if (ensureNextTaskIfReady(task)) {
            renderTasks();
        }
    }

    if (event.target.dataset.action === 'photo-caption') {
        const photo = task.photos.find((item) => item.id === Number(event.target.dataset.photoId));

        if (photo) {
            photo.caption = event.target.value;
            if (ensureNextTaskIfReady(task)) {
                renderTasks();
            }
        }
    }

    updateProgress();
    scheduleDraftSave();
    clearStatus();
});

taskList.addEventListener('click', (event) => {
    const task = getTaskFromEvent(event);

    if (!task) {
        return;
    }

    if (event.target.dataset.action === 'remove-task') {
        tasks = tasks.filter((item) => item.id !== task.id);
        renderTasks();
    }

    if (event.target.dataset.action === 'remove-photo') {
        task.photos = task.photos.filter((photo) => photo.id !== Number(event.target.dataset.photoId));
        renderTasks();
    }

    updateProgress();
    scheduleDraftSave();
    clearStatus();
});

document.getElementById('inventoryUsageList')?.addEventListener('change', event => {
    const fila = event.target.closest('[data-inventory-usage-id]');
    const uso = fila ? repuestosUsados.find(item => item.uid === Number(fila.dataset.inventoryUsageId)) : null;
    if (!uso) {
        return;
    }

    if (event.target.dataset.action === 'usage-item') {
        const repuesto = inventarioInforme.find(item => item.id === event.target.value);
        uso.id = repuesto?.id || '';
        uso.codigo = repuesto?.codigo || '';
        uso.nombre = repuesto?.nombre || '';
        uso.unidad = repuesto?.unidad || 'unidad';
    }
    scheduleDraftSave();
    renderizarUsoInventario();
});

document.getElementById('inventoryUsageList')?.addEventListener('input', event => {
    const fila = event.target.closest('[data-inventory-usage-id]');
    const uso = fila ? repuestosUsados.find(item => item.uid === Number(fila.dataset.inventoryUsageId)) : null;
    if (!uso) {
        return;
    }

    if (event.target.dataset.action === 'usage-quantity') {
        uso.cantidad = event.target.value;
    }
    if (event.target.dataset.action === 'usage-note') {
        uso.observacion = event.target.value;
    }
    scheduleDraftSave();
});

document.getElementById('inventoryUsageList')?.addEventListener('click', event => {
    const boton = event.target.closest('[data-remove-usage]');
    if (!boton) {
        return;
    }
    repuestosUsados = repuestosUsados.filter(item => item.uid !== Number(boton.dataset.removeUsage));
    renderizarUsoInventario();
    scheduleDraftSave();
});

function initForm() {
    const draft = readDraft();

    if (draft) {
        applyDraft(draft);
    } else {
        startNewReport();
    }

    applyAppContext();
    renderTasks();
    updateEstadoInicialOtroVisibility();
    syncSignatureNames();
    updateComputedFields();
}

function startNewReport() {
    reportSequence = getStoredCounter() + 1;
    reportSaved = false;
    fields.numeroInforme.value = formatReportNumber(reportSequence);
    reportNumberLabel.textContent = `Informe ${fields.numeroInforme.value}`;
    setDefaultTimes();
    applyAppContext();
    syncSignatureNames();
    tasks = [];
    nextTaskId = 1;
    createTask();
    lastGeneratedAt = null;
}

function readAppContext() {
    const params = new URLSearchParams(window.location.search);
    return {
        tecnico: params.get('tecnico')?.trim() || '',
        usuarioId: params.get('usuarioId')?.trim() || '',
        sede: params.get('sede')?.trim() || '',
        sedeId: params.get('sedeId')?.trim() || '',
        regreso: params.get('regreso') || 'index.html?module=mantenimiento'
    };
}

function applyAppContext() {
    if (!fields.personal.value && APP_CONTEXT.tecnico) {
        fields.personal.value = APP_CONTEXT.tecnico;
    }
    if (!fields.sede.value && APP_CONTEXT.sede) {
        fields.sede.value = APP_CONTEXT.sede;
    }
    if (!fields.clienteArea.value) {
        fields.clienteArea.value = 'UrbaPark';
    }
    const volver = document.getElementById('backToApp');
    if (volver) {
        volver.href = APP_CONTEXT.regreso;
    }
    renderEquipmentCatalog();
}

function getActiveSiteId() {
    const texto = fields.sede.value.trim().toLowerCase();
    const sedeSeleccionada = Object.entries(SEDES).find(([, nombre]) => nombre.toLowerCase() === texto)?.[0];
    return sedeSeleccionada || (SEDES[APP_CONTEXT.sedeId] ? APP_CONTEXT.sedeId : '');
}

function getEquipmentInfo(code = fields.equipo.value) {
    const sede = getActiveSiteId();
    const codigo = String(code || '').trim().toUpperCase();
    return EQUIPOS_MANTENIMIENTO.find(item =>
        item.sede === sede
        && (
            item.codigo.toUpperCase() === codigo
            || item.nombre.toUpperCase() === codigo
        )
    ) || null;
}

function renderEquipmentCatalog() {
    const datalist = document.getElementById('equipmentCatalog');
    if (!datalist) {
        return;
    }

    datalist.innerHTML = '';
    const sede = getActiveSiteId();
    EQUIPOS_MANTENIMIENTO
        .filter(item => item.sede === sede)
        .forEach(item => {
            const option = document.createElement('option');
            option.value = item.codigo;
            option.label = `${item.nombre} - ${item.tipo}`;
            datalist.appendChild(option);
        });
}

function actualizarImpactoOperativoSugerido() {
    const equipo = getEquipmentInfo();
    const esMejora = fields.tipoMantenimiento.value === 'Mejora / Instalacion';
    const esInfraestructura = equipo?.tipo === 'Infraestructura';
    fields.impactoOperativo.value = esMejora || esInfraestructura ? 'sin_parada' : 'con_parada';
}

function applyDraft(draft) {
    Object.entries(draft.fields || {}).forEach(([name, value]) => {
        if (fields[name]) {
            fields[name].value = value;
        }
    });
    reportSequence = draft.reportSequence || getStoredCounter() + 1;
    reportSaved = Boolean(draft.reportSaved);
    fields.numeroInforme.value = draft.reportNumber || formatReportNumber(reportSequence);
    reportNumberLabel.textContent = `Informe ${fields.numeroInforme.value}`;
    syncSignatureNames();
    tasks = draft.tasks?.length
        ? draft.tasks.map(task => ({
            ...task,
            photos: Array.isArray(task.photos)
                ? task.photos.filter(photo => photo?.dataUrl)
                : []
        }))
        : [];
    nextTaskId = Math.max(0, ...tasks.map((task) => task.id || 0)) + 1;
    repuestosUsados = Array.isArray(draft.repuestosUsados)
        ? draft.repuestosUsados.map((uso, index) => ({
            uid: Number(uso.uid || index + 1),
            id: uso.id || '',
            codigo: uso.codigo || '',
            nombre: uso.nombre || '',
            cantidad: uso.cantidad || '1',
            unidad: uso.unidad || 'unidad',
            observacion: uso.observacion || ''
        }))
        : [];
    nextRepuestoUsoId = Math.max(0, ...repuestosUsados.map(uso => uso.uid || 0)) + 1;

    if (!tasks.length) {
        createTask();
    }

    if (draft.signatures?.firmaTecnico) {
        signaturePads.firmaTecnico.load(draft.signatures.firmaTecnico);
    }

    if (draft.signatures?.firmaSupervisor) {
        signaturePads.firmaSupervisor.load(draft.signatures.firmaSupervisor);
    }
    renderizarUsoInventario();
}

function setDefaultTimes() {
    if (!fields.horaInicio.value) {
        fields.horaInicio.value = new Date().toTimeString().slice(0, 5);
    }
}

function syncSignatureNames() {
    fields.firmaTecnicoNombre.value = fields.personal.value.trim();
}

function agregarUsoInventario(overrides = {}) {
    repuestosUsados.push({
        uid: nextRepuestoUsoId,
        id: '',
        codigo: '',
        nombre: '',
        cantidad: '1',
        unidad: 'unidad',
        observacion: '',
        ...overrides
    });
    nextRepuestoUsoId += 1;
}

function obtenerRepuestosUsadosValidos() {
    return repuestosUsados
        .map(uso => {
            const repuesto = inventarioInforme.find(item => item.id === uso.id);
            const cantidad = Number(uso.cantidad);
            return {
                id: uso.id,
                codigo: repuesto?.codigo || uso.codigo || '',
                nombre: repuesto?.nombre || uso.nombre || '',
                cantidad: Number.isFinite(cantidad) && cantidad > 0 ? cantidad : 0,
                unidad: repuesto?.unidad || uso.unidad || 'unidad',
                observacion: uso.observacion || ''
            };
        })
        .filter(uso => uso.id && uso.cantidad > 0);
}

function renderizarUsoInventario() {
    const lista = document.getElementById('inventoryUsageList');
    const estado = document.getElementById('inventoryUsageStatus');
    if (!lista) {
        return;
    }

    lista.innerHTML = '';
    if (estado) {
        estado.textContent = inventarioInforme.length
            ? `${inventarioInforme.length} repuestos disponibles para seleccionar.`
            : 'No hay inventario cargado para esta sede o no hay conexion.';
    }

    if (!repuestosUsados.length) {
        const vacio = document.createElement('p');
        vacio.className = 'field-help';
        vacio.textContent = 'No se descontaran repuestos del inventario en este informe.';
        lista.appendChild(vacio);
        return;
    }

    repuestosUsados.forEach((uso, indice) => {
        const fila = document.createElement('article');
        const selector = document.createElement('select');
        const cantidad = document.createElement('input');
        const nota = document.createElement('input');
        const eliminar = document.createElement('button');
        const repuestoSeleccionado = inventarioInforme.find(item => item.id === uso.id);

        fila.className = 'inventory-usage-row';
        fila.dataset.inventoryUsageId = String(uso.uid);

        selector.dataset.action = 'usage-item';
        selector.setAttribute('aria-label', `Repuesto usado ${indice + 1}`);
        selector.appendChild(new Option('Selecciona repuesto', ''));
        inventarioInforme.forEach(item => {
            const opcion = new Option(`${item.codigo} - ${item.nombre} (${item.stock} ${item.unidad})`, item.id);
            opcion.selected = item.id === uso.id;
            selector.appendChild(opcion);
        });

        cantidad.type = 'number';
        cantidad.min = '0';
        cantidad.step = '0.01';
        cantidad.value = uso.cantidad || '1';
        cantidad.dataset.action = 'usage-quantity';
        cantidad.setAttribute('aria-label', `Cantidad usada ${indice + 1}`);

        nota.type = 'text';
        nota.value = uso.observacion || '';
        nota.placeholder = repuestoSeleccionado ? `Unidad: ${repuestoSeleccionado.unidad}` : 'Observacion opcional';
        nota.dataset.action = 'usage-note';
        nota.setAttribute('aria-label', `Observacion del repuesto ${indice + 1}`);

        eliminar.type = 'button';
        eliminar.className = 'btn btn-secondary btn-small';
        eliminar.dataset.removeUsage = String(uso.uid);
        eliminar.textContent = 'Quitar';
        fila.append(selector, cantidad, nota, eliminar);
        lista.appendChild(fila);
    });
}

function confirmResetForm() {
    const confirmed = window.confirm(
        '¿Seguro que desea limpiar todo el avance?\n\nSe eliminarán las tareas, fotos, firmas y datos guardados en este borrador. Esta acción no se puede deshacer.'
    );

    if (!confirmed) {
        setStatus('El avance se mantuvo sin cambios.');
        return;
    }

    resetForm();
    setStatus('El avance del informe fue eliminado.');
}

function resetForm() {
    form.reset();
    clearDraft();
    repuestosUsados = [];
    nextRepuestoUsoId = 1;
    Object.keys(groups).forEach((name) => setFieldError(name, false));
    groups.actividades.classList.remove('error');
    signaturePads.firmaTecnico.clear();
    signaturePads.firmaSupervisor.clear();
    startNewReport();
    renderTasks();
    renderizarUsoInventario();
    updateEstadoInicialOtroVisibility();
    updateComputedFields();
    previewSection.classList.remove('active');
}

function createTask(overrides = {}) {
    tasks.push({
        id: nextTaskId,
        done: false,
        description: '',
        photos: [],
        ...overrides
    });
    nextTaskId += 1;
}

function renderTasks() {
    taskList.innerHTML = tasks.map((task, index) => `
        <article class="task-card ${task.done ? 'active' : ''}" data-task-id="${task.id}">
            <div class="task-summary">
                <label class="task-check" for="taskDone${task.id}">
                    <input type="checkbox" id="taskDone${task.id}" data-action="toggle-task" ${task.done ? 'checked' : ''}>
                    <span>Tarea ${index + 1} realizada</span>
                </label>
                <span class="task-count">${task.photos.length} foto${task.photos.length === 1 ? '' : 's'}</span>
                ${tasks.length > 1 ? `<button type="button" class="btn btn-secondary task-remove" data-action="remove-task">Quitar</button>` : ''}
            </div>
            <div class="task-detail">
                <div>
                    <label for="taskDescription${task.id}">Detalle de la tarea</label>
                    <textarea id="taskDescription${task.id}" data-action="task-description" placeholder="Describa lo que se realiz&oacute; en esta tarea.">${escapeHtml(task.description)}</textarea>
                </div>
                <div class="photo-controls">
                    <div>
                        <label for="taskPhotos${task.id}">Evidencia fotogr&aacute;fica</label>
                        <label class="camera-button" for="taskPhotos${task.id}">Tomar foto</label>
                        <input class="camera-input" type="file" id="taskPhotos${task.id}" data-action="task-photos" accept="image/jpeg,image/png,image/webp,image/gif" capture="environment" multiple>
                    </div>
                </div>
                <div class="photo-list" id="photoList${task.id}" aria-label="Fotos agregadas a la tarea ${index + 1}"></div>
            </div>
        </article>
    `).join('');

    tasks.forEach(renderPhotoList);
}

function renderPhotoList(task) {
    const photoList = document.getElementById(`photoList${task.id}`);

    photoList.innerHTML = '';

    task.photos.forEach((photo, index) => {
        const item = document.createElement('figure');
        item.className = 'photo-thumb';
        item.innerHTML = `
            <img src="${photo.dataUrl}" alt="${escapeHtml(photo.caption || `Foto ${index + 1}`)}">
            <figcaption class="photo-body">
                <div class="photo-meta">
                    <span>${escapeHtml(photo.name)}</span>
                    <button type="button" class="photo-remove" data-action="remove-photo" data-photo-id="${photo.id}">Quitar</button>
                </div>
                <select data-action="photo-stage" data-photo-id="${photo.id}" aria-label="Tipo de foto ${index + 1}">
                    <option value="">Antes / Durante / Despu&eacute;s</option>
                    <option value="Antes" ${photo.stage === 'Antes' ? 'selected' : ''}>Antes</option>
                    <option value="Durante" ${photo.stage === 'Durante' ? 'selected' : ''}>Durante</option>
                    <option value="Despu&eacute;s" ${photo.stage === 'Despu&eacute;s' ? 'selected' : ''}>Despu&eacute;s</option>
                </select>
                <input type="text" value="${escapeHtml(photo.caption)}" placeholder="Subtitulo obligatorio de la foto" data-action="photo-caption" data-photo-id="${photo.id}" aria-label="Subtitulo de foto ${index + 1}">
                <span class="photo-meta">Tomada: ${formatDateTime(new Date(photo.capturedAt))}</span>
            </figcaption>
        `;
        photoList.append(item);
    });
}

function getTaskFromEvent(event) {
    const card = event.target.closest('.task-card');
    return card ? tasks.find((task) => task.id === Number(card.dataset.taskId)) : null;
}

function ensureNextTaskIfReady(task) {
    if (tasks[tasks.length - 1]?.id === task.id && isTaskComplete(task)) {
        createTask();
        setStatus('Tarea completada. Se habilito la siguiente tarea.');
        return true;
    }

    return false;
}

function isTaskComplete(task) {
    return task.done
        && Boolean(task.description.trim())
        && task.photos.length > 0
        && task.photos.every((photo) => photo.caption.trim() && photo.stage);
}

function isTaskStarted(task) {
    return task.done || Boolean(task.description.trim()) || task.photos.length > 0;
}

async function readImageFiles(files) {
    const imageFiles = files.filter((file) => (
        ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)
    ));

    const options = imageFiles.length >= 12 || getTotalPhotoCount() + imageFiles.length >= 60
        ? PHOTO_COMPRESSION.bulk
        : PHOTO_COMPRESSION.normal;
    const photos = [];

    for (const file of imageFiles) {
        photos.push({
            id: Date.now() + Math.floor(Math.random() * 100000),
            name: file.name,
            caption: '',
            stage: '',
            capturedAt: new Date().toISOString(),
            dataUrl: await compressImage(file, options.maxSize, options.quality)
        });
        await new Promise(resolve => window.setTimeout(resolve, 0));
    }

    return photos;
}

function getTotalPhotoCount() {
    return tasks.reduce((total, task) => total + task.photos.length, 0);
}

function compressImage(file, maxSize = PHOTO_COMPRESSION.normal.maxSize, quality = PHOTO_COMPRESSION.normal.quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const image = new Image();

            image.onload = () => {
                const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(image.width * scale);
                canvas.height = Math.round(image.height * scale);
                canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            image.onerror = reject;
            image.src = reader.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function renderPreview() {
    const report = getReportData();

    if (!validateReport(report)) {
        return false;
    }

    preview.fechaGuardado.textContent = report.fechaGuardado
        ? `Fecha de guardado: ${formatDateTime(report.fechaGuardado)}`
        : 'Fecha de guardado: se registrara al guardar el informe';
    renderGeneralDetails(report);
    preview.incidente.textContent = report.incidente;
    renderReportTasks(report.actividades);
    preview.solucion.textContent = report.solucion;
    preview.observaciones.textContent = report.observaciones || 'No especificado';
    preview.conclusiones.textContent = report.conclusiones;
    renderSignatures(report);

    previewSection.classList.add('active');
    setStatus('Vista previa actualizada. El informe ya puede guardarse.');
    return true;
}

function renderGeneralDetails(report) {
    preview.datosGenerales.innerHTML = '';
    getGeneralDetailItems(report).forEach(([label, value]) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`;
        preview.datosGenerales.append(wrapper);
    });
}

function getGeneralDetailItems(report) {
    return [
        ['Nro. informe', report.numeroInforme],
        ['Cliente / area', report.clienteArea],
        ['Personal', report.personal],
        ['Nombre firma tecnico', report.firmaTecnicoNombre],
        ['Supervisor / administrador', report.firmaSupervisorNombre],
        ['Sede', report.sede],
        ['Equipo', report.equipo],
        ['Prioridad', report.prioridad],
        ['Tipo de mantenimiento', report.tipoMantenimiento],
        ['Impacto operativo', report.impactoOperativo === 'sin_parada' ? 'Sin parada operativa' : 'Con parada operativa'],
        ['Estado inicial', report.estadoInicialTexto],
        ['Hora de inicio', report.horaInicio],
        ['Hora final', report.horaFinal],
        ['Duracion', report.duracion],
        ['Resultado final', report.resultadoFinal],
        ['Repuestos utilizados', report.repuestos || 'No especificado']
    ];
}

function renderReportTasks(activityTasks) {
    preview.actividades.innerHTML = '';
    activityTasks.forEach((task, index) => {
        const article = document.createElement('article');
        article.className = 'report-task';
        article.innerHTML = `<h4>Tarea ${index + 1}</h4><p>${escapeHtml(task.description)}</p>`;
        const photoList = document.createElement('div');
        photoList.className = 'report-photo-list';

        task.photos.forEach((photo, photoIndex) => {
            const figure = document.createElement('figure');
            figure.className = 'report-photo';
            figure.innerHTML = `
                <img src="${photo.dataUrl}" alt="Foto ${photoIndex + 1} de tarea ${index + 1}">
                <figcaption>${escapeHtml(photo.stage)} - ${escapeHtml(photo.caption)}<br><small>${formatDateTime(new Date(photo.capturedAt))}</small></figcaption>
            `;
            photoList.append(figure);
        });

        article.append(photoList);
        preview.actividades.append(article);
    });
}

function renderSignatures(report) {
    preview.firmas.innerHTML = `
        <figure class="report-signature">
            <img src="${report.firmaTecnico}" alt="Firma del tecnico">
            <p>Firma del t&eacute;cnico<br><span>${escapeHtml(report.firmaTecnicoNombre)}</span></p>
        </figure>
        <figure class="report-signature">
            <img src="${report.firmaSupervisor}" alt="Firma del supervisor">
            <p>Firma del supervisor o administrador de turno<br><span>${escapeHtml(report.firmaSupervisorNombre)}</span></p>
        </figure>
    `;
}

function getReportData() {
    const estadoInicialTexto = fields.estadoInicial.value === 'Otro'
        ? `Otro: ${fields.estadoInicialOtro.value.trim()}`
        : fields.estadoInicial.value.trim();
    const repuestosInventario = obtenerRepuestosUsadosValidos()
        .map(repuesto => `${repuesto.codigo || repuesto.nombre} x ${repuesto.cantidad} ${repuesto.unidad}`)
        .join('\n');
    const repuestosTexto = [
        fields.repuestos.value.trim(),
        repuestosInventario ? `Descuento de inventario:\n${repuestosInventario}` : ''
    ].filter(Boolean).join('\n\n');
    syncSignatureNames();

    return {
        ...Object.fromEntries(Object.entries(fields).map(([name, field]) => [name, field.value.trim()])),
        repuestos: repuestosTexto,
        firmaTecnicoNombre: fields.personal.value.trim(),
        estadoInicialTexto,
        fechaGuardado: lastGeneratedAt,
        actividades: getCompletedTasks(),
        firmaTecnico: signaturePads.firmaTecnico.toDataUrl(),
        firmaSupervisor: signaturePads.firmaSupervisor.toDataUrl()
    };
}

function getCompletedTasks() {
    return tasks
        .filter(isTaskComplete)
        .map((task) => ({
            description: task.description.trim(),
            photos: task.photos.map((photo) => ({
                name: photo.name,
                caption: photo.caption.trim(),
                stage: photo.stage,
                capturedAt: photo.capturedAt,
                dataUrl: photo.dataUrl
            }))
        }));
}

function validateReport(report) {
    const requiredFields = [
        'clienteArea',
        'personal',
        'firmaSupervisorNombre',
        'sede',
        'equipo',
        'prioridad',
        'tipoMantenimiento',
        'impactoOperativo',
        'estadoInicial',
        'horaInicio',
        'horaFinal',
        'incidente',
        'solucion',
        'resultadoFinal',
        'conclusiones'
    ];
    let isValid = true;

    requiredFields.forEach((name) => {
        const hasValue = Boolean(report[name]);
        setFieldError(name, !hasValue);
        isValid = isValid && hasValue;
    });

    const needsEstadoOtro = report.estadoInicial === 'Otro';
    setFieldError('estadoInicialOtro', needsEstadoOtro && !report.estadoInicialOtro);
    isValid = isValid && (!needsEstadoOtro || Boolean(report.estadoInicialOtro));

    const durationValid = !report.horaInicio || !report.horaFinal || calculateDuration(report.horaInicio, report.horaFinal).minutes >= 0;
    setFieldError('horaFinal', !durationValid);
    isValid = isValid && durationValid;

    const taskValidation = validateTasks();
    isValid = isValid && taskValidation.isValid;

    const hasTecnico = !signaturePads.firmaTecnico.isEmpty();
    const hasSupervisor = !signaturePads.firmaSupervisor.isEmpty();
    setFieldError('firmaTecnico', !hasTecnico);
    setFieldError('firmaSupervisor', !hasSupervisor);
    isValid = isValid && hasTecnico && hasSupervisor;

    if (!isValid) {
        const firstInvalid = requiredFields.find((name) => !report[name])
            || (needsEstadoOtro && !report.estadoInicialOtro ? 'estadoInicialOtro' : null)
            || (!taskValidation.isValid ? 'actividades' : null)
            || (!hasTecnico ? 'firmaTecnico' : null)
            || (!hasSupervisor ? 'firmaSupervisor' : null);
        abrirSeccionFormulario(firstInvalid);
        if (firstInvalid && fields[firstInvalid]) {
            fields[firstInvalid].focus();
        } else if (firstInvalid && groups[firstInvalid]) {
            groups[firstInvalid].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setStatus(taskValidation.message || 'Complete todos los campos obligatorios, firmas y tiempos antes de guardar.', true);
        return false;
    }

    return true;
}

function validateTasks() {
    const startedTasks = tasks.filter(isTaskStarted);
    const completedTasks = tasks.filter(isTaskComplete);

    taskList.querySelectorAll('.task-card').forEach((card) => card.classList.remove('error'));
    groups.actividades.classList.toggle('error', completedTasks.length === 0);

    const incompleteTask = startedTasks.find((task) => !isTaskComplete(task));
    if (!completedTasks.length && !incompleteTask) {
        return { isValid: false, message: 'Complete al menos una tarea con check, detalle, foto, tipo y subtítulo.' };
    }

    if (incompleteTask) {
        const taskNumber = tasks.findIndex((task) => task.id === incompleteTask.id) + 1;
        const message = getTaskValidationMessage(incompleteTask, taskNumber);
        const card = taskList.querySelector(`[data-task-id="${incompleteTask.id}"]`);
        if (card) {
            card.classList.add('error');
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return { isValid: false, message };
    }

    return { isValid: true, message: '' };
}

function getTaskValidationMessage(task, taskNumber) {
    if (!task.done) return `Falta marcar el check de Tarea ${taskNumber}.`;
    if (!task.description.trim()) return `Falta describir lo realizado en Tarea ${taskNumber}.`;
    if (!task.photos.length) return `Falta tomar foto en Tarea ${taskNumber}.`;
    const missingStage = task.photos.findIndex((photo) => !photo.stage);
    if (missingStage >= 0) return `Falta seleccionar Antes/Durante/Después en foto ${missingStage + 1} de Tarea ${taskNumber}.`;
    const missingCaption = task.photos.findIndex((photo) => !photo.caption.trim());
    if (missingCaption >= 0) return `Falta subtítulo en foto ${missingCaption + 1} de Tarea ${taskNumber}.`;
    return `Tarea ${taskNumber} está incompleta.`;
}

function buildReportText() {
    const report = getReportData();
    if (!validateReport(report)) return '';

    return [
        'INFORME TECNICO DE INTERVENCION - URBAPARK',
        '',
        `Fecha de guardado: ${report.fechaGuardado ? formatDateTime(report.fechaGuardado) : 'Pendiente hasta guardar informe'}`,
        ...getGeneralDetailItems(report).map(([label, value]) => `${label}: ${value}`),
        '',
        'INFORME DEL INCIDENTE / REQUERIMIENTO',
        report.incidente,
        '',
        'ACTIVIDADES REALIZADAS',
        formatActivityTasksAsText(report.actividades),
        '',
        'SOLUCION REALIZADA',
        report.solucion,
        '',
        'OBSERVACIONES',
        report.observaciones || 'No especificado',
        '',
        'CONCLUSIONES',
        report.conclusiones
    ].join('\n');
}

function formatActivityTasksAsText(activityTasks) {
    return activityTasks.map((task, index) => [
        `Tarea ${index + 1}:`,
        task.description,
        ...task.photos.map((photo, photoIndex) => `Foto ${photoIndex + 1}: ${photo.stage} - ${photo.caption} (${formatDateTime(new Date(photo.capturedAt))})`)
    ].join('\n')).join('\n\n');
}

async function copyReport() {
    const text = buildReportText();
    if (!text) return;

    try {
        await navigator.clipboard.writeText(text);
        renderPreview();
        setStatus('Informe copiado al portapapeles. Las fotos quedan disponibles en la vista previa y descarga.');
    } catch (error) {
        setStatus('No se pudo copiar automaticamente. Use la vista previa para copiar el texto.', true);
    }
}

async function downloadReport() {
    lastGeneratedAt = new Date();
    const report = getReportData();

    if (!validateReport(report)) {
        lastGeneratedAt = null;
        return;
    }

    renderPreview();
    await markReportSaved(report);

    const fileName = `${report.numeroInforme.toLowerCase()}-${formatFileDate(report.fechaGuardado)}.html`;
    const blob = new Blob([buildReportHtml(report)], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    setStatus('Informe guardado en HTML con logo, colores, firmas y fotos comprimidas.');
}

function abrirSeccionFormulario(nombre) {
    const referencia = fields[nombre] || groups[nombre];
    const seccion = referencia?.closest?.('.form-section');

    if (seccion) {
        seccion.open = true;
    }
}

async function exportPdf() {
    lastGeneratedAt = new Date();
    if (!renderPreview()) {
        lastGeneratedAt = null;
        return;
    }
    await markReportSaved(getReportData());
    setStatus('Vista lista. En la ventana de impresion seleccione Guardar como PDF.');
    window.print();
}

function buildReportHtml(report) {
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>${escapeHtml(report.numeroInforme)} - Informe tecnico UrbaPark</title>
    <style>
        * { box-sizing: border-box; }
        body { color: #1f2a2e; font-family: Arial, sans-serif; font-size: 12px; margin: 18px; }
        .header { align-items: center; border-bottom: 5px solid #f15a24; display: flex; gap: 24px; padding-bottom: 18px; }
        .header img { display: block; flex: 0 0 280px; height: auto; max-height: 86px; max-width: 280px; object-fit: contain; width: 280px; }
        h1 { color: #179bd7; margin: 0 0 6px; }
        h2 { border-bottom: 1px solid #d8e5eb; color: #0b74a9; font-size: 13px; margin: 14px 0 8px; padding-bottom: 5px; text-transform: uppercase; }
        p { line-height: 1.38; margin: 0 0 8px; white-space: pre-wrap; }
        .text-block { background: #f4f8fb; border-left: 4px solid #f15a24; padding: 8px 10px; }
        .details { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; margin-top: 12px; }
        .details div { background: #f4f8fb; border-left: 3px solid #179bd7; min-height: 0; padding: 7px 9px; break-inside: auto; page-break-inside: auto; }
        dt { color: #62727b; font-size: 10px; font-weight: 700; text-transform: uppercase; }
        dd { font-weight: 700; margin: 4px 0 0; white-space: pre-wrap; }
        .task { border: 1px solid #d8e5eb; border-left: 4px solid #f15a24; border-radius: 6px; margin: 8px 0; padding: 10px; break-inside: auto; page-break-inside: auto; }
        .photos, .signatures { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 10px; }
        figure { border: 1px solid #d8e5eb; border-radius: 6px; margin: 0; overflow: hidden; break-inside: avoid; }
        .photos img { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; }
        figcaption { color: #1f2a2e; font-size: 11px; font-weight: 700; padding: 7px 8px; }
        .signature img { background: #fff; display: block; height: 105px; object-fit: contain; width: 100%; }
        @media print { body { margin: 12mm; } h2 { break-after: avoid; page-break-after: avoid; } .details { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 700px) { .header { align-items: flex-start; flex-direction: column; } .header img { flex-basis: auto; width: 240px; } .details { grid-template-columns: repeat(2, minmax(0, 1fr)); } .photos, .signatures { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <section class="header">
        <img src="${PUBLIC_LOGO_SRC}" alt="UrbaPark">
        <div>
            <h1>Informe tecnico de intervencion</h1>
            <p>${escapeHtml(report.numeroInforme)}<br>Fecha de guardado: ${escapeHtml(formatDateTime(report.fechaGuardado))}</p>
        </div>
    </section>
    <section class="details">${getGeneralDetailItems(report).map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</section>
    <h2>Informe del incidente / requerimiento</h2><p>${escapeHtml(report.incidente)}</p>
    <h2>Actividades realizadas</h2>${buildActivityTasksHtml(report.actividades)}
    <h2>Solucion realizada</h2><p>${escapeHtml(report.solucion)}</p>
    <h2>Resultado final</h2><p class="text-block">${escapeHtml(report.resultadoFinal)}</p>
    <h2>Repuestos utilizados</h2><p class="text-block">${escapeHtml(report.repuestos || 'No especificado')}</p>
    <h2>Observaciones</h2><p>${escapeHtml(report.observaciones || 'No especificado')}</p>
    <h2>Conclusiones</h2><p>${escapeHtml(report.conclusiones)}</p>
    <h2>Firmas</h2>
    <section class="signatures">
        <figure class="signature"><img src="${report.firmaTecnico}" alt="Firma tecnico"><figcaption>Firma del tecnico<br>${escapeHtml(report.firmaTecnicoNombre)}</figcaption></figure>
        <figure class="signature"><img src="${report.firmaSupervisor}" alt="Firma supervisor o administrador de turno"><figcaption>Firma del supervisor o administrador de turno<br>${escapeHtml(report.firmaSupervisorNombre)}</figcaption></figure>
    </section>
</body>
</html>`;
}

function buildActivityTasksHtml(activityTasks) {
    return activityTasks.map((task, index) => `
        <section class="task">
            <h3>Tarea ${index + 1}</h3>
            <p>${escapeHtml(task.description)}</p>
            <div class="photos">
                ${task.photos.map((photo, photoIndex) => `
                    <figure>
                        <img src="${photo.dataUrl}" alt="Foto ${photoIndex + 1} de tarea ${index + 1}">
                        <figcaption>${escapeHtml(photo.stage)} - ${escapeHtml(photo.caption)}<br><small>${formatDateTime(new Date(photo.capturedAt))}</small></figcaption>
                    </figure>
                `).join('')}
            </div>
        </section>
    `).join('');
}

function updateEstadoInicialOtroVisibility() {
    const isOther = fields.estadoInicial.value === 'Otro';
    groups.estadoInicialOtro.classList.toggle('active', isOther);
    if (!isOther) {
        fields.estadoInicialOtro.value = '';
        setFieldError('estadoInicialOtro', false);
    }
}

function updateComputedFields() {
    updateDuration();
    updateProgress();
}

function updateDuration() {
    const result = calculateDuration(fields.horaInicio.value, fields.horaFinal.value);
    fields.duracion.value = result.label;
}

function calculateDuration(start, end) {
    if (!start || !end) return { minutes: null, label: 'Pendiente' };
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    const minutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    if (minutes < 0) return { minutes, label: 'Hora final menor que inicio' };
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return { minutes, label: `${hours} h ${rest} min` };
}

function updateProgress() {
    const checks = [
        fields.clienteArea.value.trim(),
        fields.personal.value.trim(),
        fields.firmaSupervisorNombre.value.trim(),
        fields.sede.value.trim(),
        fields.equipo.value.trim(),
        fields.prioridad.value,
        fields.tipoMantenimiento.value,
        fields.impactoOperativo.value,
        fields.estadoInicial.value && (fields.estadoInicial.value !== 'Otro' || fields.estadoInicialOtro.value.trim()),
        fields.horaInicio.value,
        fields.horaFinal.value && calculateDuration(fields.horaInicio.value, fields.horaFinal.value).minutes >= 0,
        fields.incidente.value.trim(),
        tasks.some(isTaskComplete),
        fields.solucion.value.trim(),
        fields.resultadoFinal.value,
        fields.conclusiones.value.trim(),
        !signaturePads.firmaTecnico.isEmpty(),
        !signaturePads.firmaSupervisor.isEmpty()
    ];
    const percent = Math.round((checks.filter(Boolean).length / checks.length) * 100);
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `Datos ${percent}% completos`;
    reportNumberLabel.textContent = `Informe ${fields.numeroInforme.value || '-'}`;
}

function setFieldError(name, hasError) {
    if (!groups[name]) return;
    groups[name].classList.toggle('error', hasError);
    if (fields[name]) {
        fields[name].setAttribute('aria-invalid', String(hasError));
    }
}

function initSignaturePads() {
    signaturePads = {
        firmaTecnico: createSignaturePad(document.getElementById('firmaTecnico')),
        firmaSupervisor: createSignaturePad(document.getElementById('firmaSupervisor'))
    };
}

function createSignaturePad(canvas) {
    const context = canvas.getContext('2d');
    let drawing = false;
    let empty = true;

    context.lineWidth = 2;
    context.lineCap = 'round';
    context.strokeStyle = '#1f2a2e';

    const getPoint = (event) => {
        const rect = canvas.getBoundingClientRect();
        const pointer = event.touches ? event.touches[0] : event;
        return {
            x: (pointer.clientX - rect.left) * (canvas.width / rect.width),
            y: (pointer.clientY - rect.top) * (canvas.height / rect.height)
        };
    };

    const start = (event) => {
        event.preventDefault();
        drawing = true;
        const point = getPoint(event);
        context.beginPath();
        context.moveTo(point.x, point.y);
    };
    const move = (event) => {
        if (!drawing) return;
        event.preventDefault();
        const point = getPoint(event);
        context.lineTo(point.x, point.y);
        context.stroke();
        empty = false;
    };
    const stop = () => {
        const completedStroke = drawing && !empty;
        drawing = false;
        if (completedStroke && canvas.id === 'firmaSupervisor') {
            setFinalTimeFromSignature();
        }
        scheduleDraftSave();
        updateProgress();
    };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', stop);

    return {
        clear() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            empty = true;
            updateProgress();
        },
        isEmpty() {
            return empty;
        },
        toDataUrl() {
            return canvas.toDataURL('image/png');
        },
        load(dataUrl) {
            if (!dataUrl) return;
            const image = new Image();
            image.onload = () => {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                empty = false;
                updateProgress();
            };
            image.src = dataUrl;
        }
    };
}

function setFinalTimeFromSignature() {
    fields.horaFinal.value = formatTimeInput(new Date());
    setFieldError('horaFinal', false);
    updateDuration();
}

function scheduleDraftSave() {
    window.clearTimeout(draftTimer);
    draftTimer = window.setTimeout(saveDraft, 250);
}

function saveDraft() {
    const draft = {
        reportSequence,
        reportNumber: fields.numeroInforme.value,
        reportSaved,
        fields: Object.fromEntries(Object.entries(fields).map(([name, field]) => [name, field.value])),
        tasks,
        repuestosUsados,
        signatures: {
            firmaTecnico: signaturePads.firmaTecnico.isEmpty() ? '' : signaturePads.firmaTecnico.toDataUrl(),
            firmaSupervisor: signaturePads.firmaSupervisor.isEmpty() ? '' : signaturePads.firmaSupervisor.toDataUrl()
        }
    };
    try {
        let serialized = JSON.stringify(draft);
        if (serialized.length > DRAFT_MAX_BYTES) {
            const metadataOnlyDraft = {
                ...draft,
                tasks: tasks.map(task => ({
                    ...task,
                    photos: task.photos.map(photo => ({
                        ...photo,
                        dataUrl: ''
                    }))
                }))
            };
            serialized = JSON.stringify(metadataOnlyDraft);
            localStorage.setItem(DRAFT_KEY, serialized);
            setStatus('Borrador guardado sin imagenes por limite del celular. Genera o descarga el informe antes de cerrar.', true);
        } else {
            localStorage.setItem(DRAFT_KEY, serialized);
        }
    } catch (error) {
        setStatus('El borrador contiene demasiadas fotos para guardarse completo. Genera o descarga el informe antes de cerrar.', true);
    }
    updateProgress();
}

function getReportDurationMinutes(report) {
    return calculateDuration(report.horaInicio, report.horaFinal).minutes;
}

function buildMaintenanceSummary(report) {
    const equipo = getEquipmentInfo(report.equipo);
    const duracionMinutos = getReportDurationMinutes(report);
    return {
        numero_informe: report.numeroInforme,
        sede: getActiveSiteId() || APP_CONTEXT.sedeId || '',
        sede_nombre: report.sede,
        equipo_codigo: equipo?.codigo || report.equipo,
        equipo_nombre: equipo?.nombre || report.equipo,
        equipo_tipo: equipo?.tipo || '',
        componentes: equipo?.componentes || [],
        tipo_mantenimiento: report.tipoMantenimiento,
        genera_parada: report.impactoOperativo !== 'sin_parada',
        prioridad: report.prioridad,
        estado_inicial: report.estadoInicialTexto,
        resultado_final: report.resultadoFinal,
        tecnico: report.personal,
        supervisor: report.firmaSupervisorNombre,
        hora_inicio: report.horaInicio,
        hora_final: report.horaFinal,
        duracion_minutos: typeof duracionMinutos === 'number' ? duracionMinutos : null,
        preventivo_estimado_minutos: report.tipoMantenimiento === 'Preventivo'
            ? equipo?.preventivoMinutos || 120
            : null,
        motivo: report.incidente,
        solucion: report.solucion,
        repuestos: report.repuestos || '',
        repuestos_usados: obtenerRepuestosUsadosValidos(),
        fecha_guardado: report.fechaGuardado?.toISOString?.() || new Date().toISOString()
    };
}

function saveMaintenanceSummaryLocal(summary) {
    try {
        const current = JSON.parse(localStorage.getItem(MAINTENANCE_REPORTS_KEY) || '[]');
        const next = [
            summary,
            ...current.filter(item => item.numero_informe !== summary.numero_informe)
        ].slice(0, 250);
        localStorage.setItem(MAINTENANCE_REPORTS_KEY, JSON.stringify(next));
    } catch (error) {
        console.warn('No se pudo guardar el resumen local de mantenimiento:', error);
    }
}

async function getSupabaseClient() {
    if (supabaseClient) {
        return supabaseClient;
    }

    const createClient = window.supabase?.createClient;
    if (!createClient) {
        return null;
    }

    supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.publishableKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false
        }
    });
    return supabaseClient;
}

async function validarAccesoInforme() {
    const client = await getSupabaseClient();
    if (!client) {
        window.location.replace('index.html?module=mantenimiento');
        return;
    }

    const { data: { session } = {} } = await client.auth.getSession();
    if (!session?.user) {
        window.location.replace('index.html?module=mantenimiento');
        return;
    }

    const { data: perfil, error } = await client
        .from('profiles')
        .select('rol,activo')
        .eq('id', session.user.id)
        .maybeSingle();

    if (error || perfil?.activo === false || !['admin', 'tecnico'].includes(perfil?.rol)) {
        window.location.replace('index.html?module=mantenimiento');
        return;
    }

    await cargarInventarioInforme();
}

async function saveMaintenanceSummaryRemote(summary) {
    const client = await getSupabaseClient();
    if (!client) {
        return false;
    }

    const { data: { session } = {} } = await client.auth.getSession();
    if (!session?.user) {
        return false;
    }

    const { error } = await client
        .from('intervenciones_mantenimiento')
        .upsert(summary, { onConflict: 'numero_informe' });

    if (error) {
        console.warn('No se pudo sincronizar resumen de mantenimiento:', error);
        return false;
    }

    const repuestos = obtenerRepuestosUsadosValidos();
    if (repuestos.length) {
        const { error: consumoError } = await client.rpc('registrar_consumo_repuestos', {
            numero_informe_arg: summary.numero_informe,
            sede_arg: summary.sede,
            repuestos_arg: repuestos
        });

        if (consumoError) {
            console.warn('No se pudo descontar inventario:', consumoError);
            return false;
        }
    }

    return true;
}

async function cargarInventarioInforme() {
    const client = await getSupabaseClient();
    const estado = document.getElementById('inventoryUsageStatus');
    if (!client || !getActiveSiteId()) {
        renderizarUsoInventario();
        return;
    }

    if (estado) {
        estado.textContent = 'Cargando inventario de la sede...';
    }

    const { data, error } = await client
        .from('inventario_repuestos')
        .select('id,codigo,nombre,stock,unidad,categoria')
        .eq('sede', getActiveSiteId())
        .order('nombre', { ascending: true });

    if (error) {
        console.warn('No se pudo cargar inventario para informe:', error);
        inventarioInforme = [];
    } else {
        inventarioInforme = Array.isArray(data) ? data : [];
    }
    renderizarUsoInventario();
}

async function registerMaintenanceSummary(report) {
    const summary = buildMaintenanceSummary(report);
    saveMaintenanceSummaryLocal(summary);
    const synced = await saveMaintenanceSummaryRemote(summary);
    setStatus(synced
        ? 'Informe guardado y sincronizado para KPIs de mantenimiento.'
        : 'Informe guardado. La sincronizacion de KPIs quedo pendiente.');
}

function readDraft() {
    try {
        return JSON.parse(localStorage.getItem(DRAFT_KEY));
    } catch (error) {
        return null;
    }
}

function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
}

async function markReportSaved(report = getReportData()) {
    if (!reportSaved) {
        localStorage.setItem(COUNTER_KEY, String(Math.max(getStoredCounter(), reportSequence)));
        reportSaved = true;
        saveDraft();
    }
    await registerMaintenanceSummary(report);
}

function getStoredCounter() {
    return Number(localStorage.getItem(COUNTER_KEY) || 0);
}

function formatReportNumber(sequence) {
    return `${REPORT_PREFIX}-${String(sequence).padStart(4, '0')}`;
}

function formatDateTime(date) {
    return new Intl.DateTimeFormat('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function formatFileDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}-${hour}${minute}`;
}

function formatTimeInput(date) {
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${hour}:${minute}`;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function setStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.style.color = isError ? 'var(--danger)' : 'var(--primary)';
}

function clearStatus() {
    statusMessage.textContent = '';
}
