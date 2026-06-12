// Información de los códigos de emergencia
const codigosEmergencia = {
    'rojo': {
        nombre: 'Código Rojo',
        descripcion: 'Incendio o inflamación de chimeneas',
        color: '#e74c3c',
        icono: '🔥'
    },
    'naranja': {
        nombre: 'Código Naranja',
        descripcion: 'Atrapamiento de personas en elevadores',
        color: '#f39c12',
        icono: '🛗'
    },
    'verde-oscuro': {
        nombre: 'Código 3D',
        descripcion: 'Fugas de gases o derrames de combustibles',
        color: '#1e8449',
        icono: '⛽'
    },
    'azul': {
        nombre: 'Código CAT',
        descripcion: 'Persona necesita atención médica',
        color: '#3498db',
        icono: '🏥'
    },
    'verde': {
        nombre: 'Código Verde',
        descripcion: 'Sismos',
        color: '#27ae60',
        icono: '🌍'
    }
};

// Historial de activaciones
let historial = [];

// Función para activar un código específico
function activarCodigo(codigo) {
    // Desactivar todos los códigos primero
    desactivarTodos();
    
    // Activar el código seleccionado
    const card = document.querySelector(`[data-code="${codigo}"]`);
    if (card) {
        card.classList.add('active');
        
        // Mostrar en el panel de código activo
        const info = codigosEmergencia[codigo];
        const display = document.getElementById('activeCodeDisplay');
        display.innerHTML = `
            <span style="font-size: 3rem; margin-right: 15px;">${info.icono}</span>
            <div>
                <div style="color: ${info.color}; font-size: 1.8rem;">${info.nombre}</div>
                <div style="color: #666; font-size: 1.1rem;">${info.descripcion}</div>
            </div>
        `;
        display.classList.add('has-code');
        
        // Agregar al historial
        agregarAlHistorial(codigo);
        
        // Reproducir sonido de alerta (opcional)
        reproducirSonidoAlerta();
    }
}

// Función para desactivar todos los códigos
function desactivarTodos() {
    const cards = document.querySelectorAll('.code-card');
    cards.forEach(card => {
        card.classList.remove('active');
    });
    
    const display = document.getElementById('activeCodeDisplay');
    display.innerHTML = '<p>Ningún código activo</p>';
    display.classList.remove('has-code');
}

// Función para agregar al historial
function agregarAlHistorial(codigo) {
    const info = codigosEmergencia[codigo];
    const ahora = new Date();
    const tiempo = ahora.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    
    const entrada = {
        codigo: codigo,
        nombre: info.nombre,
        tiempo: tiempo,
        color: info.color
    };
    
    historial.unshift(entrada);
    
    // Limitar el historial a 10 entradas
    if (historial.length > 10) {
        historial.pop();
    }
    
    actualizarHistorialUI();
}

// Función para actualizar la UI del historial
function actualizarHistorialUI() {
    const lista = document.getElementById('historyList');
    lista.innerHTML = '';
    
    historial.forEach(entrada => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="history-time">${entrada.tiempo}</span>
            <span class="history-code" style="background-color: ${entrada.color}">${entrada.nombre}</span>
        `;
        lista.appendChild(li);
    });
}

// Función para limpiar el historial
function limpiarHistorial() {
    historial = [];
    actualizarHistorialUI();
}

// Función para reproducir sonido de alerta (usando Web Audio API)
function reproducirSonidoAlerta() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log('No se pudo reproducir el sonido:', error);
    }
}

// Agregar event listeners para las tarjetas
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.code-card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const codigo = this.getAttribute('data-code');
            activarCodigo(codigo);
        });
    });
    
    // Cargar historial desde localStorage si existe
    const historialGuardado = localStorage.getItem('historialCodigos');
    if (historialGuardado) {
        historial = JSON.parse(historialGuardado);
        actualizarHistorialUI();
    }
});

// Guardar historial en localStorage antes de cerrar
window.addEventListener('beforeunload', function() {
    localStorage.setItem('historialCodigos', JSON.stringify(historial));
});

// Atajos de teclado
document.addEventListener('keydown', function(event) {
    switch(event.key) {
        case '1':
            activarCodigo('rojo');
            break;
        case '2':
            activarCodigo('naranja');
            break;
        case '3':
            activarCodigo('verde-oscuro');
            break;
        case '4':
            activarCodigo('azul');
            break;
        case '5':
            activarCodigo('verde');
            break;
        case '0':
        case 'Escape':
            desactivarTodos();
            break;
    }
});
