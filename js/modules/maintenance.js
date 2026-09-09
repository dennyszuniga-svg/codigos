/* URBAPARK: módulo maintenance. Mantiene API global compatible con la app principal. */

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
        const tecnico = tarea.profiles?.nombre || tarea.profiles?.email || 'Técnico asignado';
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
        actualizarEstadoAccesoMantenimiento('Ingresa la contraseña del área.', 'error');
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
        actualizarEstadoAccesoMantenimiento('No se pudo verificar la contraseña. Intenta nuevamente.', 'error');
        return;
    }

    if (!data) {
        actualizarEstadoAccesoMantenimiento('Contraseña incorrecta.', 'error');
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
