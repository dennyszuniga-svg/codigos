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
let inventoryPygRows = [];

const byId = id => document.getElementById(id);
const clear = element => { while (element?.firstChild) element.firstChild.remove(); };
const siteName = id => id === 'general' ? 'Almacén general' : SEDES.find(item => item[0] === id)?.[1] || id;
const isSuperior = () => profile?.rol === 'encargado_ti';
const monthValue = () => byId('controlMonth').value || new Date().toISOString().slice(0, 7);
const selectedSite = () => byId('controlSite').value;
const formatMoney = (value, currency = 'PEN') => new Intl.NumberFormat('es-PE', { style: 'currency', currency }).format(Number(value || 0));
const todayLocal = () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

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

function calculateMinutesBetween(start, end) {
    if (!start || !end) return null;
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    if ([startHour, startMinute, endHour, endMinute].some(value => !Number.isFinite(value))) return null;
    let startTotal = startHour * 60 + startMinute;
    let endTotal = endHour * 60 + endMinute;
    if (endTotal < startTotal) endTotal += 24 * 60;
    return endTotal - startTotal;
}

function buildManualReportNumber() {
    const now = new Date();
    const stamp = now.toISOString().replace(/\D/g, '').slice(0, 14);
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `MAN-${stamp}-${suffix}`;
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
    const manualSite = byId('manualSite');
    SEDES.forEach(([value, label]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        site.appendChild(option);
        manualSite.appendChild(option.cloneNode(true));
    });
    const requestedSite = new URLSearchParams(window.location.search).get('sede');
    site.value = SEDES.some(item => item[0] === requestedSite)
        ? requestedSite
        : profile.sede === 'general' ? 'civico' : profile.sede;
    manualSite.value = site.value;
    byId('controlMonth').value = new Date().toISOString().slice(0, 7);
    byId('manualDate').value = todayLocal();
    byId('manualTechnician').value = profile.nombre || session.user.email || '';
    byId('manualSupervisor').value = isSuperior() ? profile.nombre || '' : '';
    byId('manualReason').value = 'Registro manual por perdida del borrador/fotos del informe de intervencion.';
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

function syncManualEquipmentSuggestions() {
    const list = byId('manualEquipmentSuggestions');
    const site = byId('manualSite')?.value || selectedSite();
    if (!list) return;
    clear(list);
    const equipment = new Map();
    interventions
        .filter(item => item.sede === site)
        .forEach(item => {
            if (item.equipo_codigo) equipment.set(item.equipo_codigo, item.equipo_nombre || item.equipo_codigo);
        });
    [...equipment.entries()].sort().forEach(([code, name]) => {
        const option = document.createElement('option');
        option.value = code;
        option.label = name;
        list.appendChild(option);
    });
}

function syncManualFormSite() {
    const manualSite = byId('manualSite');
    if (manualSite) {
        manualSite.value = selectedSite();
        syncManualEquipmentSuggestions();
    }
}

function updateManualDurationPreview() {
    const manualValue = Number(byId('manualDuration')?.value);
    const calculated = calculateMinutesBetween(byId('manualStartTime')?.value, byId('manualEndTime')?.value);
    const minutes = Number.isFinite(manualValue) && byId('manualDuration').value !== '' ? manualValue : calculated;
    const preview = byId('manualDurationPreview');
    if (!preview) return;
    preview.textContent = Number.isFinite(minutes) && minutes >= 0
        ? `Duracion: ${formatMinutes(minutes)}`
        : 'Duracion: pendiente';
}

function hydrateManualEquipmentFromSuggestion() {
    const code = byId('manualEquipmentCode').value.trim();
    const row = interventions.find(item => item.sede === byId('manualSite').value && item.equipo_codigo === code);
    if (!row) return;
    if (!byId('manualEquipmentName').value.trim()) byId('manualEquipmentName').value = row.equipo_nombre || code;
    if (!byId('manualEquipmentType').value.trim()) byId('manualEquipmentType').value = row.equipo_tipo || '';
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

    const [reportsResult, inventoryResult, movementsResult, pygResult] = await Promise.all([
        reportsQuery,
        isSuperior()
            ? client.rpc('listar_inventario_consolidado')
            : Promise.resolve({ data: [], error: null }),
        isSuperior()
            ? client.from('movimientos_stock_repuestos').select('id,tipo,cantidad,ubicacion_origen,ubicacion_destino,sede_consumo,equipo_detalle,observacion,numero_informe,moneda,costo_unitario_sin_igv,costo_total_sin_igv,costo_total_con_igv,created_at,catalogo_repuestos(codigo,nombre,unidad)').gte('created_at', `${start}T00:00:00`).lt('created_at', `${end}T00:00:00`).order('created_at', { ascending: false }).limit(2000)
            : Promise.resolve({ data: [], error: null }),
        isSuperior()
            ? client.rpc('listar_pyg_inventario_mes', { mes_arg: month })
            : Promise.resolve({ data: [], error: null })
    ]);

    const error = reportsResult.error || inventoryResult.error || movementsResult.error || pygResult.error;
    if (error) {
        setStatus('No se pudo cargar toda la información. Actualiza e inténtalo nuevamente.', 'error');
        console.warn('Centro de control:', error);
        return;
    }
    interventions = reportsResult.data || [];
    inventory = inventoryResult.data || [];
    inventoryMovements = movementsResult.data || [];
    inventoryPygRows = pygResult.data || [];
    configureTechnicianFilter();
    syncManualEquipmentSuggestions();
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
    const inventoryValuePen = inventory.filter(item => item.moneda === 'PEN').reduce((sum, item) => sum + Number(item.stock || 0) * Number(item.costo_unitario_sin_igv || 0), 0);
    const inventoryValueUsd = inventory.filter(item => item.moneda === 'USD').reduce((sum, item) => sum + Number(item.stock || 0) * Number(item.costo_unitario_sin_igv || 0), 0);
    summary.append(
        metric('Repuestos', String(uniqueParts), 'Códigos del catálogo general'),
        metric('Stock total', String(totalUnits), 'Todas las ubicaciones'),
        metric('Stock bajo', String(low), 'En mínimo o por debajo', low ? 'warning' : 'good'),
        metric('No disponibles', String(unavailable), 'Stock igual a cero', unavailable ? 'danger' : 'good'),
        metric('Inventario en soles', formatMoney(inventoryValuePen, 'PEN'), 'Stock actual sin IGV'),
        metric('Inventario en dólares', formatMoney(inventoryValueUsd, 'USD'), 'Stock actual sin IGV')
    );
    const query = byId('inventoryFilter').value.trim().toLowerCase();
    const rows = inventory.filter(item => `${item.codigo} ${item.nombre} ${item.categoria} ${item.compatibilidad} ${item.ubicacion_sede}`.toLowerCase().includes(query));
    if (!rows.length) { list.appendChild(empty('No hay repuestos que coincidan con la búsqueda.')); return; }
    rows.forEach(item => {
        const row = record(
            `${item.codigo} - ${item.nombre} - ${siteName(item.ubicacion_sede)}`,
            `${item.stock} ${item.unidad} en esta ubicación - Total general ${item.stock_total} - Costo sin IGV ${formatMoney(item.costo_unitario_sin_igv, item.moneda)} c/u - Valorizado sin IGV ${formatMoney(Number(item.stock) * Number(item.costo_unitario_sin_igv), item.moneda)} - ${item.compatibilidad} - ${item.ubicacion_detalle || 'Sin detalle'}${item.proveedor ? ` - Proveedor: ${item.proveedor}` : ''}`,
            Number(item.stock) <= Number(item.stock_minimo) ? 'failure' : ''
        );
        const editor = document.createElement('div');
        const label = document.createElement('label');
        const input = document.createElement('input');
        const currencyLabel = document.createElement('label');
        const currency = document.createElement('select');
        const button = document.createElement('button');
        editor.className = 'inventory-cost-editor';
        label.textContent = 'Costo unitario sin IGV';
        input.type = 'number'; input.min = '0'; input.step = '0.01'; input.value = String(item.costo_unitario_sin_igv || 0);
        input.dataset.costInput = item.repuesto_id;
        currencyLabel.textContent = 'Moneda';
        currency.append(new Option('Soles (S/)', 'PEN'), new Option('Dólares (US$)', 'USD'));
        currency.value = item.moneda || 'PEN'; currency.dataset.costCurrency = item.repuesto_id;
        button.type = 'button'; button.textContent = 'Actualizar costo'; button.dataset.updateCost = item.repuesto_id;
        label.appendChild(input); currencyLabel.appendChild(currency); editor.append(label, currencyLabel, button); row.appendChild(editor); list.appendChild(row);
    });
    renderInventoryMovements();
    renderInventoryPyg();
}

function renderInventoryPyg() {
    const summary = byId('inventoryPygSummary');
    const list = byId('inventoryPygBySite');
    if (!summary || !list) return;
    clear(summary); clear(list);
    const expenses = inventoryPygRows;
    const units = expenses.reduce((sum, item) => sum + Number(item.cantidad || 0), 0);
    ['PEN', 'USD'].forEach(currency => {
        const rows = expenses.filter(item => item.moneda === currency);
        if (!rows.length) return;
        const totalWithoutTax = rows.reduce((sum, item) => sum + Number(item.costo_total_sin_igv || 0), 0);
        const tax = rows.reduce((sum, item) => sum + Number(item.igv || 0), 0);
        const totalWithTax = rows.reduce((sum, item) => sum + Number(item.costo_total_con_igv || 0), 0);
        const label = currency === 'PEN' ? 'Soles' : 'Dólares';
        summary.append(
            metric(`Sin IGV - ${label}`, formatMoney(totalWithoutTax, currency), monthValue(), totalWithoutTax ? 'warning' : 'good'),
            metric(`IGV 18% - ${label}`, formatMoney(tax, currency), 'Impuesto calculado'),
            metric(`Con IGV - ${label}`, formatMoney(totalWithTax, currency), 'Total mensual', totalWithTax ? 'warning' : 'good')
        );
    });
    summary.append(metric('Unidades consumidas', String(units), `${expenses.length} movimientos`));
    if (!expenses.length) { list.appendChild(empty('No hay consumos valorizados en el mes seleccionado.')); return; }
    expenses.forEach(item => list.appendChild(record(
        `${new Date(item.fecha).toLocaleDateString('es-PE')} - ${item.codigo} - ${item.repuesto}`,
        `${siteName(item.sede_consumo)} - ${item.equipo_codigo || 'Trabajo general'}${item.equipo_nombre ? ` / ${item.equipo_nombre}` : ''} - ${item.cantidad} ${item.unidad} - Sin IGV ${formatMoney(item.costo_total_sin_igv, item.moneda)} - IGV ${formatMoney(item.igv, item.moneda)} - Con IGV ${formatMoney(item.costo_total_con_igv, item.moneda)}${item.numero_informe ? ` - Informe ${item.numero_informe}` : ''}`
    )));
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
        `${item.cantidad} ${item.catalogo_repuestos?.unidad || 'unidad'} - ${siteName(item.ubicacion_origen)}${item.ubicacion_destino ? ` → ${siteName(item.ubicacion_destino)}` : ''} - Sin IGV ${formatMoney(item.costo_total_sin_igv, item.moneda)} - Con IGV ${formatMoney(item.costo_total_con_igv, item.moneda)} - ${new Date(item.created_at).toLocaleString('es-PE')} - ${item.observacion || 'Sin observación'}`
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
    byId('inventoryUnitCost').value = '0';
    byId('inventoryCurrency').value = 'PEN';
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
        costo_unitario_arg: Number(byId('inventoryUnitCost').value),
        moneda_arg: byId('inventoryCurrency').value,
        compatibilidad_arg: byId('inventoryCompatibility').value,
        ubicaciones_arg: warehouses,
        ubicacion_detalle_arg: byId('inventoryLocation').value.trim(),
        proveedor_arg: byId('inventorySupplier').value.trim(),
        contacto_arg: byId('inventorySupplierContact').value.trim()
    };
    if (!payload.codigo_arg || !payload.nombre_arg || !warehouses.length || !Number.isFinite(payload.stock_arg) || payload.stock_arg < 0 || !Number.isFinite(payload.stock_minimo_arg) || payload.stock_minimo_arg < 0 || !Number.isFinite(payload.costo_unitario_arg) || payload.costo_unitario_arg < 0) {
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
        sede_consumo_arg: byId('movementType').value === 'salida' ? byId('movementUseSite').value : null,
        equipo_arg: byId('movementType').value === 'salida' ? byId('movementEquipment').value.trim() : null,
        observacion_arg: byId('movementNote').value.trim()
    };
    if (!payload.stock_id_arg || !Number.isFinite(payload.cantidad_arg) || payload.cantidad_arg <= 0) {
        status.textContent = 'Selecciona un repuesto e ingresa una cantidad válida.';
        return;
    }
    if (payload.tipo_arg === 'salida' && (!payload.sede_consumo_arg || !payload.equipo_arg)) {
        status.textContent = 'Para una salida indica la sede de uso y el equipo o trabajo realizado.';
        return;
    }
    status.textContent = 'Registrando movimiento...';
    const { error } = await client.rpc('registrar_movimiento_stock', payload);
    if (error) {
        status.textContent = error.message?.includes('Stock insuficiente') ? 'No existe stock suficiente para esa salida.' : 'No se pudo registrar el movimiento.';
        return;
    }
    event.currentTarget.reset();
    updateMovementFields('ingreso');
    status.textContent = 'Movimiento registrado correctamente.';
    await loadData();
}

