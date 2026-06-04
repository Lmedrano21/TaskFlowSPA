/**
 * Página de Inicio (Home)
 * 
 * Página pública principal de la aplicación.
 * Muestra información general sobre TicketFlowSPA y enlaces de acceso.
 * 
 * Accesible por:
 * - Usuarios no autenticados
 * - Usuarios autenticados (aunque normalmente van directo a dashboard)
 * 
 * Responsabilidades:
 * - Mostrar interfaz principal
 * - Presentar características de la app
 * - Proporcionar enlaces a login/register o al dashboard
 */

import { loadHTML } from '../utils/helpers.js';

/**
 * Renderiza la página de inicio (home)
 * 
 * Simplemente carga el HTML de la vista home y lo inserta en el DOM.
 * No requiere lógica adicional ya que es una página estática.
 */
export async function renderHome() {
    const content = document.getElementById('content');
    content.innerHTML = await loadHTML(
        './src/views/home.html'
    );
}
