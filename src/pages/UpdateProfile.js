import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const UpdateProfile = () => {
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    zipCode: "",
    password: "",
  });
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadInitialData = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const data = await api.getProfile(token);
        setFormData({
          username: data.username || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          zipCode: data.zipCode || "",
          password: "",
        });
      } catch (err) {
        setError("No se pudo cargar la información actual.");
      }
    };
    loadInitialData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    const token = sessionStorage.getItem("token");

    // Preparamos el objeto a enviar (Payload)
    const payload = { ...formData };

    // Si la contraseña está vacía, la mandamos como null para que se ignore y no se sobrescriba.
    if (payload.password.trim() === "") {
      payload.password = null;
    }

    try {
      await api.updateProfile(token, payload);
      setMensaje("Perfil actualizado correctamente.");
      setTimeout(() => navigate("/profile"), 2000); // Regresa al perfil tras 2 segundos
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page page--auth">
      <div className="container auth-card auth-card--wide">
        <h2>Actualizar Datos del Perfil</h2>
        <p className="auth-subtitle">
          Edita tu información y guarda los cambios.
        </p>
        {error && <p className="error">{error}</p>}
        {mensaje && <p className="success">{mensaje}</p>}

        <form onSubmit={handleSubmit} className="stack-form">
          <div className="field-group">
            <label className="ui-label">Username</label>
            <input
              className="ui-input"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field-row">
            <div className="field-group">
              <label className="ui-label">Nombre</label>
              <input
                className="ui-input"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field-group">
              <label className="ui-label">Apellido</label>
              <input
                className="ui-input"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="field-group">
            <label className="ui-label">Email</label>
            <input
              className="ui-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field-group">
            <label className="ui-label">Código Postal</label>
            <input
              className="ui-input"
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
            />
          </div>
          <div className="field-group">
            <label className="ui-label">Nueva Contraseña (Opcional)</label>
            <input
              className="ui-input"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Deja en blanco para no cambiarla"
            />
          </div>
          <button className="ui-btn ui-btn--primary" type="submit">
            Guardar Cambios
          </button>
        </form>
        <button
          className="ui-btn ui-btn--ghost"
          onClick={() => navigate("/profile")}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default UpdateProfile;
