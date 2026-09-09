/* URBAPARK: módulo operations. Mantiene API global compatible con la app principal. */

function usuarioPuedeVerActivosOperaciones() {
    return !usuarioEsAnfitrion() && perfilActual?.activo !== false;
}

function configurarAccesosAnfitrion() {
    const restringido = usuarioEsAnfitrion();
    document.querySelectorAll('[data-module="mantenimiento"], [data-module="reporteria"]').forEach(elemento => {
        elemento.hidden = restringido;
    });
    document.querySelectorAll('a[href="gdh.html"], [data-nav-module="mantenimiento"]').forEach(elemento => {
        elemento.hidden = restringido;
    });
    const activos = obtenerElemento('openOperationsAssets');
    if (activos) activos.hidden = restringido;
    if (restringido) establecerPanelActivosOperaciones(false);
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
    if (!usuarioPuedeVerActivosOperaciones()) return;
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
    if (abierto && !usuarioPuedeVerActivosOperaciones()) {
        mostrarToast('Tu rol no tiene acceso a Activos de operaciones.');
        return;
    }
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
    if (!usuarioPuedeVerActivosOperaciones()) return;
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

const CONFIGURACION_OCUPABILIDAD_SEDES = Object.freeze({
    salaverry: Object.freeze({
        nombre: 'Real Plaza Salaverry', archivo: 'Salaverry', aviso: '60% SE ABRE EL SIGUIENTE SÓTANO', mostrarYaris: false,
        zonas: Object.freeze([
            { id: 'sotano-1', nombre: 'Sótano 1', tipo: 'vehiculos', capacidad: 273, color: '#2f75b5' },
            { id: 'sotano-2', nombre: 'Sótano 2', tipo: 'vehiculos', capacidad: 398, color: '#ffc000' },
            { id: 'sotano-3', nombre: 'Sótano 3', tipo: 'vehiculos', capacidad: 568, color: '#92d050' },
            { id: 'sotano-4', nombre: 'Sótano 4', tipo: 'vehiculos', capacidad: 482, color: '#19a7d8' },
            { id: 'parking-vip', nombre: 'Parking VIP', tipo: 'vehiculos', capacidad: 28, color: '#2f75b5', textoClaro: true },
            { id: 'bicicletas', nombre: 'Bicicletas', tipo: 'bicicletas', capacidad: 508, color: '#17212b' },
            { id: 'motos', nombre: 'Motos', tipo: 'motos', capacidad: 107, color: '#17212b' }
        ])
    }),
    puruchuco: Object.freeze({
        nombre: 'Real Plaza Puruchuco', archivo: 'Puruchuco', aviso: 'CONTROL DE OCUPABILIDAD POR ZONAS', mostrarYaris: true,
        zonas: Object.freeze([
            { id: 'rojo', nombre: 'Rojo', tipo: 'vehiculos', capacidad: 225, color: '#ef1818' },
            { id: 'verde', nombre: 'Verde', tipo: 'vehiculos', capacidad: 271, color: '#92d050' },
            { id: 'azul', nombre: 'Azul', tipo: 'vehiculos', capacidad: 261, color: '#19a7d8' },
            { id: 'naranja', nombre: 'Naranja', tipo: 'vehiculos', capacidad: 207, color: '#ed7d31' },
            { id: 'rosado', nombre: 'Rosado', tipo: 'vehiculos', capacidad: 73, color: '#efb5ef' },
            { id: 'amarillo', nombre: 'Amarillo', tipo: 'vehiculos', capacidad: 177, color: '#fff200' },
            { id: 'externo-ipae', nombre: 'Externo IPAE', tipo: 'vehiculos', capacidad: 62, color: '#d9e2f3' },
            { id: 'externo-paris', nombre: 'Externo Paris', tipo: 'vehiculos', capacidad: 100, color: '#f2f2f2' },
            { id: 'externo-sodimac', nombre: 'Externo Sodimac', tipo: 'vehiculos', capacidad: 132, color: '#d9ead3' },
            { id: 'externo-ripley', nombre: 'Externo Ripley', tipo: 'vehiculos', capacidad: 62, color: '#fce5cd' },
            { id: 'zona-deck', nombre: 'Zona Deck', tipo: 'vehiculos', capacidad: 220, color: '#cfe2f3' },
            { id: 'zona-helsinki', nombre: 'Zona Helsinki', tipo: 'vehiculos', capacidad: 56, color: '#ead1dc' },
            { id: 'externo-smartfit', nombre: 'Externo Smartfit', tipo: 'vehiculos', capacidad: 54, color: '#d0e0e3' },
            { id: 'zona-carga-vista-alegre', nombre: 'Zona de Carga Vista Alegre', tipo: 'vehiculos', capacidad: 85, color: '#fff2cc' },
            { id: 'bicicletas-sodimac', nombre: 'Bicicletas Sodimac', tipo: 'bicicletas', capacidad: 144, color: '#17212b' },
            { id: 'bicicletas-ipae', nombre: 'Bicicletas IPAE', tipo: 'bicicletas', capacidad: 64, color: '#17212b' },
            { id: 'motos-rojo', nombre: 'Motos (Rojo)', tipo: 'motos', capacidad: 205, color: '#17212b' },
            { id: 'motos-ipae', nombre: 'Motos IPAE', tipo: 'motos', capacidad: 58, color: '#17212b' },
            { id: 'mototaxis-rosado', nombre: 'Mototaxis Rosado', tipo: 'motos', capacidad: 29, color: '#17212b' }
        ])
    }),
    civico: Object.freeze({
        nombre: 'Real Plaza Cívico', archivo: 'Civico', aviso: 'OCUPABILIDAD REAL PLAZA CÍVICO', mostrarYaris: false,
        zonas: Object.freeze([
            { id: 'sotano-1', nombre: 'Sótano 1', tipo: 'vehiculos', capacidad: 169, color: '#2f75b5' },
            { id: 'sotano-2', nombre: 'Sótano 2', tipo: 'vehiculos', capacidad: 332, color: '#19a7d8' },
            { id: 'bicicletas', nombre: 'Bicicletas', tipo: 'bicicletas', capacidad: 220, color: '#17212b' },
            { id: 'motos', nombre: 'Motos', tipo: 'motos', capacidad: 54, color: '#17212b' }
        ])
    }),
    gama: Object.freeze({
        nombre: 'GAMA', archivo: 'GAMA', aviso: 'OCUPABILIDAD GAMA', mostrarYaris: false,
        zonas: Object.freeze([
            { id: 'sotano-1', nombre: 'Sótano 1', tipo: 'vehiculos', capacidad: 283, color: '#2f75b5' },
            { id: 'sotano-2', nombre: 'Sótano 2', tipo: 'vehiculos', capacidad: 151, color: '#ffc000' },
            { id: 'motos', nombre: 'Motos', tipo: 'motos', capacidad: 40, color: '#17212b' }
        ])
    }),
    primavera: Object.freeze({
        nombre: 'Real Plaza Primavera', archivo: 'Primavera', aviso: '60% SE ABRE EL SIGUIENTE SÓTANO', mostrarYaris: false,
        zonas: Object.freeze([
            { id: 'sotano-1', nombre: 'Sótano 1', tipo: 'vehiculos', capacidad: 114, color: '#2f75b5' },
            { id: 'sotano-2', nombre: 'Sótano 2', tipo: 'vehiculos', capacidad: 189, color: '#ffc000' },
            { id: 'sotano-3', nombre: 'Sótano 3', tipo: 'vehiculos', capacidad: 195, color: '#92d050' },
            { id: 'sotano-4', nombre: 'Sótano 4', tipo: 'vehiculos', capacidad: 134, color: '#19a7d8' },
            { id: 'bicicletas', nombre: 'Bicicletas', tipo: 'bicicletas', capacidad: 147, color: '#17212b' },
            { id: 'motos', nombre: 'Motos', tipo: 'motos', capacidad: 60, color: '#17212b' }
        ])
    })
});

function obtenerConfiguracionOcupabilidad(sede = obtenerSedeOcupabilidad()) {
    return CONFIGURACION_OCUPABILIDAD_SEDES[sede] || CONFIGURACION_OCUPABILIDAD_SEDES.salaverry;
}

function configurarSelectSedesOcupabilidad() {
    const select = obtenerElemento('operationsOccupancySite');
    if (!select) return;
    const seleccionAnterior = select.value;
    const puedeElegir = usuarioPuedeElegirSedeChecklistOperaciones();
    const sedePerfil = CONFIGURACION_OCUPABILIDAD_SEDES[perfilActual?.sede] ? perfilActual.sede : 'salaverry';
    const sedes = puedeElegir
        ? SEDES_OPERACION.filter(sede => CONFIGURACION_OCUPABILIDAD_SEDES[sede.id])
        : SEDES_OPERACION.filter(sede => sede.id === sedePerfil);
    limpiarElemento(select);
    sedes.forEach(sede => {
        const opcion = document.createElement('option');
        opcion.value = sede.id;
        opcion.textContent = obtenerConfiguracionOcupabilidad(sede.id).nombre;
        select.appendChild(opcion);
    });
    select.value = sedes.some(sede => sede.id === seleccionAnterior) ? seleccionAnterior : (sedes[0]?.id || 'salaverry');
    select.disabled = sedes.length <= 1;
    const fecha = obtenerElemento('operationsOccupancyDate');
    const hora = obtenerElemento('operationsOccupancyTime');
    if (fecha) fecha.value = fechaLocalISO();
    if (hora) hora.value = horaCorteOcupabilidad();
}

function obtenerSedeOcupabilidad() {
    const sede = obtenerElemento('operationsOccupancySite')?.value || perfilActual?.sede;
    return CONFIGURACION_OCUPABILIDAD_SEDES[sede] ? sede : 'salaverry';
}

function obtenerZonaGuardadaOcupabilidad(id, hora = obtenerElemento('operationsOccupancyTime')?.value) {
    const corte = (registroOcupabilidadDiaria?.cortes || []).find(item => item.hora === hora);
    return (corte?.zonas || []).find(zona => zona.id === id) || null;
}

function claveBorradorZonaOcupabilidad(id) {
    return `${STORAGE_KEYS.occupancyDraft}:${sesionActual?.user?.id || 'local'}:${obtenerSedeOcupabilidad()}:${fechaLocalISO()}:${horaCorteOcupabilidad()}:${id}`;
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
    const configuracion = obtenerConfiguracionOcupabilidad();
    zonasOcupabilidadActual = configuracion.zonas.map(obtenerDatosZonaActual);
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
        if (zona.tipo === 'vehiculos' && configuracion.mostrarYaris) {
            campos.append(crearCampoConteoOcupabilidad(zona, 'yaris', 'Toyota Yaris'));
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
        if (zona.tipo === 'bicicletas') total.bicicletas += numeroEnteroSeguro(zona.ocupados);
        if (zona.tipo === 'motos') total.motos += numeroEnteroSeguro(zona.ocupados);
        return total;
    }, { capacidad: 0, ocupados: 0, libres: 0, bicicletas: 0, motos: 0 });
}

