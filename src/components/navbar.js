/**
 * Navbar Component
 */
import { store } from '../services/session.js';
import { navigateTo } from '../main.js';

export async function loadNavbarHome() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    // Generamos el contenido dinámicamente según el estado de sesión
    navbar.innerHTML = `
        <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <a class="text-xl font-black text-blue-900" href="/" data-link>TicketFlowSPA</a>
            <nav class="hidden gap-3 md:flex">
                <a class="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white" href="/" data-link>Home</a>
                
                ${!store.isLoged ? `
                    <a class="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700" href="/login" data-link>Login</a>
                    <a class="rounded-full px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50" href="/register" data-link>Register</a>
                ` : `
                    <a class="rounded-full px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50" href="/dashboard" data-link>Dashboard</a>
                    <button id="logout-btn" class="rounded-full px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">Logout</button>
                `}
            </nav>
        </div>
    `;

    // Agregamos el listener al botón de logout si existe
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            store.onLogout();
            navigateTo('/login');
        });
    }
}