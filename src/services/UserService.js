const API_ROOT = "http://localhost:8080/users";

function authHeader(token) {
  if (!token) return {};
  // ensure Bearer prefix
  const value = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  return { Authorization: value };
}

export const userService = {
  register: async (data) => {
    const response = await fetch(`${API_ROOT}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (errorData.validation_errors) {
        const errors = Object.values(errorData.validation_errors).join(" | ");
        throw new Error(`Revisa tus datos: ${errors}`);
      }
      
      throw new Error(errorData.message || "No se pudo registrar el usuario");
    }

    return response.json();
  },

  login: async (credentials) => {
    const response = await fetch(`${API_ROOT}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Credenciales incorrectas");
    }
    return response.json();
  },

  getProfile: async (token) => {
    const response = await fetch(`${API_ROOT}/me`, {
      method: "GET",
      headers: authHeader(token),
    });
    if (!response.ok) throw new Error("Sesión inválida o expirada");
    return response.json();
  },

  updateProfile: async (token, data) => {
    const response = await fetch(`${API_ROOT}`, {
      method: "PUT",
      headers: { ...authHeader(token), "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al actualizar la información");
    return response.json();
  }
};
