/**
 * Servicio para la gestión de la sesión de usuario.
 * Maneja el inicio de sesión, cierre de sesión y la persistencia del estado de autenticación
 * utilizando localStorage.
 */

const API_BASE_URL = 'http://localhost:3000';

export const store = {
  user: null,
  isLoged: false,

  async onLogin(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/users?email=${email}`);
      const users = await response.json();
      
      // Buscamos al usuario que coincida con el password
      const user = users.find(u => u.password === password);

      if (user) {
        this.user = user;
        this.isLoged = true;
        this.saveData(this.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      return false;
    }
  },

  saveData(data) {
    const { password, ...restData } = data; // Quitamos el password por seguridad
    localStorage.setItem("user", JSON.stringify(restData));
  },

  loadData() {
    const data = JSON.parse(localStorage.getItem("user"));

    if (data) {
      this.user = data;
      this.isLoged = true;
    } else {
      this.user = null;
      this.isLoged = false;
    }
  },

  onLogout() {
    localStorage.removeItem("user");
    this.user = null;
    this.isLoged = false;
  },
};