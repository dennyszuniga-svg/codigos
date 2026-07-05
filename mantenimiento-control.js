const CONFIG = {
    url: 'https://uibiwhkxlyxdfytvudbn.supabase.co',
    key: 'sb_publishable_R-auhGcSmwSl-1U9WdGe3g_ZYm5BZEt'
};
const SEDES = [
    ['puruchuco', 'Real Plaza Puruchuco'],
    ['salaverry', 'Real Plaza Salaverry'],
    ['primavera', 'Real Plaza Primavera'],
    ['civico', 'Real Plaza Civico'],
    ['gama', 'GAMA']
];

let client = null;
let session = null;
let profile = null;
let interventions = [];
let tasks = [];
let inventory = [];

const byId = id => document.getElementById(id);
const clear = element => { while (element?.firstChild) element.firstChild.remove(); };
const siteName = id => SEDES.find(item => item[0] === id)?.[1] || id;
const isSuperior = () => profile?.rol === 'encargado_ti';
const monthValue = () => byId('controlMonth').value || new Date().toISOString().slice(0, 7);
const selectedSite = () => byId('controlSite').value;

function setStatus(message, state = '') {
    const status = byId('controlStatus');
    status.textContent = message;
    status.dataset.state = state;
}

function empty(message) {
    const node = document.createElement('p');
    node.className = 'empty';
    node.textContent = message;
    return node;
}

function metric(title, value, detail, state = '') {
    const card = document.createElement('article');
    const label = document.createElement('b');
    const number = document.createElement('strong');
    const description = document.createElement('span');
    card.className = `metric-card ${state}`.trim();
    label.textContent = title;
    number.textContent = value;
    description.textContent = detail;
    card.append(label, number, description);
    return card;
}

function record(title, detail, className = '') {
    const item = document.createElement('article');
    const heading = document.createElement('strong');
    const copy = document.createElement('small');
    item.className = `record ${className}`.trim();
    heading.textContent = title;
    copy.textContent = detail;
    item.append(heading, copy);
    return item;
}

function formatMinutes(value) {
    const minutes = Number(value || 0);
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return hours ? `${hours} h${rest ? ` ${rest} min` : ''}` : `${rest} min`;
}

function inSelectedMonth(value) {
    if (!value) return false;
    const date = new Date(value);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 7) === monthValue();
}

async function verifyAccess() {
    client = window.supabase.createClient(CONFIG.url, CONFIG.key, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
    });
    const { data: { session: activeSession } } = await client.auth.getSession();
    session = activeSession;
    if (!session?.user) {
        window.location.replace('index.html?module=mantenimiento');
        return false;
    }
    const { data, error } = await client.from('profiles').select('nombre,rol,activo,sede').eq('id', session.user.id).maybeSingle();
    if (error || !data?.activo || !['encargado_ti', 'admin', 'tecnico'].includes(data.rol)) {
        byId('accessMessage').querySelector('h1').textContent = 'Acceso restringido';
        byId('accessMessage').querySelector('p').textContent = 'Tu usuario no tiene acceso al centro de mantenimiento.';
        return false;
    }
    profile = data;
    return true;
}

function configureFilters() {
    const site = byId('controlSite');
    SEDES.forEach(([value, label]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        site.appendChild(option);
    });
    const requestedSite = new URLSearchParams(window.location.search).get('sede');
    site.value = SEDES.some(item => item[0] === requestedSite)
        ? requestedSite
        : profile.sede === 'general' ? 'civico' : profile.sede;
    byId('controlMonth').value = new Date().toISOString().slice(0, 7);
    if (!isSuperior()) byId('inventoryTab').hidden = true;
}

async function loadData() {
    setStatus('Actualizando información...');
    const site = selectedSite();
    const month = monthValue();
    const start = `${month}-01`;
    const endDate = new Date(`${start}T00:00:00`);
    endDate.setMonth(endDate.getMonth() + 1);
    const end = endDate.toISOString().slice(0, 10);

    const [reportsResult, tasksResult, inventoryResult] = await Promise.all([
        client.from('intervenciones_mantenimiento')
            .select('id,numero_informe,sede,equipo_codigo,equipo_nombre,equipo_tipo,tipo_mantenimiento,prioridad,estado_inicial,resultado_final,motivo,solucion,tecnico,supervisor,duracion_minutos,genera_parada,fecha_guardado')
            .eq('sede', site).order('fecha_guardado', { ascending: false }).limit(500),
        client.from('tareas_mantenimiento')
            .select('id,titulo,descripcion,sede,equipo_codigo,equipo_nombre,prioridad,fecha_limite,estado,asignado_a,observacion_tecnico,profiles!tareas_mantenimiento_asignado_a_fkey(nombre,email)')
            .eq('sede', site).gte('fecha_limite', start).lt('fecha_limite', end).order('fecha_limite'),
        isSuperior()
            ? client.from('inventario_repuestos').select('id,codigo,nombre,categoria,stock,stock_minimo,unidad,ubicacion,updated_at').eq('sede', site).order('nombre')
            : Promise.resolve({ data: [], error: null })
    ]);

    const error = reportsResult.error || tasksResult.error || inventoryResult.error;
    if (error) {
        setStatus('No se pudo cargar toda la información. Actualiza e inténtalo nuevamente.', 'error');
        console.warn('Centro de control:', error);
        return;
    }
    interventions = reportsResult.data || [];
    tasks = tasksResult.data || [];
    inventory = inventoryResult.data || [];
    renderAll();
    setStatus(`Actualizado: ${siteName(site)} - ${month}`, 'success');
}

