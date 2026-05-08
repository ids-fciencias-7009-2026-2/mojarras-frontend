import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { api } from "../services/api";

const PublicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pub, setPub] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [interested, setInterested] = useState([]);
  const [interestMessage, setInterestMessage] = useState("");
  const [loadingInterested, setLoadingInterested] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadPublication = useCallback(async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const data = await api.getPublication(token, id);
    setPub(data);
  }, [id]);

  useEffect(() => {
    const load = async () => {
      try {
        await loadPublication();
      } catch (e) {
        setError(e.message);
      }
    };
    load();
  }, [loadPublication]);

  const handleFiles = (e) => setFiles(Array.from(e.target.files));

  const handleUpload = async () => {
    try {
      setUploading(true);
      const token = sessionStorage.getItem("token");
      await api.uploadPhotos(token, id, files);
      await loadPublication();
      setFiles([]);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleMarkInterest = async () => {
    try {
      setInterestMessage("");
      const token = sessionStorage.getItem("token");
      const response = await api.markInterest(token, id);
      setInterestMessage(response.message || "Interes registrado");
    } catch (e) {
      setError(e.message);
    }
  };

  const handleLoadInterested = async () => {
    try {
      setLoadingInterested(true);
      const token = sessionStorage.getItem("token");
      const users = await api.getInterested(token, id);
      setInterested(users);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingInterested(false);
    }
  };

  if (error)
    return (
      <div className="page">
        <p className="error">{error}</p>
      </div>
    );
  if (!pub) return <div className="page">Cargando...</div>;

  return (
    <div className="page page--detail">
      <div className="container publication-detail-shell">
        <div className="publication-detail-top">
          <button
            className="ui-btn ui-btn--ghost"
            onClick={() => navigate("/publications")}
          >
            Volver
          </button>
          <button
            className="ui-btn ui-btn--primary"
            onClick={() => navigate("/publications/new")}
          >
            Nueva publicacion
          </button>
        </div>

        <section className="publication-detail-hero">
          <span className="publication-card__tag">
            {pub.type === "DOG" ? "Perro" : "Gato"}
          </span>
          <h2>{pub.petName}</h2>
          <p>{pub.description}</p>
          <div className="publication-detail-meta">
            <span>
              <strong>Raza:</strong> {pub.breed || "No especificada"}
            </span>
            <span>
              <strong>C.P.:</strong> {pub.zipCode}
            </span>
          </div>
        </section>

        <section className="photos-section">
          <div className="publication-section-header">
            <h3>Fotos</h3>
            <span>{(pub.photos || []).length} cargadas</span>
          </div>
          <div className="photos-grid">
            {(pub.photos || []).map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`photo-${i}`}
                className="photo-thumb"
              />
            ))}
          </div>
          <div className="upload-row">
            <input type="file" multiple onChange={handleFiles} />
            <button
              className="ui-btn ui-btn--primary"
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
            >
              {uploading ? "Subiendo..." : "Subir"}
            </button>
          </div>
        </section>

        <section className="interest-section">
          <div className="publication-section-header">
            <h3>Interes</h3>
          </div>
          <div className="interest-actions">
            <button
              className="ui-btn ui-btn--primary"
              onClick={handleMarkInterest}
            >
              Estoy interesado
            </button>
            <button
              className="ui-btn ui-btn--ghost"
              onClick={handleLoadInterested}
            >
              {loadingInterested ? "Consultando..." : "Ver interesados"}
            </button>
          </div>

          {interestMessage && <p className="success">{interestMessage}</p>}

          {interested.length > 0 && (
            <div className="interested-list">
              <h4>Interesados</h4>
              <ul>
                {interested.map((u) => (
                  <li key={u.id}>
                    <span>{u.username}</span>
                    <span>{u.email}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PublicationDetail;
