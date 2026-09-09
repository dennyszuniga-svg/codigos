(function initializeUrbaparkEmergencyCodes(global) {
    'use strict';

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
    
    const etiquetasModo = {
        real: 'Emergencia real',
        simulacro: 'Simulacro'
    };
    
    const etiquetasPrioridad = {
        baja: 'Baja',
        media: 'Media',
        alta: 'Alta',
        critica: 'Critica'
    };
    
    const codigosEmergencia = {
        rojo: {
            nombre: 'Código Rojo',
            descripcion: 'Incendios o inflamación de chimeneas',
            guia: '5 primeros minutos en incendios o inflamación de chimeneas',
            resumen: 'Activa respuesta contra incendio y comunica la ubicación.',
            color: '#d92d20',
            icono: 'R',
            image: 'assets/codigo-rojo.webp',
            imagenAmpliada: 'assets/codigo-rojo.png',
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
            nombre: 'Código Naranja',
            descripcion: 'Atrapados en ascensores, escaleras o travolator',
            guia: '5 primeros minutos atrapados en ascensores, escaleras o travolator',
            resumen: 'Responde ante atrapamiento y coordina el servicio de emergencias.',
            color: '#b54708',
            icono: 'N',
            image: 'assets/codigo-naranja.webp',
            imagenAmpliada: 'assets/codigo-naranja.png',
            concepto: {
                titulo: 'Persona atrapada',
                foco: 'Contencion, comunicacion y rescate asistido',
                escena: 'lift',
                etiquetas: ['Ascensor', 'Mantenimiento', 'Calma']
            },
            checklist: [
                'Anfitrión comunica a ECO el atrapamiento de personas dentro del ascensor, escalera o travolator.',
                'ECO se dirige al punto e informa de inmediato a Charly para activar al proveedor de ascensores.',
                'Mantener comunicacion calmada con los clientes, informar que la ayuda esta en camino y contener la situacion.'
            ]
        },
        'verde-oscuro': {
            nombre: 'Código 3D',
            descripcion: 'Fugas de gases y derrames de combustibles',
            guia: 'Diluye - Dispersa - Dirige',
            resumen: 'Controla gases o derrames con apoyo de mantenimiento y seguridad.',
            color: '#027a48',
            icono: '3D',
            image: 'assets/codigo-3d.webp',
            imagenAmpliada: 'assets/codigo-3d.png',
            concepto: {
                titulo: 'Derrame / fuga',
                foco: 'Diluye, dispersa y dirige el control de la zona',
                escena: 'spill',
                etiquetas: ['Aislar', 'Medir', 'Ventilar']
            },
            checklist: [],
            controles: [
                {
                    id: 'tipo-incidente-3d',
                    pregunta: 'Tipo de incidente 3D',
                    opciones: ['Gas', 'Gasolina o petroleo'],
                    posicion: 'antes'
                }
            ],
            checklistsCondicionales: {
                'tipo-incidente-3d': {
                    Gas: [
                        'Anfitrión se aleja del punto, comunica a ECO y apaga la radio hasta ubicarse en una zona segura.',
                        'ECO comunica de inmediato a Charly la fuga de gas y la ubicacion exacta.',
                        'ECO cierra la zona y establece un perimetro de seguridad definido.'
                    ],
                    'Gasolina o petroleo': [
                        'Anfitrión coloca arena en el punto del derrame, informa a ECO y reporta la situación al grupo.',
                        'ECO se acerca al punto y recopila los datos del vehiculo que genera el derrame.',
                        'ECO coordina con Charly el perifoneo y mantiene controlada la zona afectada.'
                    ]
                }
            }
        },
        azul: {
            nombre: 'Código CAT',
            descripcion: 'Persona necesita atención médica',
            guia: 'Comunica + Atiende + Traslada',
            resumen: 'Orienta la atencion medica y el traslado del paciente.',
            color: '#175cd3',
            icono: 'CAT',
            image: 'assets/codigo-cat.webp',
            imagenAmpliada: 'assets/codigo-cat.png',
            concepto: {
                titulo: 'Atencion medica',
                foco: 'Primeros auxilios, estabilizacion y traslado',
                escena: 'medical',
                etiquetas: ['Paciente', 'Topico', 'Traslado']
            },
            checklist: [
                'Anfitrión comunica por radio a ECO la situación y ubicación del cliente.',
                'ECO informa de inmediato a Charly la activación del Código CAT.',
                'Anfitrión observa de forma constante y mantiene comunicación de soporte con el cliente.'
            ],
            notaChecklist: 'NO SE ACERCA NI CONTENEMOS. VISION CONSTANTE Y COMUNICACION DE SOPORTE AL CLIENTE.'
        },
        verde: {
            nombre: 'Código Verde',
            descripcion: 'Sismos',
            guia: 'Verifica + Evalua + Restringe + Distribuye + Evacua',
            resumen: 'Gestiona el sismo con evacuación y control de la operación.',
            color: '#039855',
            icono: 'V',
            image: 'assets/codigo-verde.webp',
            imagenAmpliada: 'assets/codigo-verde.png',
            concepto: {
                titulo: 'Sismo / evacuacion',
                foco: 'Verifica, restringe accesos y evacua con control',
                escena: 'evac',
                etiquetas: ['Alarma', 'Rutas', 'Punto seguro']
            },
            checklist: [
                'ECO lanza el Código Verde y alerta a todo el equipo de URBAPARK.',
                'Anfitriones se acercan a los ascensores para evacuar y orientar a los clientes.',
                'Anfitrión de módulo evacua a los clientes y cierra su caja con llave.',
                'Rondas evacuan a los clientes y los direccionan hacia las puertas de emergencia.',
                'Fortaleza apertura plumillas y bloquea accesos para facilitar la evacuacion.',
                'Japibici evacua por la escalera de emergencia y direcciona a los clientes por la ruta segura.'
            ]
        },
        croc: {
            nombre: 'Código CROC',
            descripcion: 'Incidente con sospechoso o riesgo de seguridad',
            guia: 'Comunica + Rastrea + Observa + Contiene',
            resumen: 'Coordina con seguridad y control para contener la situacion.',
            color: '#3b4cc0',
            icono: 'CROC',
            image: 'assets/codigo-croc.webp',
            imagenAmpliada: 'assets/codigo-croc.png',
            concepto: {
                titulo: 'Riesgo de seguridad',
                foco: 'Rastreo, observacion y contencion del incidente',
                escena: 'security',
                etiquetas: ['Camaras', 'Cerco', 'Autoridad']
            },
            checklist: [
                'Anfitrión comunica al grupo vía radial un presunto C10, indicando vestimenta y último lugar donde fue visualizado.',
                'ECO comunica a Charly los detalles del presunto C10 y la referencia de ubicacion.',
                'Anfitriones se posicionan en ascensores y puertas de emergencia para reforzar puntos de salida.',
                'Anfitriones realizan seguimiento visual y comunican desplazamientos sin perder contacto operativo.'
            ]
        },
        adam: {
            nombre: 'Código ADAM',
            descripcion: 'Personas extraviadas',
            guia: 'Personas extraviadas',
            resumen: 'Activa la busqueda y el seguimiento del familiar o la persona.',
            color: '#111827',
            icono: 'ADAM',
            image: 'assets/codigo-adam.webp',
            imagenAmpliada: 'assets/codigo-adam.png',
            concepto: {
                titulo: 'Persona extraviada',
                foco: 'Busqueda coordinada con datos, recorrido y reporte',
                escena: 'search',
                etiquetas: ['Datos', 'Busqueda', 'Control']
            },
            checklist: [
                'Anfitrión comunica a ECO la activación del Código ADAM, entregando detalles de la persona extraviada.',
                'Anfitrión permanece con la persona extraviada en un punto visible por cámaras y mantiene comunicación calmada.',
                'ECO se acerca al punto y acompana a la persona extraviada hacia el modulo mas cercano.',
                'ECO realiza la entrega de la persona extraviada a Charly, dejando constancia del cierre de atencion.'
            ]
        },
        calma: {
            nombre: 'Código CALMA',
            descripcion: 'Agresion fisica o verbal y alteracion del orden',
            guia: 'Comunica + Atiende + Lidera sin agredir + Mantiene la calma + Aisla',
            resumen: 'Desescala el conflicto y aisla el punto para proteger a todos.',
            color: '#a855f7',
            icono: 'CLM',
            image: 'assets/codigo-calma.webp',
            imagenAmpliada: 'assets/codigo-calma.png',
            concepto: {
                titulo: 'Alteracion del orden',
                foco: 'Desescalamiento, separacion y control sin agresion',
                escena: 'calm',
                etiquetas: ['Separar', 'Dialogar', 'Aislar']
            },
            checklist: [
                'Anfitrión comunica a ECO los detalles de la situación y la ubicación exacta.',
                'ECO se acerca, aborda la situacion y busca apaciguar a las personas involucradas.',
                'Si la situacion escala, ECO solicita apoyo de Charly o Tango para contener y calmar el punto.',
                'A la llegada de Tango, ECO y anfitriones se retiran del punto manteniendo el control operativo.'
            ]
        },
        capta: {
            nombre: 'Código CAPTA',
            descripcion: 'Persona de alto riesgo, amenaza o agresion',
            guia: 'Comunica + Acompana + Protege + Tranquiliza + Activa',
            resumen: 'Acompana y protege a la persona mientras se activa el protocolo.',
            color: '#7c6f64',
            icono: 'CAP',
            image: 'assets/codigo-capta.webp',
            imagenAmpliada: 'assets/codigo-capta.png',
            concepto: {
                titulo: 'Alto riesgo / amenaza',
                foco: 'Acompanar, proteger, tranquilizar y activar apoyo',
                escena: 'shield',
                etiquetas: ['Proteger', 'Acompanamiento', 'Apoyo']
            },
            checklist: [
                'Anfitrión aborda a la persona de forma respetuosa e informa que no está permitido el comercio ambulatorio, consumo indebido o conducta que afecte la operación del mall.',
                'ECO comunica a Charly la ubicacion y descripcion de la persona intervenida.',
                'ECO acompaña a la persona durante su retiro; si la situación escala, activa Código CALMA o Código CROC según corresponda.'
            ]
        }
    };
    
    const ordenCodigos = ['rojo', 'naranja', 'verde-oscuro', 'azul', 'verde', 'croc', 'adam', 'calma', 'capta'];

    global.UrbaparkEmergencyCodes = Object.freeze({
        MAX_HISTORIAL,
        dateFormatter,
        timeFormatter,
        etiquetasModo,
        etiquetasPrioridad,
        codigosEmergencia,
        ordenCodigos
    });
})(window);
