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
        concepto: {
            titulo: 'Fuego / Incendio',
            foco: 'Control inicial, comunicacion y evacuacion preventiva',
            escena: 'fire',
            etiquetas: ['Extintores', 'Brigada', 'Bomberos']
        },
        checklist: [
            'Personal de URBAPARK comunica a ECO sobre el lugar y punto de ignicion.',
            'ECO realiza el comunicado a Charly (Supervisor de Centro de Control).',
            'Se procede a cerrar la zona.',
            'Se procede a evacuar clientes.'
        ],
        controles: [
            {
                id: 'uso-extintor',
                pregunta: 'Se llego a usar un extintor?',
                opciones: ['Si', 'No']
            }
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
        concepto: {
            titulo: 'Persona atrapada',
            foco: 'Contencion, comunicacion y rescate asistido',
            escena: 'lift',
            etiquetas: ['Ascensor', 'Mantenimiento', 'Calma']
        },
        checklist: [
            'Anfitrion comunica a ECO el atrapamiento de personas dentro del ascensor, escalera o travolator.',
            'ECO se dirige al punto e informa de inmediato a Charly para activar al proveedor de ascensores.',
            'Mantener comunicacion calmada con los clientes, informar que la ayuda esta en camino y contener la situacion.'
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
        concepto: {
            titulo: 'Derrame / fuga',
            foco: 'Diluye, dispersa y dirige el control de la zona',
            escena: 'spill',
            etiquetas: ['Aislar', 'Medir', 'Ventilar']
        },
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
        concepto: {
            titulo: 'Atencion medica',
            foco: 'Primeros auxilios, estabilizacion y traslado',
            escena: 'medical',
            etiquetas: ['Paciente', 'Topico', 'Traslado']
        },
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
        concepto: {
            titulo: 'Sismo / evacuacion',
            foco: 'Verifica, restringe accesos y evacua con control',
            escena: 'evac',
            etiquetas: ['Alarma', 'Rutas', 'Punto seguro']
        },
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
        concepto: {
            titulo: 'Riesgo de seguridad',
            foco: 'Rastreo, observacion y contencion del incidente',
            escena: 'security',
            etiquetas: ['Camaras', 'Cerco', 'Autoridad']
        },
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
        concepto: {
            titulo: 'Persona extraviada',
            foco: 'Busqueda coordinada con datos, recorrido y reporte',
            escena: 'search',
            etiquetas: ['Datos', 'Busqueda', 'Control']
        },
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
        concepto: {
            titulo: 'Alteracion del orden',
            foco: 'Desescalamiento, separacion y control sin agresion',
            escena: 'calm',
            etiquetas: ['Separar', 'Dialogar', 'Aislar']
        },
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
        concepto: {
            titulo: 'Alto riesgo / amenaza',
            foco: 'Acompanar, proteger, tranquilizar y activar apoyo',
            escena: 'shield',
            etiquetas: ['Proteger', 'Acompanamiento', 'Apoyo']
        },
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
    const controles = (info.controles || []).reduce((acumulado, control) => {
        acumulado[control.id] = {
            valor: '',
            actualizadoEn: null
        };
        return acumulado;
    }, {});

    return {
        encargado: '',
        pasos: info.checklist.map(() => ({
            completado: false,
            completadoEn: null
        })),
        controles
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

    (info.controles || []).forEach(control => {
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
            const id = `control-${codigo}-${control.id}-${opcion.toLowerCase()}`;

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

function escaparHTML(valor) {
    return String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function crearContenidoInforme(codigo) {
    const info = codigosEmergencia[codigo];
    const estado = obtenerEstadoChecklist(codigo);
    const generacion = obtenerFechaHoraActual();
    const ultimaActivacion = historial.find(entrada => entrada.codigo === codigo);
    const total = info.checklist.length;
    const completadas = estado.pasos.filter(paso => paso.completado).length;
    const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;
    const encargado = estado.encargado || ultimaActivacion?.encargado || 'Pendiente';
    const fechaActivacion = ultimaActivacion
        ? `${ultimaActivacion.fecha || ''} ${ultimaActivacion.hora || ''}`.trim()
        : 'Sin activacion registrada';

    const filas = info.checklist.map((paso, indice) => {
        const pasoEstado = estado.pasos[indice] || { completado: false, completadoEn: null };
        const estadoTexto = pasoEstado.completado ? 'Completado' : 'Pendiente';
        const hora = pasoEstado.completadoEn ? formatearFechaHoraISO(pasoEstado.completadoEn) : '-';

        return `
            <tr>
                <td>${indice + 1}</td>
                <td>${escaparHTML(paso)}</td>
                <td>${estadoTexto}</td>
                <td>${escaparHTML(hora)}</td>
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

        .actions {
            margin-bottom: 18px;
            text-align: right;
        }

        button {
            min-height: 40px;
            padding: 9px 14px;
            border: 0;
            border-radius: 6px;
            background: #101828;
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
        <h1>${escaparHTML(info.nombre)}</h1>
        <p>${escaparHTML(info.descripcion)}</p>
        <section class="meta">
            <div class="box">
                <span class="label">Fecha y hora de activacion</span>
                <span class="value">${escaparHTML(fechaActivacion)}</span>
            </div>
            <div class="box">
                <span class="label">Encargado</span>
                <span class="value">${escaparHTML(encargado)}</span>
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
        <h2>Checklist operativo</h2>
        <table>
            <thead>
                <tr>
                    <th>Paso</th>
                    <th>Actividad</th>
                    <th>Estado</th>
                    <th>Fecha y hora</th>
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

    if (codigoActivo === codigo) {
        actualizarChecklistUI(codigo);
    }
}

function actualizarControlChecklist(codigo, controlId, valor) {
    const estado = obtenerEstadoChecklist(codigo);

    if (!estado || !estado.controles || !estado.controles[controlId]) {
        return;
    }

    estado.controles[controlId].valor = valor;
    estado.controles[controlId].actualizadoEn = obtenerFechaHoraActual().iso;
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
    Object.keys(estado.controles || {}).forEach(controlId => {
        estado.controles[controlId] = {
            valor: '',
            actualizadoEn: null
        };
    });
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
    actualizarConceptoVisual(null);
    actualizarChecklistUI(null);

    const botonInforme = obtenerElemento('generateReport');
    if (botonInforme) {
        botonInforme.disabled = true;
    }
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
    obtenerElemento('generateReport').addEventListener('click', generarInformeActual);

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
