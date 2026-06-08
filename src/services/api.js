const API_ROOT =
  process.env.REACT_APP_API_URL || "http://localhost:8080";

function authHeader(token) {
  if (!token) return {};
  const value = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  return { Authorization: value };
}

function currentToken() {
  return sessionStorage.getItem("token");
}

async function parseError(response) {
  let body;
  try {
    body = await response.json();
  } catch (_e) {
    throw new ApiError(
      `Error del servidor (HTTP ${response.status})`,
      response.status,
    );
  }

  let message = body.message || "Ocurrió un error desconocido";

  if (body.validation_errors) {
    const details = Object.entries(body.validation_errors)
      .map(([field, msg]) => `${field}: ${msg}`)
      .join(" | ");
    message += ` - ${details}`;
  }

  if (body.status && body.error) {
    message = `[${body.status} ${body.error}] ${message}`;
  }

  throw new ApiError(message, response.status, body);
}

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, { method = "GET", body, multipart, auth = true, query } = {}) {
  const url = new URL(`${API_ROOT}${path}`);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.append(k, v);
      }
    });
  }

  const headers = {};
  if (auth) Object.assign(headers, authHeader(currentToken()));

  let payload;
  if (multipart) {
    payload = multipart;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), { method, headers, body: payload });

  if (response.status === 401) {
    sessionStorage.removeItem("token");
    throw new ApiError("Sesión expirada o inválida", 401);
  }
  if (!response.ok) {
    await parseError(response);
  }
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch (_e) {
    return text;
  }
}

export const usersApi = {
  register: (data) => request("/users", { method: "POST", body: data, auth: false }),
  login: (data) => request("/users/login", { method: "POST", body: data, auth: false }),
  me: () => request("/users/me"),
  update: (data) => request("/users", { method: "PUT", body: data }),
  verify: (token) =>
    request(`/users/verify`, { method: "POST", query: { token }, auth: false }),
};

export const publicationsApi = {
  list: (params = {}) =>
    request("/publications", {
      query: { page: 0, size: 24, sort: "id,desc", ...params },
    }),
  listMine: (params = {}) =>
    request("/publications/me", {
      query: { page: 0, size: 50, sort: "id,desc", ...params },
    }),
  get: (id) => request(`/publications/${id}`),
  create: (data) => request("/publications", { method: "POST", body: data }),
  update: (id, data) => request(`/publications/${id}`, { method: "PATCH", body: data }),
  remove: (id) => request(`/publications/${id}`, { method: "DELETE" }),
  markAdopted: (id) =>
    request(`/publications/${id}/adopt`, { method: "PATCH" }),
};

export const mapApi = {
  cluster: (params = {}) =>
    request("/publications/map", {
      query: {
        type: params.type || undefined,
        breed: params.breed || undefined,
        zipCode: params.zipCode || undefined,
      },
    }),
  publicationLocation: (id) => request(`/publications/${id}/location`),
};

export const photosApi = {
  upload: (publicationId, files) => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    return request(`/publications/${publicationId}/photos`, {
      method: "POST",
      multipart: form,
    });
  },
  remove: (publicationId, photoId) =>
    request(`/publications/${publicationId}/photos/${photoId}`, {
      method: "DELETE",
    }),
};

export const interestApi = {
  mark: (publicationId) =>
    request(`/publications/${publicationId}/interest`, { method: "POST" }),
  list: (publicationId) =>
    request(`/publications/${publicationId}/interest`),
};

export const breedsApi = {
  list: (type) => request("/breeds", { query: { type } }),
};

export const api = {
  users: usersApi,
  publications: publicationsApi,
  map: mapApi,
  photos: photosApi,
  interest: interestApi,
  breeds: breedsApi,
};
