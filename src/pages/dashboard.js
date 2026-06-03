renderDashboard
import { loadHTML } from '../utils/helpers.js';

/**
 * Renderiza Dashboard
 */
export async function renderDashboard() {
    const content = document.getElementById('content');
    content.innerHTML = await loadHTML(
        './src/views/dashboard.html'
    );
}

