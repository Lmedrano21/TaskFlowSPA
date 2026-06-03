import { loadHTML } from '../utils/helpers.js';
import { store } from '../services/session.js';
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
            
            const success = await store.onLogin(email, password);
            
            if (success) {
                alert(`Bienvenido ${store.user.name}!`);
                navigateTo('/dashboard');
            } else {
                alert('Credenciales inválidas. Inténtalo de nuevo.');
            }
        });
    }
}