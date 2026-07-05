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
let inventory = [];
let inventoryMovements = [];

const byId = id => document.getElementById(id);
const clear = element => { while (element?.firstChild) element.firstChild.remove(); };
const siteName = id => id === 'general' ? 'Almacén general' : SEDES.find(item => item[0] === id)?.[1] || id;
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
    if (!isSuperior()) {
        byId('inventoryTab').hidden = true;
        byId('technicianFilterGroup').hidden = true;
    }
}

function visibleInterventions() {
    const technician = byId('controlTechnician')?.value || '';
    return technician
        ? interventions.filter(item => (item.tecnico || 'Sin técnico') === technician)
        : interventions;
}

function configureTechnicianFilter() {
    const selector = byId('controlTechnician');
    if (!selector || !isSuperior()) return;
    const previous = selector.value;
    clear(selector);
    const all = document.createElement('option');
    all.value = '';
    all.textContent = 'Todos los técnicos';
    selector.appendChild(all);
    [...new Set(interventions.map(item => item.tecnico).filter(Boolean))].sort().forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        selector.appendChild(option);
    });
    if ([...selector.options].some(option => option.value === previous)) selector.value = previous;
}

async function loadData() {
    setStatus('Actualizando información...');
    const site = selectedSite();
    const month = monthValue();
    const start = `${month}-01`;
    const endDate = new Date(`${start}T00:00:00`);
    endDate.setMonth(endDate.getMonth() + 1);
    const end = endDate.toISOString().slice(0, 10);

    let reportsQuery = client.from('intervenciones_mantenimiento')
        .select('id,numero_informe,sede,equipo_codigo,equipo_nombre,equipo_tipo,tipo_mantenimiento,prioridad,estado_inicial,resultado_final,motivo,solucion,tecnico,supervisor,duracion_minutos,genera_parada,fecha_guardado,creado_por')
        .eq('sede', site).order('fecha_guardado', { ascending: false }).limit(500);
    if (!isSuperior()) reportsQuery = reportsQuery.eq('creado_por', session.user.id);

    const [reportsResult, inventoryResult, movementsResult] = await Promise.all([
        reportsQuery,
        isSuperior()
            ? client.rpc('listar_inventario_consolidado')
            : Promise.resolve({ data: [], error: null }),
        isSuperior()
            ? client.from('movimientos_stock_repuestos').select('id,tipo,cantidad,ubicacion_origen,ubicacion_destino,observacion,created_at,catalogo_repuestos(codigo,nombre,unidad)').order('created_at', { ascending: false }).limit(100)
            : Promise.resolve({ data: [], error: null })
    ]);

    const error = reportsResult.error || inventoryResult.error || movementsResult.error;
    if (error) {
        setStatus('No se pudo cargar toda la información. Actualiza e inténtalo nuevamente.', 'error');
        console.warn('Centro de control:', error);
        return;
    }
    interventions = reportsResult.data || [];
    inventory = inventoryResult.data || [];
    inventoryMovements = movementsResult.data || [];
    configureTechnicianFilter();
    renderAll();
    setStatus(`Actualizado: ${siteName(site)} - ${month}`, 'success');
}

