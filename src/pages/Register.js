import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    firstName: "",
    lastName: "",
    zipCode: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await api.register(formData);
      setSuccess("Cuenta creada. Ahora inicia sesion.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page page--auth">
      <div className="container auth-card auth-card--wide">
        <h2>Registro</h2>
        <p className="auth-subtitle">
          Crea tu cuenta para empezar a gestionar tu perfil.
        </p>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <form onSubmit={handleSubmit} className="stack-form">
          <input
            className="ui-input"
            type="text"
            name="username"
            placeholder="Usuario"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            className="ui-input"
            type="text"
            name="firstName"
            placeholder="Nombre"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            className="ui-input"
            type="text"
            name="lastName"
            placeholder="Apellido"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <input
            className="ui-input"
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            className="ui-input"
            type="text"
            name="zipCode"
            placeholder="Codigo postal"
            value={formData.zipCode}
            onChange={handleChange}
            required
          />
          <input
            className="ui-input"
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button className="ui-btn ui-btn--primary" type="submit">
            Crear cuenta
          </button>
        </form>

        <p className="auth-switch">
          Ya tienes cuenta?{" "}
          <Link className="secondary-link" to="/login">
            Ir a login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