function renderDashboard() {
    const cards = byId('dashboardCards');
    const progress = byId('taskProgress');
    const upcoming = byId('upcomingTasks');
    clear(cards); clear(progress); clear(upcoming);
    const monthReports = interventions.filter(item => inSelectedMonth(item.fecha_guardado));
    const completed = tasks.filter(item => item.estado === 'completada').length;
    const pending = tasks.filter(item => item.estado !== 'completada').length;
    const overdue = tasks.filter(item => item.estado !== 'completada' && item.fecha_limite < new Date().toISOString().slice(0, 10)).length;
    const compliance = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
    const downtime = monthReports.filter(item => item.genera_parada !== false).reduce((sum, item) => sum + Number(item.duracion_minutos || 0), 0);
    cards.append(
        metric('Tareas del mes', String(tasks.length), `${pending} pendientes`, pending ? 'warning' : 'good'),
        metric('Completadas', String(completed), `${compliance}% de cumplimiento`, compliance >= 90 ? 'good' : 'warning'),
        metric('Vencidas', String(overdue), 'Fuera de fecha', overdue ? 'danger' : 'good'),
        metric('Informes', String(monthReports.length), 'Intervenciones registradas'),
        metric('Parada operativa', formatMinutes(downtime), 'Acumulado del mes', downtime ? 'warning' : 'good')
    );
    const label = document.createElement('p');
    const track = document.createElement('div');
    const bar = document.createElement('span');
    label.textContent = `${completed} de ${tasks.length} tareas completadas`;
    track.className = 'progress-track';
    bar.style.width = `${compliance}%`;
    track.appendChild(bar);
    progress.append(label, track);
    const next = tasks.filter(item => item.estado !== 'completada').slice(0, 6);
    if (!next.length) upcoming.appendChild(empty('No hay trabajos pendientes en este mes.'));
    next.forEach(item => upcoming.appendChild(record(item.titulo, `${item.fecha_limite} - ${item.profiles?.nombre || 'Técnico'} - ${item.equipo_codigo || 'Trabajo general'}`)));
}

function renderKpis() {
    const cards = byId('kpiCards');
    clear(cards);
    const reports = interventions.filter(item => inSelectedMonth(item.fecha_guardado));
    const preventive = reports.filter(item => ['Preventivo', 'PreventivoMensual'].includes(item.tipo_mantenimiento));
    const corrective = reports.filter(item => item.tipo_mantenimiento === 'Correctivo');
    const average = reports.length ? Math.round(reports.reduce((sum, item) => sum + Number(item.duracion_minutos || 0), 0) / reports.length) : 0;
    const uniqueEquipment = new Set(reports.map(item => item.equipo_codigo).filter(Boolean)).size;
    const repeatCount = repeatedFailures().length;
    cards.append(
        metric('Preventivos', String(preventive.length), 'Ejecutados en el mes', preventive.length ? 'good' : 'warning'),
        metric('Correctivos', String(corrective.length), 'Registrados en el mes', corrective.length ? 'danger' : 'good'),
        metric('Duración promedio', formatMinutes(average), 'Por intervención'),
        metric('Equipos atendidos', String(uniqueEquipment), 'Cobertura mensual'),
        metric('Equipos reincidentes', String(repeatCount), 'Dos o más correctivos', repeatCount ? 'danger' : 'good')
    );
}

