(function initializeUrbaparkOperationsConfig(global) {
    'use strict';

    const OPERATIONS_CHECKLIST_BUCKET = 'operations-checklist-images';
    const OPERATIONS_CHECKLIST_SECTIONS = [
        {
            id: 'vehiculos',
            nombre: 'Ingresos y salidas vehiculares',
            descripcion: 'Validacion de carriles, accesos y equipos asociados.',
            criticidad: 'critica',
            items: [
                ['equipos-operativos', 'Equipos de ingreso y salida operativos.', 'critica'],
                ['lpr-operativo', 'LPR operativo y con lectura correcta de placas.', 'critica'],
                ['camaras-acceso', 'Camaras de ingreso y salida operativas y enfocadas.', 'critica'],
                ['barreras', 'Barreras operativas y alineadas.', 'critica'],
                ['ticketera', 'Ticketera operativa y con rollo termico.', 'critica'],
                ['interfonia-acceso', 'Interfonia operativa en ingresos y salidas.', 'critica'],
                ['tiempo-barrera', 'Tiempo de apertura de barrera menor a 7 segundos.', 'critica'],
                ['carriles-limpios', 'Carriles limpios y libres de obstaculos.', 'critica']
            ]
        },
        {
            id: 'pagos',
            nombre: 'Modulos de pago (TPA / TPM)',
            descripcion: 'No se muestra en Puruchuco porque la sede no realiza cobros.',
            criticidad: 'critica',
            excluidaEn: ['puruchuco'],
            items: [
                ['modulos-operativos', 'Modulos limpios y operativos.', 'critica'],
                ['pantallas-pago', 'Pantallas operativas y visibles.', 'critica'],
                ['medios-pago', 'Monedero, billetero y devolvedor operativos.', 'critica'],
                ['impresora-pago', 'Impresora operativa y con rollo termico.', 'critica'],
                ['interfonia-pago', 'Interfonia operativa.', 'critica'],
                ['recaudo', 'Recaudo realizado y fondo cuadrado.', 'critica'],
                ['area-pago', 'Area limpia y ordenada.', 'critica']
            ]
        },
        {
            id: 'fortaleza',
            nombre: 'Fortaleza',
            descripcion: 'Control de monitoreo, comunicaciones y soporte operativo.',
            criticidad: 'media',
            items: [
                ['camaras-fortaleza', 'Camaras operativas y con enfoque correcto.', 'media'],
                ['pantallas-fortaleza', 'Pantallas limpias y operativas.', 'media'],
                ['radios', 'Radios de comunicacion cargados y operativos.', 'media'],
                ['grupos-camaras', 'Grupos de camaras organizados correctamente.', 'media'],
                ['incidencias', 'Registro y seguimiento de incidencias actualizado.', 'media'],
                ['area-fortaleza', 'Area limpia y ordenada.', 'media'],
                ['scooters', 'Scooters con carga suficiente para la operacion.', 'media']
            ]
        },
        {
            id: 'generales',
            nombre: 'Validaciones generales',
            descripcion: 'Seguridad, respuesta y condiciones generales de operacion.',
            criticidad: 'mixta',
            items: [
                ['extintores', 'Extintores verificados y operativos.', 'critica'],
                ['luces-emergencia', 'Luces de emergencia operativas.', 'critica'],
                ['rutas-evacuacion', 'Rutas de evacuacion despejadas.', 'critica'],
                ['senaleticas', 'Senaleticas de seguridad limpias y en buen estado.', 'critica'],
                ['botiquin', 'Botiquin implementado y vigente.', 'critica'],
                ['radio-epp', 'Personal con radio y EPP completo.', 'media'],
                ['libro-reclamaciones', 'Libro de reclamaciones disponible.', 'baja'],
                ['sin-incidencias', 'Operacion sin incidencias criticas.', 'media'],
                ['auxilio-mecanico', 'Herramientas de auxilio mecanico disponibles.', 'baja']
            ]
        }
    ];

    global.UrbaparkOperationsConfig = Object.freeze({
        OPERATIONS_CHECKLIST_BUCKET,
        OPERATIONS_CHECKLIST_SECTIONS
    });
})(window);
