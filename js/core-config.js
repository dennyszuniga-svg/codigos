(function initializeUrbaparkCoreConfig(global) {
    'use strict';

    const STORAGE_KEYS = {
        history: 'historialCodigos',
        checklist: 'estadoChecklistCodigos',
        guides: 'guiasOperativas',
        guideDraft: 'borradorGuiaOperativa',
        guideProgress: 'progresoGuiasOperativas',
        guideImagesMigrated: 'fotosGuiasMigradasAStorage',
        theme: 'temaCodigosUrbapark',
        maintenanceReports: 'urbapark-maintenance-reports',
        occupancyDraft: 'urbapark-operations-occupancy-draft'
    };
    
    const SUPABASE_CONFIG = {
        url: 'https://uibiwhkxlyxdfytvudbn.supabase.co',
        publishableKey: 'sb_publishable_R-auhGcSmwSl-1U9WdGe3g_ZYm5BZEt'
    };
    
    const SUPABASE_ESM_SOURCES = [
        'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm',
        'https://esm.sh/@supabase/supabase-js@2'
    ];
    
    const VAPID_PUBLIC_KEY = 'BG9moXgahVKNxX367YNu3NPS5GdD03nrtB3YikfldVYwq8YAsKZEmIPevWZaozevHeCgWXXDPNp3BKC652FoZHc';
    const GUIDE_IMAGE_BUCKET = 'guide-images';
    const GUIDE_IMAGE_URL_TTL = 60 * 60;
    const GDH_DOCUMENT_BUCKET = 'gdh-documentos';
    const GDH_ANNOUNCEMENT_BUCKET = 'gdh-comunicados';
    const MEDIA_VAULT_DB_NAME = 'urbapark-media-vault';
    const MEDIA_VAULT_DB_VERSION = 1;
    const MEDIA_VAULT_STORE = 'media';
    const MAINTENANCE_ACCESS_SESSION_KEY = 'urbapark-maintenance-area-unlocked';
    const SEDES_OPERACION = [
        { id: 'puruchuco', nombre: 'Real Plaza Puruchuco', corto: 'Puruchuco' },
        { id: 'salaverry', nombre: 'Real Plaza Salaverry', corto: 'Salaverry' },
        { id: 'primavera', nombre: 'Real Plaza Primavera', corto: 'Primavera' },
        { id: 'civico', nombre: 'Real Plaza Civico', corto: 'Civico' },
        { id: 'gama', nombre: 'GAMA', corto: 'GAMA' }
    ];
    const MODULOS_POR_SEDE = new Set(['mantenimiento', 'caja', 'ronda']);
    const ROL_SUPERIOR = 'encargado_ti';
    const ROLES_OPERACION_GLOBAL = ['jefe_operaciones', 'coordinador_operaciones', 'gdh'];
    const ROLES_GLOBALES = [ROL_SUPERIOR, 'comercial_abonados', ...ROLES_OPERACION_GLOBAL];
    const ROLES_CREABLES_POR_ADMIN = ['tecnico', 'supervisor', 'fortaleza', 'eco', 'charly', 'anfitrion', 'marcador'];
    const ROLES_USUARIO = [
        ROL_SUPERIOR,
        'admin',
        'comercial_abonados',
        'jefe_operaciones',
        'coordinador_operaciones',
        'gdh',
        'tecnico',
        'supervisor',
        'fortaleza',
        'eco',
        'charly',
        'anfitrion',
        'marcador'
    ];
    const ETIQUETAS_ROL = {
        [ROL_SUPERIOR]: 'Encargado de Mantenimiento y TI',
        admin: 'Administrador',
        comercial_abonados: 'Comercial de abonados',
        jefe_operaciones: 'Jefe de operaciones',
        coordinador_operaciones: 'Coordinador de operaciones',
        gdh: 'GDH',
        tecnico: 'Técnico de mantenimiento',
        supervisor: 'Supervisor',
        fortaleza: 'Fortaleza',
        eco: 'ECO',
        charly: 'Charly',
        anfitrion: 'Anfitrión',
        marcador: 'Marcador de sede'
    };
    const TIPOS_ABONO = {
        locatario_lv: { nombre: 'Locatario auto - lunes a viernes', monto: 150 },
        locatario_sd: { nombre: 'Locatario auto - sabado a domingo', monto: 200 }
    };

    global.UrbaparkCoreConfig = Object.freeze({
        STORAGE_KEYS,
        SUPABASE_CONFIG,
        SUPABASE_ESM_SOURCES,
        VAPID_PUBLIC_KEY,
        GUIDE_IMAGE_BUCKET,
        GUIDE_IMAGE_URL_TTL,
        GDH_DOCUMENT_BUCKET,
        GDH_ANNOUNCEMENT_BUCKET,
        MEDIA_VAULT_DB_NAME,
        MEDIA_VAULT_DB_VERSION,
        MEDIA_VAULT_STORE,
        MAINTENANCE_ACCESS_SESSION_KEY,
        SEDES_OPERACION,
        MODULOS_POR_SEDE,
        ROL_SUPERIOR,
        ROLES_OPERACION_GLOBAL,
        ROLES_GLOBALES,
        ROLES_CREABLES_POR_ADMIN,
        ROLES_USUARIO,
        ETIQUETAS_ROL,
        TIPOS_ABONO
    });
})(window);
