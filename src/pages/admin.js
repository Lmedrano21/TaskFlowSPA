/**
 * Página de Administración
 * 
 * Esta página es exclusiva para usuarios con rol ADMIN.
 * Permite crear técnicos, gestionar usuarios y asignar tickets.
 * 
 * Responsabilidades:
 * - Verificar que el usuario es ADMIN
 * - Crear nuevos técnicos
 * - Listar todos los técnicos
 * - Listar todos los tickets
 * - Asignar tickets a técnicos
 * - Eliminar técnicos y usuarios
 * - Control de acceso basado en roles
 */

import { loadHTML } from '../utils/helpers.js';
import { store } from '../services/session.js';
import { navigateTo } from '../main.js';
import { api } from '../services/api.js';

/**
 * Renderiza la página de administración
 * 
 * Esta función:
 * 1. Verifica que el usuario está autenticado
 * 2. Verifica que el usuario tiene rol ADMIN
 * 3. Carga el HTML de la vista admin
 * 4. Carga la lista de técnicos
 * 5. Carga todos los tickets
 * 6. Configura los listeners para gestión
 */
export async function renderAdmin() {
    // Verificar que el usuario está autenticado
    if (!store.isLoged) {
        navigateTo('/login');
        return;
    }

    // Verificar que el usuario tiene rol ADMIN
    if (store.user.role !== 'ADMIN') {
        alert('No tienes permisos para acceder a esta página');
        navigateTo('/dashboard');
        return;
    }

    const content = document.getElementById('content');
    content.innerHTML = await loadHTML('./src/views/admin.html');

    // Cargar técnicos
    await loadAllTechnicians();

    // Cargar todos los tickets
    await loadAllTickets();

    // Configurar listeners
    setupAdminEventListeners();
}

/**
 * Carga y renderiza todos los técnicos del sistema
 * 
 * Obtiene la lista de técnicos y los muestra en una tabla,
 * permitiendo al admin visualizar y eliminar técnicos
 */
