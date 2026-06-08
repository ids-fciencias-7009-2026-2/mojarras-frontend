import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usersApi } from "../services/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await usersApi.me();
        if (!cancelled) setUser(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    })();
    return () => {
      cancelled = true;
    };
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
        <div className="profile-header">
          <div>
            <h2>Mi Perfil</h2>
            <p className="auth-subtitle">
              Consulta y administra tu información.
            </p>
          </div>
          <div className="profile-avatar">{initials || "U"}</div>
        </div>

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
        <button
          type="button"
          className="profile-cta"
          onClick={() => navigate("/my-publications")}
        >
          <div className="profile-cta__content">
            <div className="profile-cta__icon" aria-hidden="true">
              🐾
            </div>
            <div className="profile-cta__text">
              <h3>Mis Mascotas</h3>
              <p>Gestiona tus adopciones publicadas</p>
            </div>
          </div>
          <span className="profile-cta__arrow" aria-hidden="true">
            →
          </span>
        </button>
        <div className="profile-actions">
          <button
            className="ui-btn ui-btn--primary"
            onClick={() => navigate("/update-profile")}
          >
            Editar Perfil
          </button>

          <button
            className="ui-btn ui-btn--ghost"
            onClick={() => navigate("/home")}
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
