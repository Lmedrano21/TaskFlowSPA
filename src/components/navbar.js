/**
 * Navbar Component
 */

export async function loadNavbarHome() {

    const navbar = document.getElementById('navbar');

    navbar.innerHTML = `
        <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <a class="text-xl font-black text-blue-900" href="/" data-link>TicketFlowSPA</a>
            <nav class="hidden gap-3 md:flex">
            <a class="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white" href="/" data-link>Home</a>
            <a class="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700" href="/login" data-link>Login</a>
            <a class="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700" href="/home" data-link>Logout</a>
            <a class="rounded-full px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50" href="/register" data-link>Register</a>
            <a class="rounded-full px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50" href="/dashboard" data-link>Dashboard</a>
            </nav>
        </div>
        `;
}