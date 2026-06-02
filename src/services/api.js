// Usar variable de entorno para la URL base
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3000'  // Desarrollo con JSON Server
  : '/api';                   // Producción (ajustar según deploy)

export const api = {
  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...userData,
        createdAt: new Date().toISOString()
      })
    });
    
    if (!response.ok) throw new Error('Error en registro');
    const user = await response.json();
    delete user.password;
    return user;
  },
  
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/users?email=${email}`);
    const users = await response.json();
    
    const user = users.find(u => u.password === password);
    if (!user) throw new Error('Credenciales inválidas');
    
    const session = {
      userId: user.id,
      token: btoa(`${user.id}:${Date.now()}`),
      role: user.role,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    };
    
    localStorage.setItem('session', JSON.stringify(session));
    delete user.password;
    
    return { user, session };
  },
  
  logout() {
    localStorage.removeItem('session');
  },
  
  getSession() {
    const session = localStorage.getItem('session');
    if (!session) return null;
    
    const parsed = JSON.parse(session);
    if (parsed.expiresAt < Date.now()) {
      this.logout();
      return null;
    }
    return parsed;
  },
  
  isAuthenticated() {
    return !!this.getSession();
  },
  
  async getTasks() {
    const session = this.getSession();
    if (!session) throw new Error('No autenticado');
    
    const response = await fetch(`${API_BASE_URL}/tasks?userId=${session.userId}`);
    return await response.json();
  },
  
  async createTask(task) {
    const session = this.getSession();
    if (!session) throw new Error('No autenticado');
    
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...task,
        userId: session.userId,
        completed: false,
        createdAt: new Date().toISOString()
      })
    });
    
    return await response.json();
  },
  
  async updateTask(id, updates) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    
    return await response.json();
  },
  
  async deleteTask(id) {
    await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE'
    });
  }
};