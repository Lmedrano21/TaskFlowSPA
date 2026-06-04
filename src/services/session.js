/**
 * Servicio de Gestión de Sesión
 * 
 * Módulo responsable de manejar el estado de autenticación del usuario,
 * incluyendo login, logout y persistencia de datos en localStorage.
 * 
 * Este store es el punto centralizado para conocer:
 * - Si un usuario está autenticado (isLoged)
 * - Datos del usuario autenticado (user)
 * 
 * Características:
 * - Persistencia en localStorage
 * - Validación de sesión al cargar la app
 * - Métodos para login/logout
 * - Seguridad: no almacena contraseñas en el store (solo en localStorage al registrar)
 */

const API_BASE_URL = 'http://localhost:3000';

/**
 * Store global de sesión
 * 
 * Objeto reactivo que mantiene el estado de autenticación de la aplicación.
 * Se sincroniza con localStorage para persistencia entre sesiones.
 */
export const store = {
  /**
   * Datos del usuario autenticado
   * Estructura:
   * {
   *   id: string,
   *   name: string,
   *   lastname: string,
   *   email: string,
   *   role: 'USER' | 'ADMIN',
   *   createdAt: string (ISO)
   * }
   * 
   * Nota: No contiene contraseña por seguridad
   */
  user: null,

  /**
   * Indicador de si el usuario está autenticado
   * true = usuario logueado
   * false = usuario no autenticado
   */
  isLoged: false,

  /**
   * Realiza el login del usuario
   * 
   * Proceso:
   * 1. Busca en la API el usuario con ese email
   * 2. Valida la contraseña
   * 3. Si coincide, actualiza el store y localStorage
   * 4. Retorna true si fue exitoso, false si no
   * 
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<boolean>} true si login exitoso, false si falló
   */
  async onLogin(email, password) {
    try {
      // Obtener todos los usuarios del API
      const response = await fetch(`${API_BASE_URL}/users?email=${email}`);
      const users = await response.json();
      
      // Buscamos al usuario que coincida con el password
      const user = users.find(u => u.password === password);

      if (user) {
        // Autenticación exitosa
        this.user = user;
        this.isLoged = true;
        this.saveData(this.user);  // Persistir en localStorage
        return true;
      }
      // Autenticación fallida
      return false;
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      return false;
    }
  },

  /**
   * Guarda los datos del usuario en localStorage
   * 
   * IMPORTANTE: Elimina la contraseña antes de guardar por seguridad.
   * localStorage debe ser lo más seguro posible (nunca guardar passwords sin encriptar).
   * 
   * @param {Object} data - Datos del usuario a guardar
   */
  saveData(data) {
    const { password, ...restData } = data; // Quitamos el password por seguridad
    localStorage.setItem("user", JSON.stringify(restData));
  },

  /**
   * Carga los datos del usuario desde localStorage
   * 
   * Se ejecuta al iniciar la app para restaurar la sesión del usuario.
   * Si hay datos en localStorage, los restaura en el store.
   * Si no hay datos, resetea el estado de autenticación.
   */
  loadData() {
    const data = JSON.parse(localStorage.getItem("user"));

    if (data) {
      // Hay datos guardados → restaurar sesión
      this.user = data;
      this.isLoged = true;
    } else {
      // No hay datos → usuario no autenticado
      this.user = null;
      this.isLoged = false;
    }
  },

  /**
   * Realiza el logout del usuario
   * 
   * Proceso:
   * 1. Elimina datos de localStorage
   * 2. Limpia el store (user = null, isLoged = false)
   * 3. La app debe redirigir a login después de esto
   */
  onLogout() {
    localStorage.removeItem("user");
    this.user = null;
    this.isLoged = false;
  },
};