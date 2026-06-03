import { loadHTML } from '../utils/helpers.js';

/**
 * Renderiza Not Found
 */
export async function renderNotFound() {
    const content = document.getElementById('content');
    content.innerHTML = await loadHTML(
        './src/views/not-found.html'
    );
}