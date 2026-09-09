/* URBAPARK: módulo subscribers. Mantiene API global compatible con la app principal. */

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
    actualizarEstadoAbonados('Solicitud registrada. Enviando alerta a la administración...', 'success');
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