function renderDashboard() {
    const cards = byId('dashboardCards');
    const activity = byId('monthlyActivity');
    const recent = byId('recentInterventions');
    clear(cards); clear(activity); clear(recent);
    const visible = visibleInterventions();
    const monthReports = visible.filter(item => inSelectedMonth(item.fecha_guardado));
    const preventive = monthReports.filter(item => ['Preventivo', 'PreventivoMensual'].includes(item.tipo_mantenimiento));
    const corrective = monthReports.filter(item => item.tipo_mantenimiento === 'Correctivo');
    const downtime = monthReports.filter(item => item.genera_parada !== false).reduce((sum, item) => sum + Number(item.duracion_minutos || 0), 0);
    const average = monthReports.length ? Math.round(monthReports.reduce((sum, item) => sum + Number(item.duracion_minutos || 0), 0) / monthReports.length) : 0;
    cards.append(
        metric('Intervenciones', String(monthReports.length), 'Realizadas en el mes'),
        metric('Preventivos', String(preventive.length), 'Mantenimientos ejecutados', preventive.length ? 'good' : 'warning'),
        metric('Correctivos', String(corrective.length), 'Atenciones por falla', corrective.length ? 'danger' : 'good'),
        metric('Duración promedio', formatMinutes(average), 'Por intervención'),
        metric('Parada operativa', formatMinutes(downtime), 'Acumulado del mes', downtime ? 'warning' : 'good')
    );

    const selectedMonth = new Date(`${monthValue()}-01T00:00:00`);
    for (let offset = 5; offset >= 0; offset -= 1) {
        const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - offset, 1);
        const key = date.toISOString().slice(0, 7);
        const rows = visible.filter(item => new Date(item.fecha_guardado).toISOString().slice(0, 7) === key);
        const row = document.createElement('div');
        const label = document.createElement('strong');
        const bars = document.createElement('div');
        const preventiveBar = document.createElement('span');
        const correctiveBar = document.createElement('span');
        row.className = 'monthly-row';
        bars.className = 'monthly-bars';
        preventiveBar.className = 'monthly-bar';
        correctiveBar.className = 'monthly-bar corrective';
        label.textContent = date.toLocaleDateString('es-PE', { month: 'short', year: '2-digit' });
        preventiveBar.textContent = `P: ${rows.filter(item => ['Preventivo', 'PreventivoMensual'].includes(item.tipo_mantenimiento)).length}`;
        correctiveBar.textContent = `C: ${rows.filter(item => item.tipo_mantenimiento === 'Correctivo').length}`;
        bars.append(preventiveBar, correctiveBar);
        row.append(label, bars);
        activity.appendChild(row);
    }
    const latest = visible.slice(0, 6);
    if (!latest.length) recent.appendChild(empty('Este técnico todavía no registra intervenciones.'));
    latest.forEach(item => recent.appendChild(record(
        `${item.tipo_mantenimiento} - ${item.equipo_codigo || item.equipo_nombre}`,
        `${new Date(item.fecha_guardado).toLocaleDateString('es-PE')} - ${item.numero_informe} - ${formatMinutes(item.duracion_minutos)}`,
        item.tipo_mantenimiento === 'Correctivo' ? 'corrective' : ''
    )));
}

