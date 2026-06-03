/**
 * Router SPA
 */
import { loadHTML } from './utils/helpers.js';

import { renderLogin } from './pages/login.js';
import { renderHome } from './pages/home.js';
import { renderRegister } from './pages/register.js';
import { loadNavbarHome } from './components/navbar.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderNotFound } from './pages/not-found.js';


/**
 * Rutas disponibles
 */
const routes = {
    '/login': renderLogin,
    '/': renderHome,
    '/register': renderRegister,
    '/dashboard': renderDashboard,
    '/not-found': renderNotFound,
};

/**
 * Carga el navbar según la ruta
 */
async function loadNavbarByPath(path) {
    // Solo cargar navbarHome en la ruta raíz
    if (path === '/') {
        await loadNavbarHome();
    } else {
        // Para otras rutas (como /login), limpiar o mostrar navbar alternativo
        const navbarContainer = document.getElementById('navbar-container');
        if (navbarContainer) {
            // Opción 1: Limpiar el navbar
            navbarContainer.innerHTML = '';
            
            // Opción 2: Mostrar un navbar diferente
            // navbarContainer.innerHTML = '<nav>Navbar Login</nav>';
        }
    }
}

/**
 * Router principal
 */
export async function router() {
    // Obtiene ruta real
    const path = window.location.pathname;
    
    // Cargar navbar según la ruta
    await loadNavbarByPath(path);
    
    // Busca render
    const render = routes[path];
    if (render) {
        await render();
    } else {
        document.getElementById('content').innerHTML = 
        await loadHTML('./src/views/not-found.html');
    }

}