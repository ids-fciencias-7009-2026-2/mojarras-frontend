const API_ROOT = "http://localhost:8080";

function authHeader(token) {
  if (!token) return {};
  // ensure Bearer prefix
  const value = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  return { Authorization: value };
}

export const api = {
  // Users
  register: async (data) => {
    const response = await fetch(`${API_ROOT}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("No se pudo registrar el usuario");
    return response.json();
  },

  login: async (credentials) => {
    const response = await fetch(`${API_ROOT}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!response.ok)
      throw new Error("Credenciales incorrectas o usuario no existe");
    return response.json();
  },

  getProfile: async (token) => {
    const response = await fetch(`${API_ROOT}/users/me`, {
      method: "GET",
      headers: authHeader(token),
    });
    if (!response.ok) throw new Error("Sesión inválida o expirada");
    return response.json();
  },

  updateProfile: async (token, data) => {
    const response = await fetch(`${API_ROOT}/users`, {
      method: "PUT",
      headers: { ...authHeader(token), "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al actualizar la información");
    return response.json();
  },

  // Publications
  createPublication: async (token, data) => {
    const response = await fetch(`${API_ROOT}/publications`, {
      method: "POST",
      headers: { ...authHeader(token), "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al crear la publicación");
    return response.json();
  },

  listPublications: async (token, params = {}) => {
    const url = new URL(`${API_ROOT}/publications`);
    Object.keys(params).forEach((k) => url.searchParams.append(k, params[k]));
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: authHeader(token),
    });
    if (!response.ok)
      throw new Error("No se pudieron obtener las publicaciones");
    return response.json();
  },

  getPublication: async (token, id) => {
    const response = await fetch(`${API_ROOT}/publications/${id}`, {
      method: "GET",
      headers: authHeader(token),
    });
    if (!response.ok) throw new Error("Publicación no encontrada");
    return response.json();
  },

  updatePublication: async (token, id, data) => {
    const response = await fetch(`${API_ROOT}/publications/${id}`, {
      method: "PATCH",
      headers: { ...authHeader(token), "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al actualizar la publicación");
    return response.json();
  },

  deletePublication: async (token, id) => {
    const response = await fetch(`${API_ROOT}/publications/${id}`, {
      method: "DELETE",
      headers: authHeader(token),
    });
    if (!response.ok) throw new Error("Error al eliminar la publicación");
    return;
  },

  // Photos (multipart)
  uploadPhotos: async (token, publicationId, files) => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    const response = await fetch(
      `${API_ROOT}/publications/${publicationId}/photos`,
      {
        method: "POST",
        headers: authHeader(token),
        body: form,
      },
    );
    if (!response.ok) throw new Error("Error subiendo fotos");
    return response.json();
  },

  deletePhoto: async (token, publicationId, photoId) => {
    const response = await fetch(
      `${API_ROOT}/publications/${publicationId}/photos/${photoId}`,
      {
        method: "DELETE",
        headers: authHeader(token),
      },
    );
    if (!response.ok) throw new Error("Error eliminando la foto");
    return;
  },

  // Interest
  markInterest: async (token, publicationId) => {
    const response = await fetch(
      `${API_ROOT}/publications/${publicationId}/interest`,
      {
        method: "POST",
        headers: authHeader(token),
      },
    );
    if (!response.ok) throw new Error("Error marcando interés");
    return response.json();
  },

  getInterested: async (token, publicationId) => {
    const response = await fetch(
      `${API_ROOT}/publications/${publicationId}/interest`,
      {
        method: "GET",
        headers: authHeader(token),
      },
    );
    if (!response.ok) throw new Error("Error obteniendo interesados");
    return response.json();
  },
};
