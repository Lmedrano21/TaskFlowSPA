/**
 * Router SPA
 * 
 * Este módulo gestiona la navegación del lado del cliente usando History API.
 * Define todas las rutas disponibles, rutas privadas (que requieren autenticación),
 * y los guards para proteger el acceso a ciertas páginas.
 * 
 * Características principales:
 * - Navegación SPA sin recargas de página
 * - Guardias de rutas para autenticación
 * - Redirección automática de usuarios no autorizados
 * - Carga de navbar según la ruta actual
 */

import { loadHTML } from './utils/helpers.js';

// Importar páginas/vistas
import { renderLogin } from './pages/login.js';
import { renderHome } from './pages/home.js';
import { renderRegister } from './pages/register.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderTickets } from './pages/tickets.js';
import { renderTicketForm } from './pages/ticket-form.js';
import { renderProfile } from './pages/profile.js';
import { renderAdmin } from './pages/admin.js';
import { renderNotFound } from './pages/not-found.js';

// Importar componentes
import { loadNavbarHome } from './components/navbar.js';

// Importar servicios
import { store } from './services/session.js';


/**
 * Definición de todas las rutas disponibles en la aplicación
 * 
 * Mapa de rutas que asocia paths con sus funciones render correspondientes.
 * Las claves son las rutas (pathname), y los valores son las funciones
 * que renderizarán el contenido en el elemento #content
 */
const routes = {
    '/': renderHome,                  // Ruta principal - pública
    '/login': renderLogin,             // Login - pública (redirige si autenticado)
    '/register': renderRegister,       // Registro - pública (redirige si autenticado)
    '/dashboard': renderDashboard,     // Dashboard - privada
    '/tickets': renderTickets,         // Listado de tickets - privada
    '/ticket-form': renderTicketForm,  // Formulario de tickets - privada
    '/profile': renderProfile,         // Perfil del usuario - privada
    '/admin': renderAdmin,             // Panel administrativo - privada (solo ADMIN)
    '/not-found': renderNotFound,      // Página 404 - pública
};

/**
 * Rutas que requieren autenticación
 * 
 * Cualquier ruta en este array solo será accesible para usuarios
 * autenticados. Si un usuario no autenticado intenta acceder,
 * será redirigido a /home
 */
const privateRoutes = [
    '/dashboard',
    '/tickets',
    '/ticket-form',
    '/profile'
];

/**
 * Rutas que requieren rol específico (ADMIN)
 * 
 * Estas rutas solo son accesibles para usuarios con rol ADMIN.
 * La verificación de rol se realiza en la función render correspondiente.
 */
const adminRoutes = ['/admin'];

/**
 * Carga el navbar según la ruta actual
 * 
 * Esta función determina qué navbar mostrar basándose en:
 * - La ruta actual
 * - El estado de autenticación del usuario
 * - El rol del usuario
 * 
 * @param {string} path - La ruta actual (pathname)
 */
async function loadNavbarByPath(path) {
    const navbarContainer = document.getElementById('navbar');
    if (!navbarContainer) return;

    // Mostrar navbar siempre en la mayoría de rutas
    // (la navbar se adapta dinámicamente según el estado de autenticación)
    if (path === '/' || privateRoutes.includes(path) || adminRoutes.includes(path)) {
        await loadNavbarHome();
    } else {
        // Limpiar navbar en rutas de autenticación
        navbarContainer.innerHTML = '';
    }
}

/**
 * Función principal del Router SPA
 * 
 * Orquesta la navegación de la aplicación:
 * 1. Carga datos de sesión desde localStorage
 * 2. Obtiene la ruta actual
 * 3. Valida permisos (autenticación y rol)
 * 4. Redirige si es necesario
 * 5. Carga el navbar apropiado
 * 6. Renderiza la página correspondiente
 * 
 * Guards implementados:
 * - Si estás autenticado y accedes a /login o /register → redirige a /dashboard
 * - Si accedes a ruta privada sin autenticación → redirige a /home
 * - Si accedes a /admin sin ser ADMIN → redirige a /dashboard
 */
export async function router() {
    // CRITICO: Cargar datos del localStorage al store antes de validar permisos
    store.loadData();

    // Obtener la ruta actual
    const path = window.location.pathname;

    // Obtener estado de autenticación
    const authenticated = store.isLoged;
    const userRole = store.user?.role;

    // ═════════════════════════════════════════════════════════════════
    // SECCIÓN: GUARDS DE RUTA - Validación de permisos
    // ═════════════════════════════════════════════════════════════════

    /**
     * Guard 1: Si está autenticado y trata de acceder a /login o /register
     * → Redirige automáticamente a /dashboard
     * 
     * Razón: Evitar que usuarios logueados vean las pantallas de autenticación
     */
    if ((path === '/login' || path === '/register') && authenticated) {
        window.history.pushState({}, '', '/dashboard');
        await router(); // Vuelve a ejecutar el router con la nueva ruta
        return;
    }

    /**
     * Guard 2: Si la ruta es privada y NO está autenticado
     * → Redirige a /home (no a /login para permitir exploración)
     * 
     * Razón: Proteger rutas que requieren autenticación
     */
    if (privateRoutes.includes(path) && !authenticated) {
        window.history.pushState({}, '', '/home');
        await router(); // Vuelve a ejecutar el router con la nueva ruta
        return;
    }

    /**
     * Guard 3: Si trata de acceder a /admin sin ser ADMIN
     * → Redirige a /dashboard
     * 
     * Razón: Proteger rutas administrativas
     */
    if (adminRoutes.includes(path) && userRole !== 'ADMIN') {
        window.history.pushState({}, '', '/dashboard');
        await router(); // Vuelve a ejecutar el router con la nueva ruta
        return;
    }

    // ═════════════════════════════════════════════════════════════════
    // Cargar navbar apropiado según la ruta
    await loadNavbarByPath(path);

    // ═════════════════════════════════════════════════════════════════
    // SECCIÓN: RENDERIZADO
    // ═════════════════════════════════════════════════════════════════

    // Buscar la función render para la ruta actual
    const render = routes[path];

    if (render) {
        // Ruta encontrada → ejecutar su función render
        await render();
    } else {
        // Ruta no encontrada → mostrar página 404
        await routes['/not-found']();
    }
}