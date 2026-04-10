import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadProfile = async () => {
            const token = sessionStorage.getItem('token');
            try {
                const data = await api.getProfile(token);
                setUser(data);
            } catch (err) {
                setError(err.message);
            }
        };
        loadProfile();
    }, []);

    if (error) return <div>Error: {error}</div>;
    if (!user) return <div>Cargando perfil...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
            <h2>Mi Perfil</h2>
            <p><strong>Usuario:</strong> {user.username}</p>
            <p><strong>Nombre:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Código Postal:</strong> {user.zipCode || 'No registrado'}</p>

            <button onClick={() => navigate('/update-profile')} style={{ marginTop: '10px' }}>
                Editar Perfil
            </button>
        </div>
    );
};

export default Profile;