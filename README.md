# 🚨 Sistema de Códigos de Emergencia

Aplicación web interactiva para visualizar y gestionar códigos de emergencia con colores específicos.

## 📋 Descripción

Esta aplicación permite visualizar diferentes códigos de emergencia utilizados en edificios e instalaciones, cada uno con un color distintivo para facilitar su identificación rápida durante situaciones de emergencia.

## 🎨 Códigos de Emergencia

| Código | Color | Descripción |
|--------|-------|-------------|
| **Código Rojo** | 🔴 Rojo | Incendio o inflamación de chimeneas |
| **Código Naranja** | 🟠 Naranja | Atrapamiento de personas en elevadores |
| **Código 3D** | 🟢 Verde Oscuro | Fugas de gases o derrames de combustibles |
| **Código CAT** | 🔵 Azul | Persona necesita atención médica |
| **Código Verde** | 🟢 Verde | Sismos |

## 🚀 Instalación y Uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- No requiere dependencias adicionales

### Instrucciones

1. **Descargar los archivos**
   - Asegúrate de tener los siguientes archivos en el mismo directorio:
     - `index.html`
     - `styles.css`
     - `script.js`

2. **Abrir la aplicación**
   - Haz doble clic en el archivo `index.html`
   - O arrastra el archivo `index.html` a tu navegador web

3. **Usar la aplicación**
   - Haz clic en cualquier tarjeta de código para activarlo
   - El código activo se mostrará en el panel superior con animación
   - El historial de activaciones se guardará automáticamente

## ⌨️ Atajos de Teclado

- **Tecla 1**: Activar Código Rojo
- **Tecla 2**: Activar Código Naranja
- **Tecla 3**: Activar Código 3D (Verde Oscuro)
- **Tecla 4**: Activar Código CAT (Azul)
- **Tecla 5**: Activar Código Verde
- **Tecla 0 o Escape**: Desactivar todos los códigos

## ✨ Características

- **Interfaz intuitiva**: Diseño moderno y fácil de usar
- **Visualización clara**: Cada código tiene su color distintivo
- **Animaciones**: Efectos visuales al activar códigos
- **Historial**: Registro de las últimas 10 activaciones
- **Persistencia**: El historial se guarda en el navegador
- **Responsive**: Se adapta a diferentes tamaños de pantalla
- **Alertas sonoras**: Sonido de alerta al activar un código

## 📁 Estructura de Archivos

```
codigos/
├── index.html      # Estructura HTML principal
├── styles.css      # Estilos y diseño visual
├── script.js       # Funcionalidad JavaScript
└── README.md       # Documentación
```

## 🎯 Funcionalidades Principales

1. **Activación de códigos**: Clic en tarjetas o atajos de teclado
2. **Panel de código activo**: Muestra el código actualmente activo
3. **Historial de activaciones**: Registro temporal de activaciones
4. **Desactivación masiva**: Botón para desactivar todos los códigos
5. **Limpieza de historial**: Opción para borrar el historial

## 🔧 Personalización

Si deseas modificar los colores o textos, edita los siguientes archivos:

- **Colores y estilos**: `styles.css`
- **Información de códigos**: `script.js` (objeto `codigosEmergencia`)
- **Estructura**: `index.html`

## 📝 Notas Importantes

- La aplicación funciona completamente en el navegador, no requiere servidor
- El historial se guarda en `localStorage` del navegador
- Los sonidos de alerta usan la Web Audio API
- La aplicación es responsive y funciona en dispositivos móviles

## 🤝 Contribuciones

Si deseas agregar más códigos de emergencia o mejorar la funcionalidad, siéntete libre de modificar los archivos según tus necesidades.

## 📄 Licencia

Este proyecto es de código abierto y puede ser utilizado libremente para fines de seguridad y emergencia.

---

**Desarrollado para sistemas de gestión de emergencias**
