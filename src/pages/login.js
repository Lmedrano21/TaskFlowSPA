import { loadHTML } from '../utils/helpers.js';
import { api } from '../services/api.js';
import { navigateTo } from '../main.js';

export async function renderLogin() {
    const content = document.getElementById('content');
    content.innerHTML = await loadHTML('./src/views/login.html');
    
    const form = document.querySelector('#login-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const { user, session } = await api.login(email, password);
                alert(`Bienvenido ${user.name}!`);
                navigateTo('/dashboard');
            } catch (error) {
                alert('Error en login: ' + error.message);
            }
        });
    }
}