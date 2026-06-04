/**
 * Archivo Principal de Entrada (main.js)
 * 
 * Punto de partida de la aplicación SPA.
 * 
 * Responsabilidades:
 * 1. Importar estilos globales
 * 2. Importar y ejecutar el router
 * 3. Configurar event listeners para navegación SPA
 * 4. Proporcionar función navigateTo para cambiar rutas
 * 
 * Flujo de inicialización:
 * 1. Al cargar la página, se dispara 'DOMContentLoaded'
 * 2. Se ejecuta el router para renderizar la página inicial
 * 3. Se configuran listeners para clics en enlaces
 * 4. Se configura listener para navegación con botones atrás/adelante
 */

// Importar estilos globales
import "./styles/global.css";

// Importar componentes necesarios
import { loadNavbarHome } from './components/navbar.js';

// Importar router
import { router } from './router.js';

/**
 * Función para navegar a una ruta
 * 
 * Utiliza History API para cambiar la URL sin recargar la página.
 * Dispara el router para renderizar el contenido de la nueva ruta.
 * 
 * Se utiliza en toda la app cuando se necesita cambiar de página:
 * - Al clickear enlaces internos (data-link)
 * - En formularios después de guardar
 * - En logout
 * - En redirecciones
 * 
 * @param {string} url - Ruta a la que navegar (ej: '/dashboard', '/tasks')
 */
export function navigateTo(url) {
    history.pushState(null, null, url);  // Cambiar URL del navegador
    router();                             // Renderizar contenido de la nueva ruta
}

/**
 * Inicialización de la aplicación
 * 
 * Se ejecuta cuando el DOM está completamente cargado.
 * Configura los listeners iniciales y ejecuta el router por primera vez.
 */
window.addEventListener('DOMContentLoaded', async () => {
    /**
     * Ejecutar router con la URL inicial
     * 
     * Esto renderizará la página correspondiente a la ruta actual.
     * Carga autenticación, permisos y muestra el contenido apropiado.
     */
    router();

    /**
     * Event listener para navegación interna
     * 
     * Detecta clicks en enlaces con atributo data-link.
     * Impide recarga de página y usa navigateTo en su lugar.
     * 
     * Ejemplo de uso en HTML:
     * <a href="/dashboard" data-link>Dashboard</a>
     * 
     * Sin esto, los clics en enlaces causarían recarga completa de página.
     */
    document.body.addEventListener('click', event => {
        const target = event.target;
        if (target.matches('[data-link]')) {
            event.preventDefault();  // Evitar recarga
            navigateTo(target.href);
        }
    });
});

/**
 * Event listener para botones atrás/adelante del navegador
 * 
 * Cuando el usuario usa los botones de historial del navegador,
 * se dispara el evento 'popstate' y debemos re-renderizar la página.
 * 
 * Esto mantiene la experiencia SPA consistente incluso con botones del navegador.
 */
window.addEventListener('popstate', router);