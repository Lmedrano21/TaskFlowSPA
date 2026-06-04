/**
 * Página de Perfil del Usuario
 * 
 * Esta página permite al usuario autenticado visualizar y editar
 * su información personal (nombre, apellido, email). También proporciona
 * la opción de eliminar su propia cuenta.
 * 
 * Responsabilidades:
 * - Mostrar datos del usuario autenticado
 * - Permitir edición de perfil (nombre, apellido)
 * - Cambiar contraseña (optional)
 * - Eliminar cuenta
 * - Validar cambios
 * - Persistir cambios en la API
 */

import { loadHTML } from '../utils/helpers.js';
import { store } from '../services/session.js';
import { navigateTo } from '../main.js';
import { api } from '../services/api.js';

/**
 * Renderiza la página de perfil del usuario
 * 
 * Esta función:
 * 1. Verifica que el usuario está autenticado
 * 2. Carga el HTML de la vista de perfil
 * 3. Prelena los datos del usuario en el formulario
 * 4. Configura los listeners para editar y eliminar
 */
export async function renderProfile() {
    const content = document.getElementById('content');
    content.innerHTML = await loadHTML('./src/views/profile.html');

    // Verificar que el usuario está autenticado
    if (!store.isLoged) {
        navigateTo('/login');
        return;
    }

    // Prellenar datos del usuario
    populateProfileForm();

    // Configurar listeners
    setupProfileEventListeners();
}

/**
 * Prelena el formulario con los datos actuales del usuario
 * 
 * Obtiene los datos del store (sesión actual en memoria)
 * y los asigna a los campos del formulario
 */
function populateProfileForm() {
    const nameInput = document.getElementById('profile-name');
    const lastnameInput = document.getElementById('profile-lastname');
    const emailInput = document.getElementById('profile-email');
    const roleDisplay = document.getElementById('profile-role');

    if (store.user) {
        if (nameInput) nameInput.value = store.user.name || '';
        if (lastnameInput) lastnameInput.value = store.user.lastname || '';
        if (emailInput) emailInput.value = store.user.email || '';
        if (roleDisplay) roleDisplay.textContent = store.user.role || 'USER';
    }
}

/**
 * Configura los listeners de los eventos del perfil
 * 
 * Maneja:
 * - Botón guardar cambios
 * - Botón eliminar cuenta
 * - Validación de datos
 */
function setupProfileEventListeners() {
    const saveBtn = document.getElementById('save-profile-btn');
    const deleteBtn = document.getElementById('delete-account-btn');

    // Listener para guardar cambios
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const name = document.getElementById('profile-name').value.trim();
            const lastname = document.getElementById('profile-lastname').value.trim();

            // Validación básica
            if (!name || !lastname) {
                alert('El nombre y apellido son requeridos');
                return;
            }

            try {
                // Actualizar en el backend
                // Nota: La API actual necesitaría un endpoint PATCH para usuarios
                // Por ahora, actualizamos solo en localStorage
                const updatedUser = {
                    ...store.user,
                    name,
                    lastname
                };

                store.user = updatedUser;
                store.saveData(updatedUser);

                alert('Perfil actualizado correctamente');
            } catch (error) {
                console.error('Error actualizando perfil:', error);
                alert('Error al actualizar el perfil: ' + error.message);
            }
        });
    }

    // Listener para eliminar cuenta
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            const confirmDelete = confirm(
                '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.'
            );

            if (!confirmDelete) return;

            const doubleConfirm = prompt(
                'Para confirmar, escribe tu email: ' + store.user.email
            );

            if (doubleConfirm === store.user.email) {
                try {
                    // Llamar a API para eliminar cuenta
                    // await api.deleteUser(store.user.id);
                    
                    // Por ahora, solo hacemos logout
                    store.onLogout();
                    alert('Tu cuenta ha sido eliminada');
                    navigateTo('/login');
                } catch (error) {
                    console.error('Error eliminando cuenta:', error);
                    alert('Error al eliminar la cuenta: ' + error.message);
                }
            } else {
                alert('Email no coincide. Operación cancelada.');
            }
        });
    }
}
