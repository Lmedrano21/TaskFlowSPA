/**
 * Página de Gestión de Tickets
 * 
 * Esta página permite al usuario autenticado listar todas sus tickets,
 * editar tickets existentes y eliminar tickets. Implementa un CRUD básico
 * restringido al usuario propietario de las tickets.
 * 
 * Responsabilidades:
 * - Cargar y mostrar las tickets del usuario autenticado
 * - Manejar eventos de edición y eliminación de tickets
 * - Navegación a formulario de creación de tickets
 * - Actualización dinámica del estado de tickets (completada/incompleta)
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
 * 2. Obtiene las tickets del usuario desde la API
 * 3. Configura los listeners para editar y eliminar tickets
 * 4. Maneja el cambio de estado (completada/incompleta)
 */
export async function renderTasks() {
    const content = document.getElementById('content');
    content.innerHTML = await loadHTML('./src/views/tasks.html');

    // Verificar que el usuario está autenticado
    if (!store.isLoged) {
        navigateTo('/login');
        return;
    }

    // Cargar tickets del usuario
    await loadUserTasks();

    // Configurar eventos de botones
    setupTasksEventListeners();
}

/**
 * Carga y renderiza las tickets del usuario desde la API
 * 
 * Esta función:
 * - Obtiene las tickets del usuario desde el backend
 * - Las renderiza en el DOM
 * - Maneja errores si no hay tickets
 */
async function loadUserTasks() {
    try {
        const tasks = await api.getTasks();
        const tasksContainer = document.getElementById('tasks-container');
        
        if (!tasksContainer) return;

        // Si no hay tickets, mostrar mensaje vacío
        if (tasks.length === 0) {
            tasksContainer.innerHTML = `
                <div class="rounded-3xl border border-blue-100 bg-white p-8 text-center">
                    <p class="text-slate-600">No tienes tickets aún. ¡Crea una nueva!</p>
                    <a href="/task-form" data-link class="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500 mt-4">
                        Crear primera ticket
                    </a>
                </div>
            `;
            return;
        }

        // Renderizar cada ticket
        tasksContainer.innerHTML = tasks.map(task => `
            <article class="rounded-3xl border border-blue-100 bg-white p-6 shadow-lg shadow-blue-50">
                <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div class="flex-1">
                        <p class="text-xs font-bold uppercase tracking-[0.25em] ${task.completed ? 'text-green-600' : 'text-blue-600'}">
                            ${task.completed ? 'Completada' : 'En progreso'}
                        </p>
                        <h2 class="mt-2 text-2xl font-bold text-slate-900">${task.title}</h2>
                        <p class="mt-3 max-w-2xl text-slate-600">${task.description || ''}</p>
                        <p class="mt-2 text-xs text-slate-500">${new Date(task.createdAt).toLocaleDateString('es-CO')}</p>
                    </div>
                    <div class="flex gap-3">
                        <button 
                            class="rounded-full border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 toggle-task"
                            data-task-id="${task.id}">
                            ${task.completed ? 'Desmarcar' : 'Completar'}
                        </button>
                        <button 
                            class="rounded-full border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 edit-task"
                            data-task-id="${task.id}">
                            Editar
                        </button>
                        <button 
                            class="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 delete-task"
                            data-task-id="${task.id}">
                            Eliminar
                        </button>
                    </div>
                </div>
            </article>
        `).join('');

    } catch (error) {
        console.error('Error cargando tickets:', error);
        const tasksContainer = document.getElementById('tasks-container');
        if (tasksContainer) {
            tasksContainer.innerHTML = '<p class="text-red-600">Error al cargar tickets</p>';
        }
    }
}

/**
 * Configura los event listeners para las tickets
 * 
 * Maneja:
 * - Botón completar/descompletar ticket
 * - Botón editar (redirige a formulario)
 * - Botón eliminar ticket
 */
function setupTasksEventListeners() {
    const tasksContainer = document.getElementById('tasks-container');
    if (!tasksContainer) return;

    // Listener para marcar como completada
    tasksContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('toggle-task')) {
            const taskId = e.target.getAttribute('data-task-id');
            const tasks = await api.getTasks();
            const task = tasks.find(t => t.id === taskId);
            
            if (task) {
                await api.updateTask(taskId, { completed: !task.completed });
                await loadUserTasks();
                setupTasksEventListeners();
            }
        }

        // Listener para eliminar ticket
        if (e.target.classList.contains('delete-task')) {
            const taskId = e.target.getAttribute('data-task-id');
            
            if (confirm('¿Estás seguro de que deseas eliminar esta ticket?')) {
                try {
                    await api.deleteTask(taskId);
                    await loadUserTasks();
                    setupTasksEventListeners();
                } catch (error) {
                    alert('Error al eliminar la ticket: ' + error.message);
                }
            }
        }

        // Listener para editar ticket
        if (e.target.classList.contains('edit-task')) {
            const taskId = e.target.getAttribute('data-task-id');
            // Guardar el ID de la ticket a editar en sessionStorage
            sessionStorage.setItem('editingTaskId', taskId);
            navigateTo('/task-form');
        }
    });
}
