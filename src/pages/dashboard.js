/**
 * Página de Dashboard (Inicio Sesión)
 * 
 * Página privada que muestra un resumen de la actividad del usuario autenticado.
 * Solo accesible para usuarios logueados.
 * 
 * Contenido:
 * - Bienvenida personalizada con nombre del usuario REAL
 * - Estadísticas dinámicas (tickets activos, completados, pendientes hoy)
 * - Accesos rápidos a funciones principales
 * 
 * Responsabilidades:
 * - Renderizar información personalizada del usuario desde el store
 * - Cargar y mostrar estadísticas reales de tickets de la API
 * - Proporcionar navegación rápida a tickets y perfil
 */

import { loadHTML } from '../utils/helpers.js';
import { store } from '../services/session.js';
import { api } from '../services/api.js';
import { navigateTo } from '../main.js';

/**
 * Renderiza el dashboard
 * 
 * Carga el HTML del dashboard y luego:
 * 1. Carga datos del usuario autenticado del store
 * 2. Carga tickets del usuario de la API
 * 3. Calcula estadísticas dinámicas
 * 4. Actualiza el HTML con la información real
 */
export async function renderDashboard() {
    const content = document.getElementById('content');
    content.innerHTML = await loadHTML('./src/views/dashboard.html');

    // Verificar autenticación
    if (!store.isLoged || !store.user) {
        navigateTo('/login');
        return;
    }

    // Cargar datos dinámicos
    await loadDashboardData();
}

/**
 * Carga los datos del dashboard de forma dinámica
 * 
 * Obtiene:
 * - Nombre del usuario del store
 * - Tickets del usuario de la API
 * - Calcula estadísticas
 * - Actualiza el DOM con valores reales
 */
async function loadDashboardData() {
    try {
        // Obtener nombre y datos del usuario
        const userName = store.user.name;
        const userLastName = store.user.lastname;
        
        // Actualizar encabezado con bienvenida personalizada
        const welcomeTitle = document.querySelector('h1');
        if (welcomeTitle) {
            welcomeTitle.textContent = `Bienvenida, ${userName}.`;
        }

        // Obtener tickets basados en el rol
        let userTickets = [];
        if (store.user.role === 'ADMIN') {
            userTickets = await api.getAllTickets();
        } else if (store.user.role === 'TECHNICIAN') {
            userTickets = await api.getTicketsForTechnician(store.user.id);
        } else {
            userTickets = await api.getTickets();
        }

        // Calcular estadísticas
        const openTickets = userTickets.filter(t => t.status === 'open').length;
        const closedTickets = userTickets.filter(t => t.status === 'closed').length;
        
        // Contar tickets creados hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const createdToday = userTickets.filter(t => {
            const ticketDate = new Date(t.createdAt);
            ticketDate.setHours(0, 0, 0, 0);
            return ticketDate.getTime() === today.getTime();
        }).length;

        // Actualizar estadísticas en el DOM
        const statCards = document.querySelectorAll('article p:nth-child(2)');
        
        if (statCards.length >= 3) {
            // Primera tarjeta: Tickets abiertos
            const openCard = statCards[0];
            if (openCard.nextElementSibling) {
                openCard.nextElementSibling.textContent = openTickets;
            }

            // Segunda tarjeta: Completados
            const closedCard = statCards[1];
            if (closedCard.nextElementSibling) {
                closedCard.nextElementSibling.textContent = closedTickets;
            }

            // Tercera tarjeta: Creados hoy
            const todayCard = statCards[2];
            if (todayCard.nextElementSibling) {
                todayCard.nextElementSibling.textContent = createdToday;
            }
        }

    } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
        alert('Error al cargar los datos del dashboard');
    }
}

