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
import { store } from './services/session.js'; // Importa el store


/**
 * Rutas disponibles
 */
const routes = {
    '/login': renderLogin,
    '/': renderHome,  /** ruta principal y por eso solo tiene un solo / */
    '/register': renderRegister,
    '/dashboard': renderDashboard,
    '/not-found': renderNotFound,
};

/**
 * Rutas que requieren autenticación.
 * Añade aquí todas las rutas que solo deben ser accesibles para usuarios logueados.
 */
const privateRoutes = ['/dashboard'];

/**
 * Carga el navbar según la ruta
 */
async function loadNavbarByPath(path) {
    // Solo cargar navbarHome en la ruta raíz
    if (path === '/') {
        await loadNavbarHome();
    } else if (store.isLoged) {
        // Si el usuario está autenticado, podrías cargar un navbar diferente o el mismo
        // con opciones para usuarios logueados. Por ahora, cargamos el mismo.
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
    store.loadData(); // <--- CRITICO: Carga los datos del localStorage al store antes de validar

    const path = window.location.pathname;

    // --- Implementación de Guards de Ruta ---
    const authenticated = store.isLoged;

    // Si el usuario está autenticado y trata de acceder a /login o /register, redirige a /dashboard
    if ((path === '/login' || path === '/register') && authenticated) {
        window.history.pushState({}, '', '/dashboard');
        await router(); // Vuelve a ejecutar el router con la nueva ruta
        return;
    }

    // Si la ruta es privada y el usuario NO está autenticado, redirige a /login
    if (privateRoutes.includes(path) && !authenticated) {
        window.history.pushState({}, '', '/home');
        await router(); // Vuelve a ejecutar el router con la nueva ruta
        return;
    }
    // --- Fin de Guards de Ruta ---

    // Cargar navbar según la ruta
    await loadNavbarByPath(path);

    // Busca render
    const render = routes[path];
    if (render) {
        await render();
    } else {
        // Si la ruta no se encuentra, renderiza la página 404
        await routes['/not-found']();
    }
}