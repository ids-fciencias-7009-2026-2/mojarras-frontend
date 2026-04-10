import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.login(credentials);

      sessionStorage.setItem("token", response.token);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page page--auth">
      <div className="container auth-card">
        <h2>Iniciar Sesión</h2>
        <p className="auth-subtitle">
          Accede con tus credenciales para continuar.
        </p>
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit} className="stack-form">
          <input
            className="ui-input"
            type="email"
            name="email"
            placeholder="Email"
            value={credentials.email}
            onChange={handleChange}
            required
          />
          <input
            className="ui-input"
            type="password"
            name="password"
            placeholder="Contraseña"
            value={credentials.password}
            onChange={handleChange}
            required
          />
          <button className="ui-btn ui-btn--primary" type="submit">
            Ingresar
          </button>
        </form>

        <p className="auth-switch">
          No tienes cuenta?{" "}
          <Link className="secondary-link" to="/register">
            Ir a registro
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
