import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const data = await api.getProfile(token);
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
        <div className="profile-header">
          <div>
            <h2>Mi Perfil</h2>
            <p className="auth-subtitle">
              Consulta y administra tu información personal.
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
          className="ui-btn ui-btn--primary"
          onClick={() => navigate("/update-profile")}
        >
          Editar Perfil
        </button>
      </div>
    </div>
  );
};

export default Profile;
