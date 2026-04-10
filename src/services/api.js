const BASE_URL = 'http://localhost:8080/users';

export const api = {
    login: async (credentials) => {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        if (!response.ok) throw new Error('Credenciales incorrectas');
        return response.json();
    },

    getProfile: async (token) => {
        const response = await fetch(`${BASE_URL}/me`, {
            method: 'GET',
            headers: { 'Authorization': token }
        });
        if (!response.ok) throw new Error('Sesión inválida o expirada');
        return response.json();
    },

    updateProfile: async (token, data) => {
        const response = await fetch(`${BASE_URL}`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error al actualizar la información');
        return response.json();
    }
};