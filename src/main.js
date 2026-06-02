// main.js
import "./styles/global.css";
import { loadNavbarHome } from './components/navbar.js';
import { router } from './router.js';

export function navigateTo(url) {
    history.pushState(null, null, url);
    router();
}

window.addEventListener('DOMContentLoaded', async () => {
    // No cargues navbar aquí, el router se encargará
    router();

    document.body.addEventListener('click', event => {
        const target = event.target;
        if (target.matches('[data-link]')) {
            event.preventDefault();
            navigateTo(target.href);
        }
    });
});

window.addEventListener('popstate', router);