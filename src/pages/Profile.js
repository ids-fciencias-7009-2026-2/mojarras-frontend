import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/UserService";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const data = await userService.getProfile(token);
        setUser(data);
      } catch (err) {
        setError(err.message);
      }
    };
    loadProfile();
  }, []);

  if (error)
    return (
      <div className="profile-state profile-state--error">Error: {error}</div>
    );
  if (!user)
    return (
      <div className="profile-state">
        <span className="spinner" />
        Cargando perfil...
      </div>
    );

  const initials =
    `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase();

  return (
    <div className="page page--profile">
      <div className="container profile-card">
        
        {/* Encabezado del perfil */}
        <div className="profile-header">
          <div>
            <h2>Mi Perfil</h2>
            <p className="auth-subtitle">
              Consulta y administra tu información.
            </p>
          </div>
          <div className="profile-avatar">{initials || "U"}</div>
        </div>

        {/* Datos del usuario */}
        <div className="profile-grid">
          <div className="profile-item">
            <span className="profile-label">Usuario</span>
            <span className="profile-value">{user.username}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Nombre</span>
            <span className="profile-value">
              {user.firstName} {user.lastName}
            </span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Email</span>
            <span className="profile-value">{user.email}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Código Postal</span>
            <span className="profile-value">
              {user.zipCode || "No registrado"}
            </span>
          </div>
        </div>
        <div 
          onClick={() => navigate("/my-publications")}
          style={{
            marginTop: '24px',
            marginBottom: '28px',
            padding: '16px 20px',
            background: 'linear-gradient(135deg, var(--primary-soft) 0%, #ffffff 100%)',
            border: '2px solid var(--primary)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 6px 16px rgba(245, 157, 48, 0.15)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 157, 48, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 157, 48, 0.15)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ fontSize: '2.2rem', background: '#fff', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              🐾
            </div>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ margin: '0 0 4px', color: 'var(--primary-dark)', fontSize: '1.15rem' }}>Mis Mascotas</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>Gestiona tus adopciones publicadas</p>
            </div>
          </div>
          <span style={{ color: 'var(--primary-dark)', fontSize: '1.5rem', fontWeight: 'bold' }}>→</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="ui-btn ui-btn--primary"
            onClick={() => navigate("/update-profile")}
            style={{ flex: 1, margin: 0 }}
          >
            Editar Perfil
          </button>

          <button
            className="ui-btn ui-btn--ghost"
            onClick={() => navigate("/home")}
            style={{ flex: 1, margin: 0 }}
          >
            Volver al Inicio
          </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;