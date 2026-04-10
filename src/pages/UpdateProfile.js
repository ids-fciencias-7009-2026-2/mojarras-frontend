import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const UpdateProfile = () => {
    const [formData, setFormData] = useState({ 
        username: '',
        firstName: '',
        lastName: '',
        email: '', 
        zipCode: '',
        password: '' 
    });
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const loadInitialData = async () => {
            const token = sessionStorage.getItem('token');
            try {
                const data = await api.getProfile(token);
                setFormData({ 
                    username: data.username || '',
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    email: data.email || '', 
                    zipCode: data.zipCode || '',
                    password: '' 
                });
            } catch (err) {
                setError('No se pudo cargar la información actual.');
            }
        };
        loadInitialData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje('');
        setError('');

        const token = sessionStorage.getItem('token');
        
        // Preparamos el objeto a enviar (Payload)
        const payload = { ...formData };
        
        // Si la contraseña está vacía, la mandamos como null para que se ignore y no se sobrescriba.
        if (payload.password.trim() === '') {
            payload.password = null;
        }

        try {
            await api.updateProfile(token, payload);
            setMensaje('Perfil actualizado correctamente.');
            setTimeout(() => navigate('/profile'), 2000); // Regresa al perfil tras 2 segundos
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
            <h2>Actualizar Datos del Perfil</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {mensaje && <p style={{ color: 'green', fontWeight: 'bold' }}>{mensaje}</p>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label>Username:</label>
                    <input 
                        type="text" name="username" value={formData.username} 
                        onChange={handleChange} required style={{ width: '100%' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label>Nombre:</label>
                        <input 
                            type="text" name="firstName" value={formData.firstName} 
                            onChange={handleChange} required style={{ width: '100%' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Apellido:</label>
                        <input 
                            type="text" name="lastName" value={formData.lastName} 
                            onChange={handleChange} required style={{ width: '100%' }}
                        />
                    </div>
                </div>
                <div>
                    <label>Email:</label>
                    <input 
                        type="email" name="email" value={formData.email} 
                        onChange={handleChange} required style={{ width: '100%' }}
                    />
                </div>
                <div>
                    <label>Código Postal:</label>
                    <input 
                        type="text" name="zipCode" value={formData.zipCode} 
                        onChange={handleChange} style={{ width: '100%' }}
                    />
                </div>
                <div>
                    <label>Nueva Contraseña (Opcional):</label>
                    <input 
                        type="password" name="password" value={formData.password} 
                        onChange={handleChange} placeholder="Deja en blanco para no cambiarla"
                        style={{ width: '100%' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px', marginTop: '10px', cursor: 'pointer' }}>
                    Guardar Cambios
                </button>
            </form>
            <button onClick={() => navigate('/profile')} style={{ marginTop: '10px', padding: '10px', width: '100%', backgroundColor: 'gray', color: 'white', cursor: 'pointer' }}>
                Cancelar
            </button>
        </div>
    );
};

export default UpdateProfile;