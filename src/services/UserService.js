const API_ROOT = "http://localhost:8080/users";

function authHeader(token) {
  if (!token) return {};
  const value = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  return { Authorization: value };
}

async function handleResponseError(response) {
  let errorData;
  try { 
    errorData = await response.json(); 
  } catch (e) { 
    throw new Error(`Error del servidor o conexión (HTTP ${response.status})`); 
  }

  let finalMsg = errorData.message || "Ocurrió un error desconocido";
  
  if (errorData.validation_errors) {
    const details = Object.entries(errorData.validation_errors)
      .map(([field, msg]) => `${field}: ${msg}`)
      .join(" | ");
    finalMsg += ` - Validaciones: ${details}`;
  }
  
  if (errorData.status && errorData.error) {
    finalMsg = `[Error ${errorData.status} ${errorData.error}] ${finalMsg}`;
  }
  
  throw new Error(finalMsg);
}

export const userService = {
  register: async (data) => {
    const response = await fetch(`${API_ROOT}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) await handleResponseError(response);
    return response.json();
  },

  login: async (credentials) => {
    const response = await fetch(`${API_ROOT}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) await handleResponseError(response);
    return response.json();
  },

  getProfile: async (token) => {
    const response = await fetch(`${API_ROOT}/me`, {
      method: "GET",
      headers: authHeader(token),
    });
    if (!response.ok) await handleResponseError(response);
    return response.json();
  },

  updateProfile: async (token, data) => {
    const response = await fetch(`${API_ROOT}`, {
      method: "PUT",
      headers: { ...authHeader(token), "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) await handleResponseError(response);
    return response.json();
  }
};