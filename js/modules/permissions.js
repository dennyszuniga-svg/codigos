/* URBAPARK: solicitud y estado de permisos del dispositivo. */

const ESTADOS_PERMISO_DISPOSITIVO = Object.freeze({
    granted: { estado: 'granted', sufijo: 'activo', bloqueado: true },
    denied: { estado: 'denied', sufijo: 'bloqueado', bloqueado: true },
    prompt: { estado: 'prompt', sufijo: '', bloqueado: false },
    unsupported: { estado: 'unsupported', sufijo: 'no disponible', bloqueado: true }
});

function actualizarBotonPermisoDispositivo(id, nombre, estado = 'prompt', detalle = '') {
    const boton = obtenerElemento(id);
    if (!boton) return;

    const configuracion = ESTADOS_PERMISO_DISPOSITIVO[estado] || ESTADOS_PERMISO_DISPOSITIVO.prompt;
    const etiqueta = boton.querySelector('span');
    const texto = configuracion.sufijo ? `${nombre} ${configuracion.sufijo}` : `Activar ${nombre}`;

    if (etiqueta) etiqueta.textContent = texto;
    else boton.textContent = texto;

    boton.disabled = configuracion.bloqueado;
    boton.dataset.permissionState = configuracion.estado;
    boton.title = detalle || (estado === 'denied'
        ? `El permiso de ${nombre.toLowerCase()} está bloqueado. Habilítalo desde la configuración del sitio.`
        : '');
}

async function consultarEstadoPermisoDispositivo(nombre) {
    if (!navigator.permissions?.query) return 'prompt';
    try {
        const resultado = await navigator.permissions.query({ name: nombre });
        return resultado.state;
    } catch {
        return 'prompt';
    }
}

async function actualizarBotonesPermisos() {
    if (!('geolocation' in navigator)) {
        actualizarBotonPermisoDispositivo('enableGpsButton', 'GPS', 'unsupported');
    } else {
        actualizarBotonPermisoDispositivo(
            'enableGpsButton',
            'GPS',
            await consultarEstadoPermisoDispositivo('geolocation')
        );
    }

    if (!navigator.mediaDevices?.getUserMedia) {
        actualizarBotonPermisoDispositivo('enableCameraButton', 'Cámara', 'unsupported');
    } else {
        actualizarBotonPermisoDispositivo(
            'enableCameraButton',
            'Cámara',
            await consultarEstadoPermisoDispositivo('camera')
        );
    }
}

function solicitarPermisoGps() {
    if (!('geolocation' in navigator)) {
        actualizarBotonPermisoDispositivo('enableGpsButton', 'GPS', 'unsupported');
        actualizarEstadoSincronizacion('GPS no disponible', 'warning');
        return;
    }

    const boton = obtenerElemento('enableGpsButton');
    if (boton) {
        boton.disabled = true;
        boton.querySelector('span').textContent = 'Solicitando GPS';
    }

    navigator.geolocation.getCurrentPosition(
        () => {
            actualizarBotonPermisoDispositivo('enableGpsButton', 'GPS', 'granted');
            actualizarEstadoSincronizacion('GPS activo', 'success');
        },
        error => {
            const bloqueado = error.code === error.PERMISSION_DENIED;
            actualizarBotonPermisoDispositivo(
                'enableGpsButton',
                'GPS',
                bloqueado ? 'denied' : 'prompt',
                bloqueado ? '' : 'No se pudo obtener la ubicación. Puedes intentarlo nuevamente.'
            );
            actualizarEstadoSincronizacion(
                bloqueado ? 'GPS bloqueado' : 'GPS sin respuesta',
                'warning'
            );
        },
        { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 }
    );
}

async function solicitarPermisoCamara() {
    if (!navigator.mediaDevices?.getUserMedia) {
        actualizarBotonPermisoDispositivo('enableCameraButton', 'Cámara', 'unsupported');
        actualizarEstadoSincronizacion('Cámara no disponible', 'warning');
        return;
    }

    const boton = obtenerElemento('enableCameraButton');
    if (boton) {
        boton.disabled = true;
        boton.querySelector('span').textContent = 'Solicitando cámara';
    }

    let flujo = null;
    try {
        flujo = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        actualizarBotonPermisoDispositivo('enableCameraButton', 'Cámara', 'granted');
        actualizarEstadoSincronizacion('Cámara activa', 'success');
    } catch (error) {
        const bloqueado = ['NotAllowedError', 'SecurityError'].includes(error?.name);
        actualizarBotonPermisoDispositivo(
            'enableCameraButton',
            'Cámara',
            bloqueado ? 'denied' : 'prompt',
            bloqueado ? '' : 'No se pudo abrir la cámara. Revisa que no esté siendo utilizada por otra aplicación.'
        );
        actualizarEstadoSincronizacion(
            bloqueado ? 'Cámara bloqueada' : 'Cámara sin respuesta',
            'warning'
        );
    } finally {
        flujo?.getTracks().forEach(track => track.stop());
    }
}
