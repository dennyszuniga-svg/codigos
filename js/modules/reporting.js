/* URBAPARK: módulo reporting. Mantiene API global compatible con la app principal. */

function establecerEstadoReporteria(id, mensaje, tipo = '') {
    const estado = obtenerElemento(id);
    if (!estado) return;
    estado.textContent = mensaje;
    if (tipo) estado.dataset.status = tipo;
    else delete estado.dataset.status;
}

function actualizarProgresoReporteria(porcentaje, visible = true) {
    const progreso = obtenerElemento('reportingProgress');
    const barra = obtenerElemento('reportingProgressBar');
    const valor = Math.max(0, Math.min(100, Math.round(Number(porcentaje) || 0)));
    if (!progreso || !barra) return;
    progreso.hidden = !visible;
    progreso.setAttribute('aria-valuenow', String(valor));
    barra.style.width = `${valor}%`;
}

function seleccionarTipoReporteria(tipo) {
    if (!TIPOS_REPORTERIA[tipo]) return;
    reporteCapturaActual.tipo = tipo;
    reporteCapturaActual.fuenteExcel = '';
    reporteCapturaActual.encabezados = TIPOS_REPORTERIA[tipo].encabezados
        ? [...TIPOS_REPORTERIA[tipo].encabezados]
        : [];
    reporteCapturaActual.filas = [];
    document.querySelectorAll('[data-reporting-type]').forEach(boton => {
        const activo = boton.dataset.reportingType === tipo;
        boton.classList.toggle('is-active', activo);
        boton.setAttribute('aria-pressed', String(activo));
    });
    obtenerElemento('reportingTableCard').hidden = true;
    const entradaExcel = obtenerElemento('reportingExcelInput');
    const botonExcel = obtenerElemento('chooseReportingExcel');
    const nota = document.querySelector('.reporting-source-note');
    if (entradaExcel) entradaExcel.multiple = tipo === 'tickets';
    if (botonExcel) botonExcel.textContent = tipo === 'tickets' ? 'Cargar informes CU30, RE18, CU14 y CU16' : 'Cargar Excel original';
    if (nota) nota.textContent = tipo === 'tickets'
        ? 'Selecciona los cuatro informes juntos. Solo se completarán motivos comprobados; los casos que requieren cámaras quedarán en blanco.'
        : 'Recomendado: filtra automáticamente solo las órdenes 2/7 - Posición barrera.';
    const resumen = obtenerElemento('reportingSourceSummary');
    if (resumen) resumen.textContent = '';
    establecerEstadoReporteria('reportingExportStatus', '');
}

function liberarVistaPreviaReporteria() {
    if (reporteCapturaActual.urlVistaPrevia) {
        URL.revokeObjectURL(reporteCapturaActual.urlVistaPrevia);
        reporteCapturaActual.urlVistaPrevia = '';
    }
}

function seleccionarCapturaReporteria(archivosSeleccionados, opciones = {}) {
    const { agregar = false } = opciones;
    const archivos = Array.from(archivosSeleccionados || []).filter(Boolean);
    if (!archivos.length) return;
    if (archivos.some(archivo => !archivo.type.startsWith('image/'))) {
        establecerEstadoReporteria('reportingOcrStatus', 'Selecciona una imagen valida.', 'error');
        return;
    }
    if (archivos.some(archivo => archivo.size > 18 * 1024 * 1024)) {
        establecerEstadoReporteria('reportingOcrStatus', 'Una imagen supera 18 MB. Usa capturas mas livianas.', 'error');
        return;
    }

    liberarVistaPreviaReporteria();
    reporteCapturaActual.fuenteExcel = '';
    reporteCapturaActual.archivos = agregar
        ? [...reporteCapturaActual.archivos, ...archivos]
        : archivos;
    reporteCapturaActual.urlVistaPrevia = URL.createObjectURL(reporteCapturaActual.archivos[0]);
    reporteCapturaActual.filas = [];
    obtenerElemento('reportingPreviewImage').src = reporteCapturaActual.urlVistaPrevia;
    obtenerElemento('reportingFileName').textContent = reporteCapturaActual.archivos.length === 1
        ? (reporteCapturaActual.archivos[0].name || 'Foto tomada')
        : `${reporteCapturaActual.archivos.length} capturas seleccionadas`;
    const pesoTotal = reporteCapturaActual.archivos.reduce((total, archivo) => total + archivo.size, 0);
    obtenerElemento('reportingFileMeta').textContent = `${(pesoTotal / 1024 / 1024).toFixed(2)} MB en total`;
    obtenerElemento('reportingPreview').hidden = false;
    obtenerElemento('processReportingImage').disabled = false;
    obtenerElemento('reportingRawText').value = '';
    obtenerElemento('reportingRawText').disabled = true;
    obtenerElemento('buildReportingTable').disabled = true;
    obtenerElemento('reportingTableCard').hidden = true;
    actualizarProgresoReporteria(0, false);
    establecerEstadoReporteria('reportingOcrStatus', 'Captura lista para leer.', 'success');
}

async function pegarCapturaReporteria() {
    if (!navigator.clipboard?.read) {
        establecerEstadoReporteria('reportingOcrStatus', 'Este navegador no permite leer imagenes del portapapeles. Usa Elegir capturas.', 'error');
        return;
    }
    try {
        const elementos = await navigator.clipboard.read();
        const archivos = [];
        for (const elemento of elementos) {
            const tipo = elemento.types.find(valor => valor.startsWith('image/'));
            if (!tipo) continue;
            const blob = await elemento.getType(tipo);
            const extension = tipo.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
            archivos.push(new File([blob], `captura-portapapeles-${Date.now()}.${extension}`, { type: tipo }));
        }
        if (!archivos.length) throw new Error('El portapapeles no contiene una imagen.');
        seleccionarCapturaReporteria(archivos, { agregar: true });
        establecerEstadoReporteria('reportingOcrStatus', 'Captura pegada correctamente.', 'success');
    } catch (error) {
        const mensaje = error?.name === 'NotAllowedError'
            ? 'No se autorizo el acceso al portapapeles. Usa Elegir capturas o vuelve a intentarlo.'
            : (error.message || 'No se pudo pegar la captura.');
        establecerEstadoReporteria('reportingOcrStatus', mensaje, 'error');
    }
}