function updateMovementFields(type) {
    byId('movementDestinationGroup').hidden = type !== 'transferencia';
    byId('movementUseSiteGroup').hidden = type !== 'salida';
    byId('movementEquipmentGroup').hidden = type !== 'salida';
}

async function updateInventoryCost(button) {
    const input = button.closest('.inventory-cost-editor')?.querySelector('input[data-cost-input]');
    const currency = button.closest('.inventory-cost-editor')?.querySelector('select[data-cost-currency]')?.value || 'PEN';
    const cost = Number(input?.value);
    if (!Number.isFinite(cost) || cost < 0) { setStatus('Ingresa un costo sin IGV válido.', 'error'); return; }
    button.disabled = true;
    const { error } = await client.rpc('actualizar_costo_repuesto', { repuesto_id_arg: button.dataset.updateCost, costo_arg: cost, moneda_arg: currency });
    button.disabled = false;
    if (error) { setStatus('No se pudo actualizar el costo del repuesto.', 'error'); return; }
    setStatus('Costo sin IGV actualizado. Se aplicará a los próximos consumos.', 'success');
    await loadData();
}

function resetManualMaintenanceForm() {
    const form = byId('manualMaintenanceForm');
    if (!form) return;
    form.reset();
    byId('manualSite').value = selectedSite();
    byId('manualDate').value = todayLocal();
    byId('manualType').value = 'PreventivoMensual';
    byId('manualPriority').value = 'Media';
    byId('manualDowntime').value = 'true';
    byId('manualResult').value = 'Operativo';
    byId('manualTechnician').value = profile?.nombre || session?.user?.email || '';
    byId('manualSupervisor').value = isSuperior() ? profile?.nombre || '' : '';
    byId('manualReason').value = 'Registro manual por perdida del borrador/fotos del informe de intervencion.';
    byId('manualMaintenanceStatus').textContent = '';
    updateManualDurationPreview();
    syncManualEquipmentSuggestions();
}

