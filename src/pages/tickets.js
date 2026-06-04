/**
 * Página de Gestión de Tickets
 * 
 * Esta página permite al usuario autenticado listar todos sus tickets,
 * editar tickets existentes y eliminar tickets. Implementa un CRUD básico
 * restringido al usuario propietario de los tickets.
 * 
 * Responsabilidades:
 * - Cargar y mostrar los tickets del usuario autenticado
 * - Manejar eventos de edición y eliminación de tickets
 * - Navegación a formulario de creación de tickets
 * - Mostrar información del técnico asignado
 */

import { loadHTML } from '../utils/helpers.js';
import { store } from '../services/session.js';
import { navigateTo } from '../main.js';
import { api } from '../services/api.js';

/**
 * Renderiza la página de tickets del usuario
 * 
 * Esta función:
 * 1. Carga el HTML de la vista de tickets
 * 2. Obtiene los tickets del usuario desde la API
 * 3. Configura los listeners para editar y eliminar tickets
 * 4. Muestra información del técnico asignado
 */
export async function renderTickets() {
    const content = document.getElementById('content');
    content.innerHTML = await loadHTML('./src/views/tickets.html');

    // Verificar que el usuario está autenticado
    if (!store.isLoged) {
        navigateTo('/login');
        return;
    }

    // Cargar tickets del usuario
    await loadUserTickets();

    // Configurar eventos de botones
    setupTicketsEventListeners();
}

/**
 * Carga y renderiza los tickets del usuario desde la API
 * 
 * Esta función:
 * - Obtiene los tickets del usuario desde el backend
 * - Las renderiza en el DOM
 * - Maneja errores si no hay tickets
 */
