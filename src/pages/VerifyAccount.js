import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { userService } from "../services/UserService";

const VerifyAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    if (!token) {
      setStatus("error");
      setMessage("El enlace no contiene un token de verificación.");
      return;
    }

    const verify = async () => {
      try {
        await userService.verifyAccount(token);
        setStatus("success");
        setMessage("Tu cuenta ha sido verificada correctamente.");
        setTimeout(() => navigate("/login"), 3000);
      } catch (err) {
        setStatus("error");
        setMessage(err.message || "El token es inválido o ha expirado.");
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="page page--auth">
      <div className="container auth-card">
        <h2>Verificación de cuenta</h2>

        {status === "loading" && (
          <div className="home-loading">
            <span className="spinner" /> Verificando tu cuenta...
          </div>
        )}

        {status === "success" && (
          <>
            <p className="success">{message}</p>
            <p className="auth-subtitle">
              Te redirigiremos al inicio de sesión en unos segundos.
            </p>
            <Link className="ui-btn ui-btn--primary" to="/login">
              Ir a iniciar sesión
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <p className="error">{message}</p>
            <p className="auth-subtitle">
              Solicita un nuevo enlace de verificación o vuelve a intentarlo.
            </p>
            <Link className="ui-btn ui-btn--primary" to="/login">
              Volver a iniciar sesión
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyAccount;
