/**
 * Página de Registro (Register)
 * 
 * Formulario para que nuevos usuarios se registren en la aplicación como USER.
 * Captura nombre, apellido, email y contraseña.
 * El rol siempre es USER, los técnicos son creados por admin.
 * 
 * Responsabilidades:
 * - Cargar el formulario de registro
 * - Validar datos del formulario en cliente
 * - Enviar datos a la API para crear nuevo usuario (siempre como USER)
 * - Redirigir a login después de registro exitoso
 * - Mostrar mensajes de error si algo falla
 */

import { loadHTML } from '../utils/helpers.js';
import { api } from '../services/api.js';
import { navigateTo } from '../main.js';

/**
 * Renderiza la página de registro
 * 
 * Proceso:
 * 1. Carga el HTML de la vista register
 * 2. Busca el formulario en el DOM
 * 3. Agrega listener para manejar el submit
 * 4. El listener enviará datos a la API como USER
 */
export async function renderRegister() {
    const content = document.getElementById('content');
    content.innerHTML = await loadHTML('./src/views/register.html');
    
    /**
     * Configurar listener del formulario de registro
     * 
     * Se ejecuta cuando el usuario hace submit del formulario.
     * Recopila datos, valida y envía a la API.
     */
    const form = document.querySelector('#register-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();  // Prevenir recarga de página
            
            /**
             * Obtener valores del formulario
             * 
             * Los IDs deben coincidir con los del HTML:
             * - register-name: nombre del usuario
             * - register-lastname: apellido del usuario
             * - register-email: email único
             * - register-password: contraseña
             */
            const userData = {
                name: document.getElementById('register-name').value,
                lastname: document.getElementById('register-lastname').value,
                email: document.getElementById('register-email').value,
                password: document.getElementById('register-password').value
            };
            
            try {
                /**
                 * Enviar datos a la API
                 * 
                 * api.register() realiza:
                 * 1. Fetch POST a /users con role=USER automáticamente
                 * 2. Envía userData como JSON
                 * 3. Retorna usuario creado (sin contraseña)
                 */
                const user = await api.register(userData);
                alert('Registro exitoso! Ahora puedes iniciar sesión');
                navigateTo('/login');  // Redirigir a login
            } catch (error) {
                alert('Error en registro: ' + error.message);
            }
        });
    }
}