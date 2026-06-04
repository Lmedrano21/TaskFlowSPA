/**
 * Página 404 - Página No Encontrada
 * 
 * Se renderiza cuando el usuario intenta acceder a una ruta que no existe.
 * El router la muestra automáticamente cuando no encuentra coincidencia.
 * 
 * Responsabilidades:
 * - Informar al usuario que la página no existe
 * - Proporcionar enlaces para volver a rutas válidas
 * - Mantener consistencia visual con el resto de la app
 */

import { loadHTML } from '../utils/helpers.js';

/**
 * Renderiza la página 404
 * 
 * Muestra un mensaje indicando que la ruta no fue encontrada
 * y proporciona opciones para navegar a rutas válidas.
 */
export async function renderNotFound() {
    const content = document.getElementById('content');
    content.innerHTML = await loadHTML(
        './src/views/not-found.html'
    );
}