async function loadAllTechnicians() {
    try {
        const technicians = await api.getAllTechnicians();
        
        const techniciansContainer = document.getElementById('technicians-container');
        if (!techniciansContainer) return;

        if (technicians.length === 0) {
            techniciansContainer.innerHTML = '<p class="text-slate-600">No hay técnicos registrados. Crea uno nuevo.</p>';
            return;
        }

        // Renderizar tabla de técnicos
        techniciansContainer.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-blue-100">
                            <th class="text-left px-4 py-3 font-bold text-slate-900">Nombre</th>
                            <th class="text-left px-4 py-3 font-bold text-slate-900">Email</th>
                            <th class="text-left px-4 py-3 font-bold text-slate-900">Estado</th>
                            <th class="text-left px-4 py-3 font-bold text-slate-900">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${technicians.map(tech => `
                            <tr class="border-b border-blue-100">
                                <td class="px-4 py-3 text-slate-900 font-semibold">${tech.name} ${tech.lastname}</td>
                                <td class="px-4 py-3 text-slate-600">${tech.email}</td>
                                <td class="px-4 py-3">
                                    <span class="inline-flex rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm font-semibold">
                                        Activo
                                    </span>
                                </td>
                                <td class="px-4 py-3">
                                    <button class="delete-technician-btn text-sm font-semibold text-red-700 hover:text-red-600" data-tech-id="${tech.id}" data-tech-name="${tech.name}">
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

    } catch (error) {
        console.error('Error cargando técnicos:', error);
        const techniciansContainer = document.getElementById('technicians-container');
        if (techniciansContainer) {
            techniciansContainer.innerHTML = '<p class="text-red-600">Error al cargar técnicos</p>';
        }
    }
}

/**
 * Carga y renderiza todos los tickets del sistema
 * 
 * Obtiene todos los tickets de todos los usuarios
 * para que el admin pueda visualizar la actividad general
 * y asignarlos a técnicos
 */
async function loadAllTickets() {
    try {
        const tickets = await api.getAllTickets();
        const technicians = await api.getAllTechnicians();
        
        const ticketsContainer = document.getElementById('all-tickets-container');
        if (!ticketsContainer) return;

        if (tickets.length === 0) {
            ticketsContainer.innerHTML = '<p class="text-slate-600">No hay tickets registrados</p>';
            return;
        }

        // Renderizar tickets
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
                            <h3 class="mt-2 text-xl font-bold text-slate-900">${ticket.title}</h3>
                            <p class="mt-2 text-slate-600">${ticket.description || ''}</p>
                            <p class="mt-2 text-xs text-slate-500">
                                Usuario ID: ${ticket.userId} • <span class="technician-label">${technicianText}</span> • ${new Date(ticket.createdAt).toLocaleDateString('es-CO')}
                            </p>
                        </div>
                        <div class="flex flex-col gap-3 min-w-[200px]">
                            <div>
                                <label class="text-xs font-bold text-slate-500 mb-1 block">Estado</label>
                                <select class="status-select w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 transition-colors" data-ticket-id="${ticket.id}">
                                    <option value="open" ${ticket.status === 'open' ? 'selected' : ''}>Abierto</option>
                                    <option value="in-progress" ${ticket.status === 'in-progress' ? 'selected' : ''}>En proceso</option>
                                    <option value="closed" ${ticket.status === 'closed' ? 'selected' : ''}>Cerrado</option>
                                </select>
                            </div>
                            <div>
                                <label class="text-xs font-bold text-slate-500 mb-1 block">Técnico</label>
                                <select class="technician-select w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 transition-colors" data-ticket-id="${ticket.id}">
                                    <option value="">Sin asignar</option>
                                    ${technicians.map(tech => `
                                        <option value="${tech.id}" ${ticket.technicianId === tech.id ? 'selected' : ''}>
                                            ${tech.name} ${tech.lastname}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

    } catch (error) {
        console.error('Error cargando tickets:', error);
    }
}

/**
 * Configura los listeners de los eventos del admin
 * 
 * Maneja:
 * - Creación de nuevos técnicos
 * - Eliminación de técnicos
 * - Asignación de tickets a técnicos
 * - Recarga de datos después de cambios
 */
function setupAdminEventListeners() {
    // Listener para crear técnico
    const createTechBtn = document.getElementById('create-tech-btn');
    if (createTechBtn) {
        createTechBtn.addEventListener('click', async () => {
            const name = prompt('Nombre del técnico:');
            if (!name) return;

            const lastname = prompt('Apellido del técnico:');
            if (!lastname) return;

            const email = prompt('Email del técnico:');
            if (!email) return;

            const password = prompt('Contraseña del técnico (mínimo 6 caracteres):');
            if (!password || password.length < 6) {
                alert('La contraseña debe tener al menos 6 caracteres');
                return;
            }

            try {
                await api.createTechnician({ name, lastname, email, password });
                alert('Técnico creado correctamente');
                await loadAllTechnicians();
            } catch (error) {
                alert('Error al crear técnico: ' + error.message);
            }
        });
    }

    // Listener para eliminar técnico
    const techniciansContainer = document.getElementById('technicians-container');
    if (techniciansContainer) {
        techniciansContainer.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-technician-btn')) {
                const techId = e.target.getAttribute('data-tech-id');
                const techName = e.target.getAttribute('data-tech-name');
                
                if (confirm(`¿Estás seguro de que deseas eliminar al técnico ${techName}?`)) {
                    try {
                        await api.deleteUser(techId);
                        alert('Técnico eliminado correctamente');
                        await loadAllTechnicians();
                    } catch (error) {
                        alert('Error al eliminar técnico: ' + error.message);
                    }
                }
            }
        });
    }

    // Listener para cambios en tickets (estado y técnico)
    const ticketsContainer = document.getElementById('all-tickets-container');
    if (ticketsContainer) {
        ticketsContainer.addEventListener('change', async (e) => {
            // Cambio de estado
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

            // Asignación de técnico
            if (e.target.classList.contains('technician-select')) {
                const selectElement = e.target;
                const ticketId = selectElement.getAttribute('data-ticket-id');
                const newTechnicianId = selectElement.value;
                const selectedOption = selectElement.options[selectElement.selectedIndex];
                
                try {
                    const technicianId = newTechnicianId ? newTechnicianId : null;
                    await api.updateTicket(ticketId, { technicianId });
                    
                    // Actualizar el DOM localmente sin recargar la lista
                    const article = selectElement.closest('article');
                    if (article) {
                        const technicianLabel = article.querySelector('.technician-label');
                        if (technicianLabel) {
                            technicianLabel.textContent = technicianId ? `Asignado a: ${selectedOption.text.trim()}` : 'Sin asignar';
                        }
                    }
                } catch (error) {
                    alert('Error al asignar técnico: ' + error.message);
                }
            }
        });
    }
}

