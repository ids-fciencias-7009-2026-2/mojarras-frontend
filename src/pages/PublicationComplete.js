import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { publicationService } from "../services/PublicationService";

const PublicationComplete = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFiles = (event) => {
    setFiles(Array.from(event.target.files || []));
  };

  const handleActivate = async () => {
    setError("");
    setSuccess("");

    if (files.length === 0) {
      setError("Sube al menos una foto para activar la publicación.");
      return;
    }

    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      await publicationService.uploadPhotos(token, id, files);
      setSuccess("Publicación activada correctamente.");
      navigate(`/publications/${id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page--form">
      <div className="container auth-card publication-form-card publication-complete-card">
        <div className="publication-form-header">
          <div>
            <span className="publication-complete-kicker">Paso final</span>
            <h2>Activa tu publicación</h2>
            <p className="auth-subtitle">
              La ficha queda visible cuando subes al menos una foto. Después
              podrás verla en el módulo de adopciones.
            </p>
          </div>
          <button
            className="ui-btn ui-btn--ghost"
            type="button"
            onClick={() => navigate("/home")}
          >
            Ir al listado
          </button>
        </div>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <div className="publication-complete-box">
          <h3>Publicación #{id}</h3>
          <p>
            Sube una o varias fotos para cambiar el estado de borrador a activa
            y dejarla disponible para consulta.
          </p>
          <div className="upload-row upload-row--stacked">
            <input type="file" multiple onChange={handleFiles} />
            <button
              className="ui-btn ui-btn--primary"
              type="button"
              onClick={handleActivate}
              disabled={loading}
            >
              {loading ? "Activando..." : "Subir fotos y activar"}
            </button>
          </div>
          <p className="publication-complete-note">
            Luego de este paso podrás abrir la publicación normal, marcar
            interés y consultar interesados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicationComplete;
