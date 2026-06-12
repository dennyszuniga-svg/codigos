const STORAGE_KEYS = {
    history: 'historialCodigos',
    checklist: 'estadoChecklistCodigos'
};

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

const codigosEmergencia = {
    rojo: {
        nombre: 'Codigo Rojo',
        descripcion: 'Incendios o inflamacion de chimeneas',
        guia: '5 primeros minutos en incendios o inflamacion de chimeneas',
        resumen: 'Activa respuesta contra incendio y comunica la ubicacion.',
        color: '#d92d20',
        icono: 'R',
        image: 'assets/codigo-rojo.png',
        checklist: [
            'Reporta la emergencia por radio al supervisor e indica la ubicacion exacta.',
            'Moviliza la brigada contra incendios y lleva extintores al punto.',
            'Inicia el control del fuego con apoyo cercano y manteniendo distancia segura.',
            'Mantente en comunicacion con el centro de control y bomberos.',
            'Si hay lesionados, coordina primeros auxilios y traslado medico.'
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
        checklist: [
            'Reporta la emergencia de atrapamiento y confirma el lugar exacto.',
            'Comunica el Codigo Naranja por radio al supervisor de turno.',
            'Moviliza tecnico de mantenimiento y servicio de emergencias si corresponde.',
            'Mantiene contacto verbal con las personas atrapadas para tranquilizarlas.',
            'Libera a las personas con maniobras seguras y apoyo especializado.'
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
        checklist: [
            'Reporta la fuga o derrame y activa el Codigo 3D.',
            'Cierra accesos y aleja a las personas del area afectada.',
            'Toma medicion o verificacion de gas desde una distancia segura.',
            'Diluye o dispersa con agua si el procedimiento lo permite.',
            'Mantiene la zona controlada hasta confirmar que el riesgo termino.'
        ]
    },
    azul: {
        nombre: 'Codigo CAT',
        descripcion: 'Persona necesita atencion medica',
        guia: 'Comunica + Atiende + Traslada',
        resumen: 'Orienta la atencion medica y el traslado del paciente.',
        color: '#175cd3',
        icono: 'CAT',
        image: 'assets/codigo-cat.png',
        checklist: [
            'Comunica la emergencia medica al centro de control.',
            'Atiende a la persona con calma y verifica su estado inicial.',
            'Traslada o acompana al paciente segun el nivel de condicion.',
            'Mantiene despejada el area para la atencion y el traslado.',
            'Coordina apoyo medico si la situacion lo exige.'
        ]
    },
    verde: {
        nombre: 'Codigo Verde',
        descripcion: 'Sismos',
        guia: 'Verifica + Evalua + Restringe + Distribuye + Evacua',
        resumen: 'Gestiona el sismo con evacuacion y control de la operacion.',
        color: '#039855',
        icono: 'V',
        image: 'assets/codigo-verde.png',
        checklist: [
            'Comunica el evento sismico y activa la alarma.',
            'Mantiene la posicion hasta que termine el movimiento.',
            'Verifica personas heridas o atrapadas e informa al control.',
            'Restringe accesos y distribuye al personal hacia rutas seguras.',
            'Evacua segun indicaciones y valida las instalaciones.'
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
        checklist: [
            'Comunica el incidente y activa el Codigo CROC.',
            'Rastrea o identifica al sospechoso mediante camaras y observacion.',
            'Observa movimientos y comparte la ubicacion con el equipo.',
            'Contiene la situacion cerrando accesos y evitando la dispersion.',
            'Dirige al sospechoso hacia las autoridades o el punto definido.'
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
        checklist: [
            'Recibe el reporte de la persona extraviada y calma al familiar.',
            'Solicita datos completos, descripcion y ultimo lugar visto.',
            'Recorre el area junto al familiar y al equipo asignado.',
            'Comunica avances al centro de control de forma continua.',
            'Reporta si la busqueda no tiene exito dentro del plazo.'
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
        checklist: [
            'Comunica la alteracion del orden al supervisor de turno.',
            'Atiende el punto de forma inmediata y sin confrontar.',
            'Lidera la intervencion sin agredir ni responder con violencia.',
            'Mantiene la calma y separa a las partes involucradas.',
            'Aisla la zona y deriva a las personas por accesos distintos.'
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
        checklist: [
            'Identifica a la persona de alto riesgo y comunica su ubicacion.',
            'Acompana a distancia prudente sin perderla de vista.',
            'Protege a clientes y personal cercano en el area afectada.',
            'Tranquiliza la situacion y evita cualquier confrontacion.',
            'Activa el codigo de apoyo que corresponda si hay agresion.'
        ]
    }
};

const ordenCodigos = ['rojo', 'naranja', 'verde-oscuro', 'azul', 'verde', 'croc', 'adam', 'calma', 'capta'];

let historial = [];
let checklistEstado = {};
let codigoActivo = null;

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

function crearEstadoChecklistBase(codigo) {
    const info = codigosEmergencia[codigo];
    return {
        encargado: '',
        pasos: info.checklist.map(() => ({
            completado: false,
            completadoEn: null
        }))
    };
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
        return base;
    }

    if (typeof valor !== 'object') {
        return base;
    }

    if (typeof valor.encargado === 'string') {
        base.encargado = valor.encargado;
    }

    const pasosGuardados = Array.isArray(valor.pasos)
        ? valor.pasos
        : Array.isArray(valor.items)
            ? valor.items
            : Array.isArray(valor.estados)
                ? valor.estados
                : [];

    base.pasos = base.pasos.map((paso, indice) => {
        const guardado = pasosGuardados[indice];

        if (guardado && typeof guardado === 'object') {
            return {
                completado: Boolean(guardado.completado ?? guardado.checked ?? guardado.estado),
                completadoEn: guardado.completadoEn || guardado.checkedAt || guardado.fechaHora || null
            };
        }

        return {
            completado: Boolean(guardado),
            completadoEn: guardado ? new Date().toISOString() : null
        };
    });

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
            encargado: entrada.encargado || ''
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

function crearTarjetaCodigo(codigo, info) {
    const article = document.createElement('article');
    const icono = document.createElement('div');
    const titulo = document.createElement('h3');
    const descripcion = document.createElement('p');
    const guia = document.createElement('p');
    const boton = document.createElement('button');

    article.className = `code-card code-${codigo}`;
    article.dataset.code = codigo;
    article.setAttribute('role', 'group');
    article.setAttribute('aria-label', info.nombre);

    icono.className = 'code-icon';
    icono.textContent = info.icono;
    icono.setAttribute('aria-hidden', 'true');

    titulo.textContent = info.nombre;

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

    article.append(icono, titulo, descripcion, guia, boton);
    return article;
}

function renderizarCodigos() {
    const contenedor = obtenerElemento('codesGrid');
    limpiarElemento(contenedor);

    ordenCodigos.forEach(codigo => {
        contenedor.appendChild(crearTarjetaCodigo(codigo, codigosEmergencia[codigo]));
    });
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

    if (historial.length > 0 && historial[0].codigo === codigo) {
        historial[0].encargado = nombre;
        guardarHistorial();
        actualizarHistorialUI();
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

    icono.className = 'active-code-icon';
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

    contenido.append(nombre, descripcion, guia);
    display.append(icono, contenido);
    display.classList.add('has-code');
}

function actualizarEncargadoUI(codigo) {
    const input = obtenerElemento('responsibleName');
    const hint = obtenerElemento('responsibleHint');
    const estado = codigo ? obtenerEstadoChecklist(codigo) : null;

    if (!input || !hint) {
        return;
    }

    if (!codigo || !estado) {
        input.value = '';
        input.disabled = true;
        input.setAttribute('aria-describedby', 'responsibleHint');
        hint.textContent = 'Registra quien queda a cargo de la activacion actual.';
        return;
    }

    input.disabled = false;
    input.value = estado.encargado || '';
    input.setAttribute('aria-describedby', 'responsibleHint');
    hint.textContent = 'Registra quien queda a cargo de la activacion actual.';
}

function actualizarLamina(codigo, { abrirModal = false } = {}) {
    const imagen = obtenerElemento('codeImage');
    const caption = obtenerElemento('codeImageCaption');
    const botonAbrir = obtenerElemento('openImageView');
    const info = codigo ? codigosEmergencia[codigo] : null;

    if (!info) {
        imagen.src = '';
        imagen.alt = 'Lamina de codigo de emergencia';
        caption.textContent = 'Activa un codigo para mostrar su lamina de respuesta.';
        botonAbrir.disabled = true;
        return;
    }

    imagen.src = info.image;
    imagen.alt = `${info.nombre} - lamina de emergencia`;
    caption.textContent = `${info.nombre}. ${info.guia}.`;
    botonAbrir.disabled = false;

    if (abrirModal) {
        abrirModalCodigo(codigo);
    }
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
    const completadas = estado.pasos.filter(paso => paso.completado).length;

    intro.textContent = `Pasos operativos para ${info.nombre}. Marca cada casillero al completarlo.`;
    progreso.textContent = `${completadas} de ${info.checklist.length}`;
    botonReiniciar.disabled = false;

    info.checklist.forEach((paso, indice) => {
        const item = document.createElement('li');
        const etiqueta = document.createElement('label');
        const checkbox = document.createElement('input');
        const numero = document.createElement('span');
        const contenido = document.createElement('div');
        const texto = document.createElement('span');
        const timestamp = document.createElement('time');

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

        contenido.append(texto, timestamp);
        etiqueta.append(checkbox, numero, contenido);
        item.appendChild(etiqueta);
        lista.appendChild(item);
    });
}

function guardarHistorial() {
    guardarEstadoLocalStorage(STORAGE_KEYS.history, historial);
}

function agregarAlHistorial(codigo, encargado) {
    const info = codigosEmergencia[codigo];
    const tiempo = obtenerFechaHoraActual();

    historial.unshift({
        codigo,
        nombre: info.nombre,
        descripcion: info.descripcion,
        fecha: tiempo.fecha,
        hora: tiempo.hora,
        encargado: encargado || ''
    });

    historial = historial.slice(0, MAX_HISTORIAL);
    guardarHistorial();
    actualizarHistorialUI();
}

function actualizarHistorialUI() {
    const lista = obtenerElemento('historyList');
    limpiarElemento(lista);

    if (historial.length === 0) {
        const itemVacio = document.createElement('li');
        itemVacio.className = 'history-empty';
        itemVacio.textContent = 'Sin activaciones registradas';
        lista.appendChild(itemVacio);
        return;
    }

    historial.forEach(entrada => {
        const li = document.createElement('li');
        const fecha = document.createElement('span');
        const detalle = document.createElement('span');
        const nombre = document.createElement('span');
        const descripcion = document.createElement('span');
        const encargado = document.createElement('span');

        fecha.className = 'history-datetime';
        fecha.textContent = `${entrada.fecha || ''} ${entrada.hora || ''}`.trim();

        detalle.className = 'history-detail';

        nombre.className = 'history-code';
        nombre.textContent = entrada.nombre;
        nombre.style.backgroundColor = codigosEmergencia[entrada.codigo].color;

        descripcion.className = 'history-description';
        descripcion.textContent = entrada.descripcion || '';

        detalle.append(nombre, descripcion);

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

function limpiarHistorial() {
    historial = [];
    guardarHistorial();
    actualizarHistorialUI();
}

function actualizarEstadoChecklist(codigo, indice, valor) {
    const estado = obtenerEstadoChecklist(codigo);

    if (!estado || !estado.pasos[indice]) {
        return;
    }

    estado.pasos[indice].completado = valor;
    estado.pasos[indice].completadoEn = valor ? obtenerFechaHoraActual().iso : null;
    guardarChecklistEstado();

    if (codigoActivo === codigo) {
        actualizarChecklistUI(codigo);
    }
}

function reiniciarChecklistActual() {
    if (!codigoActivo) {
        return;
    }

    const estado = obtenerEstadoChecklist(codigoActivo);
    estado.pasos = estado.pasos.map(() => ({
        completado: false,
        completadoEn: null
    }));
    guardarChecklistEstado();
    actualizarChecklistUI(codigoActivo);
}

function reproducirSonidoAlerta() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;

        if (!AudioContext) {
            return;
        }

        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.35);
    } catch (error) {
        console.warn('No se pudo reproducir el sonido:', error);
    }
}

function abrirModalCodigo(codigo) {
    const info = codigosEmergencia[codigo];
    if (!info) {
        return;
    }

    const modal = obtenerElemento('codeModal');
    const modalImage = obtenerElemento('modalImage');
    const modalSubtitle = obtenerElemento('modalSubtitle');

    modalImage.src = info.image;
    modalImage.alt = `${info.nombre} - lamina ampliada`;
    modalSubtitle.textContent = `${info.nombre}. ${info.guia}.`;
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
    actualizarChecklistUI(codigo);
}

function activarCodigo(codigo, opciones = {}) {
    if (!codigosEmergencia[codigo]) {
        return;
    }

    codigoActivo = codigo;
    actualizarInterfazCodigo(codigo);

    const encargado = obtenerNombreEncargadoActual();
    guardarEncargadoActual(codigo, encargado);
    agregarAlHistorial(codigo, encargado);
    reproducirSonidoAlerta();
    desplazarseALamina();

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
    actualizarChecklistUI(null);
}

function configurarEventos() {
    const contenedor = obtenerElemento('codesGrid');

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

    obtenerElemento('responsibleName').addEventListener('input', event => {
        if (!codigoActivo) {
            return;
        }

        guardarEncargadoActual(codigoActivo, event.target.value.trim());
    });

    obtenerElemento('responsibleName').addEventListener('change', event => {
        if (!codigoActivo) {
            return;
        }

        guardarEncargadoActual(codigoActivo, event.target.value.trim());
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
    renderizarCodigos();
    historial = cargarHistorial();
    checklistEstado = cargarChecklistEstado();
    configurarEventos();
    desactivarTodos();
    actualizarHistorialUI();
});
