import { loadHTML } from '../utils/helpers.js';
import { api } from '../services/api.js';
import { navigateTo } from '../main.js';

export async function renderRegister() {
    const content = document.getElementById('content');
    content.innerHTML = await loadHTML('./src/views/register.html');
    
    // Agregar funcionalidad al formulario
    const form = document.querySelector('#register-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userData = {
                name: document.getElementById('register-name').value,
                lastname: document.getElementById('register-lastname').value,
                email: document.getElementById('register-email').value,
                password: document.getElementById('register-password').value,
                role: document.getElementById('register-role').value
            };
            
            try {
                const user = await api.register(userData);
                alert('Registro exitoso! Ahora puedes iniciar sesión');
                navigateTo('/login');
            } catch (error) {
                alert('Error en registro: ' + error.message);
            }
        });
    }
}