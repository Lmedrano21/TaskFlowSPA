# TicketFlowSPA

TicketFlowSPA es una aplicación web tipo SPA (Single Page Application) construida con JavaScript Vanilla, HTML, CSS y Tailwind CSS. Es un sistema moderno de gestión de tickets de soporte técnico que sirve como base práctica de arquitectura frontend modular, sin depender de frameworks como React, Vue o Angular.

La aplicación utiliza enrutamiento del lado del cliente (History API) para navegar entre vistas sin recargas de página, integrando autenticación, autorización por roles, protección de rutas, renderizado dinámico y persistencia de datos mediante un backend simulado con `json-server`.

La sesión activa del usuario se maneja mediante `localStorage`, y `json-server` proporciona una API REST local para los datos persistentes del sistema.

## Objetivo del proyecto

Este proyecto fue diseñado para demostrar fundamentos clave del desarrollo frontend moderno:

- Enrutamiento SPA sin recargas completas.
- Arquitectura frontend modular y en capas.
- Separación de responsabilidades.
- Manejo de estado de sesión.
- Guards y protección de rutas.
- Interfaz dinámica e interactiva manipulando el DOM localmente.
- Uso de utilidades CSS con Tailwind CSS.

## Arquitectura

El proyecto está organizado en una arquitectura por capas (`layered architecture`), separando la aplicación por responsabilidades para facilitar su mantenimiento y escalabilidad:

- `src/main.js`: Punto de entrada que inicializa el enrutador.
- `src/router.js`: Gestiona la navegación, rutas públicas/privadas y validación de permisos.
- `src/views/`: Contiene las plantillas HTML (Login, Dashboard, Tickets, etc.).
- `src/pages/`: Controladores JavaScript asociados a cada vista (lógica de interfaz).
- `src/components/`: Piezas de UI compartidas como la barra de navegación.
- `src/services/`: Capa de comunicación de datos (`api.js` y `session.js`).
- `src/utils/`: Utilidades generales (`helpers.js`).

## Stack Tecnológico

- **Frontend:** JavaScript Vanilla, HTML5, CSS3.
- **Estilos:** Tailwind CSS v4.
- **Herramientas:** Vite (Bundler y servidor de desarrollo).
- **Backend Simulado:** JSON Server.

## Características Principales

- **Gestión de Usuarios:** Registro e inicio de sesión.
- **Roles y Permisos:** Tres niveles de acceso (`ADMIN`, `TECHNICIAN`, `USER`).
- **Navegación SPA fluida:** Renderizado instantáneo de componentes.
- **Gestión de Tickets:** Creación, edición, eliminación y cambio de estados (Abierto, En Proceso, Cerrado).
- **Asignación de Tickets:** Interfaz dinámica para que el administrador asigne técnicos a tickets específicos sin perder el contexto de la página.
- **Dashboard Estadístico:** Visualización de actividad general o personal según el rol del usuario.
- **Protección de Rutas:** Redirecciones automáticas si no hay sesión activa o permisos suficientes.

## Roles del Sistema

### `ADMIN` (Administrador)
- Tiene acceso total al sistema.
- Ve y administra absolutamente todos los tickets creados.
- Asigna técnicos a los tickets en curso.
- Visualiza métricas y listados globales.
- Puede gestionar a los técnicos del sistema.

### `TECHNICIAN` (Técnico)
- Puede ver y gestionar únicamente los tickets que le han sido asignados por el administrador.
- Puede actualizar el estado de los tickets que está trabajando.
- Visualiza estadísticas relacionadas con sus tickets asignados.
- Gestiona su perfil personal.

### `USER` (Usuario Regular)
- Puede crear nuevos tickets de soporte.
- Ve, edita, cambia de estado y elimina exclusivamente sus propios tickets.
- Gestiona su perfil personal.

## Iniciar el Proyecto

Para levantar el entorno completo (servidor de desarrollo Vite y el backend API JSON Server) de forma concurrente, sigue estos pasos:

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Ejecuta el script principal:
   ```bash
   npm run dev:all
   ```

Este comando arrancará `json-server` en el puerto `3000` observando el archivo `db.json` y, al mismo tiempo, levantará el entorno de frontend con Vite.

## Licencia

Este proyecto se distribuye bajo la licencia incluida en el repositorio.



##
##hola

