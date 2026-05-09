const API_ROOT = "http://localhost:8080/publications";

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

export const publicationService = {
  createPublication: async (token, data) => {
    const response = await fetch(`${API_ROOT}`, {
      method: "POST",
      headers: { ...authHeader(token), "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) await handleResponseError(response);
    return response.json();
  },

  listPublications: async (token, params = {}) => {
    const url = new URL(`${API_ROOT}`);
    Object.keys(params).forEach((k) => url.searchParams.append(k, params[k]));
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: authHeader(token),
    });
    if (!response.ok) await handleResponseError(response);
    return response.json();
  },

  getPublication: async (token, id) => {
    const response = await fetch(`${API_ROOT}/${id}`, {
      method: "GET",
      headers: authHeader(token),
    });
    if (!response.ok) await handleResponseError(response);
    return response.json();
  },

  updatePublication: async (token, id, data) => {
    const response = await fetch(`${API_ROOT}/${id}`, {
      method: "PATCH",
      headers: { ...authHeader(token), "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) await handleResponseError(response);
    return response.json();
  },

  deletePublication: async (token, id) => {
    const response = await fetch(`${API_ROOT}/${id}`, {
      method: "DELETE",
      headers: authHeader(token),
    });
    if (!response.ok) await handleResponseError(response);
    return;
  },

  uploadPhotos: async (token, publicationId, files) => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    const response = await fetch(`${API_ROOT}/${publicationId}/photos`, {
        method: "POST",
        headers: authHeader(token),
        body: form,
      }
    );
    if (!response.ok) await handleResponseError(response);
    return response.json();
  },

  deletePhoto: async (token, publicationId, photoId) => {
    const response = await fetch(`${API_ROOT}/${publicationId}/photos/${photoId}`, {
        method: "DELETE",
        headers: authHeader(token),
      }
    );
    if (!response.ok) await handleResponseError(response);
    return;
  },

  markInterest: async (token, publicationId) => {
    const response = await fetch(`${API_ROOT}/${publicationId}/interest`, {
        method: "POST",
        headers: authHeader(token),
      }
    );
    if (!response.ok) await handleResponseError(response);
    return response.json();
  },

  getInterested: async (token, publicationId) => {
    const response = await fetch(`${API_ROOT}/${publicationId}/interest`, {
        method: "GET",
        headers: authHeader(token),
      }
    );
    if (!response.ok) await handleResponseError(response);
    return response.json();
  },
  
  listMyPublications: async (token, params = {}) => {
    const url = new URL(`${API_ROOT}/me`);
    Object.keys(params).forEach((k) => url.searchParams.append(k, params[k]));
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: authHeader(token),
    });
    if (!response.ok) await handleResponseError(response);
    return response.json();
  },
};