async function saveManualMaintenance(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const status = byId('manualMaintenanceStatus');
    const submit = form.querySelector('button[type="submit"]');
    const manualDuration = byId('manualDuration').value === '' ? null : Number(byId('manualDuration').value);
    const calculatedDuration = calculateMinutesBetween(byId('manualStartTime').value, byId('manualEndTime').value);
    const duration = Number.isFinite(manualDuration) ? manualDuration : calculatedDuration;
    const site = byId('manualSite').value;
    const date = byId('manualDate').value;
    const endTime = byId('manualEndTime').value || byId('manualStartTime').value || '00:00';
    const savedAt = new Date(`${date}T${endTime}:00`);
    const equipmentCode = byId('manualEquipmentCode').value.trim().toUpperCase();
    const equipmentName = byId('manualEquipmentName').value.trim();
    const reason = byId('manualReason').value.trim();

    if (!site || !date || !equipmentCode || !equipmentName || !Number.isFinite(duration) || duration < 0 || !reason) {
        status.textContent = 'Completa sede, fecha, equipo, motivo y un tiempo valido.';
        status.dataset.state = 'error';
        return;
    }

    const payload = {
        numero_informe: buildManualReportNumber(),
        sede: site,
        sede_nombre: siteName(site),
        equipo_codigo: equipmentCode,
        equipo_nombre: equipmentName,
        equipo_tipo: byId('manualEquipmentType').value.trim(),
        componentes: [],
        tipo_mantenimiento: byId('manualType').value,
        genera_parada: byId('manualDowntime').value === 'true',
        prioridad: byId('manualPriority').value,
        estado_inicial: 'Registro manual',
        resultado_final: byId('manualResult').value,
        tecnico: byId('manualTechnician').value.trim() || profile?.nombre || '',
        supervisor: byId('manualSupervisor').value.trim(),
        hora_inicio: byId('manualStartTime').value,
        hora_final: byId('manualEndTime').value,
        duracion_minutos: Math.round(duration),
        preventivo_estimado_minutos: byId('manualType').value === 'Correctivo' ? null : 120,
        motivo: reason,
        solucion: byId('manualSolution').value.trim() || 'Registro manual de mantenimiento preventivo.',
        repuestos: '',
        fecha_guardado: Number.isNaN(savedAt.getTime()) ? new Date().toISOString() : savedAt.toISOString(),
        creado_por: session.user.id
    };

    submit.disabled = true;
    status.textContent = 'Guardando preventivo manual...';
    status.dataset.state = '';
    const { error } = await client.from('intervenciones_mantenimiento').insert(payload);
    submit.disabled = false;

    if (error) {
        console.warn('No se pudo guardar el preventivo manual:', error);
        status.textContent = error.message?.includes('row-level security')
            ? 'No tienes permiso para guardar en esa sede. Revisa que tu usuario sea admin/tecnico o encargado.'
            : 'No se pudo guardar el preventivo manual.';
        status.dataset.state = 'error';
        return;
    }

    byId('controlSite').value = site;
    byId('controlMonth').value = date.slice(0, 7);
    resetManualMaintenanceForm();
    await loadData();
    status.textContent = 'Preventivo manual guardado correctamente.';
    status.dataset.state = 'success';
    setStatus(`Preventivo manual guardado: ${equipmentCode} - ${formatMinutes(payload.duracion_minutos)}`, 'success');
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

function exportInventoryPygCsv() {
    const rows = inventoryPygRows;
    if (!rows.length) { setStatus('No hay consumos de inventario para exportar en el mes seleccionado.', 'warning'); return; }
    const table = [[
        'Mes', 'Fecha', 'Sede de consumo', 'Equipo codigo', 'Equipo', 'Tipo', 'Informe', 'Codigo', 'Repuesto', 'Cantidad', 'Unidad', 'Moneda', 'Costo unitario sin IGV', 'Subtotal sin IGV', 'IGV 18%', 'Total con IGV', 'Observacion'
    ], ...rows.map(item => [
        monthValue(), new Date(item.fecha).toLocaleString('es-PE'), siteName(item.sede_consumo), item.equipo_codigo || '', item.equipo_nombre || '', item.tipo,
        item.numero_informe || '', item.codigo, item.repuesto, item.cantidad, item.unidad, item.moneda, item.costo_unitario_sin_igv,
        item.costo_total_sin_igv, item.igv, item.costo_total_con_igv, item.observacion || ''
    ])];
    const blob = new Blob([`\ufeff${table.map(row => row.map(csvCell).join(',')).join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `URBAPARK-PyG-repuestos-${monthValue()}.csv`;
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
    byId('controlSite').addEventListener('change', () => {
        syncManualFormSite();
        loadData();
    });
    byId('controlMonth').addEventListener('change', loadData);
    byId('controlTechnician').addEventListener('change', renderAll);
    byId('manualMaintenanceForm').addEventListener('submit', saveManualMaintenance);
    byId('resetManualForm').addEventListener('click', resetManualMaintenanceForm);
    byId('manualSite').addEventListener('change', syncManualEquipmentSuggestions);
    byId('manualEquipmentCode').addEventListener('change', hydrateManualEquipmentFromSuggestion);
    ['manualStartTime', 'manualEndTime', 'manualDuration'].forEach(id => byId(id).addEventListener('input', updateManualDurationPreview));
    byId('historyEquipment').addEventListener('change', renderHistory);
    byId('inventoryFilter').addEventListener('input', renderInventory);
    byId('inventoryList').addEventListener('click', event => {
        const button = event.target.closest('button[data-update-cost]');
        if (button) updateInventoryCost(button);
    });
    byId('toggleInventoryForm').addEventListener('click', event => showInventoryForm(event.currentTarget.getAttribute('aria-expanded') !== 'true'));
    byId('cancelInventoryForm').addEventListener('click', () => { resetInventoryForm(); showInventoryForm(false); });
    byId('inventoryForm').addEventListener('submit', saveInventoryItem);
    byId('inventoryMovementForm').addEventListener('submit', saveInventoryMovement);
    byId('movementType').addEventListener('change', event => updateMovementFields(event.target.value));
    byId('exportGeneralCsv').addEventListener('click', exportGeneralCsv);
    byId('exportInventoryPyg').addEventListener('click', exportInventoryPygCsv);
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
