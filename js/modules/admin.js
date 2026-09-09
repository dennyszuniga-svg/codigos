/* URBAPARK: módulo admin. Mantiene API global compatible con la app principal. */

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
        anfitriones.appendChild(crearMensajeVacio('No hay usuarios creados con el rol Anfitrión.'));
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
            ? 'Ingresa apellidos y nombres y el DNI. El sistema entregará una contraseña temporal.'
            : 'Puedes crear personal operativo para tu sede. El sistema entregará una contraseña temporal.';
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
