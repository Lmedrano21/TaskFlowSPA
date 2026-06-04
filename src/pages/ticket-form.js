/**
 * Página de Formulario de Tickets
 * 
 * Esta página permite crear tickets nuevos o editar tickets existentes.
 * Si se accede desde el listado de tickets, carga los datos del ticket
 * a editar. Si se accede directamente, abre el formulario en blanco
 * para crear un nuevo ticket.
 * 
 * Responsabilidades:
 * - Renderizar el formulario de creación/edición
 * - Cargar datos si es modo edición
 * - Validar datos del formulario
 * - Enviar datos a la API
 * - Redirigir después de guardar
 */

import { loadHTML } from '../utils/helpers.js';
import { store } from '../services/session.js';
import { navigateTo } from '../main.js';
import { api } from '../services/api.js';

/**
 * Renderiza la página del formulario de tickets
 * 
 * Esta función:
 * 1. Verifica que el usuario está autenticado
 * 2. Carga el HTML del formulario
 * 3. Revisa si es modo edición (busca ID en sessionStorage)
 * 4. Si es edición, carga los datos del ticket
 * 5. Configura los listeners del formulario
 */
export async function renderTicketForm() {
    const content = document.getElementById('content');
    content.innerHTML = await loadHTML('./src/views/ticket-form.html');

    // Verificar que el usuario está autenticado
    if (!store.isLoged) {
        navigateTo('/login');
        return;
    }

    // Verificar si es modo edición
    const editingTicketId = sessionStorage.getItem('editingTicketId');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('submit-btn');

    if (editingTicketId) {
        // Modo edición
        if (formTitle) formTitle.textContent = 'Editar Ticket';
        if (submitBtn) submitBtn.textContent = 'Actualizar Ticket';
        
        // Cargar datos del ticket
        await loadTicketData(editingTicketId);
        sessionStorage.removeItem('editingTicketId');
    } else {
        // Modo creación
        if (formTitle) formTitle.textContent = 'Crear Nuevo Ticket';
        if (submitBtn) submitBtn.textContent = 'Crear Ticket';
    }

    // Configurar listener del formulario
    setupFormEventListener();
}

/**
 * Carga los datos de un ticket existente en el formulario
 * 
 * @param {string} ticketId - ID del ticket a cargar
 */
async function loadTicketData(ticketId) {
    try {
        const ticket = await api.getTicketById(ticketId);

        if (ticket) {
            document.getElementById('ticket-title').value = ticket.title;
            document.getElementById('ticket-description').value = ticket.description || '';
            document.getElementById('ticket-priority').value = ticket.priority || 'medium';
            
            // Guardar el ID en un atributo data para usar en el submit
            const form = document.getElementById('ticket-form');
            if (form) {
                form.setAttribute('data-ticket-id', ticketId);
            }
        }
    } catch (error) {
        console.error('Error cargando datos del ticket:', error);
        alert('Error al cargar el ticket');
        navigateTo('/tickets');
    }
}

/**
 * Configura el listener del formulario para submit
 * 
 * Maneja:
 * - Validación de campos
 * - Envío de datos a la API (crear o actualizar)
 * - Redirección después de guardar
 * - Manejo de errores
 */
function setupFormEventListener() {
    const form = document.getElementById('ticket-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('ticket-title').value.trim();
        const description = document.getElementById('ticket-description').value.trim();
        const priority = document.getElementById('ticket-priority').value;

        // Validación básica
        if (!title) {
            alert('El título del ticket es requerido');
            return;
        }

        try {
            const ticketId = form.getAttribute('data-ticket-id');

            if (ticketId) {
                // Modo edición
                await api.updateTicket(ticketId, { title, description, priority });
                alert('Ticket actualizado correctamente');
            } else {
                // Modo creación
                await api.createTicket({ title, description, priority });
                alert('Ticket creado correctamente');
            }

            navigateTo('/tickets');
        } catch (error) {
            console.error('Error guardando ticket:', error);
            alert('Error al guardar el ticket: ' + error.message);
        }
    });
}
