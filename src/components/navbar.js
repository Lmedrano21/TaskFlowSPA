/**
 * Componente Navbar (Barra de Navegación)
 * 
 * Renderiza la barra de navegación principal de la aplicación.
 * La navbar se adapta dinámicamente según el estado de autenticación del usuario.
 * 
 * Comportamiento:
 * - Usuario NO autenticado: muestra botones Login y Register
 * - Usuario autenticado: muestra Dashboard, Tickets, Perfil, botón Logout
 * - Usuarios ADMIN: pueden ver el panel de administración
 * 
 * Características:
 * - Responsive (oculta en mobile, visible en desktop)
 * - Indicador visual del color según página actual
 * - Manejo de eventos para logout
 */

import { store } from '../services/session.js';
import { navigateTo } from '../main.js';

/**
 * Renderiza la navbar en el DOM
 * 
 * Busca el elemento #navbar e inserta el HTML dinámicamente.
 * El contenido varía según el estado de autenticación del usuario.
 * 
 * La navbar siempre muestra:
 * - Logo/Marca
 * - Navegación adaptada al estado
 * 
 * Configurador post-render:
 * - Agrega listener al botón logout si existe
 */
export async function loadNavbarHome() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    /**
     * Contenido HTML de la navbar
     * 
     * Template literals con lógica condicional:
     * - Si NO está logueado: muestra Login y Register
     * - Si está logueado: muestra Dashboard, Tickets, Perfil, Logout
     * - Si es ADMIN: obtiene acceso a panel admin (en futuras versiones)
     */
    navbar.innerHTML = `
        <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <!-- Logo/Marca -->
            <a class="text-xl font-black text-blue-900" href="/" data-link>TicketFlowSPA</a>
            
            <!-- Navegación -->
            <nav class="hidden gap-3 md:flex">
                <!-- Home -->
                <a class="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white" href="/" data-link>Home</a>
                
                <!-- Rutas condicionales según autenticación -->
                ${!store.isLoged ? `
                    <!-- Usuario NO autenticado -->
                    <a class="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700" href="/login" data-link>Login</a>
                    <a class="rounded-full px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50" href="/register" data-link>Register</a>
                ` : `
                    <!-- Usuario autenticado -->
                    <a class="rounded-full px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50" href="/dashboard" data-link>Dashboard</a>
                    
                    <!-- Opción de Tickets según rol -->
                    ${store.user?.role === 'USER' ? `
                        <!-- Usuarios regulares ven "Mis Tickets" -->
                        <a class="rounded-full px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50" href="/tickets" data-link>Mis Tickets</a>
                    ` : store.user?.role === 'TECHNICIAN' ? `
                        <!-- Técnicos ven "Tickets Asignados" -->
                        <a class="rounded-full px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50" href="/tickets" data-link>Tickets Asignados</a>
                    ` : ''}
                    
                    <a class="rounded-full px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50" href="/profile" data-link>Perfil</a>
                    
                    <!-- Botón Admin solo para usuarios ADMIN -->
                    ${store.user?.role === 'ADMIN' ? `
                        <a class="rounded-full px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50" href="/admin" data-link>Admin</a>
                    ` : ''}
                    
                    <!-- Botón Logout -->
                    <button id="logout-btn" class="rounded-full px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">Logout</button>
                `}
            </nav>
        </div>
    `;

    /**
     * Configurar listeners post-render
     * 
     * Agrega el event listener al botón logout si existe.
     * El click ejecuta:
     * 1. Logout en el store
     * 2. Redirección a login
     */
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            store.onLogout();
            navigateTo('/login');
        });
    }
}