function actualizarResumenOcupabilidad() {
    const configuracion = obtenerConfiguracionOcupabilidad();
    const zonasGuardadas = configuracion.zonas.filter(zona => obtenerZonaGuardadaOcupabilidad(zona.id));
    const datosGuardados = configuracion.zonas.map(config => {
        const guardada = obtenerZonaGuardadaOcupabilidad(config.id);
        return zonaOcupabilidadCompleta(config, guardada || {});
    });
    const totales = calcularTotalesOcupabilidad(datosGuardados);
    const porcentaje = totales.capacidad ? totales.ocupados / totales.capacidad * 100 : 0;
    obtenerElemento('occupancyZonesReported').textContent = `${zonasGuardadas.length}/${configuracion.zonas.length}`;
    obtenerElemento('occupancyTotalOccupied').textContent = totales.ocupados.toLocaleString('es-PE');
    obtenerElemento('occupancyTotalAvailable').textContent = totales.libres.toLocaleString('es-PE');
    obtenerElemento('occupancyRate').textContent = `${porcentaje.toFixed(1)}%`;
    obtenerElemento('occupancyMobilityTotal').textContent = `${totales.bicicletas} / ${totales.motos}`;
    const faltantes = configuracion.zonas.filter(zona => !obtenerZonaGuardadaOcupabilidad(zona.id)).map(zona => zona.nombre);
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
        sede_arg: obtenerSedeOcupabilidad(), fecha_arg: fechaLocalISO(), hora_arg: horaCorteOcupabilidad(), zona_arg: payload
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
    const configuracion = obtenerConfiguracionOcupabilidad();
    let suma = 0;
    cortes.forEach(corte => {
        const zonas = configuracion.zonas.map(config => zonaOcupabilidadCompleta(config, (corte.zonas || []).find(z => z.id === config.id) || {}));
        const totales = calcularTotalesOcupabilidad(zonas);
        const porcentaje = totales.capacidad ? totales.ocupados / totales.capacidad * 100 : 0;
        suma += porcentaje;
        const elemento = document.createElement('article');
        elemento.className = 'occupancy-history-item';
        elemento.append(
            crearTextoElemento('strong', corte.hora),
            crearTextoElemento('span', `${(corte.zonas || []).length}/${configuracion.zonas.length} zonas`),
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
    const sede = obtenerSedeOcupabilidad();
    const configuracion = obtenerConfiguracionOcupabilidad(sede);
    estado.textContent = `Actualizando aportes de ${configuracion.nombre}...`;
    estado.dataset.status = 'info';
    const { data, error } = await supabaseClient.from('operaciones_ocupabilidad_diaria')
        .select('*').eq('sede', sede).eq('fecha', fechaLocalISO()).maybeSingle();
    if (error) {
        registroOcupabilidadDiaria = { sede, fecha: fechaLocalISO(), cortes: [] };
        renderizarZonasOcupabilidad();
        renderizarHistorialOcupabilidad();
        estado.textContent = mensajeErrorSupabase(error, 'No se pudo cargar la ocupabilidad.');
        estado.dataset.status = 'error';
        return;
    }
    registroOcupabilidadDiaria = data || { sede, fecha: fechaLocalISO(), cortes: [] };
    renderizarZonasOcupabilidad();
    renderizarHistorialOcupabilidad();
    suscribirOcupabilidadOperaciones();
    estado.textContent = 'Datos del dia sincronizados.';
    estado.dataset.status = 'success';
}

function suscribirOcupabilidadOperaciones() {
    if (!supabaseClient) return;
    if (canalOcupabilidadOperaciones) supabaseClient.removeChannel(canalOcupabilidadOperaciones);
    const sede = obtenerSedeOcupabilidad();
    canalOcupabilidadOperaciones = supabaseClient.channel(`ocupabilidad-${sede}-hoy`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'operaciones_ocupabilidad_diaria', filter: `sede=eq.${sede}` }, payload => {
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
    const configuracion = obtenerConfiguracionOcupabilidad();
    cortes.sort((a, b) => String(a.hora).localeCompare(String(b.hora))).forEach(corte => {
        const zonas = configuracion.zonas.map(config => zonaOcupabilidadCompleta(config, (corte.zonas || []).find(z => z.id === config.id) || {}));
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
    XLSX.writeFile(libro, `Ocupabilidad-${configuracion.archivo}-${fechaLocalISO()}.xlsx`, { compression: true });
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

async function aplicarFormatoVisualOcupabilidad(buffer, esquema = {}) {
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
<fills count="15">
<fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFFF0000"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF000000"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF2F75B5"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFFFFF00"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF70C94F"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF19A7D8"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFFFFFFF"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFF4F7F9"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFEF1818"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFED7D31"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFEFB5EF"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFB80000"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF092B61"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="2"><border/><border><left style="thin"><color rgb="FF000000"/></left><right style="thin"><color rgb="FF000000"/></right><top style="thin"><color rgb="FF000000"/></top><bottom style="thin"><color rgb="FF000000"/></bottom></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="22">
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
<xf numFmtId="0" fontId="2" fillId="10" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="2" fillId="11" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="2" fillId="12" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="2" fillId="13" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="2" fillId="8" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="3" fillId="14" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="2" fillId="6" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="2" fillId="7" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
    zip.file('xl/styles.xml', estilos);

    let hojaXml = await zip.file('xl/worksheets/sheet1.xml').async('string');
    const estilosPorCelda = {};
    ['A1', 'B1', 'C1', 'D1', 'E1'].forEach(celda => { estilosPorCelda[celda] = 1; });
    ['A7', 'B7', 'C7', 'D7', 'E7'].forEach(celda => { estilosPorCelda[celda] = 2; });
    const filasAutos = esquema.filasAutos || [8, 9, 10, 11, 12];
    const filaTotal = esquema.filaTotal || 13;
    const filasMovilidad = esquema.filasMovilidad || [15, 16];
    const estilosZona = [3, 4, 5, 6, 13];
    filasAutos.forEach((fila, indice) => { estilosPorCelda[`A${fila}`] = estilosZona[indice % estilosZona.length]; });
    estilosPorCelda[`A${filaTotal}`] = 9;
    filasMovilidad.forEach(fila => { estilosPorCelda[`A${fila}`] = 9; });
    Object.assign(estilosPorCelda, { C3: 11, D3: 11, E3: 11, A3: 12 });
    for (const fila of [...filasAutos, filaTotal]) {
        estilosPorCelda[`B${fila}`] = 7;
        estilosPorCelda[`C${fila}`] = 8;
        estilosPorCelda[`D${fila}`] = 9;
        estilosPorCelda[`E${fila}`] = 10;
    }
    for (const fila of filasMovilidad) {
        estilosPorCelda[`B${fila}`] = 7;
        estilosPorCelda[`C${fila}`] = 8;
        estilosPorCelda[`D${fila}`] = 9;
        estilosPorCelda[`E${fila}`] = 10;
    }
    Object.assign(estilosPorCelda, esquema.estilosCeldas || {});
    Object.entries(estilosPorCelda).forEach(([celda, estilo]) => { hojaXml = asignarEstiloCeldaXml(hojaXml, celda, estilo); });

    try {
        const logo = await fetch('assets/urbapark-logo.png').then(respuesta => respuesta.arrayBuffer());
        zip.file('xl/media/image1.png', logo);
        zip.file('xl/drawings/drawing1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><xdr:oneCellAnchor><xdr:from><xdr:col>0</xdr:col><xdr:colOff>190500</xdr:colOff><xdr:row>0</xdr:row><xdr:rowOff>95250</xdr:rowOff></xdr:from><xdr:ext cx="1905000" cy="714375"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="1" name="UrbaPark"/><xdr:cNvPicPr/></xdr:nvPicPr><xdr:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor></xdr:wsDr>`);
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

function convertirCanvasABlobSincrono(canvas) {
    const dataUrl = canvas.toDataURL('image/png', 0.96);
    const base64 = dataUrl.split(',')[1];
    const binario = atob(base64);
    const bytes = new Uint8Array(binario.length);
    for (let indice = 0; indice < binario.length; indice += 1) bytes[indice] = binario.charCodeAt(indice);
    return new Blob([bytes], { type: 'image/png' });
}

function crearModeloExcelOcupabilidadPuruchuco(zonas, hora, fechaTexto, horaTexto) {
    const autos = zonas.filter(zona => zona.tipo === 'vehiculos');
    const bicicletas = zonas.filter(zona => zona.tipo === 'bicicletas');
    const motos = zonas.filter(zona => zona.tipo === 'motos');
    const porcentaje = zona => `${zona.capacidad ? Math.round(zona.ocupados / zona.capacidad * 100) : 0}%`;
    const sumar = (lista, campo) => lista.reduce((total, zona) => total + numeroEnteroSeguro(zona[campo]), 0);
    const totalFila = lista => {
        const ocupados = sumar(lista, 'ocupados');
        const libres = sumar(lista, 'libres');
        const capacidad = sumar(lista, 'capacidad');
        return ['TOTAL', ocupados, libres, capacidad, `${capacidad ? Math.round(ocupados / capacidad * 100) : 0}%`, ''];
    };
    const filas = [
        ['', '', '', '', '', '', '', ''],
        ['', '', fechaTexto, '', horaTexto, '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['ZONA', 'AUTOS', 'DISPONIBLE', 'TOTAL', '%', 'TOYOTA YARIS', '', ''],
        ...autos.map(zona => [zona.nombre.toUpperCase(), zona.ocupados, zona.libres, zona.capacidad, porcentaje(zona), zona.yaris, '', '']),
        totalFila(autos).map((valor, indice) => indice === 5 ? sumar(autos, 'yaris') : valor),
        ['', '', '', '', '', '', '', ''],
        ['BICICLETAS', 'OCUPADOS', 'DISPONIBLE', 'TOTAL', '%', '', '', ''],
        ...bicicletas.map(zona => [zona.nombre, zona.ocupados, zona.libres, zona.capacidad, porcentaje(zona), '', '', '']),
        totalFila(bicicletas),
        ['', '', '', '', '', '', '', ''],
        ['MOTOS', 'OCUPADOS', 'DISPONIBLE', 'TOTAL', '%', '', '', ''],
        ...motos.map(zona => [zona.nombre, zona.ocupados, zona.libres, zona.capacidad, porcentaje(zona), '', '', '']),
        totalFila(motos)
    ];
    const primeraFilaAutos = 6;
    const filaTotalAutos = primeraFilaAutos + autos.length;
    const filaCabeceraBicicletas = filaTotalAutos + 2;
    const primeraFilaBicicletas = filaCabeceraBicicletas + 1;
    const filaTotalBicicletas = primeraFilaBicicletas + bicicletas.length;
    const filaCabeceraMotos = filaTotalBicicletas + 2;
    const primeraFilaMotos = filaCabeceraMotos + 1;
    const filaTotalMotos = primeraFilaMotos + motos.length;
    const estilosCeldas = {};
    const asignarFila = (fila, columnas, estilo) => columnas.forEach(columna => { estilosCeldas[`${columna}${fila}`] = estilo; });
    [1, 2, 3, 4].forEach(fila => asignarFila(fila, ['A', 'B', 'C', 'D', 'E', 'F'], 0));
    asignarFila(5, ['A', 'B', 'C', 'D', 'E', 'F'], 19);
    asignarFila(filaTotalAutos, ['A', 'B', 'C', 'D', 'E', 'F'], 19);
    asignarFila(filaCabeceraBicicletas, ['A', 'B', 'C', 'D', 'E'], 19);
    asignarFila(filaTotalBicicletas, ['A', 'B', 'C', 'D', 'E'], 19);
    asignarFila(filaCabeceraMotos, ['A', 'B', 'C', 'D', 'E'], 19);
    asignarFila(filaTotalMotos, ['A', 'B', 'C', 'D', 'E'], 19);
    asignarFila(2, ['C', 'D', 'E', 'F'], 19);
    const estilosZona = {
        rojo: 14, verde: 20, azul: 21, naranja: 15, rosado: 16,
        amarillo: 4, 'externo-ipae': 17
    };
    autos.forEach((zona, indice) => {
        const fila = primeraFilaAutos + indice;
        asignarFila(fila, ['A', 'B', 'C', 'D', 'E', 'F'], estilosZona[zona.id] || 18);
    });
    [...bicicletas.map((_, indice) => primeraFilaBicicletas + indice),
        ...motos.map((_, indice) => primeraFilaMotos + indice)]
        .forEach(fila => asignarFila(fila, ['A', 'B', 'C', 'D', 'E'], 18));

    const alertas = {
        amarillo: 'Apertura de Amarillo al 70%',
        'zona-deck': 'Apertura de Deck al 70%',
        'zona-helsinki': 'Apertura de Helsinki al 70%',
        'externo-smartfit': 'Apertura de Smartfit al 97%',
        'zona-carga-vista-alegre': 'Apertura de Vista Alegre al 98%'
    };
    autos.forEach((zona, indice) => {
        if (!alertas[zona.id]) return;
        const fila = primeraFilaAutos + indice;
        filas[fila - 1][6] = porcentaje(zona);
        filas[fila - 1][7] = alertas[zona.id];
        asignarFila(fila, ['G', 'H'], 4);
    });

    const hoja = XLSX.utils.aoa_to_sheet(filas);
    hoja['!merges'] = [XLSX.utils.decode_range('C2:D2'), XLSX.utils.decode_range('E2:F2')];
    hoja['!cols'] = [{ wch: 30 }, { wch: 13 }, { wch: 15 }, { wch: 13 }, { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 34 }];
    hoja['!rows'] = filas.map((_, indice) => ({ hpt: indice < 3 ? 25 : 22 }));
    hoja['!ref'] = `A1:H${filas.length}`;
    return {
        hoja,
        esquema: {
            filasAutos: autos.map((_, indice) => primeraFilaAutos + indice),
            filaTotal: filaTotalAutos,
            filasMovilidad: [],
            estilosCeldas
        }
    };
}

function crearImagenCorteOcupabilidad(zonas, hora, fechaTexto, configuracion = obtenerConfiguracionOcupabilidad()) {
    const autos = zonas.filter(zona => zona.tipo === 'vehiculos');
    const movilidad = zonas.filter(zona => zona.tipo !== 'vehiculos');
    const altoFila = autos.length > 10 ? 48 : 58;
    const yTabla = 270;
    const yTotal = yTabla + altoFila * (autos.length + 1);
    const altoNecesario = yTotal + altoFila + (movilidad.length ? 22 + altoFila * movilidad.length : 0) + 35;
    const canvas = document.createElement('canvas');
    canvas.width = 1100;
    canvas.height = Math.max(720, altoNecesario);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, canvas.width, 72);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 34px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(configuracion.aviso, canvas.width / 2, 36, canvas.width - 50);

    const logo = document.querySelector('img[src*="urbapark-logo.png"]');
    if (logo?.complete && logo.naturalWidth) {
        const maxAncho = 500;
        const maxAlto = 160;
        const escala = Math.min(maxAncho / logo.naturalWidth, maxAlto / logo.naturalHeight);
        const ancho = logo.naturalWidth * escala;
        const alto = logo.naturalHeight * escala;
        ctx.drawImage(logo, 18, 92 + (maxAlto - alto) / 2, ancho, alto);
    } else {
        ctx.fillStyle = '#ef4b1b';
        ctx.font = '800 50px Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('UrbaPark', 40, 165);
    }

    dibujarCeldaOcupabilidad(ctx, 570, 105, 235, 55, '#000000', fechaTexto, '#ffffff', 27);
    const horaGeneracion = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    dibujarCeldaOcupabilidad(ctx, 805, 105, 275, 55, '#000000', horaGeneracion, '#ffffff', 27);

    const x = 20;
    const altos = altoFila;
    const anchos = [350, 205, 190, 175, 140];
    const posiciones = anchos.reduce((lista, ancho, indice) => {
        lista.push(indice ? lista[indice - 1] + anchos[indice - 1] : x);
        return lista;
    }, []);
    ['OCUPABILIDAD ' + hora, 'OCUPADOS', 'DISPO.', 'TOT.', '%'].forEach((texto, indice) => {
        dibujarCeldaOcupabilidad(ctx, posiciones[indice], yTabla, anchos[indice], altos, '#000000', texto, '#ffffff', indice ? 25 : 24);
    });

    autos.forEach((zona, indice) => {
        const y = yTabla + altos * (indice + 1);
        const colorTexto = zona.textoClaro ? '#ffffff' : '#000000';
        const tamano = altos < 55 ? 20 : 27;
        dibujarCeldaOcupabilidad(ctx, posiciones[0], y, anchos[0], altos, zona.color, zona.nombre.toUpperCase(), colorTexto, tamano);
        dibujarCeldaOcupabilidad(ctx, posiciones[1], y, anchos[1], altos, '#ff0000', zona.ocupados, '#ffffff', tamano + 1);
        dibujarCeldaOcupabilidad(ctx, posiciones[2], y, anchos[2], altos, '#92d050', zona.libres, '#000000', tamano + 1);
        dibujarCeldaOcupabilidad(ctx, posiciones[3], y, anchos[3], altos, '#000000', zona.capacidad, '#ffffff', tamano + 1);
        dibujarCeldaOcupabilidad(ctx, posiciones[4], y, anchos[4], altos, '#ffffff', `${zona.capacidad ? Math.round(zona.ocupados / zona.capacidad * 100) : 0}%`, '#000000', tamano + 1);
    });
    const totales = calcularTotalesOcupabilidad(zonas);
    dibujarCeldaOcupabilidad(ctx, posiciones[0], yTotal, anchos[0], altos, '#000000', 'TOTAL', '#ffffff', 28);
    dibujarCeldaOcupabilidad(ctx, posiciones[1], yTotal, anchos[1], altos, '#ff0000', totales.ocupados, '#ffffff', 28);
    dibujarCeldaOcupabilidad(ctx, posiciones[2], yTotal, anchos[2], altos, '#92d050', totales.libres, '#000000', 28);
    dibujarCeldaOcupabilidad(ctx, posiciones[3], yTotal, anchos[3], altos, '#000000', totales.capacidad, '#ffffff', 28);
    dibujarCeldaOcupabilidad(ctx, posiciones[4], yTotal, anchos[4], altos, '#ffffff', `${totales.capacidad ? Math.round(totales.ocupados / totales.capacidad * 100) : 0}%`, '#000000', 28);

    movilidad.forEach((zona, indice) => {
        const y = yTotal + altos + 22 + altos * indice;
        dibujarCeldaOcupabilidad(ctx, posiciones[0], y, anchos[0], altos, '#000000', zona.nombre.toUpperCase(), '#ffffff', 28);
        dibujarCeldaOcupabilidad(ctx, posiciones[1], y, anchos[1], altos, '#ff0000', zona.ocupados, '#ffffff', 28);
        dibujarCeldaOcupabilidad(ctx, posiciones[2], y, anchos[2], altos, '#92d050', zona.libres, '#000000', 28);
        dibujarCeldaOcupabilidad(ctx, posiciones[3], y, anchos[3], altos, '#000000', zona.capacidad, '#ffffff', 28);
        dibujarCeldaOcupabilidad(ctx, posiciones[4], y, anchos[4], altos, '#ffffff', `${zona.capacidad ? Math.round(zona.ocupados / zona.capacidad * 100) : 0}%`, '#000000', 28);
    });

    return convertirCanvasABlobSincrono(canvas);
}

async function exportarCorteOcupabilidadExcel(horaSeleccionada = '', compartir = false) {
    const estado = obtenerElemento('operationsOccupancyStatus');
    const configuracion = obtenerConfiguracionOcupabilidad();
    const hora = typeof horaSeleccionada === 'string' && horaSeleccionada ? horaSeleccionada : horaCorteOcupabilidad();
    const corte = (registroOcupabilidadDiaria?.cortes || []).find(item => item.hora === hora);
    const reportadas = corte?.zonas || [];
    const faltantes = configuracion.zonas.filter(config => !reportadas.some(zona => zona.id === config.id));
    if (!window.XLSX) {
        estado.textContent = 'No se pudo cargar el generador de Excel.';
        estado.dataset.status = 'error';
        return;
    }
    if (!corte || faltantes.length) {
        estado.textContent = `Completa las ${configuracion.zonas.length} zonas antes de generar el archivo. Faltan: ${faltantes.map(zona => zona.nombre).join(', ') || 'todas'}.`;
        estado.dataset.status = 'error';
        return;
    }
    const zonas = configuracion.zonas.map(config => zonaOcupabilidadCompleta(config, reportadas.find(zona => zona.id === config.id)));
    const autos = zonas.filter(zona => zona.tipo === 'vehiculos');
    const movilidad = zonas.filter(zona => zona.tipo !== 'vehiculos');
    const fecha = new Date(`${fechaLocalISO()}T12:00:00`);
    const fechaTexto = fecha.toLocaleDateString('es-PE');
    const horaTexto = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    if (compartir) {
        estado.textContent = 'Preparando la imagen para WhatsApp...';
        estado.dataset.status = 'info';
        try {
            const imagen = crearImagenCorteOcupabilidad(zonas, hora, fechaTexto, configuracion);
            const nombreImagen = `Ocupabilidad-${configuracion.archivo}-${fechaLocalISO()}-${hora.replace(':', '')}.png`;
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
                estado.textContent = 'Este dispositivo no permite adjuntar desde la app. La imagen se descargo para enviarla desde WhatsApp.';
                estado.dataset.status = 'success';
                return;
            }
            await navigator.share({
                files: [imagenCompartible],
                title: `Ocupabilidad ${configuracion.nombre} ${hora}`,
                text: `Ocupabilidad ${configuracion.nombre} - ${fechaTexto} ${hora}`
            });
            estado.textContent = `Imagen del corte ${hora} compartida.`;
            estado.dataset.status = 'success';
        } catch (error) {
            if (error?.name === 'AbortError') {
                estado.textContent = 'Se cancelo el envio por WhatsApp.';
                estado.dataset.status = 'info';
            } else if (error?.name === 'NotAllowedError') {
                estado.textContent = 'Android bloqueo el menu de compartir. Cierra y vuelve a abrir la app para aplicar la actualizacion.';
                estado.dataset.status = 'error';
            } else {
                console.error('No se pudo compartir la imagen:', error);
                estado.textContent = 'No se pudo preparar la imagen. Intenta nuevamente.';
                estado.dataset.status = 'error';
            }
        }
        return;
    }
    if (obtenerSedeOcupabilidad() === 'puruchuco') {
        const modelo = crearModeloExcelOcupabilidadPuruchuco(zonas, hora, fechaTexto, horaTexto);
        const libroPuruchuco = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libroPuruchuco, modelo.hoja, `Ocupabilidad ${hora.replace(':', '')}`);
        const bufferPuruchuco = XLSX.write(libroPuruchuco, { bookType: 'xlsx', type: 'array', compression: true });
        estado.textContent = 'Preparando el formato de Puruchuco...';
        estado.dataset.status = 'info';
        try {
            const archivo = await aplicarFormatoVisualOcupabilidad(bufferPuruchuco, modelo.esquema);
            const nombreArchivo = `Ocupabilidad-${configuracion.archivo}-${fechaLocalISO()}-${hora.replace(':', '')}.xlsx`;
            const enlace = document.createElement('a');
            const url = URL.createObjectURL(archivo);
            enlace.href = url;
            enlace.download = nombreArchivo;
            document.body.appendChild(enlace);
            enlace.click();
            enlace.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
            estado.textContent = `Excel de Puruchuco ${hora} generado con el formato operativo.`;
            estado.dataset.status = 'success';
        } catch (error) {
            console.error('No se pudo generar el Excel de Puruchuco:', error);
            estado.textContent = 'No se pudo terminar el Excel de Puruchuco. Intenta nuevamente.';
            estado.dataset.status = 'error';
        }
        return;
    }
    const primeraFilaDatos = 8;
    const filaTotal = primeraFilaDatos + autos.length;
    const primeraFilaMovilidad = filaTotal + 2;
    const filasAutos = autos.map((zona, indice) => {
        const fila = primeraFilaDatos + indice;
        return [zona.nombre.toUpperCase(), zona.ocupados, zona.libres, zona.capacidad,
            { f: `IFERROR(B${fila}/D${fila},0)`, v: zona.capacidad ? zona.ocupados / zona.capacidad : 0 }];
    });
    const totalOcupados = autos.reduce((suma, zona) => suma + zona.ocupados, 0);
    const totalLibres = autos.reduce((suma, zona) => suma + zona.libres, 0);
    const totalCapacidad = autos.reduce((suma, zona) => suma + zona.capacidad, 0);
    const filasMovilidad = movilidad.map((zona, indice) => {
        const fila = primeraFilaMovilidad + indice;
        return [zona.nombre.toUpperCase(), zona.ocupados, zona.libres, zona.capacidad,
            { f: `IFERROR(B${fila}/D${fila},0)`, v: zona.capacidad ? zona.ocupados / zona.capacidad : 0 }];
    });
    const filas = [
        [configuracion.aviso, '', '', '', ''],
        ['', '', '', '', ''],
        ['UrbaPark', '', fechaTexto, horaTexto, ''],
        ['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', ''],
        [`OCUPABILIDAD ${hora}`, 'OCUPADOS', 'DISPO.', 'TOT.', '%'],
        ...filasAutos,
        ['TOTAL', { f: `SUM(B${primeraFilaDatos}:B${filaTotal - 1})`, v: totalOcupados },
            { f: `SUM(C${primeraFilaDatos}:C${filaTotal - 1})`, v: totalLibres },
            { f: `SUM(D${primeraFilaDatos}:D${filaTotal - 1})`, v: totalCapacidad },
            { f: `IFERROR(B${filaTotal}/D${filaTotal},0)`, v: totalCapacidad ? totalOcupados / totalCapacidad : 0 }],
        ['', '', '', '', ''],
        ...filasMovilidad
    ];
    const hoja = XLSX.utils.aoa_to_sheet(filas);
    hoja['!merges'] = [XLSX.utils.decode_range('A1:E1'), XLSX.utils.decode_range('A3:B5'), XLSX.utils.decode_range('D3:E3')];
    hoja['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 16 }, { wch: 15 }, { wch: 13 }];
    hoja['!rows'] = filas.map((fila, indice) => ({ hpt: indice === 0 ? 34 : (indice === 1 || indice === filaTotal ? 10 : 27) }));
    hoja['!ref'] = `A1:E${filas.length}`;
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, `Ocupabilidad ${hora.replace(':', '')}`);
    const buffer = XLSX.write(libro, { bookType: 'xlsx', type: 'array', compression: true });
    estado.textContent = 'Preparando el Excel de la hora...';
    estado.dataset.status = 'info';
    try {
        const archivo = await aplicarFormatoVisualOcupabilidad(buffer, {
            filasAutos: autos.map((_, indice) => primeraFilaDatos + indice),
            filaTotal,
            filasMovilidad: movilidad.map((_, indice) => primeraFilaMovilidad + indice)
        });
        const nombreArchivo = `Ocupabilidad-${configuracion.archivo}-${fechaLocalISO()}-${hora.replace(':', '')}.xlsx`;
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

function usuarioPuedeVerReporteriaOperaciones() {
    return perfilActual?.activo !== false
        && [ROL_SUPERIOR, 'jefe_operaciones', 'coordinador_operaciones', 'gdh'].includes(perfilActual?.rol);
}

function usuarioPuedeVerInformeGeneralOperaciones() {
    return usuarioPuedeVerReporteriaOperaciones();
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
    const ahora = new Date();
    const minutos = minutosDelDia(ahora);
    const fase = minutos >= 17 * 60 ? '17'
        : minutos >= 13 * 60 ? '13'
        : minutos >= 4 * 60 ? '04'
        : minutos >= 3 * 60 ? '03'
        : '00';
    const clave = `urbapark-operations-image-cleanup-${fechaLocalISO(ahora)}-${fase}`;
    try {
        if (localStorage.getItem(clave)) return;
        const { data, error } = await supabaseClient.functions.invoke('cleanup-operations-images', { body: {} });
        if (error) throw error;
        localStorage.setItem(clave, 'ok');
    } catch (error) {
        console.warn('La limpieza diaria del checklist operativo quedo pendiente:', error);
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
    const puedeVerReporteria = usuarioPuedeVerReporteriaOperaciones();
    const botonDashboard = obtenerElemento('openOperationsDashboard');
    const botonInforme = obtenerElemento('openOperationsGeneralReport');
    if (botonDashboard) botonDashboard.hidden = !puedeVerReporteria;
    if (botonInforme) botonInforme.hidden = !puedeVerReporteria;
    if (!puedeVerReporteria) {
        const dashboardPanel = obtenerElemento('operationsDashboardPanel');
        const generalPanel = obtenerElemento('operationsGeneralReportPanel');
        if (dashboardPanel) dashboardPanel.hidden = true;
        if (generalPanel) {
            generalPanel.hidden = true;
            generalPanel.classList.remove('operations-subwindow-active');
        }
        botonDashboard?.setAttribute('aria-expanded', 'false');
        botonInforme?.setAttribute('aria-expanded', 'false');
    }
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
                if (capturaFotoChecklistOperacionesEnCurso) return;
                if (checklistOperacionesActual?.id && !esRegistroActual) return;
                if (esRegistroActual && firmaSincronizacionChecklistOperaciones(remoto) === firmaSincronizacionChecklistOperaciones(checklistOperacionesActual)) return;
                const campoActivo = document.activeElement;
                const editandoObservacion = esRegistroActual
                    && campoActivo?.matches?.('textarea[data-operations-observation]');
                if (editandoObservacion) return;
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

function iniciarCapturaFotoChecklistOperaciones() {
    capturaFotoChecklistOperacionesEnCurso = true;
    window.clearTimeout(temporizadorCapturaFotoChecklistOperaciones);
    temporizadorCapturaFotoChecklistOperaciones = window.setTimeout(() => {
        capturaFotoChecklistOperacionesEnCurso = false;
        temporizadorCapturaFotoChecklistOperaciones = null;
    }, 120000);
}

function finalizarCapturaFotoChecklistOperaciones() {
    capturaFotoChecklistOperacionesEnCurso = false;
    window.clearTimeout(temporizadorCapturaFotoChecklistOperaciones);
    temporizadorCapturaFotoChecklistOperaciones = null;
}

async function manejarSeleccionFotosChecklistOperaciones(input) {
    const archivos = Array.from(input?.files || []);
    if (!archivos.length) {
        finalizarCapturaFotoChecklistOperaciones();
        return;
    }
    iniciarCapturaFotoChecklistOperaciones();
    try {
        await adjuntarFotosChecklistOperaciones(input.dataset.operationsEvidenceInput, archivos);
    } finally {
        input.value = '';
        finalizarCapturaFotoChecklistOperaciones();
    }
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
            if (foto.dataUrl || (foto.url && Number(foto.urlExpiresAt || 0) > Date.now())) return;
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
            input.addEventListener('click', iniciarCapturaFotoChecklistOperaciones);
            input.addEventListener('change', () => manejarSeleccionFotosChecklistOperaciones(input));
            label.appendChild(input);
            return label;
        };
        acciones.append(crearEntrada(false, true, 'Cargar imagen'));
    }

    fotos.forEach((foto, indice) => {
        const figura = document.createElement('figure');
        const imagen = document.createElement('img');
        const pie = document.createElement('figcaption');
        const quitar = document.createElement('button');
        figura.className = 'operations-evidence-item';
        imagen.src = foto.url || foto.dataUrl || '';
        imagen.alt = `Evidencia ${indice + 1} de ${seccion.nombre}`;
        imagen.loading = 'lazy';
        pie.textContent = foto.subiendo
            ? 'Cargando foto...'
            : `${foto.autor_nombre || 'Personal de sede'} · ${foto.creado_at ? formatearFechaHoraReporte(foto.creado_at) : 'sin hora'}`;
        quitar.type = 'button';
        quitar.className = 'operations-evidence-remove';
        quitar.dataset.removeOperationsEvidence = seccion.id;
        quitar.dataset.operationsEvidenceIndex = String(indice);
        quitar.setAttribute('aria-label', `Quitar evidencia ${indice + 1} de ${seccion.nombre}`);
        quitar.title = 'Quitar foto';
        quitar.textContent = '×';
        quitar.addEventListener('click', () => quitarFotoChecklistOperaciones(seccion.id, indice));
        if (foto.pendiente) figura.classList.add('is-pending');
        figura.append(imagen, pie);
        if (checklistOperacionesActual?.estado === 'borrador') figura.appendChild(quitar);
        galeria.appendChild(figura);
    });

    if (!fotos.length) galeria.appendChild(crearMensajeVacio('Aun no se adjuntaron fotos en este bloque.', 'operations-evidence-empty'));
    const estado = crearTextoElemento('p', '', 'auth-status operations-evidence-status');
    estado.dataset.operationsPhotoStatus = seccion.id;
    panel.append(cabecera, acciones, galeria, estado);
    return panel;
}

async function quitarFotoChecklistOperaciones(seccionId, indice) {
    const fotos = obtenerEvidenciasSeccionOperaciones(checklistOperacionesActual, seccionId);
    const foto = fotos[Number(indice)];
    if (!foto || checklistOperacionesActual?.estado !== 'borrador') return;
    if (!window.confirm('¿Quitar esta foto del checklist?')) return;

    const estado = document.querySelector(`[data-operations-photo-status="${seccionId}"]`);
    if (estado) estado.textContent = 'Quitando foto...';
    try {
        if (foto.pendiente || !foto.path) {
            if (foto.localKey) await eliminarMediaLocal(foto.localKey);
            fotos.splice(Number(indice), 1);
            checklistOperacionesActual.evidencias[seccionId] = fotos;
        } else {
            const { data, error } = await supabaseClient.rpc('eliminar_evidencia_checklist_operaciones', {
                checklist_id_arg: checklistOperacionesActual.id,
                seccion_arg: seccionId,
                path_arg: foto.path
            });
            if (error) throw error;
            checklistOperacionesActual.evidencias = data || checklistOperacionesActual.evidencias || {};
            const { error: storageError } = await supabaseClient.storage
                .from(OPERATIONS_CHECKLIST_BUCKET)
                .remove([foto.path]);
            if (storageError) console.warn('La referencia se retiro, pero la limpieza fisica quedo pendiente:', storageError);
        }
        const panel = obtenerElemento('operationsChecklistPanel');
        const posicion = panel?.scrollTop || 0;
        await hidratarEvidenciasChecklistOperaciones(checklistOperacionesActual);
        renderizarChecklistOperaciones();
        if (panel) panel.scrollTop = posicion;
        const estadoActual = document.querySelector(`[data-operations-photo-status="${seccionId}"]`);
        if (estadoActual) {
            estadoActual.textContent = 'Foto retirada correctamente.';
            estadoActual.dataset.status = 'success';
        }
    } catch (error) {
        console.warn('No se pudo quitar la evidencia operativa:', error);
        if (estado) {
            estado.textContent = `No se pudo quitar la foto: ${error?.message || 'intenta nuevamente'}.`;
            estado.dataset.status = 'error';
        }
    }
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
    const errores = [];
    for (const archivo of seleccionados) {
        let ruta = '';
        let dataUrl = '';
        let respaldoLocal = false;
        let vistaPreviaUrl = '';
        let fotoTemporal = null;
        const localKey = `operaciones:${checklistOperacionesActual.id}:${seccionId}:${Date.now()}-${Math.random().toString(16).slice(2)}`;
        try {
            vistaPreviaUrl = URL.createObjectURL(archivo);
            checklistOperacionesActual.evidencias = checklistOperacionesActual.evidencias || {};
            const fotosSeccion = checklistOperacionesActual.evidencias[seccionId] || [];
            fotoTemporal = {
                localKey,
                url: vistaPreviaUrl,
                nombre: archivo.name || 'evidencia.jpg',
                autor_nombre: obtenerNombreUsuarioActivo(),
                creado_at: new Date().toISOString(),
                pendiente: true,
                subiendo: true
            };
            fotosSeccion.push(fotoTemporal);
            checklistOperacionesActual.evidencias[seccionId] = fotosSeccion;
            const panelVistaPrevia = obtenerElemento('operationsChecklistPanel');
            const posicionVistaPrevia = panelVistaPrevia?.scrollTop || 0;
            renderizarChecklistOperaciones();
            if (panelVistaPrevia) panelVistaPrevia.scrollTop = posicionVistaPrevia;
            const estadoVistaPrevia = document.querySelector(`[data-operations-photo-status="${seccionId}"]`);
            if (estadoVistaPrevia) estadoVistaPrevia.textContent = 'Preparando y subiendo la foto...';

            dataUrl = await comprimirFoto(archivo, 800, 0.60);
            fotoTemporal.dataUrl = dataUrl;
            try {
                await guardarMediaLocal(localKey, dataUrl, obtenerScopeEvidenciasOperaciones(), {
                    seccionId,
                    nombre: archivo.name || 'evidencia.jpg',
                    autorNombre: obtenerNombreUsuarioActivo()
                });
                respaldoLocal = true;
            } catch (errorRespaldo) {
                console.warn('El celular no permitio el respaldo local; se intentara la subida directa:', errorRespaldo);
            }
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
            const fotoSubida = Object.values(checklistOperacionesActual.evidencias)
                .flat()
                .find(foto => foto?.path === ruta);
            if (fotoSubida) fotoSubida.dataUrl = dataUrl;
            if (respaldoLocal) {
                try {
                    await eliminarMediaLocal(localKey);
                } catch (errorLimpieza) {
                    console.warn('La foto se guardo, pero su respaldo temporal quedo pendiente de limpieza:', errorLimpieza);
                }
            }
            if (vistaPreviaUrl) URL.revokeObjectURL(vistaPreviaUrl);
            try {
                await hidratarEvidenciasChecklistOperaciones(checklistOperacionesActual);
            } catch (errorHidratacion) {
                console.warn('La foto se guardo, pero la vista remota tardara en actualizarse:', errorHidratacion);
            }
            agregadas += 1;
        } catch (error) {
            console.warn('No se pudo adjuntar evidencia operativa:', error);
            errores.push(error?.message || 'No se pudo procesar o subir la imagen.');
            if (ruta) await supabaseClient.storage.from(OPERATIONS_CHECKLIST_BUCKET).remove([ruta]);
            if (dataUrl) {
                if (fotoTemporal) {
                    fotoTemporal.dataUrl = dataUrl;
                    fotoTemporal.url = '';
                    fotoTemporal.subiendo = false;
                }
                if (vistaPreviaUrl) URL.revokeObjectURL(vistaPreviaUrl);
            } else {
                const fotosPendientes = checklistOperacionesActual.evidencias?.[seccionId] || [];
                checklistOperacionesActual.evidencias[seccionId] = fotosPendientes.filter(foto => foto.localKey !== localKey);
                if (vistaPreviaUrl) URL.revokeObjectURL(vistaPreviaUrl);
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
            : `No se pudo guardar la foto. ${errores[0] || 'Revisa la conexion y vuelve a intentar.'}`;
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
        const { error } = await supabaseClient.rpc('finalizar_checklist_operaciones', {
            checklist_id_arg: checklistOperacionesActual.id,
            turno_arg: checklistOperacionesActual.turno,
            fin_at_arg: finAt,
            respuestas_arg: checklistOperacionesActual.respuestas,
            observaciones_arg: checklistOperacionesActual.observaciones,
            total_items_arg: resumen.total,
            cumple_items_arg: resumen.cumple,
            no_cumple_items_arg: resumen.noCumple,
            no_aplica_items_arg: resumen.noAplica,
            cumplimiento_arg: resumen.cumplimiento,
            criticos_no_cumple_arg: resumen.criticos
        });
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
        obtenerElemento('downloadLastOperationsChecklist').hidden = false;
        actualizarEstadoChecklistOperaciones(`Checklist finalizado con ${resumen.cumplimiento}% de cumplimiento.`, 'success');
        renderizarChecklistOperaciones();
        actualizarBannerBorradorOperaciones('Checklist finalizado. El resultado ya esta disponible para todo el equipo.', 'success');
    } catch (error) {
        console.warn('No se pudo finalizar el checklist:', error);
        actualizarEstadoChecklistOperaciones(`No se pudo finalizar: ${error?.message || 'el borrador permanece guardado.'}`, 'error');
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
    if (!usuarioPuedeVerReporteriaOperaciones()) {
        mostrarToast('El historial y los KPI están disponibles solo para los roles autorizados.');
        return;
    }
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
        const acciones = document.createElement('div');
        const descargarPdf = document.createElement('button');
        tarjeta.className = 'operations-history-item';
        cabecera.append(crearTextoElemento('h3', registro.responsable_nombre), crearTextoElemento('span', obtenerEtiquetaRol(registro.responsable_rol)));
        const estadoPuntualidad = obtenerPuntualidadChecklistOperaciones(registro);
        const puntualidad = estadoPuntualidad === 'tardanza' ? 'TARDANZA' : estadoPuntualidad === 'a_tiempo' ? 'A TIEMPO' : 'SIN CLASIFICAR';
        datos.textContent = `${registro.fecha} - ${String(registro.turno || '').toUpperCase()} - ${puntualidad} - ${registro.no_cumple_items || 0} no conformidades`;
        resultado.textContent = `${Number(registro.cumplimiento || 0).toFixed(1)}%`;
        resultado.className = Number(registro.criticos_no_cumple || 0) ? 'has-critical' : '';
        acciones.className = 'operations-report-actions';
        descargarPdf.type = 'button';
        descargarPdf.className = 'clear-btn operations-report-action';
        descargarPdf.dataset.downloadOperationsChecklist = registro.id;
        descargarPdf.textContent = 'Descargar PDF';
        acciones.append(descargarPdf);
        tarjeta.append(cabecera, datos, resultado, acciones);
        historialContenedor.appendChild(tarjeta);
    });
}

function escaparXmlChecklist(valor = '') {
    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function actualizarCeldaXmlChecklist(xml, referencia, valor, opciones = {}) {
    const patron = new RegExp(`<c\\b([^>]*\\br="${referencia}"[^>]*)\\s*(?:\\/>|>([\\s\\S]*?)<\\/c>)`);
    return xml.replace(patron, coincidencia => {
        const apertura = coincidencia.match(/^<c\b([^>]*)/)?.[1] || ` r="${referencia}"`;
        const atributos = apertura.replace(/\s+t="[^"]*"/g, '').replace(/\s*\/$/, '');
        if (opciones.texto) {
            return `<c${atributos} t="inlineStr"><is><t xml:space="preserve">${escaparXmlChecklist(valor)}</t></is></c>`;
        }
        const numero = Number.isFinite(Number(valor)) ? Number(valor) : 0;
        const formula = opciones.formula ? `<f>${escaparXmlChecklist(opciones.formula)}</f>` : '';
        return `<c${atributos}>${formula}<v>${numero}</v></c>`;
    });
}

function crearCacheNumericoGrafico(valores, formato = 'General') {
    const puntos = valores.map((valor, indice) => `<c:pt idx="${indice}"><c:v>${Number(valor) || 0}</c:v></c:pt>`).join('');
    return `<c:numCache><c:formatCode>${formato}</c:formatCode><c:ptCount val="${valores.length}"/>${puntos}</c:numCache>`;
}

function actualizarCachesGrafico(xml, series) {
    let indice = 0;
    return xml.replace(/<c:numCache>[\s\S]*?<\/c:numCache>/g, coincidencia => {
        const serie = series[indice++];
        return serie ? crearCacheNumericoGrafico(serie.valores, serie.formato) : coincidencia;
    });
}

function nombreColumnaExcel(indice) {
    let numero = indice + 1;
    let resultado = '';
    while (numero > 0) {
        numero -= 1;
        resultado = String.fromCharCode(65 + (numero % 26)) + resultado;
        numero = Math.floor(numero / 26);
    }
    return resultado;
}

function crearXmlHojaChecklist(encabezados, filas, anchos = [], columnasPorcentaje = []) {
    const ultimaColumna = nombreColumnaExcel(encabezados.length - 1);
    const totalFilas = Math.max(1, filas.length + 1);
    const columnas = encabezados.map((_, indice) => {
        const ancho = Number(anchos[indice] || 18);
        return `<col min="${indice + 1}" max="${indice + 1}" width="${ancho}" customWidth="1"/>`;
    }).join('');
    const crearCelda = (valor, fila, columna, cabecera = false) => {
        const referencia = `${nombreColumnaExcel(columna)}${fila}`;
        const esNumero = typeof valor === 'number' && Number.isFinite(valor);
        const estilo = cabecera ? 1 : columnasPorcentaje.includes(columna) ? 7 : esNumero ? 3 : 2;
        if (esNumero) return `<c r="${referencia}" s="${estilo}"><v>${valor}</v></c>`;
        return `<c r="${referencia}" s="${estilo}" t="inlineStr"><is><t xml:space="preserve">${escaparXmlChecklist(valor ?? '')}</t></is></c>`;
    };
    const filaCabecera = `<row r="1" ht="30" customHeight="1">${encabezados.map((valor, columna) => crearCelda(valor, 1, columna, true)).join('')}</row>`;
    const filasXml = filas.map((fila, indice) => {
        const numeroFila = indice + 2;
        return `<row r="${numeroFila}" ht="24" customHeight="1">${encabezados.map((_, columna) => crearCelda(fila[columna], numeroFila, columna)).join('')}</row>`;
    }).join('');
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:${ultimaColumna}${totalFilas}"/><sheetViews><sheetView showGridLines="0" workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="18"/><cols>${columnas}</cols><sheetData>${filaCabecera}${filasXml}</sheetData><autoFilter ref="A1:${ultimaColumna}${totalFilas}"/><pageMargins left="0.35" right="0.35" top="0.5" bottom="0.5" header="0.2" footer="0.2"/><pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/></worksheet>`;
}

function obtenerDiasEsperadosChecklist(mes) {
    const [anio, numeroMes] = mes.split('-').map(Number);
    const hoy = new Date();
    const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
    if (mes > mesActual) return 0;
    if (mes === mesActual) return hoy.getDate();
    return new Date(anio, numeroMes, 0).getDate();
}

function obtenerHoraLimaChecklist(fechaIso) {
    if (!fechaIso) return '';
    const partes = new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date(fechaIso));
    const hora = partes.find(parte => parte.type === 'hour')?.value || '00';
    const minuto = partes.find(parte => parte.type === 'minute')?.value || '00';
    return `${hora === '24' ? '00' : hora}:${minuto}`;
}

function obtenerMinutosTardanzaChecklist(registro) {
    const hora = obtenerHoraLimaChecklist(registro.inicio_at);
    if (!hora || obtenerPuntualidadChecklistOperaciones(registro) !== 'tardanza') return 0;
    const [horas, minutos] = hora.split(':').map(Number);
    let inicio = horas * 60 + minutos;
    const limite = registro.turno === 'apertura' ? 10 * 60 : registro.turno === 'intermedio' ? 15 * 60 : 23 * 60;
    if (registro.turno === 'cierre' && horas < 2) inicio += 24 * 60;
    return Math.max(0, inicio - limite);
}

function crearFilasTardanzasChecklist(registros) {
    return [...registros]
        .sort((a, b) => String(b.inicio_at || b.fecha).localeCompare(String(a.inicio_at || a.fecha)))
        .map(registro => {
            const puntualidad = obtenerPuntualidadChecklistOperaciones(registro);
            const ventana = VENTANAS_CHECKLIST_OPERACIONES[registro.turno];
            return [
                registro.fecha || '',
                obtenerNombreSede(registro.sede),
                ventana?.etiqueta || registro.turno || '',
                obtenerHoraLimaChecklist(registro.inicio_at),
                registro.responsable_nombre || '',
                obtenerEtiquetaRol(registro.responsable_rol),
                ventana ? `${ventana.inicio}-${ventana.cierre} (puntual hasta ${ventana.puntualHasta})` : '',
                puntualidad === 'tardanza' ? 'TARDANZA' : puntualidad === 'a_tiempo' ? 'A TIEMPO' : 'SIN CLASIFICAR',
                obtenerMinutosTardanzaChecklist(registro),
                puntualidad === 'a_tiempo' ? 'SÍ' : puntualidad === 'tardanza' ? 'NO' : 'SIN DATO'
            ];
        });
}

function crearFilasReincidenciasChecklist(registros) {
    const resumen = new Map();
    registros.forEach(registro => {
        obtenerSeccionesChecklistOperaciones(registro.sede).forEach(seccion => {
            seccion.items.forEach(item => {
                const resultado = registro.respuestas?.[`${seccion.id}:${item[0]}`];
                if (!['cumple', 'no_cumple'].includes(resultado)) return;
                const clave = `${registro.sede}|${seccion.id}|${item[0]}`;
                if (!resumen.has(clave)) {
                    resumen.set(clave, {
                        sede: registro.sede, seccion: seccion.nombre, punto: item[1], criticidad: item[2],
                        evaluados: 0, noCumple: 0, dias: new Set(), ultimaFecha: '', observaciones: new Set()
                    });
                }
                const dato = resumen.get(clave);
                dato.evaluados += 1;
                if (resultado !== 'no_cumple') return;
                dato.noCumple += 1;
                if (registro.fecha) dato.dias.add(registro.fecha);
                if (String(registro.fecha || '') > dato.ultimaFecha) dato.ultimaFecha = registro.fecha;
                const observacion = String(registro.observaciones?.[seccion.id] || '').trim();
                if (observacion) dato.observaciones.add(observacion);
            });
        });
    });
    const filas = [...resumen.values()]
        .filter(dato => dato.noCumple > 0)
        .sort((a, b) => b.dias.size - a.dias.size || b.noCumple - a.noCumple || obtenerNombreSede(a.sede).localeCompare(obtenerNombreSede(b.sede)))
        .map(dato => [
            obtenerNombreSede(dato.sede), dato.seccion, dato.punto, dato.criticidad,
            dato.noCumple, dato.dias.size, dato.ultimaFecha,
            dato.evaluados ? dato.noCumple / dato.evaluados : 0,
            dato.dias.size >= 2 ? 'RECURRENTE' : 'PUNTUAL',
            [...dato.observaciones].join(' | ').slice(0, 1000)
        ]);
    return filas.length ? filas : [['Todas las sedes', '', 'Sin no conformidades registradas en el periodo.', '', 0, 0, '', 0, 'SIN HALLAZGOS', '']];
}

async function exportarChecklistOperacionesExcel() {
    const estado = obtenerElemento('operationsDashboardStatus');
    if (!usuarioPuedeVerReporteriaOperaciones()) {
        mostrarToast('No tienes permiso para exportar el informe mensual de operaciones.');
        return;
    }
    if (!supabaseClient || !sesionActual?.user) {
        estado.textContent = 'La sesión no está disponible para generar el reporte.';
        return;
    }
    if (!window.JSZip) {
        estado.textContent = 'No se pudo cargar la plantilla de Excel.';
        return;
    }
    const rango = obtenerRangoMesOperaciones();
    estado.textContent = 'Preparando el consolidado de todas las sedes...';
    estado.dataset.status = '';
    try {
        const { data, error } = await supabaseClient.from('operaciones_checklists')
            .select('*')
            .eq('estado', 'finalizado')
            .gte('fecha', rango.inicio)
            .lte('fecha', rango.fin)
            .order('inicio_at', { ascending: false });
        if (error) throw error;
        const registros = Array.isArray(data) ? data : [];
        if (!registros.length) throw new Error('No hay checklists finalizados en el mes elegido.');

        const ordenSedes = ['salaverry', 'puruchuco', 'civico', 'primavera', 'gama'];
        const agregados = ordenSedes.map(sede => {
            const registrosSede = registros.filter(registro => registro.sede === sede);
            const apertura = registrosSede.filter(registro => registro.turno === 'apertura').length;
            const intermedio = registrosSede.filter(registro => registro.turno === 'intermedio').length;
            const cierre = registrosSede.filter(registro => registro.turno === 'cierre').length;
            return { sede, apertura, intermedio, cierre, total: apertura + intermedio + cierre };
        });
        const diasEsperados = obtenerDiasEsperadosChecklist(rango.mes);
        const esperadosPorSede = diasEsperados * 3;
        const cumplimiento = agregados.map(item => esperadosPorSede ? item.total / esperadosPorSede : 0);

        const respuestaPlantilla = await fetch('assets/reporte-checklist-por-sede.xlsx', { cache: 'no-store' });
        if (!respuestaPlantilla.ok) throw new Error('No se pudo abrir la plantilla del reporte.');
        const zip = await window.JSZip.loadAsync(await respuestaPlantilla.arrayBuffer());
        const leer = ruta => zip.file(ruta).async('string');
        let resumenXml = await leer('xl/worksheets/sheet1.xml');
        let datosXml = await leer('xl/worksheets/sheet2.xml');
        resumenXml = actualizarCeldaXmlChecklist(resumenXml, 'A2', `Cantidad de registros realizados por tipo de control - ${rango.mes}`, { texto: true });
        resumenXml = actualizarCeldaXmlChecklist(resumenXml, 'I4', esperadosPorSede, { formula: `3*${diasEsperados}` });
        agregados.forEach((item, indice) => {
            const filaResumen = indice + 5;
            const filaDatos = indice + 2;
            [['B', item.apertura], ['C', item.intermedio], ['D', item.cierre], ['E', item.total]].forEach(([columna, valor]) => {
                resumenXml = actualizarCeldaXmlChecklist(resumenXml, `${columna}${filaResumen}`, valor);
                datosXml = actualizarCeldaXmlChecklist(datosXml, `${columna}${filaDatos}`, valor);
            });
            resumenXml = actualizarCeldaXmlChecklist(resumenXml, `F${filaResumen}`, cumplimiento[indice], { formula: `E${filaResumen}/$I$4` });
        });
        ['B', 'C', 'D', 'E'].forEach(columna => {
            const clave = columna === 'B' ? 'apertura' : columna === 'C' ? 'intermedio' : columna === 'D' ? 'cierre' : 'total';
            resumenXml = actualizarCeldaXmlChecklist(resumenXml, `${columna}10`, agregados.reduce((suma, item) => suma + item[clave], 0), { formula: `SUM(${columna}5:${columna}9)` });
        });
        zip.file('xl/worksheets/sheet1.xml', resumenXml);
        zip.file('xl/worksheets/sheet2.xml', datosXml);

        const chart1 = actualizarCachesGrafico(await leer('xl/charts/chart1.xml'), [
            { valores: agregados.map(item => item.apertura), formato: 'General' },
            { valores: agregados.map(item => item.intermedio), formato: 'General' },
            { valores: agregados.map(item => item.cierre), formato: 'General' }
        ]);
        const chart2 = actualizarCachesGrafico(await leer('xl/charts/chart2.xml'), [{ valores: cumplimiento, formato: '0%' }]);
        zip.file('xl/charts/chart1.xml', chart1);
        zip.file('xl/charts/chart2.xml', chart2);

        const encabezadosTardanza = ['Fecha', 'Sede', 'Turno', 'Hora de inicio', 'Responsable', 'Cargo', 'Horario esperado', 'Estado', 'Minutos de tardanza', 'Cumple horario'];
        const encabezadosReincidencia = ['Sede', 'Sección', 'Punto de verificación', 'Criticidad', 'Veces No cumple', 'Días distintos', 'Última fecha', 'Tasa de no cumplimiento', 'Clasificación', 'Observaciones registradas'];
        zip.file('xl/worksheets/sheet3.xml', crearXmlHojaChecklist(encabezadosTardanza, crearFilasTardanzasChecklist(registros), [14, 28, 14, 15, 30, 25, 30, 18, 21, 18]));
        zip.file('xl/worksheets/sheet4.xml', crearXmlHojaChecklist(encabezadosReincidencia, crearFilasReincidenciasChecklist(registros), [28, 28, 52, 14, 18, 16, 16, 24, 18, 60], [7]));

        let workbookXml = await leer('xl/workbook.xml');
        workbookXml = workbookXml.replace('</sheets>', '<sheet name="Tardanzas" sheetId="3" r:id="rId7"/><sheet name="Reincidencias" sheetId="4" r:id="rId8"/></sheets>')
            .replace(/<calcPr[^>]*\/>/, '<calcPr calcId="191029" calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1"/>');
        zip.file('xl/workbook.xml', workbookXml);

        let relacionesXml = await leer('xl/_rels/workbook.xml.rels');
        relacionesXml = relacionesXml.replace('</Relationships>', '<Relationship Id="rId7" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/><Relationship Id="rId8" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet4.xml"/></Relationships>');
        zip.file('xl/_rels/workbook.xml.rels', relacionesXml);

        let tiposXml = await leer('[Content_Types].xml');
        tiposXml = tiposXml.replace('</Types>', '<Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet4.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');
        zip.file('[Content_Types].xml', tiposXml);

        let propiedadesXml = await leer('docProps/app.xml');
        propiedadesXml = propiedadesXml
            .replace('<vt:variant><vt:i4>2</vt:i4></vt:variant>', '<vt:variant><vt:i4>4</vt:i4></vt:variant>')
            .replace('<vt:vector size="2" baseType="lpstr"><vt:lpstr>Resumen</vt:lpstr><vt:lpstr>Datos</vt:lpstr></vt:vector>', '<vt:vector size="4" baseType="lpstr"><vt:lpstr>Resumen</vt:lpstr><vt:lpstr>Datos</vt:lpstr><vt:lpstr>Tardanzas</vt:lpstr><vt:lpstr>Reincidencias</vt:lpstr></vt:vector>');
        zip.file('docProps/app.xml', propiedadesXml);

        const archivo = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
        descargarBlob(archivo, `Reporte-Checklist-por-Sede-${rango.mes}.xlsx`);
        estado.textContent = `Reporte consolidado generado: ${registros.length} checklists de ${rango.mes}.`;
        estado.dataset.status = 'success';
    } catch (error) {
        console.error('No se pudo generar el reporte consolidado de checklist:', error);
        estado.textContent = error?.message || 'No se pudo generar el Excel consolidado.';
        estado.dataset.status = 'error';
    }
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
    if (!window.PDFLib) throw new Error('El generador de PDF no esta disponible.');
    await hidratarEvidenciasChecklistOperaciones(registro);
    const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
    const pdf = await PDFDocument.create();
    const normal = await pdf.embedFont(StandardFonts.Helvetica);
    const negrita = await pdf.embedFont(StandardFonts.HelveticaBold);
    const anchoPagina = 595.28;
    const altoPagina = 841.89;
    const margen = 38;
    const anchoUtil = anchoPagina - (margen * 2);
    const colores = {
        azul: rgb(0.04, 0.25, 0.39),
        celeste: rgb(0.08, 0.48, 0.67),
        naranja: rgb(0.94, 0.29, 0.11),
        texto: rgb(0.12, 0.18, 0.24),
        gris: rgb(0.37, 0.43, 0.49),
        borde: rgb(0.77, 0.82, 0.86),
        fondo: rgb(0.96, 0.98, 0.99),
        verde: rgb(0.88, 0.96, 0.91),
        verdeTexto: rgb(0.03, 0.42, 0.23),
        rojo: rgb(0.99, 0.90, 0.89),
        rojoTexto: rgb(0.70, 0.12, 0.08),
        neutro: rgb(0.92, 0.94, 0.96)
    };
    let pagina;
    let y;

    const nuevaPagina = () => {
        pagina = pdf.addPage([anchoPagina, altoPagina]);
        pagina.drawRectangle({ x: 0, y: altoPagina - 18, width: anchoPagina, height: 18, color: colores.naranja });
        pagina.drawText('URBAPARK', { x: margen, y: altoPagina - 52, size: 16, font: negrita, color: colores.celeste });
        y = altoPagina - 74;
    };
    const asegurarEspacio = alto => {
        if (y - alto < 42) nuevaPagina();
    };
    const dividirTexto = (texto, fuente, tamano, anchoMaximo) => {
        const lineas = [];
        limpiarTextoReporte(texto || '').split(/\n/).forEach(parrafo => {
            const palabras = parrafo.split(/\s+/).filter(Boolean);
            let linea = '';
            palabras.forEach(palabra => {
                const candidata = linea ? `${linea} ${palabra}` : palabra;
                if (linea && fuente.widthOfTextAtSize(candidata, tamano) > anchoMaximo) {
                    lineas.push(linea);
                    linea = palabra;
                } else linea = candidata;
            });
            lineas.push(linea || ' ');
        });
        return lineas;
    };
    const dibujarLineas = (lineas, x, inicioY, opciones = {}) => {
        const tamano = opciones.tamano || 9;
        const fuente = opciones.fuente || normal;
        const color = opciones.color || colores.texto;
        const interlineado = opciones.interlineado || tamano + 3;
        lineas.forEach((linea, indice) => pagina.drawText(linea, {
            x,
            y: inicioY - (indice * interlineado),
            size: tamano,
            font: fuente,
            color
        }));
    };
    const escribir = (texto, opciones = {}) => {
        const tamano = opciones.tamano || 9;
        const fuente = opciones.negrita ? negrita : normal;
        const lineas = dividirTexto(texto, fuente, tamano, opciones.ancho || anchoUtil);
        const alto = lineas.length * (opciones.interlineado || tamano + 3);
        asegurarEspacio(alto + (opciones.despues || 3));
        dibujarLineas(lineas, opciones.x || margen, y, { tamano, fuente, color: opciones.color, interlineado: opciones.interlineado });
        y -= alto + (opciones.despues || 3);
    };
    const incrustarFoto = async foto => {
        const fuente = foto?.url || foto?.dataUrl || '';
        if (!fuente) return null;
        try {
            const respuesta = await fetch(fuente);
            if (!respuesta.ok) return null;
            const bytes = new Uint8Array(await respuesta.arrayBuffer());
            const esPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
            return esPng ? pdf.embedPng(bytes) : pdf.embedJpg(bytes);
        } catch (error) {
            console.warn('No se pudo agregar una evidencia al PDF:', error);
            return null;
        }
    };

    nuevaPagina();
    escribir('CHECKLIST OPERATIVO DE SEDE', { tamano: 18, negrita: true, color: colores.azul, despues: 3 });
    escribir(`${obtenerNombreSede(registro.sede)} | ${registro.fecha} | ${String(registro.turno || '').toUpperCase()}`, { tamano: 10, color: colores.gris, despues: 9 });
    const duracion = calcularDuracionChecklistOperaciones(registro);
    const estadoPuntualidad = obtenerPuntualidadChecklistOperaciones(registro);
    const puntualidad = estadoPuntualidad === 'tardanza' ? 'TARDANZA' : estadoPuntualidad === 'a_tiempo' ? 'A TIEMPO' : 'SIN CLASIFICAR';
    const resumen = calcularResumenChecklistOperaciones(registro);
    const altoResumen = 76;
    pagina.drawRectangle({ x: margen, y: y - altoResumen, width: anchoUtil, height: altoResumen, color: colores.fondo, borderColor: colores.borde, borderWidth: 0.7 });
    pagina.drawText(`Responsable: ${limpiarTextoReporte(registro.responsable_nombre)}`, { x: margen + 12, y: y - 18, size: 9.5, font: negrita, color: colores.texto });
    pagina.drawText(`Cargo: ${limpiarTextoReporte(obtenerEtiquetaRol(registro.responsable_rol))}`, { x: margen + 12, y: y - 35, size: 8.5, font: normal, color: colores.texto });
    pagina.drawText(`Estado horario: ${puntualidad}`, { x: margen + 300, y: y - 35, size: 8.5, font: normal, color: colores.texto });
    pagina.drawText(`Inicio: ${formatearFechaHoraReporte(registro.inicio_at)} | Fin: ${formatearFechaHoraReporte(registro.fin_at)} | Duración: ${duracion} min`, { x: margen + 12, y: y - 53, size: 8.5, font: normal, color: colores.texto });
    pagina.drawText(`Cumplimiento: ${Number(registro.cumplimiento || resumen.cumplimiento).toFixed(1)}%`, { x: margen + 370, y: y - 55, size: 11, font: negrita, color: colores.verdeTexto });
    y -= altoResumen + 14;

    for (const seccion of obtenerSeccionesChecklistOperaciones(registro.sede)) {
        asegurarEspacio(74);
        escribir(seccion.nombre.toUpperCase(), { tamano: 12, negrita: true, color: colores.naranja, despues: 6 });
        const columnas = [342, 76, anchoUtil - 418];
        const encabezados = ['PUNTO DE VERIFICACIÓN', 'CRITICIDAD', 'RESULTADO'];
        let x = margen;
        encabezados.forEach((encabezado, indice) => {
            pagina.drawRectangle({ x, y: y - 24, width: columnas[indice], height: 24, color: colores.azul, borderColor: colores.borde, borderWidth: 0.5 });
            pagina.drawText(encabezado, { x: x + 6, y: y - 16, size: 7.8, font: negrita, color: rgb(1, 1, 1) });
            x += columnas[indice];
        });
        y -= 24;
        seccion.items.forEach(item => {
            const valor = registro.respuestas?.[`${seccion.id}:${item[0]}`] || 'sin_respuesta';
            const etiqueta = valor === 'cumple' ? 'SÍ CUMPLE' : valor === 'no_cumple' ? 'NO CUMPLE' : valor === 'na' ? 'N.A.' : 'SIN RESPUESTA';
            const lineasPunto = dividirTexto(item[1], normal, 8.3, columnas[0] - 12);
            const altoFila = Math.max(27, (lineasPunto.length * 11) + 10);
            asegurarEspacio(altoFila + 2);
            const rellenoResultado = valor === 'cumple' ? colores.verde : valor === 'no_cumple' ? colores.rojo : colores.neutro;
            x = margen;
            [colores.fondo, colores.fondo, rellenoResultado].forEach((relleno, indice) => {
                pagina.drawRectangle({ x, y: y - altoFila, width: columnas[indice], height: altoFila, color: relleno, borderColor: colores.borde, borderWidth: 0.5 });
                x += columnas[indice];
            });
            dibujarLineas(lineasPunto, margen + 6, y - 10, { tamano: 8.3, interlineado: 11 });
            pagina.drawText(String(item[2] || '').toUpperCase(), { x: margen + columnas[0] + 6, y: y - 16, size: 7.5, font: negrita, color: colores.gris });
            const colorResultado = valor === 'cumple' ? colores.verdeTexto : valor === 'no_cumple' ? colores.rojoTexto : colores.gris;
            const anchoEtiqueta = negrita.widthOfTextAtSize(etiqueta, 7.5);
            pagina.drawText(etiqueta, { x: margen + columnas[0] + columnas[1] + Math.max(5, (columnas[2] - anchoEtiqueta) / 2), y: y - 16, size: 7.5, font: negrita, color: colorResultado });
            y -= altoFila;
        });
        const observacion = String(registro.observaciones?.[seccion.id] || '').trim();
        const textoObservacion = observacion || 'Sin observaciones.';
        const lineasObservacion = dividirTexto(textoObservacion, normal, 8.5, anchoUtil - 24);
        const altoObservacion = 25 + (lineasObservacion.length * 11);
        asegurarEspacio(altoObservacion + 8);
        pagina.drawRectangle({ x: margen, y: y - altoObservacion, width: anchoUtil, height: altoObservacion, color: rgb(1, 0.97, 0.94), borderColor: rgb(0.96, 0.66, 0.50), borderWidth: 0.7 });
        pagina.drawText('OBSERVACIONES / NOVEDAD Y SOLUCIÓN', { x: margen + 10, y: y - 15, size: 8, font: negrita, color: colores.naranja });
        dibujarLineas(lineasObservacion, margen + 10, y - 30, { tamano: 8.5, interlineado: 11 });
        y -= altoObservacion + 8;

        const fotos = obtenerEvidenciasSeccionOperaciones(registro, seccion.id);
        escribir(`EVIDENCIAS FOTOGRÁFICAS (${fotos.length})`, { tamano: 9, negrita: true, color: colores.azul, despues: 5 });
        if (!fotos.length) {
            escribir('Sin fotografías disponibles para este bloque.', { tamano: 8.5, color: colores.gris, despues: 10 });
            continue;
        }
        const anchoTarjeta = (anchoUtil - 10) / 2;
        const altoTarjeta = 158;
        for (let indice = 0; indice < fotos.length; indice += 2) {
            asegurarEspacio(altoTarjeta + 12);
            const par = fotos.slice(indice, indice + 2);
            const imagenes = await Promise.all(par.map(incrustarFoto));
            par.forEach((foto, indicePar) => {
                const tarjetaX = margen + (indicePar * (anchoTarjeta + 10));
                pagina.drawRectangle({ x: tarjetaX, y: y - altoTarjeta, width: anchoTarjeta, height: altoTarjeta, color: colores.fondo, borderColor: colores.borde, borderWidth: 0.7 });
                const imagen = imagenes[indicePar];
                if (imagen) {
                    const escala = Math.min((anchoTarjeta - 12) / imagen.width, 121 / imagen.height);
                    const anchoImagen = imagen.width * escala;
                    const altoImagen = imagen.height * escala;
                    pagina.drawImage(imagen, {
                        x: tarjetaX + ((anchoTarjeta - anchoImagen) / 2),
                        y: y - 8 - altoImagen,
                        width: anchoImagen,
                        height: altoImagen
                    });
                } else {
                    pagina.drawText('Imagen no disponible', { x: tarjetaX + 55, y: y - 72, size: 9, font: negrita, color: colores.gris });
                }
                const pie = `${foto.autor_nombre || 'Personal de sede'} | ${foto.creado_at ? formatearFechaHoraReporte(foto.creado_at) : 'Sin hora'}`;
                const lineasPie = dividirTexto(pie, normal, 7.2, anchoTarjeta - 12).slice(0, 2);
                dibujarLineas(lineasPie, tarjetaX + 6, y - 137, { tamano: 7.2, color: colores.gris, interlineado: 9 });
            });
            y -= altoTarjeta + 10;
        }
        y -= 4;
    }
    return pdf.save();
}

async function obtenerPdfChecklistOperaciones(registro) {
    const almacenado = cachePdfChecklistOperaciones.get(registro);
    if (almacenado) return almacenado;
    const bytes = await crearPdfChecklistOperaciones(registro);
    cachePdfChecklistOperaciones.set(registro, bytes);
    return bytes;
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
        const bytes = await obtenerPdfChecklistOperaciones(registro);
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

async function descargarPdfChecklistOperaciones(registro) {
    if (!registro) return;
    const estado = obtenerElemento('operationsChecklistStatus') || obtenerElemento('operationsDashboardStatus');
    try {
        if (estado) estado.textContent = 'Generando PDF para descargar...';
        const bytes = await obtenerPdfChecklistOperaciones(registro);
        const nombre = `Checklist-${nombreArchivoSeguro(obtenerNombreSede(registro.sede))}-${registro.fecha}.pdf`;
        descargarBlob(new Blob([bytes], { type: 'application/pdf' }), nombre);
        if (estado) {
            estado.textContent = 'PDF descargado correctamente.';
            estado.dataset.status = 'success';
        }
    } catch (error) {
        console.warn('No se pudo descargar el PDF operativo:', error);
        if (estado) {
            estado.textContent = 'No se pudo descargar el PDF.';
            estado.dataset.status = 'error';
        }
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
    if (!usuarioPuedeVerReporteriaOperaciones()) return mostrarToast('No tienes permiso para generar este informe.');
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
    if (!usuarioPuedeVerReporteriaOperaciones()) return mostrarToast('No tienes permiso para generar este informe.');
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
    if (abierto && !usuarioPuedeVerReporteriaOperaciones()) {
        panel.hidden = true;
        boton.setAttribute('aria-expanded', 'false');
        mostrarToast('El historial y los KPI están disponibles solo para los roles autorizados.');
        return;
    }
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
