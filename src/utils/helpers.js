/**
 * Utilidades y Helpers
 * 
 * Módulo con funciones reutilizables en toda la aplicación.
 * Concentra lógica común que no pertenece a servicios específicos.
 * 
 * Funciones disponibles:
 * - loadHTML: carga archivos HTML de forma dinámica
 */

/**
 * Carga un archivo HTML desde una ruta y retorna su contenido
 * 
 * Utilizado para cargar dinámicamente las vistas HTML.
 * El router utilizaEsta función para obtener el contenido de cada vista.
 * 
 * Proceso:
 * 1. Hace fetch al archivo HTML
 * 2. Si es exitoso, devuelve el HTML como string
 * 3. Si hay error, devuelve un mensaje de error genérico
 * 
 * @param {string} path - Ruta relativa al archivo HTML a cargar
 *                       Ej: './src/views/dashboard.html'
 * @returns {Promise<string>} Contenido HTML del archivo
 * 
 * @example
 * const html = await loadHTML('./src/views/dashboard.html');
 * document.getElementById('content').innerHTML = html;
 */
export async function loadHTML(path) {

    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Error cargando HTML: ${path}`);
        }
        return await response.text();
    } catch (error) {
        console.error(error);
        return '<h2>Error cargando contenido</h2>';
    }
}