function manejarPegadoCapturaReporteria(evento) {
    if (moduloActivo !== 'reporteria') return;
    const archivos = Array.from(evento.clipboardData?.items || [])
        .filter(item => item.kind === 'file' && item.type.startsWith('image/'))
        .map(item => item.getAsFile())
        .filter(Boolean);
    if (!archivos.length) return;
    evento.preventDefault();
    seleccionarCapturaReporteria(archivos, { agregar: true });
    establecerEstadoReporteria('reportingOcrStatus', 'Captura pegada correctamente.', 'success');
}

function cargarScriptReporteria(src) {
    return new Promise((resolver, rechazar) => {
        const existente = document.querySelector(`script[src="${src}"]`);
        if (existente) {
            if (window.Tesseract) resolver();
            else existente.addEventListener('load', resolver, { once: true });
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.addEventListener('load', resolver, { once: true });
        script.addEventListener('error', () => rechazar(new Error('No se pudo cargar el lector OCR.')), { once: true });
        document.head.appendChild(script);
    });
}

async function asegurarLectorOcrReporteria() {
    if (window.Tesseract?.createWorker) return;
    await cargarScriptReporteria('https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.min.js');
    if (!window.Tesseract?.createWorker) throw new Error('El lector OCR no esta disponible.');
}

function cargarImagenReporteria(archivo) {
    return new Promise((resolver, rechazar) => {
        const imagen = new Image();
        const url = URL.createObjectURL(archivo);
        imagen.onload = () => {
            URL.revokeObjectURL(url);
            resolver(imagen);
        };
        imagen.onerror = () => {
            URL.revokeObjectURL(url);
            rechazar(new Error('No se pudo preparar la captura.'));
        };
        imagen.src = url;
    });
}

async function prepararCapturaParaOcr(archivo) {
    const imagen = await cargarImagenReporteria(archivo);
    const escala = Math.min(2.2, Math.max(1, 1800 / imagen.naturalWidth));
    const ancho = Math.min(2600, Math.round(imagen.naturalWidth * escala));
    const alto = Math.round(imagen.naturalHeight * (ancho / imagen.naturalWidth));
    const lienzo = document.createElement('canvas');
    lienzo.width = ancho;
    lienzo.height = alto;
    const contexto = lienzo.getContext('2d', { willReadFrequently: true });
    contexto.fillStyle = '#ffffff';
    contexto.fillRect(0, 0, ancho, alto);
    contexto.drawImage(imagen, 0, 0, ancho, alto);
    const pixels = contexto.getImageData(0, 0, ancho, alto);
    for (let indice = 0; indice < pixels.data.length; indice += 4) {
        const gris = (pixels.data[indice] * 0.299) + (pixels.data[indice + 1] * 0.587) + (pixels.data[indice + 2] * 0.114);
        const contraste = Math.max(0, Math.min(255, ((gris - 128) * 1.28) + 128));
        pixels.data[indice] = contraste;
        pixels.data[indice + 1] = contraste;
        pixels.data[indice + 2] = contraste;
    }
    contexto.putImageData(pixels, 0, 0);
    return new Promise((resolver, rechazar) => lienzo.toBlob(
        blob => blob ? resolver(blob) : rechazar(new Error('No se pudo optimizar la captura.')),
        'image/jpeg',
        0.92
    ));
}

async function procesarCapturaReporteria() {
    if (!reporteCapturaActual.archivos.length) return;
    const boton = obtenerElemento('processReportingImage');
    boton.disabled = true;
    actualizarProgresoReporteria(2, true);
    establecerEstadoReporteria('reportingOcrStatus', 'Preparando la captura...', 'pending');
    let worker = null;
    try {
        await asegurarLectorOcrReporteria();
        worker = await window.Tesseract.createWorker(['spa', 'eng'], 1, {
            logger: mensaje => {
                const porcentaje = mensaje.progress == null ? 8 : 8 + (mensaje.progress * 90);
                actualizarProgresoReporteria(porcentaje, true);
                if (mensaje.status === 'recognizing text') {
                    establecerEstadoReporteria('reportingOcrStatus', `Leyendo texto... ${Math.round(mensaje.progress * 100)}%`, 'pending');
                }
            }
        });
        const textos = [];
        for (let indice = 0; indice < reporteCapturaActual.archivos.length; indice += 1) {
            establecerEstadoReporteria('reportingOcrStatus', `Leyendo captura ${indice + 1} de ${reporteCapturaActual.archivos.length}...`, 'pending');
            const captura = await prepararCapturaParaOcr(reporteCapturaActual.archivos[indice]);
            const resultado = await worker.recognize(captura, { rotateAuto: true });
            const textoCaptura = String(resultado?.data?.text || '').trim();
            if (textoCaptura) textos.push(textoCaptura);
        }
        const texto = textos.join('\n').trim();
        if (!texto) throw new Error('No se detecto texto. Prueba con una captura mas nitida o recortada.');
        const campo = obtenerElemento('reportingRawText');
        campo.value = texto;
        campo.disabled = false;
        obtenerElemento('buildReportingTable').disabled = false;
        actualizarProgresoReporteria(100, true);
        establecerEstadoReporteria('reportingOcrStatus', 'Lectura terminada. Revisa el texto antes de crear la tabla.', 'success');
        campo.focus({ preventScroll: true });
    } catch (error) {
        console.error('No se pudo leer la captura de reporteria:', error);
        actualizarProgresoReporteria(0, false);
        establecerEstadoReporteria('reportingOcrStatus', error.message || 'No se pudo leer la captura.', 'error');
    } finally {
        if (worker) await worker.terminate().catch(() => {});
        boton.disabled = false;
    }
}

function limpiarLineaOcrReporteria(linea) {
    return String(linea || '').replace(/[|]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizarTextoReporteria(valor) {
    return String(valor ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase();
}

function extraerPlacaYMotivoReporteria(valor) {
    const texto = normalizarTextoReporteria(valor);
    if (!texto) return { placa: '', motivo: '' };
    const patrones = [
        /\bPLACA\s*[:\-]?\s*([A-Z0-9?]{5,7})\b/,
        /\b(?=[A-Z0-9?]{5,7}\b)(?=[A-Z0-9?]*[A-Z])(?=[A-Z0-9?]*\d)[A-Z0-9?]{5,7}\b/,
        /[A-Z?]{3}\d{3}/,
        /\d[A-Z?]{2}\d{3}/,
        /\d{2}[A-Z?]\d{3}/,
        /\b[A-Z?]{2}\d{3}\b/,
        /\b\d{6,7}\b/
    ];
    let coincidencia = null;
    let placa = '';
    for (const patron of patrones) {
        coincidencia = patron.exec(texto);
        if (!coincidencia) continue;
        placa = coincidencia[1] || coincidencia[0];
        break;
    }
    if (!coincidencia) return { placa: '', motivo: texto };
    const inicioRecorte = coincidencia[1]
        ? coincidencia.index
        : coincidencia.index + coincidencia[0].lastIndexOf(placa);
    const longitudRecorte = coincidencia[1] ? coincidencia[0].length : placa.length;
    const motivo = `${texto.slice(0, inicioRecorte)} ${texto.slice(inicioRecorte + longitudRecorte)}`
        .replace(/\s*[-:;,]\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    return { placa, motivo };
}

function extraerOrdenesManualesDesdeMatriz(matriz) {
    const filas = [];
    (matriz || []).forEach(filaOriginal => {
        const fila = Array.isArray(filaOriginal) ? filaOriginal.map(valor => String(valor ?? '').trim()) : [];
        const normalizada = fila.map(normalizarTextoReporteria);
        const indiceOrden = normalizada.findIndex(valor => /^2\s*\/\s*7\b/.test(valor) && valor.includes('POSICION BARRERA'));
        if (indiceOrden < 0) return;

        const fechaCompleta = fila.slice(0, indiceOrden + 1).find(valor => /\b\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4}\b/.test(valor)) || '';
        const fecha = fechaCompleta.match(/\b\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4}\b/)?.[0] || '';
        const indiceEquipo = normalizada.findIndex((valor, indice) => indice > indiceOrden && /PUMA\s*\d+\s*-\s*C\.?\s*[AB]/.test(valor));
        const equipo = indiceEquipo >= 0
            ? normalizada[indiceEquipo].match(/PUMA\s*(\d+)\s*-\s*C\.?\s*([AB])/) : null;
        const inicioMotivo = indiceEquipo >= 0 ? indiceEquipo + 1 : indiceOrden + 1;
        const motivoOriginal = fila
            .slice(inicioMotivo)
            .filter(Boolean)
            .sort((a, b) => b.length - a.length)[0] || '';
        const { placa, motivo } = extraerPlacaYMotivoReporteria(motivoOriginal);
        filas.push([fecha, equipo ? `P${equipo[1]}.C${equipo[2]}` : '', placa, motivo]);
    });
    return filas;
}

function detectarTipoInformeTickets(nombreArchivo, matriz) {
    const muestra = `${nombreArchivo || ''} ${(matriz || []).slice(0, 35).flat().join(' ')}`;
    const texto = normalizarTextoReporteria(muestra);
    if (/\bCU\s*30\b/.test(texto) || texto.includes('INFORME DE TICKETS DE ROTACION PRESENTES') || texto.includes('TODOS LOS TICKETS ABIERTOS') || texto.includes('TICKETS ABIERTOS DE LAS ENTRADAS') || texto.includes('IDENTIFICADOR DEL TICKET')) return 'CU30';
    if (/\bRE\s*18\b/.test(texto) || texto.includes('DETALLE DE CONCEPTOS DE COBROS DEL SISTEMA') || texto.includes('COBRO TICKET PERDIDO') || texto.includes('TICKET PERDIDO')) return 'RE18';
    if (/\bCU\s*14\b/.test(texto) || texto.includes('LEVANTAMIENTO MANUAL') || texto.includes('ORDENES MANUALES DE EQUIPOS')) return 'CU14';
    if (/\bCU\s*16\b/.test(texto) || texto.includes('MOVIMIENTOS DE TARJETAS DE ABONADO') || texto.includes('TARJETAS MAESTRAS') || texto.includes('TARJETA MAESTRA')
        || (texto.includes('ABONO CONTRATADO') && texto.includes('ZONA SALIDA') && texto.includes('ZONA ENTRADA'))) return 'CU16';
    return '';
}

function buscarFilaEncabezadosInforme(matriz) {
    let mejor = { indice: -1, puntuacion: 0, celdas: [] };
    (matriz || []).forEach((fila, indice) => {
        const celdas = (fila || []).map(normalizarTextoReporteria);
        const puntuacion = celdas.reduce((total, celda) => total
            + (/FECHA|HORA/.test(celda) ? 1 : 0)
            + (/MATRICULA|PLACA/.test(celda) ? 2 : 0)
            + (/TICKET|ORDEN|EQUIPO|MOTIVO|OBSERVACION|CONCEPTO.*COBRO/.test(celda) ? 1 : 0), 0);
        if (puntuacion > mejor.puntuacion) mejor = { indice, puntuacion, celdas };
    });
    return mejor;
}

function indiceColumnaInforme(encabezados, patrones) {
    return encabezados.findIndex(celda => patrones.some(patron => patron.test(celda)));
}

function normalizarPlacaCruce(valor) {
    const texto = normalizarTextoReporteria(valor).replace(/[^A-Z0-9]/g, '');
    const coincidencia = texto.match(/(?=[A-Z0-9]{5,7}$)(?=[A-Z0-9]*[A-Z])(?=[A-Z0-9]*\d)[A-Z0-9]{5,7}$/);
    return coincidencia?.[0] || '';
}

function normalizarTicketCruce(valor) {
    const texto = String(valor ?? '');
    const grupos = texto.match(/\b\d{7}\b/g);
    if (grupos?.length) return grupos[0];
    const digitos = texto.replace(/\D/g, '');
    return digitos && digitos.length <= 12 ? digitos.padStart(7, '0') : '';
}

function obtenerHoraDesdeTextoInforme(valor) {
    const texto = String(valor ?? '');
    const coincidencia = texto.match(/\b([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?\b/);
    return coincidencia ? Number(coincidencia[1]) * 60 + Number(coincidencia[2]) : null;
}

function fechaDesdeFilaInforme(valores) {
    return valores.find(valor => /^\s*\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4}\s+\d{1,2}:\d{2}/.test(valor)) || '';
}

function extraerCu30DesdeMatriz(matriz) {
    return (matriz || []).map(fila => {
        const valores = Array.isArray(fila) ? fila.map(valor => String(valor ?? '').trim()) : [];
        const fecha = fechaDesdeFilaInforme(valores);
        const indiceIdentificador = valores.findIndex(valor => /\b\d{4}\s+\d{6}\s+\d{3}\s+\d{7}\s+\d{14}/.test(valor));
        if (!fecha || indiceIdentificador < 0) return null;
        const indiceVehiculo = valores.findIndex(valor => /\b(?:COCHE|MOTOCICLETA)\b/i.test(valor));
        const indicePagado = valores.findIndex(valor => /^(?:SI|SÍ|NO)$/i.test(valor));
        const candidatosPlaca = valores.slice(Math.max(0, indiceVehiculo + 1), indicePagado >= 0 ? indicePagado : indiceIdentificador);
        const placa = candidatosPlaca.map(normalizarPlacaCruce).find(Boolean)
            || (indiceVehiculo >= 0 ? valores[indiceVehiculo] : '');
        const identificador = valores[indiceIdentificador];
        return {
            fecha,
            hora: fecha,
            placa,
            ticket: normalizarTicketCruce(identificador),
            pagado: indicePagado >= 0 ? valores[indicePagado] : '',
            motivo: '',
            equipo: identificador.match(/^\s*\d{4}\s+\d{6}\s+(\d{3})/)?.[1] || '',
            texto: normalizarTextoReporteria(valores.filter(Boolean).join(' ')),
            contexto: 'CU30'
        };
    }).filter(Boolean);
}

function extraerRe18DesdeMatriz(matriz) {
    return (matriz || []).map(fila => {
        const valores = Array.isArray(fila) ? fila.map(valor => String(valor ?? '').trim()) : [];
        const fecha = fechaDesdeFilaInforme(valores);
        const esTicketPerdido = valores.some(valor => /^40(?:[.,]00)?$/.test(valor.replace(/\s/g, '')));
        if (!fecha || !esTicketPerdido) return null;
        const concepto = valores.find(valor => /\b\d{4}\s+\d{6}\s+\d{3}\s+\d{7,8}\s+\d{14}/.test(valor)) || '';
        const placa = extraerPlacaYMotivoReporteria(concepto).placa;
        if (!placa) return null;
        return {
            fecha,
            hora: fecha,
            placa,
            ticket: '',
            pagado: '',
            motivo: concepto,
            equipo: '',
            texto: normalizarTextoReporteria(valores.filter(Boolean).join(' ')),
            contexto: 'RE18 TICKET PERDIDO'
        };
    }).filter(Boolean);
}

function extraerCu14DesdeMatriz(matriz) {
    return (matriz || []).map(fila => {
        const valores = Array.isArray(fila) ? fila.map(valor => String(valor ?? '').trim()) : [];
        const fecha = fechaDesdeFilaInforme(valores);
        const indiceOrden = valores.findIndex(valor => /^2\s*\/\s*7\s*-?\s*POSICI[ÓO]N BARRERA/i.test(valor));
        if (!fecha || indiceOrden < 0) return null;
        const indiceEquipo = valores.findIndex((valor, indice) => indice > indiceOrden
            && /(?:^|\s|\/|-)(?:ENTRADA|SALIDA)\s*\d+/i.test(valor));
        const candidatosMotivo = valores
            .slice(indiceEquipo >= 0 ? indiceEquipo + 1 : indiceOrden + 1)
            .filter(Boolean);
        const motivo = candidatosMotivo.find(valor => extraerPlacaYMotivoReporteria(valor).placa)
            || candidatosMotivo.sort((a, b) => b.length - a.length)[0]
            || '';
        const placa = extraerPlacaYMotivoReporteria(motivo).placa;
        return {
            fecha,
            hora: fecha,
            placa,
            ticket: normalizarTicketCruce(motivo),
            pagado: '',
            motivo,
            equipo: indiceEquipo >= 0 ? valores[indiceEquipo] : '',
            texto: normalizarTextoReporteria(valores.filter(Boolean).join(' ')),
            contexto: 'CU14 ORDEN MANUAL'
        };
    }).filter(Boolean);
}

function extraerCu16DesdeMatriz(matriz) {
    const registros = [];
    let tarjetaActual = '';
    let abonoActual = '';
    (matriz || []).forEach(fila => {
        const valores = Array.isArray(fila) ? fila.map(valor => String(valor ?? '').trim()) : [];
        const indiceEtiquetaAbono = valores.findIndex(valor => /^ABONO CONTRATADO\s*:?$/i.test(valor));
        if (indiceEtiquetaAbono >= 0) {
            abonoActual = valores.slice(indiceEtiquetaAbono + 1).find(Boolean) || abonoActual;
        }
        const indiceEtiquetaTarjeta = valores.findIndex(valor => /^TARJETA\s*:?$/i.test(valor));
        if (indiceEtiquetaTarjeta >= 0) {
            tarjetaActual = valores.slice(indiceEtiquetaTarjeta + 1).find(Boolean) || tarjetaActual;
        }
        const fecha = fechaDesdeFilaInforme(valores);
        if (!fecha) return;
        const equipo = valores.find(valor => /^\d{3}\s*-\s*(?:ENTRADA|SALIDA)\s*\d+/i.test(valor)) || '';
        if (!equipo) return;
        const placa = valores.map(normalizarPlacaCruce).find(valor => valor && !normalizarPlacaCruce(equipo).includes(valor)) || '';
        registros.push({
            fecha,
            hora: fecha,
            placa,
            ticket: '',
            pagado: '',
            motivo: `${abonoActual} ${tarjetaActual}`.trim(),
            equipo,
            texto: normalizarTextoReporteria(valores.filter(Boolean).join(' ')),
            contexto: normalizarTextoReporteria(`CU16 ${abonoActual} ${tarjetaActual}`)
        });
    });
    return registros;
}

function extraerRegistrosInformeTickets(matriz, tipoInforme = '') {
    if (tipoInforme === 'CU30') return extraerCu30DesdeMatriz(matriz);
    if (tipoInforme === 'RE18') return extraerRe18DesdeMatriz(matriz);
    if (tipoInforme === 'CU14') return extraerCu14DesdeMatriz(matriz);
    if (tipoInforme === 'CU16') return extraerCu16DesdeMatriz(matriz);
    const encabezado = buscarFilaEncabezadosInforme(matriz);
    if (encabezado.indice < 0 || encabezado.puntuacion < 2) return [];
    const indiceFecha = indiceColumnaInforme(encabezado.celdas, [/FECHA.*EMISION/, /FECHA.*ENTRADA/, /^FECHA/]);
    const indiceHora = indiceColumnaInforme(encabezado.celdas, [/^HORA/, /HORA.*ENTRADA/]);
    const indicePlaca = indiceColumnaInforme(encabezado.celdas, [/MATRICULA/, /PLACA/]);
    const indiceVehiculo = indiceColumnaInforme(encabezado.celdas, [/VEHICULO/, /TIPO.*VEHICULO/]);
    const indiceTicket = indiceColumnaInforme(encabezado.celdas, [/IDENTIFICADOR.*TICKET/, /NUMERO.*TICKET/, /NRO.*TICKET/, /^TICKET/]);
    const indicePagado = indiceColumnaInforme(encabezado.celdas, [/PAGADO/, /PAGO/]);
    const indiceMotivo = indiceColumnaInforme(encabezado.celdas, [/MOTIVO/, /OBSERVACION/, /DETALLE/, /DESCRIPCION/, /CONCEPTO.*COBRO/]);
    const indiceEquipo = indiceColumnaInforme(encabezado.celdas, [/EQUIPO/, /ENTRADA/, /TERMINAL/]);
    const contexto = normalizarTextoReporteria((matriz || []).slice(0, encabezado.indice + 1).flat().join(' '));
    return (matriz || []).slice(encabezado.indice + 1).map(fila => {
        const valores = Array.isArray(fila) ? fila.map(valor => String(valor ?? '').trim()) : [];
        const textoFila = valores.filter(Boolean).join(' ');
        const fecha = indiceFecha >= 0 ? valores[indiceFecha] : (textoFila.match(/\b\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?/)?.[0] || '');
        const hora = indiceHora >= 0 ? valores[indiceHora] : fecha;
        const placaDirecta = indicePlaca >= 0 ? valores[indicePlaca] : '';
        const placaDetectada = normalizarPlacaCruce(placaDirecta)
            || (tipoInforme === 'CU30' ? '' : extraerPlacaYMotivoReporteria(textoFila).placa);
        const vehiculo = indiceVehiculo >= 0 ? valores[indiceVehiculo] : '';
        const placa = placaDetectada || (tipoInforme === 'CU30' ? vehiculo : '');
        const ticket = indiceTicket >= 0 ? normalizarTicketCruce(valores[indiceTicket]) : '';
        return {
            fecha, hora, placa, ticket,
            pagado: indicePagado >= 0 ? valores[indicePagado] : '',
            motivo: indiceMotivo >= 0 ? valores[indiceMotivo] : textoFila,
            equipo: indiceEquipo >= 0 ? valores[indiceEquipo] : '',
            texto: normalizarTextoReporteria(textoFila), contexto
        };
    }).filter(registro => registro.fecha || registro.placa || registro.ticket);
}

function buscarCoincidenciaInforme(base, registros) {
    const ticketBase = normalizarTicketCruce(base.ticket);
    const placaBase = normalizarPlacaCruce(base.placa);
    const fechaBase = obtenerFechaCalendarioInforme(base.fecha || base.hora);
    return (registros || []).find(registro => {
        const coincideTicket = ticketBase && normalizarTicketCruce(registro.ticket) === ticketBase;
        if (coincideTicket) return true;
        const placaRegistro = normalizarPlacaCruce(registro.placa);
        if (!placaBase || placaRegistro !== placaBase) return false;
        const fechaRegistro = obtenerFechaCalendarioInforme(registro.fecha || registro.hora);
        return !fechaBase || !fechaRegistro || fechaRegistro === fechaBase;
    });
}

function obtenerFechaCalendarioInforme(valor) {
    const coincidencia = String(valor ?? '').match(/\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})\b/);
    if (!coincidencia) return '';
    const anio = Number(coincidencia[3]) < 100 ? 2000 + Number(coincidencia[3]) : Number(coincidencia[3]);
    return `${anio}-${String(Number(coincidencia[2])).padStart(2, '0')}-${String(Number(coincidencia[1])).padStart(2, '0')}`;
}

function obtenerMarcaTiempoInforme(valor) {
    const coincidencia = String(valor ?? '').match(/\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (!coincidencia) return null;
    const anio = Number(coincidencia[3]) < 100 ? 2000 + Number(coincidencia[3]) : Number(coincidencia[3]);
    return Date.UTC(
        anio,
        Number(coincidencia[2]) - 1,
        Number(coincidencia[1]),
        Number(coincidencia[4]),
        Number(coincidencia[5]),
        Number(coincidencia[6] || 0)
    );
}

function buscarCoincidenciaTarjeta(base, registros) {
    const placaBase = normalizarPlacaCruce(base.placa);
    const inicio = obtenerMarcaTiempoInforme(`${base.fecha || ''} ${base.hora || ''}`);
    if (!placaBase || inicio === null) return null;
    const fechaBase = obtenerFechaCalendarioInforme(base.fecha || base.hora);
    return (registros || [])
        .filter(registro => normalizarPlacaCruce(registro.placa) === placaBase)
        .filter(registro => normalizarTextoReporteria(registro.equipo).includes('SALIDA'))
        .filter(registro => obtenerFechaCalendarioInforme(registro.fecha || registro.hora) === fechaBase)
        .map(registro => ({ registro, momento: obtenerMarcaTiempoInforme(`${registro.fecha || ''} ${registro.hora || ''}`) }))
        .filter(item => item.momento !== null)
        .sort((a, b) => Math.abs(a.momento - inicio) - Math.abs(b.momento - inicio))
        .map(item => ({ ...item, esPosterior: item.momento >= inicio }))[0] || null;
}

function observacionTicketAbierto(base, fuentes) {
    const evidencias = [];
    const referencias = [];
    const re18 = buscarCoincidenciaInforme(base, fuentes.RE18);
    const cu14 = buscarCoincidenciaInforme(base, fuentes.CU14);
    const coincidenciaTarjeta = buscarCoincidenciaTarjeta(base, fuentes.CU16);
    const cu16 = coincidenciaTarjeta?.registro || null;
    const textoTarjeta = `${cu16?.texto || ''} ${cu16?.contexto || ''}`;
    const entidadTarjeta = /\b(?:RENIEC|REINIEC)\b/.test(textoTarjeta)
        ? 'RENIEC'
        : (/\bONP(?:E)?\b/.test(textoTarjeta) ? 'ONP' : 'TARJETA MAESTRA');
    if (re18) evidencias.push('PAGO TICKET PERDIDO');
    if (cu16 && coincidenciaTarjeta.esPosterior) {
        evidencias.push(entidadTarjeta === 'TARJETA MAESTRA'
            ? 'SALE CON TARJETA MAESTRA'
            : `SALE CON TARJETA MAESTRA ${entidadTarjeta}`);
    } else if (cu16) {
        referencias.push(`VEHÍCULO ${entidadTarjeta}; SIN REGISTRO DE SALIDA CON TARJETA POSTERIOR AL TICKET`);
    }
    if (cu14 && !(cu16 && coincidenciaTarjeta.esPosterior)) {
        const detalle = String(cu14.motivo || '').replace(/^\s*\d{5,7}\s*/g, '').trim();
        evidencias.push(detalle ? `SE APERTURA ${detalle}` : 'APERTURA MANUAL VALIDADA EN CU14');
    }
    return {
        validado: Boolean(evidencias.length),
        observacion: evidencias.join(' | '),
        referencia: referencias.join(' | ')
    };
}

function construirAnalisisTicketsAbiertos(fuentes) {
    return (fuentes.CU30 || []).map(base => {
        const resultado = observacionTicketAbierto(base, fuentes);
        const fecha = String(base.fecha || '').match(/\b\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4}\b/)?.[0] || base.fecha;
        const pagado = /^(SI|SÍ)$/i.test(String(base.pagado || '').trim())
            ? 'Sí'
            : (/^NO$/i.test(String(base.pagado || '').trim()) ? 'No' : (resultado.validado ? 'Sí' : 'No'));
        return [fecha, base.placa, pagado, base.ticket, resultado.observacion, resultado.referencia];
    });
}

async function cargarInformesTicketsAbiertos(archivos) {
    const fuentes = { CU30: [], RE18: [], CU14: [], CU16: [] };
    const detectados = [];
    for (const archivo of archivos) {
        const libro = XLSX.read(await archivo.arrayBuffer(), { type: 'array', cellDates: false });
        const matriz = libro.SheetNames.flatMap(nombre => XLSX.utils.sheet_to_json(libro.Sheets[nombre], { header: 1, raw: false, defval: '' }));
        const tipo = detectarTipoInformeTickets(archivo.name, matriz);
        if (!tipo) continue;
        const registros = extraerRegistrosInformeTickets(matriz, tipo);
        fuentes[tipo].push(...registros);
        detectados.push(`${tipo}: ${registros.length}`);
    }
    if (!fuentes.CU30.length) throw new Error('No se identificó el informe CU30. Inclúyelo o agrega CU30 al nombre del archivo.');
    reporteCapturaActual.fuenteExcel = archivos.map(archivo => archivo.name).join(', ');
    reporteCapturaActual.encabezados = [...TIPOS_REPORTERIA.tickets.encabezados];
    reporteCapturaActual.filas = construirAnalisisTicketsAbiertos(fuentes);
    const comprobados = reporteCapturaActual.filas.filter(fila => String(fila[4] || '').trim()).length;
    const faltantes = ['RE18', 'CU14', 'CU16'].filter(tipo => !fuentes[tipo].length);
    const resumen = obtenerElemento('reportingSourceSummary');
    if (resumen) resumen.textContent = `Informes reconocidos: ${detectados.join(' · ')}${faltantes.length ? ` · Faltan: ${faltantes.join(', ')}` : ''}`;
    return {
        filas: reporteCapturaActual.filas.length,
        comprobados,
        pendientesCamara: reporteCapturaActual.filas.length - comprobados,
        faltantes
    };
}

async function cargarExcelReporteria(archivosSeleccionados) {
    const archivos = Array.from(archivosSeleccionados || []).filter(Boolean);
    if (!archivos.length) return;
    if (!window.XLSX) {
        establecerEstadoReporteria('reportingOcrStatus', 'El lector de Excel no esta disponible.', 'error');
        return;
    }
    if (archivos.some(archivo => !/\.(xls|xlsx)$/i.test(archivo.name || ''))) {
        establecerEstadoReporteria('reportingOcrStatus', 'Selecciona un archivo Excel .xls o .xlsx.', 'error');
        return;
    }
    establecerEstadoReporteria('reportingOcrStatus', 'Leyendo el Excel original...', 'pending');
    try {
        if (reporteCapturaActual.tipo === 'tickets') {
            const resultado = await cargarInformesTicketsAbiertos(archivos);
            liberarVistaPreviaReporteria();
            reporteCapturaActual.archivos = [];
            renderizarTablaReporteria();
            obtenerElemento('reportingTableCard').hidden = false;
            establecerEstadoReporteria(
                'reportingOcrStatus',
                `${resultado.filas} tickets analizados: ${resultado.comprobados} con motivo comprobado y ${resultado.pendientesCamara} pendientes de revisión en cámaras.${resultado.faltantes.length ? ' Faltan informes para completar el cruce.' : ''}`,
                resultado.faltantes.length ? 'pending' : 'success'
            );
            obtenerElemento('reportingTableCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        const archivo = archivos[0];
        const libro = XLSX.read(await archivo.arrayBuffer(), { type: 'array', cellDates: false });
        const filas = libro.SheetNames.flatMap(nombre => XLSX.utils.sheet_to_json(libro.Sheets[nombre], {
            header: 1,
            raw: false,
            defval: ''
        }));
        const ordenes = extraerOrdenesManualesDesdeMatriz(filas);
        if (!ordenes.length) throw new Error('No se encontraron ordenes 2/7 - Posicion barrera en el archivo.');
        reporteCapturaActual.tipo = 'plumillas';
        liberarVistaPreviaReporteria();
        reporteCapturaActual.archivos = [];
        reporteCapturaActual.fuenteExcel = archivo.name;
        reporteCapturaActual.encabezados = [...TIPOS_REPORTERIA.plumillas.encabezados];
        reporteCapturaActual.filas = ordenes;
        document.querySelectorAll('[data-reporting-type]').forEach(boton => {
            const activo = boton.dataset.reportingType === 'plumillas';
            boton.classList.toggle('is-active', activo);
            boton.setAttribute('aria-pressed', String(activo));
        });
        obtenerElemento('reportingPreviewImage').removeAttribute('src');
        obtenerElemento('reportingPreview').hidden = true;
        obtenerElemento('processReportingImage').disabled = true;
        obtenerElemento('reportingRawText').value = '';
        obtenerElemento('reportingRawText').disabled = true;
        obtenerElemento('buildReportingTable').disabled = true;
        renderizarTablaReporteria();
        obtenerElemento('reportingTableCard').hidden = false;
        const pendientes = ordenes.filter(fila => !fila[2]).length;
        const detallePendientes = pendientes ? ` ${pendientes} filas no traen una placa identificable y quedaron para revision.` : '';
        establecerEstadoReporteria('reportingOcrStatus', `${archivo.name}: ${ordenes.length} ordenes manuales cargadas.${detallePendientes}`, 'success');
        obtenerElemento('reportingTableCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
        console.error('No se pudo leer el Excel de reporteria:', error);
        establecerEstadoReporteria('reportingOcrStatus', error.message || 'No se pudo leer el archivo Excel.', 'error');
    } finally {
        obtenerElemento('reportingExcelInput').value = '';
    }
}

function extraerOrdenesManuales(texto) {
    const filas = [];
    String(texto).split(/\r?\n/).map(limpiarLineaOcrReporteria).filter(Boolean).forEach(linea => {
        const mayuscula = linea.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
        if (mayuscula.includes('REPORTE DE ORDENES') || mayuscula.includes('TURNO APERTURA')
            || (mayuscula.includes('FECHA') && mayuscula.includes('PLACA') && mayuscula.includes('MOTIVO'))) return;
        if (!/POSICI[O0]N\s+BARRERA/.test(mayuscula)) return;
        const fecha = linea.match(/\b(\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4})\b/)?.[1];
        const equipo = mayuscula.match(/PUMA\s*(\d+)\s*[- ]?\s*C\s*[- ]?\s*([AB])\b/)
            || mayuscula.match(/PUMA\s*(\d+)\s*[- ]?\s*C([AB])\b/);
        if (!fecha || !equipo) return;
        const cola = linea.slice(equipo.index + equipo[0].length).trim();
        const placa = cola.match(/^[-:;,\s]*([A-Z][A-Z0-9]{2}\d{3})/i);
        if (!placa) return;
        const motivo = cola.slice(placa.index + placa[0].length).replace(/^[-:;,\s]+/, '').trim();
        filas.push([fecha, `P${equipo[1]}.C${equipo[2]}`, placa[1].toUpperCase(), motivo]);
    });
    return filas;
}

function extraerTablaGenerica(texto) {
    const filas = String(texto).split(/\r?\n/)
        .map(linea => linea.trim())
        .filter(Boolean)
        .map(linea => linea.split(/\t|\s{2,}|\s*\|\s*/).map(valor => valor.trim()).filter(Boolean));
    if (!filas.length) return { encabezados: ['DATO'], filas: [] };
    const columnas = Math.max(...filas.map(fila => fila.length));
    if (columnas === 1) return { encabezados: ['TEXTO DETECTADO'], filas };
    const primera = filas.shift();
    const encabezados = Array.from({ length: columnas }, (_, indice) => primera[indice] || `COLUMNA ${indice + 1}`);
    return { encabezados, filas: filas.map(fila => Array.from({ length: columnas }, (_, indice) => fila[indice] || '')) };
}

function convertirTextoReporteriaEnTabla() {
    const texto = obtenerElemento('reportingRawText').value.trim();
    if (!texto) {
        establecerEstadoReporteria('reportingOcrStatus', 'No hay texto para convertir.', 'error');
        return;
    }
    if (reporteCapturaActual.tipo === 'plumillas') {
        reporteCapturaActual.encabezados = [...TIPOS_REPORTERIA.plumillas.encabezados];
        reporteCapturaActual.filas = extraerOrdenesManuales(texto);
        if (!reporteCapturaActual.filas.length) {
            reporteCapturaActual.filas = [['', '', '', texto.replace(/\s+/g, ' ').trim()]];
            establecerEstadoReporteria('reportingOcrStatus', 'No se separaron filas con seguridad. Dejamos el texto en Motivo para que puedas corregirlo.', 'pending');
        }
    } else {
        const tabla = extraerTablaGenerica(texto);
        reporteCapturaActual.encabezados = tabla.encabezados;
        reporteCapturaActual.filas = tabla.filas;
    }
    renderizarTablaReporteria();
    obtenerElemento('reportingTableCard').hidden = false;
    obtenerElemento('reportingTableCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function crearCampoTablaReporteria(valor, fila, columna, encabezado = false) {
    const campo = document.createElement('input');
    campo.type = 'text';
    campo.value = valor || '';
    campo.dataset.reportingRow = String(fila);
    campo.dataset.reportingColumn = String(columna);
    if (encabezado) campo.dataset.reportingHeader = 'true';
    campo.setAttribute('aria-label', encabezado ? `Nombre de columna ${columna + 1}` : `Fila ${fila + 1}, columna ${columna + 1}`);
    return campo;
}

function renderizarTablaReporteria() {
    const cabecera = obtenerElemento('reportingTableHead');
    const cuerpo = obtenerElemento('reportingTableBody');
    limpiarElemento(cabecera);
    limpiarElemento(cuerpo);
    const filaCabecera = document.createElement('tr');
    const numero = document.createElement('th');
    numero.className = 'reporting-row-number';
    numero.scope = 'col';
    numero.textContent = '#';
    filaCabecera.appendChild(numero);
    reporteCapturaActual.encabezados.forEach((encabezado, indice) => {
        const celda = document.createElement('th');
        celda.scope = 'col';
        celda.appendChild(crearCampoTablaReporteria(encabezado, -1, indice, true));
        filaCabecera.appendChild(celda);
    });
    const accion = document.createElement('th');
    accion.className = 'reporting-row-action';
    accion.scope = 'col';
    accion.textContent = 'Quitar';
    filaCabecera.appendChild(accion);
    cabecera.appendChild(filaCabecera);

    reporteCapturaActual.filas.forEach((fila, indiceFila) => {
        const tr = document.createElement('tr');
        if (fila.some(valor => normalizarTextoReporteria(valor).includes('REVISAR SALIDA'))) {
            tr.classList.add('is-review-window');
        }
        const indice = document.createElement('td');
        indice.className = 'reporting-row-number';
        indice.textContent = String(indiceFila + 1);
        tr.appendChild(indice);
        reporteCapturaActual.encabezados.forEach((_, indiceColumna) => {
            const celda = document.createElement('td');
            celda.appendChild(crearCampoTablaReporteria(fila[indiceColumna] || '', indiceFila, indiceColumna));
            tr.appendChild(celda);
        });
        const celdaAccion = document.createElement('td');
        celdaAccion.className = 'reporting-row-action';
        const eliminar = document.createElement('button');
        eliminar.type = 'button';
        eliminar.className = 'reporting-delete-row';
        eliminar.dataset.deleteReportingRow = String(indiceFila);
        eliminar.setAttribute('aria-label', `Eliminar fila ${indiceFila + 1}`);
        eliminar.title = 'Eliminar fila';
        eliminar.textContent = '×';
        celdaAccion.appendChild(eliminar);
        tr.appendChild(celdaAccion);
        cuerpo.appendChild(tr);
    });
}

function agregarFilaReporteria() {
    reporteCapturaActual.filas.push(reporteCapturaActual.encabezados.map(() => ''));
    renderizarTablaReporteria();
    obtenerElemento('reportingTableBody').querySelector('tr:last-child input')?.focus();
}

function actualizarDatoTablaReporteria(campo) {
    const columna = Number(campo.dataset.reportingColumn);
    if (campo.dataset.reportingHeader) {
        reporteCapturaActual.encabezados[columna] = campo.value.trim() || `COLUMNA ${columna + 1}`;
        return;
    }
    const fila = Number(campo.dataset.reportingRow);
    if (reporteCapturaActual.filas[fila]) reporteCapturaActual.filas[fila][columna] = campo.value;
}

function eliminarFilaReporteria(indice) {
    reporteCapturaActual.filas.splice(Number(indice), 1);
    renderizarTablaReporteria();
}

async function aplicarFormatoExcelReporteria(buffer, filas, columnas, filasAlerta = []) {
    if (!window.JSZip) return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const zip = await window.JSZip.loadAsync(buffer);
    const estilos = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="4"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="15"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font><font><sz val="10"/><name val="Calibri"/></font></fonts>
<fills count="5"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF92D050"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFC6E0B4"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFE699"/></patternFill></fill></fills>
<borders count="2"><border/><border><left style="thin"><color rgb="FF000000"/></left><right style="thin"><color rgb="FF000000"/></right><top style="thin"><color rgb="FF000000"/></top><bottom style="thin"><color rgb="FF000000"/></bottom></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="5"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="3" fillId="0" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="3" fillId="4" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
    zip.file('xl/styles.xml', estilos);
    let hojaXml = await zip.file('xl/worksheets/sheet1.xml').async('string');
    hojaXml = asignarEstiloCeldaXml(hojaXml, 'A1', 1);
    for (let columna = 0; columna < columnas; columna += 1) {
        const letra = XLSX.utils.encode_col(columna);
        hojaXml = asignarEstiloCeldaXml(hojaXml, `${letra}2`, 2);
        for (let fila = 3; fila <= filas + 2; fila += 1) {
            hojaXml = asignarEstiloCeldaXml(hojaXml, `${letra}${fila}`, filasAlerta.includes(fila - 3) ? 4 : 3);
        }
    }
    zip.file('xl/worksheets/sheet1.xml', hojaXml);
    return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', compression: 'DEFLATE' });
}

async function exportarExcelReporteria() {
    if (!window.XLSX || !reporteCapturaActual.filas.length) {
        establecerEstadoReporteria('reportingExportStatus', 'Agrega al menos una fila antes de generar el Excel.', 'error');
        return;
    }
    const configuracion = TIPOS_REPORTERIA[reporteCapturaActual.tipo];
    const encabezados = reporteCapturaActual.encabezados.map(valor => valor.trim());
    const filas = reporteCapturaActual.filas
        .map(fila => encabezados.map((_, indice) => String(fila[indice] || '').trim()))
        .filter(fila => fila.some(Boolean));
    if (!filas.length) {
        establecerEstadoReporteria('reportingExportStatus', 'La tabla no contiene datos.', 'error');
        return;
    }
    const matriz = [[configuracion.tituloExcel, ...encabezados.slice(1).map(() => '')], encabezados, ...filas];
    const hoja = XLSX.utils.aoa_to_sheet(matriz);
    hoja['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: encabezados.length - 1 } }];
    hoja['!cols'] = encabezados.map((_, indice) => ({ wch: configuracion.anchos[indice] || (indice === encabezados.length - 1 ? 48 : 20) }));
    hoja['!rows'] = [{ hpt: 24 }, { hpt: 22 }, ...filas.map(() => ({ hpt: 20 }))];
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Reporte');
    libro.Props = {
        Title: configuracion.tituloExcel,
        Subject: configuracion.nombre,
        Author: perfilActual?.nombre || 'UrbaPark',
        CreatedDate: new Date()
    };
    const buffer = XLSX.write(libro, { bookType: 'xlsx', type: 'array', compression: true });
    const filasAlerta = filas.reduce((indices, fila, indice) => {
        if (fila.some(valor => normalizarTextoReporteria(valor).includes('REVISAR SALIDA'))) indices.push(indice);
        return indices;
    }, []);
    const blob = await aplicarFormatoExcelReporteria(buffer, filas.length, encabezados.length, filasAlerta);
    const nombre = `${configuracion.nombre.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}-${fechaLocalISO()}.xlsx`;
    descargarBlob(blob, nombre);
    establecerEstadoReporteria('reportingExportStatus', `Excel generado con ${filas.length} registros.`, 'success');
}

function limpiarReporteria(confirmar = true) {
    if (confirmar && (reporteCapturaActual.archivos.length || reporteCapturaActual.fuenteExcel || obtenerElemento('reportingRawText').value)
        && !window.confirm('¿Seguro que deseas limpiar la captura y los datos del reporte?')) return;
    liberarVistaPreviaReporteria();
    reporteCapturaActual.archivos = [];
    reporteCapturaActual.fuenteExcel = '';
    reporteCapturaActual.filas = [];
    reporteCapturaActual.encabezados = TIPOS_REPORTERIA[reporteCapturaActual.tipo].encabezados
        ? [...TIPOS_REPORTERIA[reporteCapturaActual.tipo].encabezados]
        : [];
    ['reportingExcelInput', 'reportingCameraInput', 'reportingGalleryInput'].forEach(id => { obtenerElemento(id).value = ''; });
    obtenerElemento('reportingPreviewImage').removeAttribute('src');
    obtenerElemento('reportingPreview').hidden = true;
    obtenerElemento('processReportingImage').disabled = true;
    obtenerElemento('reportingRawText').value = '';
    obtenerElemento('reportingRawText').disabled = true;
    obtenerElemento('buildReportingTable').disabled = true;
    obtenerElemento('reportingTableCard').hidden = true;
    actualizarProgresoReporteria(0, false);
    establecerEstadoReporteria('reportingOcrStatus', '');
    establecerEstadoReporteria('reportingExportStatus', '');
    const resumen = obtenerElemento('reportingSourceSummary');
    if (resumen) resumen.textContent = '';
}