function configureHistorySelector() {
    const selector = byId('historyEquipment');
    const previous = selector.value;
    clear(selector);
    const initial = document.createElement('option');
    initial.value = '';
    initial.textContent = 'Selecciona un equipo';
    selector.appendChild(initial);
    const equipment = new Map();
    interventions.forEach(item => {
        if (item.equipo_codigo) equipment.set(item.equipo_codigo, item.equipo_nombre || item.equipo_codigo);
    });
    [...equipment.entries()].sort().forEach(([code, name]) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${code} - ${name}`;
        selector.appendChild(option);
    });
    if ([...selector.options].some(option => option.value === previous)) selector.value = previous;
    renderHistory();
}

function renderHistory() {
    const list = byId('historyList');
    clear(list);
    const code = byId('historyEquipment').value;
    if (!code) { list.appendChild(empty('Selecciona un equipo para consultar su historial.')); return; }
    const rows = interventions.filter(item => item.equipo_codigo === code);
    if (!rows.length) { list.appendChild(empty('No existen intervenciones para este equipo.')); return; }
    rows.forEach(item => {
        const date = new Date(item.fecha_guardado);
        list.appendChild(record(
            `${item.tipo_mantenimiento} - ${item.numero_informe}`,
            `${date.toLocaleDateString('es-PE')} - ${item.tecnico || 'Sin técnico'} - ${formatMinutes(item.duracion_minutos)} - ${item.motivo || 'Sin detalle'}`,
            item.tipo_mantenimiento === 'Correctivo' ? 'corrective' : ''
        ));
    });
}

function repeatedFailures() {
    const groups = new Map();
    interventions.filter(item => item.tipo_mantenimiento === 'Correctivo').forEach(item => {
        const code = item.equipo_codigo || 'Sin equipo';
        if (!groups.has(code)) groups.set(code, []);
        groups.get(code).push(item);
    });
    return [...groups.entries()].filter(([, rows]) => rows.length >= 2).sort((a, b) => b[1].length - a[1].length);
}

function renderFailures() {
    const list = byId('failureList');
    clear(list);
    const failures = repeatedFailures();
    if (!failures.length) { list.appendChild(empty('No se detectan fallas repetitivas.')); return; }
    failures.forEach(([code, rows]) => {
        const causes = [...new Set(rows.map(item => item.motivo).filter(Boolean))].slice(0, 3).join(' / ');
        list.appendChild(record(`${code} - ${rows.length} correctivos`, causes || 'Sin causas detalladas en los informes.', 'failure'));
    });
}

function renderInventory() {
    const summary = byId('inventorySummary');
    const list = byId('inventoryList');
    clear(summary); clear(list);
    if (!isSuperior()) return;
    const low = inventory.filter(item => Number(item.stock) <= Number(item.stock_minimo)).length;
    const unavailable = inventory.filter(item => Number(item.stock) === 0).length;
    summary.append(
        metric('Repuestos', String(inventory.length), 'Registrados en la sede'),
        metric('Stock bajo', String(low), 'En mínimo o por debajo', low ? 'warning' : 'good'),
        metric('No disponibles', String(unavailable), 'Stock igual a cero', unavailable ? 'danger' : 'good')
    );
    const query = byId('inventoryFilter').value.trim().toLowerCase();
    const rows = inventory.filter(item => `${item.codigo} ${item.nombre} ${item.categoria}`.toLowerCase().includes(query));
    if (!rows.length) { list.appendChild(empty('No hay repuestos que coincidan con la búsqueda.')); return; }
    rows.forEach(item => list.appendChild(record(
        `${item.codigo} - ${item.nombre}`,
        `${item.stock} ${item.unidad} - Mínimo ${item.stock_minimo} - ${item.ubicacion || 'Sin ubicación'}`,
        Number(item.stock) <= Number(item.stock_minimo) ? 'failure' : ''
    )));
}

function renderAll() {
    renderDashboard();
    renderKpis();
    configureHistorySelector();
    renderFailures();
    renderInventory();
}

function selectTab(name) {
    document.querySelectorAll('[data-control-tab]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.controlTab === name)));
    document.querySelectorAll('[data-control-view]').forEach(view => { view.hidden = view.dataset.controlView !== name; });
}

function configureEvents() {
    byId('refreshControl').addEventListener('click', loadData);
    byId('controlSite').addEventListener('change', loadData);
    byId('controlMonth').addEventListener('change', loadData);
    byId('historyEquipment').addEventListener('change', renderHistory);
    byId('inventoryFilter').addEventListener('input', renderInventory);
    document.querySelector('.control-tabs').addEventListener('click', event => {
        const button = event.target.closest('button[data-control-tab]');
        if (button) selectTab(button.dataset.controlTab);
    });
}

async function init() {
    if (!await verifyAccess()) return;
    configureFilters();
    configureEvents();
    byId('accessMessage').hidden = true;
    byId('controlShell').hidden = false;
    await loadData();
}

init().catch(error => {
    console.warn('No se pudo iniciar el centro de control:', error);
    byId('accessMessage').querySelector('h1').textContent = 'No se pudo abrir';
    byId('accessMessage').querySelector('p').textContent = 'Actualiza la página o revisa tu conexión.';
});
