/**
 * Página de Login (Inicio de Sesión)
 * 
 * Formulario para que usuarios registrados inicien sesión en la aplicación.
 * Valida credenciales contra los datos almacenados en el backend.
 * 
 * Responsabilidades:
 * - Cargar el formulario de login
 * - Manejar el submit del formulario
 * - Validar credenciales con el servicio
 * - Redirigir al dashboard si es exitoso
 * - Mostrar mensaje de error si fallan las credenciales
 */

import { loadHTML } from '../utils/helpers.js';
import { store } from '../services/session.js';
import { navigateTo } from '../main.js';

/**
 * Renderiza la página de login
 * 
 * Proceso:
 * 1. Carga el HTML de la vista login
 * 2. Busca el formulario en el DOM
 * 3. Agrega listener para manejar el submit
 * 4. El listener validará credenciales y redirigirá si es exitoso
 */
export async function renderLogin() {
    const content = document.getElementById('content');
    content.innerHTML = await loadHTML('./src/views/login.html');
    
    /**
     * Configurar listener del formulario
     * 
     * Se ejecuta cuando el usuario hace submit del formulario.
     * Obtiene email y password, los valida con el servicio, y redirige.
     */
    const form = document.querySelector('#login-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();  // Prevenir recarga de página
            
            // Obtener valores del formulario
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            /**
             * Intentar login
             * 
             * onLogin() realiza:
             * 1. Búsqueda en API por email
             * 2. Validación de contraseña
             * 3. Almacenamiento en store si es exitoso
             * 4. Persistencia en localStorage
             */
            const success = await store.onLogin(email, password);
            
            if (success) {
                // Login exitoso
                alert(`Bienvenido ${store.user.name}!`);
                navigateTo('/dashboard');  // Redirigir a dashboard
            } else {
                // Login fallido
                alert('Credenciales inválidas. Inténtalo de nuevo.');
            }
        });
    }
}