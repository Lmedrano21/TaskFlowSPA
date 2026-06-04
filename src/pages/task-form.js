/**
 * Página de Formulario de Tickets
 * 
 * Esta página permite crear tickets nuevas o editar tickets existentes.
 * Si se accede desde el listado de tickets, carga los datos de la ticket
 * a editar. Si se accede directamente, abre el formulario en blanco
 * para crear una nueva ticket.
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
 * 4. Si es edición, carga los datos de la ticket
 * 5. Configura los listeners del formulario
 */
export async function renderTaskForm() {
    const content = document.getElementById('content');
    content.innerHTML = await loadHTML('./src/views/task-form.html');

    // Verificar que el usuario está autenticado
    if (!store.isLoged) {
        navigateTo('/login');
        return;
    }

    // Verificar si es modo edición
    const editingTaskId = sessionStorage.getItem('editingTaskId');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('submit-btn');

    if (editingTaskId) {
        // Modo edición
        if (formTitle) formTitle.textContent = 'Editar Ticket';
        if (submitBtn) submitBtn.textContent = 'Actualizar Ticket';
        
        // Cargar datos de la ticket
        await loadTaskData(editingTaskId);
        sessionStorage.removeItem('editingTaskId');
    } else {
        // Modo creación
        if (formTitle) formTitle.textContent = 'Crear Nueva Ticket';
        if (submitBtn) submitBtn.textContent = 'Crear Ticket';
    }

    // Configurar listener del formulario
    setupFormEventListener();
}

/**
 * Carga los datos de una ticket existente en el formulario
 * 
 * @param {string} taskId - ID de la ticket a cargar
 */
async function loadTaskData(taskId) {
    try {
        const tasks = await api.getTasks();
        const task = tasks.find(t => t.id === taskId);

        if (task) {
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-description').value = task.description || '';
            
            // Guardar el ID en un atributo data para usar en el submit
            const form = document.getElementById('task-form');
            if (form) {
                form.setAttribute('data-task-id', taskId);
            }
        }
    } catch (error) {
        console.error('Error cargando datos de la ticket:', error);
        alert('Error al cargar la ticket');
        navigateTo('/tasks');
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
    const form = document.getElementById('task-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();

        // Validación básica
        if (!title) {
            alert('El título de la ticket es requerido');
            return;
        }

        try {
            const taskId = form.getAttribute('data-task-id');

            if (taskId) {
                // Modo edición
                await api.updateTask(taskId, { title, description });
                alert('Ticket actualizada correctamente');
            } else {
                // Modo creación
                await api.createTask({ title, description });
                alert('Ticket creada correctamente');
            }

            navigateTo('/tasks');
        } catch (error) {
            console.error('Error guardando ticket:', error);
            alert('Error al guardar la ticket: ' + error.message);
        }
    });
}
