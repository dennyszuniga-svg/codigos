(function initializeUrbaparkMaintenanceCatalog(global) {
    'use strict';

    const { SEDES_OPERACION } = global.UrbaparkCoreConfig;

    const EQUIPOS_MANTENIMIENTO = [
        { sede: 'civico', codigo: 'ENTRADA 1', nombre: 'Carril de entrada 1', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'civico', codigo: 'ENTRADA 2', nombre: 'Carril de entrada 2', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'civico', codigo: 'SALIDA 1', nombre: 'Carril de salida 1', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'civico', codigo: 'SALIDA 2', nombre: 'Carril de salida 2', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'civico', codigo: 'TPA 1', nombre: 'Cajero automatico full 1', tipo: 'Cajero automatico full', componentes: ['Cajero automatico full'], preventivoMinutos: 120 },
        { sede: 'civico', codigo: 'TPA 2', nombre: 'Cajero automatico full 2', tipo: 'Cajero automatico full', componentes: ['Cajero automatico full'], preventivoMinutos: 120 },
        { sede: 'civico', codigo: 'TPA 3', nombre: 'Cajero automatico full 3', tipo: 'Cajero automatico full', componentes: ['Cajero automatico full'], preventivoMinutos: 120 },
        { sede: 'civico', codigo: 'TPALITE1', nombre: 'Equipo de pago automatico con tarjeta', tipo: 'Pago automatico tarjeta', componentes: ['Pago con tarjeta'], preventivoMinutos: 120 },
        { sede: 'salaverry', codigo: 'TPA 1', nombre: 'Cajero automatico 1', tipo: 'Cajero automatico', componentes: ['Cajero automatico'], preventivoMinutos: 120 },
        { sede: 'salaverry', codigo: 'TPA 2', nombre: 'Cajero automatico 2', tipo: 'Cajero automatico', componentes: ['Cajero automatico'], preventivoMinutos: 120 },
        { sede: 'salaverry', codigo: 'TPA 3', nombre: 'Cajero automatico 3', tipo: 'Cajero automatico', componentes: ['Cajero automatico'], preventivoMinutos: 120 },
        { sede: 'salaverry', codigo: 'TPA 4', nombre: 'Cajero automatico 4', tipo: 'Cajero automatico', componentes: ['Cajero automatico'], preventivoMinutos: 120 },
        { sede: 'salaverry', codigo: 'TPA 5', nombre: 'Cajero automatico 5', tipo: 'Cajero automatico', componentes: ['Cajero automatico'], preventivoMinutos: 120 },
        { sede: 'salaverry', codigo: 'TPA 6', nombre: 'Cajero automatico 6', tipo: 'Cajero automatico', componentes: ['Cajero automatico'], preventivoMinutos: 120 },
        { sede: 'salaverry', codigo: 'TPA 7', nombre: 'Cajero automatico 7', tipo: 'Cajero automatico', componentes: ['Cajero automatico'], preventivoMinutos: 120 },
        { sede: 'salaverry', codigo: 'TPA 8', nombre: 'Cajero automatico 8', tipo: 'Cajero automatico', componentes: ['Cajero automatico'], preventivoMinutos: 120 },
        { sede: 'salaverry', codigo: 'PUMA 1 A', nombre: 'Carril de ingreso Puma 1 A', tipo: 'Carril de ingreso', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'salaverry', codigo: 'PUMA 1 B', nombre: 'Carril de ingreso Puma 1 B', tipo: 'Carril de ingreso', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'salaverry', codigo: 'PUMA 2 A', nombre: 'Carril de ingreso Puma 2 A', tipo: 'Carril de ingreso', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'salaverry', codigo: 'PUMA 2 B', nombre: 'Carril de ingreso Puma 2 B', tipo: 'Carril de ingreso', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'salaverry', codigo: 'PUMA 3 A', nombre: 'Carril de ingreso Puma 3 A', tipo: 'Carril de ingreso', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'salaverry', codigo: 'PUMA 3 B', nombre: 'Carril de ingreso Puma 3 B', tipo: 'Carril de ingreso', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'salaverry', codigo: 'PUMA 4 A', nombre: 'Carril de ingreso Puma 4 A', tipo: 'Carril de ingreso', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'salaverry', codigo: 'PUMA 4 B', nombre: 'Carril de ingreso Puma 4 B', tipo: 'Carril de ingreso', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'salaverry', codigo: 'PUMA 5 A', nombre: 'Carril de ingreso Puma 5 A', tipo: 'Carril de ingreso', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'salaverry', codigo: 'PUMA 5 B', nombre: 'Carril de ingreso Puma 5 B', tipo: 'Carril de ingreso', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'primavera', codigo: 'ENTRADA ALVAREZ CALDERON', nombre: 'Carril de entrada Alvarez Calderon', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'primavera', codigo: 'SALIDA ALVAREZ CARRION', nombre: 'Carril de salida Alvarez Carrion', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'primavera', codigo: 'ENTRADA 2 AVIACION', nombre: 'Carril de entrada 2 Aviacion', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'primavera', codigo: 'ENTRADA 3 AVIACION', nombre: 'Carril de entrada 3 Aviacion', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'primavera', codigo: 'SALIDA 2 AVIACION', nombre: 'Carril de salida 2 Aviacion', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'primavera', codigo: 'SALIDA 3 AVIACION', nombre: 'Carril de salida 3 Aviacion', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'primavera', codigo: 'TPA1LITE JAPIBICI', nombre: 'Cajero automatico Lite 1 Japibici', tipo: 'Cajero automatico Lite', componentes: ['Pago con tarjeta'], preventivoMinutos: 120 },
        { sede: 'primavera', codigo: 'TPA1FULL JAPIBICI', nombre: 'Cajero automatico Full 1 Japibici', tipo: 'Cajero automatico Full', componentes: ['Cajero automatico Full'], preventivoMinutos: 120 },
        { sede: 'primavera', codigo: 'TPA2LITE JAPIBICI', nombre: 'Cajero automatico Lite 2 Japibici', tipo: 'Cajero automatico Lite', componentes: ['Pago con tarjeta'], preventivoMinutos: 120 },
        { sede: 'primavera', codigo: 'TPA2FULL JAPIBICI', nombre: 'Cajero automatico Full 2 Japibici', tipo: 'Cajero automatico Full', componentes: ['Cajero automatico Full'], preventivoMinutos: 120 },
        { sede: 'primavera', codigo: 'TPA3LITE', nombre: 'Cajero automatico Lite 3', tipo: 'Cajero automatico Lite', componentes: ['Pago con tarjeta'], preventivoMinutos: 120 },
        { sede: 'primavera', codigo: 'TPA4LITE', nombre: 'Cajero automatico Lite 4', tipo: 'Cajero automatico Lite', componentes: ['Pago con tarjeta'], preventivoMinutos: 120 },
        { sede: 'gama', codigo: 'ENTRADA 1', nombre: 'Carril de entrada 1', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'gama', codigo: 'ENTRADA 2', nombre: 'Carril de entrada 2', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'gama', codigo: 'SALIDA 1', nombre: 'Carril de salida 1', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'gama', codigo: 'SALIDA 2', nombre: 'Carril de salida 2', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'gama', codigo: 'CAJA MANUAL 1', nombre: 'Caja manual 1', tipo: 'Caja manual', componentes: ['Caja manual', 'Impresora termica', 'PC'], preventivoMinutos: 120 },
        { sede: 'gama', codigo: 'CAJA MANUAL 2', nombre: 'Caja manual 2', tipo: 'Caja manual', componentes: ['Caja manual', 'Impresora termica', 'PC'], preventivoMinutos: 120 },
        { sede: 'puruchuco', codigo: 'ENTRADA 1 DE JAVIER PRADO', nombre: 'Carril de entrada 1 Javier Prado', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'puruchuco', codigo: 'ENTRADA 2 DE JAVIER PRADO', nombre: 'Carril de entrada 2 Javier Prado', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'puruchuco', codigo: 'ENTRADA 3 DE JAVIER PRADO', nombre: 'Carril de entrada 3 Javier Prado', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'puruchuco', codigo: 'ENTRADA JAVIER PRADO PROVEEDORES', nombre: 'Carril de entrada Javier Prado Proveedores', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'puruchuco', codigo: 'ENTRADA 1 VISTA ALEGRE', nombre: 'Carril de entrada 1 Vista Alegre', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'puruchuco', codigo: 'ENTRADA 2 VISTA ALEGRE', nombre: 'Carril de entrada 2 Vista Alegre', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'puruchuco', codigo: 'ENTRADA 1 CARRETERA CENTRAL', nombre: 'Carril de entrada 1 Carretera Central', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'puruchuco', codigo: 'ENTRADA 2 CARRETERA CENTRAL', nombre: 'Carril de entrada 2 Carretera Central', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'puruchuco', codigo: 'ENTRADA DE ZONA IPAE', nombre: 'Carril de entrada Zona IPAE', tipo: 'Carril de entrada', componentes: ['Ticketero', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'puruchuco', codigo: 'SALIDA DE ZONA IPAE', nombre: 'Carril de salida Zona IPAE', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'puruchuco', codigo: 'SALIDA 1 DE JAVIER PRADO', nombre: 'Carril de salida 1 Javier Prado', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'puruchuco', codigo: 'SALIDA 2 DE JAVIER PRADO', nombre: 'Carril de salida 2 Javier Prado', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'puruchuco', codigo: 'SALIDA 3 DE JAVIER PRADO', nombre: 'Carril de salida 3 Javier Prado', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'puruchuco', codigo: 'SALIDA JAVIER PRADO PROVEEDORES', nombre: 'Carril de salida Javier Prado Proveedores', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120, activo: false },
        { sede: 'puruchuco', codigo: 'SALIDA 1 DE SMARTFIT', nombre: 'Carril de salida 1 Smartfit', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120, activo: false },
        { sede: 'puruchuco', codigo: 'SALIDA 1 VISTA ALEGRE', nombre: 'Carril de salida 1 Vista Alegre', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'puruchuco', codigo: 'SALIDA 2 VISTA ALEGRE', nombre: 'Carril de salida 2 Vista Alegre', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120 },
        { sede: 'puruchuco', codigo: 'SALIDA DE NICOLAS AYLLON', nombre: 'Carril de salida Nicolas Ayllon', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120, activo: false },
        { sede: 'puruchuco', codigo: 'SALIDA 2 CARRETERA CENTRAL', nombre: 'Carril de salida 2 Carretera Central', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120, activo: false },
        { sede: 'puruchuco', codigo: 'SALIDA 3 CARRETERA CENTRAL', nombre: 'Carril de salida 3 Carretera Central', tipo: 'Carril de salida', componentes: ['Lector de tickets', 'Barrera', 'LPR'], preventivoMinutos: 120, activo: false }
    ];
    SEDES_OPERACION.forEach(sede => {
        EQUIPOS_MANTENIMIENTO.push(
            { sede: sede.id, codigo: 'ESTACIONAMIENTO', nombre: 'Mejoras generales de estacionamiento', tipo: 'Infraestructura', componentes: ['Infraestructura del estacionamiento'], preventivoMinutos: 0 },
            { sede: sede.id, codigo: 'FORTALEZA', nombre: 'Trabajos de Fortaleza', tipo: 'Infraestructura', componentes: ['Infraestructura y seguridad vial'], preventivoMinutos: 0 }
        );
    });

    global.UrbaparkMaintenanceCatalog = Object.freeze({
        EQUIPOS_MANTENIMIENTO
    });
})(window);
