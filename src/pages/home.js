import { loadHTML } from '../utils/helpers.js';

/**
 * Renderiza About
 */
export async function renderHome() {
    const content = document.getElementById('content');
    content.innerHTML = await loadHTML(
        './src/views/home.html'
    );
}