async function loadUserTickets() {
    try {
        let tickets = [];
        if (store.user.role === 'ADMIN') {
            tickets = await api.getAllTickets();
        } else if (store.user.role === 'TECHNICIAN') {
            tickets = await api.getTicketsForTechnician(store.user.id);
        } else {
            tickets = await api.getTickets();
        }
        
        const technicians = await api.getAllTechnicians();
        const ticketsContainer = document.getElementById('tickets-container');
        
        if (!ticketsContainer) return;

        // Si no hay tickets, mostrar mensaje vacío
        if (tickets.length === 0) {
            ticketsContainer.innerHTML = `
                <div class="rounded-3xl border border-blue-100 bg-white p-8 text-center">
                    <p class="text-slate-600">No tienes tickets aún. ¡Crea uno nuevo!</p>
                    <a href="/ticket-form" data-link class="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500 mt-4">
                        Crear primer ticket
                    </a>
                </div>
            `;
            return;
        }

        // Renderizar cada ticket
        ticketsContainer.innerHTML = tickets.map(ticket => {
            const statusColor = ticket.status === 'open' ? 'text-blue-600' : 
                               ticket.status === 'in-progress' ? 'text-yellow-600' : 'text-green-600';
            const statusText = ticket.status === 'open' ? 'Abierto' :
                              ticket.status === 'in-progress' ? 'En proceso' : 'Cerrado';
            
            const technician = technicians.find(t => t.id === ticket.technicianId);
            const technicianText = technician ? `Asignado a: ${technician.name} ${technician.lastname}` : 'Sin asignar';
            
            return `
                <article class="rounded-3xl border border-blue-100 bg-white p-6 shadow-lg shadow-blue-50">
                    <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div class="flex-1">
                            <p class="status-label text-xs font-bold uppercase tracking-[0.25em] ${statusColor}">
                                ${statusText} • ${ticket.priority === 'high' ? 'Prioridad Alta' : ticket.priority === 'medium' ? 'Prioridad Media' : 'Prioridad Baja'}
                            </p>
                            <h2 class="mt-2 text-2xl font-bold text-slate-900">${ticket.title}</h2>
                            <p class="mt-3 max-w-2xl text-slate-600">${ticket.description || ''}</p>
                            <p class="mt-2 text-xs text-slate-500">${new Date(ticket.createdAt).toLocaleDateString('es-CO')} • ${technicianText}</p>
                        </div>
                        <div class="flex flex-col gap-3 min-w-[200px]">
                            <!-- Dropdown de estado -->
                            <div>
                                <label class="text-xs font-bold text-slate-500 mb-1 block">Estado del Ticket</label>
                                <select class="status-select w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 transition-colors" data-ticket-id="${ticket.id}">
                                    <option value="open" ${ticket.status === 'open' ? 'selected' : ''}>Abierto</option>
                                    <option value="in-progress" ${ticket.status === 'in-progress' ? 'selected' : ''}>En proceso</option>
                                    <option value="closed" ${ticket.status === 'closed' ? 'selected' : ''}>Cerrado</option>
                                </select>
                            </div>
                            
                            <!-- Botones de acción -->
                            <div class="flex gap-2 justify-end mt-2">
                                <button 
                                    class="rounded-full border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 edit-ticket"
                                    data-ticket-id="${ticket.id}">
                                    Editar
                                </button>
                                <button 
                                    class="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 delete-ticket"
                                    data-ticket-id="${ticket.id}">
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

    } catch (error) {
        console.error('Error cargando tickets:', error);
        const ticketsContainer = document.getElementById('tickets-container');
        if (ticketsContainer) {
            ticketsContainer.innerHTML = '<p class="text-red-600">Error al cargar tickets</p>';
        }
    }
}

/**
 * Configura los event listeners para los tickets
 * 
 * Maneja:
 * - Botón editar (redirige a formulario)
 * - Botón eliminar ticket
 */
function setupTicketsEventListeners() {
    const ticketsContainer = document.getElementById('tickets-container');
    if (!ticketsContainer) return;
    
    // Evitar listeners duplicados guardando una referencia
    if (ticketsContainer.dataset.hasListener) return;
    ticketsContainer.dataset.hasListener = "true";

    // Listener para eventos de botones en tickets (Eliminar / Editar)
    ticketsContainer.addEventListener('click', async (e) => {
        // Listener para eliminar ticket
        if (e.target.classList.contains('delete-ticket')) {
            const ticketId = e.target.getAttribute('data-ticket-id');
            
            if (confirm('¿Estás seguro de que deseas eliminar este ticket?')) {
                try {
                    await api.deleteTicket(ticketId);
                    await loadUserTickets();
                } catch (error) {
                    alert('Error al eliminar el ticket: ' + error.message);
                }
            }
        }

        // Listener para editar ticket
        if (e.target.classList.contains('edit-ticket')) {
            const ticketId = e.target.getAttribute('data-ticket-id');
            // Guardar el ID del ticket a editar en sessionStorage
            sessionStorage.setItem('editingTicketId', ticketId);
            navigateTo('/ticket-form');
        }
    });

    // Listener para cambiar estado del ticket con el select
    ticketsContainer.addEventListener('change', async (e) => {
        if (e.target.classList.contains('status-select')) {
            const selectElement = e.target;
            const ticketId = selectElement.getAttribute('data-ticket-id');
            const newStatus = selectElement.value;
            
            try {
                await api.updateTicket(ticketId, { status: newStatus });
                
                // Actualizar el DOM localmente sin recargar la lista
                const article = selectElement.closest('article');
                if (article) {
                    const statusLabel = article.querySelector('.status-label');
                    if (statusLabel) {
                        statusLabel.classList.remove('text-blue-600', 'text-yellow-600', 'text-green-600');
                        const statusColor = newStatus === 'open' ? 'text-blue-600' : 
                                           newStatus === 'in-progress' ? 'text-yellow-600' : 'text-green-600';
                        statusLabel.classList.add(statusColor);
                        
                        const statusText = newStatus === 'open' ? 'Abierto' :
                                          newStatus === 'in-progress' ? 'En proceso' : 'Cerrado';
                                          
                        // Mantener la prioridad
                        const currentText = statusLabel.textContent;
                        const priorityMatch = currentText.match(/•(.*)/);
                        const priorityText = priorityMatch ? priorityMatch[1].trim() : '';
                        statusLabel.textContent = `${statusText} • ${priorityText}`;
                    }
                }
            } catch (error) {
                alert('Error al actualizar estado: ' + error.message);
            }
        }
    });
}