function renderKpis() {
    const cards = byId('kpiCards');
    clear(cards);
    const reports = visibleInterventions().filter(item => inSelectedMonth(item.fecha_guardado));
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
    visibleInterventions().forEach(item => {
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
    const rows = visibleInterventions().filter(item => item.equipo_codigo === code);
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
    visibleInterventions().filter(item => item.tipo_mantenimiento === 'Correctivo').forEach(item => {
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
    const uniqueParts = new Set(inventory.map(item => item.repuesto_id)).size;
    const totalUnits = inventory.reduce((sum, item) => sum + Number(item.stock || 0), 0);
    const low = inventory.filter(item => Number(item.stock) <= Number(item.stock_minimo)).length;
    const unavailable = inventory.filter(item => Number(item.stock) === 0).length;
    summary.append(
        metric('Repuestos', String(uniqueParts), 'Códigos del catálogo general'),
        metric('Stock total', String(totalUnits), 'Todas las ubicaciones'),
        metric('Stock bajo', String(low), 'En mínimo o por debajo', low ? 'warning' : 'good'),
        metric('No disponibles', String(unavailable), 'Stock igual a cero', unavailable ? 'danger' : 'good')
    );
    const query = byId('inventoryFilter').value.trim().toLowerCase();
    const rows = inventory.filter(item => `${item.codigo} ${item.nombre} ${item.categoria} ${item.compatibilidad} ${item.ubicacion_sede}`.toLowerCase().includes(query));
    if (!rows.length) { list.appendChild(empty('No hay repuestos que coincidan con la búsqueda.')); return; }
    rows.forEach(item => list.appendChild(record(
        `${item.codigo} - ${item.nombre} - ${siteName(item.ubicacion_sede)}`,
        `${item.stock} ${item.unidad} en esta ubicación - Total general ${item.stock_total} - ${item.compatibilidad} - ${item.ubicacion_detalle || 'Sin detalle'}${item.proveedor ? ` - Proveedor: ${item.proveedor}` : ''}`,
        Number(item.stock) <= Number(item.stock_minimo) ? 'failure' : ''
    )));
    renderInventoryMovements();
}

function renderInventoryMovements() {
    const selector = byId('movementItem');
    const list = byId('movementList');
    if (!selector || !list || !isSuperior()) return;
    const previous = selector.value;
    clear(selector); clear(list);
    const initial = document.createElement('option');
    initial.value = '';
    initial.textContent = 'Selecciona un repuesto';
    selector.appendChild(initial);
    inventory.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.codigo} - ${item.nombre} | ${siteName(item.ubicacion_sede)} (${item.stock} ${item.unidad})`;
        selector.appendChild(option);
    });
    if ([...selector.options].some(option => option.value === previous)) selector.value = previous;
    if (!inventoryMovements.length) { list.appendChild(empty('Todavía no hay movimientos registrados.')); return; }
    inventoryMovements.slice(0, 20).forEach(item => list.appendChild(record(
        `${item.tipo.toUpperCase()} - ${item.catalogo_repuestos?.codigo || ''} - ${item.catalogo_repuestos?.nombre || ''}`,
        `${item.cantidad} ${item.catalogo_repuestos?.unidad || 'unidad'} - ${siteName(item.ubicacion_origen)}${item.ubicacion_destino ? ` → ${siteName(item.ubicacion_destino)}` : ''} - ${new Date(item.created_at).toLocaleString('es-PE')} - ${item.observacion || 'Sin observación'}`
    )));
}

function showInventoryForm(show) {
    const form = byId('inventoryForm');
    const button = byId('toggleInventoryForm');
    if (!isSuperior() || !form || !button) return;
    form.hidden = !show;
    button.setAttribute('aria-expanded', String(show));
    button.textContent = show ? 'Ocultar formulario' : 'Añadir repuesto';
    if (show) byId('inventoryCode').focus();
}

function resetInventoryForm() {
    byId('inventoryForm').reset();
    byId('inventoryMinimum').value = '0';
    byId('inventoryUnit').value = 'unidad';
    byId('inventoryFormStatus').textContent = '';
}

async function saveInventoryItem(event) {
    event.preventDefault();
    if (!isSuperior()) return;
    const status = byId('inventoryFormStatus');
    const submit = event.currentTarget.querySelector('button[type="submit"]');
    const warehouses = [...event.currentTarget.querySelectorAll('input[name="inventoryWarehouses"]:checked')].map(input => input.value);
    const payload = {
        codigo_arg: byId('inventoryCode').value.trim().toUpperCase(),
        nombre_arg: byId('inventoryName').value.trim(),
        categoria_arg: byId('inventoryCategory').value.trim() || 'General',
        stock_arg: Number(byId('inventoryStock').value),
        stock_minimo_arg: Number(byId('inventoryMinimum').value),
        unidad_arg: byId('inventoryUnit').value.trim() || 'unidad',
        compatibilidad_arg: byId('inventoryCompatibility').value,
        ubicaciones_arg: warehouses,
        ubicacion_detalle_arg: byId('inventoryLocation').value.trim(),
        proveedor_arg: byId('inventorySupplier').value.trim(),
        contacto_arg: byId('inventorySupplierContact').value.trim()
    };
    if (!payload.codigo_arg || !payload.nombre_arg || !warehouses.length || !Number.isFinite(payload.stock_arg) || payload.stock_arg < 0 || !Number.isFinite(payload.stock_minimo_arg) || payload.stock_minimo_arg < 0) {
        status.textContent = 'Completa el código, las cantidades y selecciona al menos un almacén.';
        return;
    }
    submit.disabled = true;
    status.textContent = 'Guardando repuesto...';
    const { error } = await client.rpc('guardar_stock_repuesto_multiples', payload);
    submit.disabled = false;
    if (error) {
        console.warn('No se pudo guardar el repuesto:', error);
        status.textContent = 'No se pudo guardar el repuesto.';
        return;
    }
    resetInventoryForm();
    showInventoryForm(false);
    await loadData();
    byId('inventoryFormStatus').textContent = 'Repuesto guardado correctamente.';
}

async function saveInventoryMovement(event) {
    event.preventDefault();
    if (!isSuperior()) return;
    const status = byId('movementStatus');
    const payload = {
        stock_id_arg: byId('movementItem').value,
        tipo_arg: byId('movementType').value,
        cantidad_arg: Number(byId('movementQuantity').value),
        destino_arg: byId('movementType').value === 'transferencia' ? byId('movementDestination').value : null,
        observacion_arg: byId('movementNote').value.trim()
    };
    if (!payload.stock_id_arg || !Number.isFinite(payload.cantidad_arg) || payload.cantidad_arg <= 0) {
        status.textContent = 'Selecciona un repuesto e ingresa una cantidad válida.';
        return;
    }
    status.textContent = 'Registrando movimiento...';
    const { error } = await client.rpc('registrar_movimiento_stock', payload);
    if (error) {
        status.textContent = error.message?.includes('Stock insuficiente') ? 'No existe stock suficiente para esa salida.' : 'No se pudo registrar el movimiento.';
        return;
    }
    event.currentTarget.reset();
    status.textContent = 'Movimiento registrado correctamente.';
    await loadData();
}

function csvCell(value) {
    return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function exportGeneralCsv() {
    const rows = visibleInterventions().filter(item => inSelectedMonth(item.fecha_guardado));
    if (!rows.length) { setStatus('No hay intervenciones para exportar en el filtro actual.', 'warning'); return; }
    const table = [[
        'Sede', 'Mes', 'Técnico', 'Informe', 'Equipo', 'Tipo', 'Prioridad', 'Duración minutos',
        'Generó parada', 'Motivo', 'Solución', 'Resultado'
    ], ...rows.map(item => [
        siteName(item.sede), monthValue(), item.tecnico, item.numero_informe,
        `${item.equipo_codigo || ''} ${item.equipo_nombre || ''}`.trim(), item.tipo_mantenimiento,
        item.prioridad, item.duracion_minutos, item.genera_parada === false ? 'No' : 'Sí',
        item.motivo, item.solucion, item.resultado_final
    ])];
    const blob = new Blob([`\ufeff${table.map(row => row.map(csvCell).join(',')).join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `URBAPARK-mantenimiento-${selectedSite()}-${monthValue()}.csv`;
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(link.href);
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
    byId('controlTechnician').addEventListener('change', renderAll);
    byId('historyEquipment').addEventListener('change', renderHistory);
    byId('inventoryFilter').addEventListener('input', renderInventory);
    byId('toggleInventoryForm').addEventListener('click', event => showInventoryForm(event.currentTarget.getAttribute('aria-expanded') !== 'true'));
    byId('cancelInventoryForm').addEventListener('click', () => { resetInventoryForm(); showInventoryForm(false); });
    byId('inventoryForm').addEventListener('submit', saveInventoryItem);
    byId('inventoryMovementForm').addEventListener('submit', saveInventoryMovement);
    byId('movementType').addEventListener('change', event => {
        byId('movementDestinationGroup').hidden = event.target.value !== 'transferencia';
    });
    byId('exportGeneralCsv').addEventListener('click', exportGeneralCsv);
    byId('exportGeneralPdf').addEventListener('click', () => window.print());
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
