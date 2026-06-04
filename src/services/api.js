/**
 * Módulo de API de Tickets
 * 
 * Proporciona un conjunto de métodos para interactuar con el backend (JSON Server).
 * Maneja todas las operaciones CRUD de tickets, gestión de usuarios y técnicos.
 * 
 * IMPORTANTE: Este módulo se sincroniza con el store de sesión.
 * No mantiene su propio estado de autenticación en localStorage.
 * 
 * Características principales:
 * - Autenticación y gestión de sesión (coordinada con store)
 * - Operaciones CRUD para tickets
 * - Creación de técnicos (solo admin)
 * - Gestión de usuarios (registro solo como USER)
 * - URLs dinámicas según entorno (desarrollo/producción)
 */

import { store } from './session.js';

/**
 * URL base de la API
 * 
 * En desarrollo: apunta a localhost:3000 (JSON Server)
 * En producción: apunta a /api (debe ser configurado según el servidor)
 */
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3000'  // Desarrollo con JSON Server
  : '/api';                   // Producción (ajustar según deploy)

/**
 * Objeto api: contiene todos los métodos para comunicación con el backend
 * 
 * Se utiliza como: api.register(), api.login(), api.getTickets(), etc.
 */
export const api = {
  /**
   * Registra un nuevo usuario en el sistema (solo como USER)
   * 
   * @param {Object} userData - Datos del usuario a registrar
   * @param {string} userData.name - Nombre del usuario
   * @param {string} userData.lastname - Apellido del usuario
   * @param {string} userData.email - Email único del usuario
   * @param {string} userData.password - Contraseña del usuario
   * @returns {Promise<Object>} Usuario registrado (sin contraseña, role=USER)
   * @throws {Error} Si hay error en el registro
   */
  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...userData,
        role: 'USER',  // Los usuarios registrados siempre son USER
        createdAt: new Date().toISOString()
      })
    });
    
    if (!response.ok) throw new Error('Error en registro');
    const user = await response.json();
    delete user.password;
    return user;
  },
  
  /**
   * Realiza el login del usuario
   * 
   * Busca el usuario por email y valida la contraseña.
   * Actualiza el store de sesión con los datos del usuario.
   * 
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<Object>} Objeto con {user, session}
   * @throws {Error} Si las credenciales son inválidas
   */
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/users?email=${email}`);
    const users = await response.json();
    
    const user = users.find(u => u.password === password);
    if (!user) throw new Error('Credenciales inválidas');
    
    // Guardar en el store de sesión compartido
    store.user = user;
    store.isLoged = true;
    store.saveData(user);
    
    delete user.password;
    
    return { user };
  },
  
  /**
   * Obtiene todos los tickets del usuario autenticado
   * 
   * Utiliza los datos del store para filtrar tickets del usuario.
   * 
   * @returns {Promise<Array>} Array de tickets del usuario
   * @throws {Error} Si el usuario no está autenticado
   */
  async getTickets() {
    if (!store.isLoged || !store.user) {
      throw new Error('No autenticado');
    }
    
    const response = await fetch(`${API_BASE_URL}/tickets`);
    const allTickets = await response.json();
    return allTickets.filter(t => t.userId === String(store.user.id));
  },
  
  /**
   * Obtiene un ticket específico por su ID
   * 
   * @param {string} id - ID del ticket
   * @returns {Promise<Object>} Ticket encontrado
   */
  async getTicketById(id) {
    const response = await fetch(`${API_BASE_URL}/tickets/${id}`);
    if (!response.ok) throw new Error('Ticket no encontrado');
    return await response.json();
  },
  
  /**
   * Obtiene todos los tickets asignados a un técnico
   * 
   * @param {string} technicianId - ID del técnico
   * @returns {Promise<Array>} Array de tickets asignados
   */
  async getTicketsForTechnician(technicianId) {
    const response = await fetch(`${API_BASE_URL}/tickets`);
    const allTickets = await response.json();
    return allTickets.filter(t => t.technicianId === String(technicianId));
  },
  
  /**
   * Obtiene todos los tickets (solo para admin)
   * 
   * @returns {Promise<Array>} Array de todos los tickets
   */
  async getAllTickets() {
    const response = await fetch(`${API_BASE_URL}/tickets`);
    return await response.json();
  },
  
  /**
   * Crea un nuevo ticket para el usuario autenticado
   * 
   * Agrega automáticamente:
   * - userId del usuario actual
   * - Status inicial: open
   * - Priority: medium (por defecto)
   * - Fecha de creación en formato ISO
   * 
   * @param {Object} ticket - Datos del ticket
   * @param {string} ticket.title - Título del ticket (requerido)
   * @param {string} ticket.description - Descripción del ticket
   * @param {string} ticket.priority - Prioridad: high, medium, low
   * @returns {Promise<Object>} Ticket creado con ID asignado
   * @throws {Error} Si el usuario no está autenticado
   */
  async createTicket(ticket) {
    if (!store.isLoged || !store.user) {
      throw new Error('No autenticado');
    }
    
    const response = await fetch(`${API_BASE_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...ticket,
        userId: store.user.id,
        status: 'open',
        priority: ticket.priority || 'medium',
        createdAt: new Date().toISOString()
      })
    });
    
    return await response.json();
  },
  
  /**
   * Actualiza un ticket existente
   * 
   * Realiza una actualización parcial (PATCH).
   * 
   * @param {string} id - ID del ticket a actualizar
   * @param {Object} updates - Campos a actualizar
   * @returns {Promise<Object>} Ticket actualizado
   */
  async updateTicket(id, updates) {
    const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    
    return await response.json();
  },
  
  /**
   * Elimina un ticket
   * 
   * @param {string} id - ID del ticket a eliminar
   * @returns {Promise<void>}
   */
  async deleteTicket(id) {
    await fetch(`${API_BASE_URL}/tickets/${id}`, {
      method: 'DELETE'
    });
  },
  
  /**
   * Crea un nuevo técnico (solo para admin)
   * 
   * @param {Object} technicianData - Datos del técnico
   * @param {string} technicianData.name - Nombre del técnico
   * @param {string} technicianData.lastname - Apellido del técnico
   * @param {string} technicianData.email - Email único del técnico
   * @param {string} technicianData.password - Contraseña del técnico
   * @returns {Promise<Object>} Técnico creado (sin contraseña, role=TECHNICIAN)
   * @throws {Error} Si hay error en la creación
   */
  async createTechnician(technicianData) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...technicianData,
        role: 'TECHNICIAN',
        createdAt: new Date().toISOString()
      })
    });
    
    if (!response.ok) throw new Error('Error al crear técnico');
    const user = await response.json();
    delete user.password;
    return user;
  },
  
  /**
   * Obtiene todos los técnicos del sistema (solo para admin)
   * 
   * @returns {Promise<Array>} Array de técnicos
   */
  async getAllTechnicians() {
    const response = await fetch(`${API_BASE_URL}/users?role=TECHNICIAN`);
    return await response.json();
  },
  
  /**
   * Obtiene todos los usuarios (solo para admin)
   * 
   * @returns {Promise<Array>} Array de todos los usuarios
   */
  async getAllUsers() {
    const response = await fetch(`${API_BASE_URL}/users`);
    return await response.json();
  },
  
  /**
   * Elimina un usuario (solo para admin)
   * 
   * @param {string} id - ID del usuario a eliminar
   * @returns {Promise<void>}
   */
  async deleteUser(id) {
    await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE'
    });
  }
};