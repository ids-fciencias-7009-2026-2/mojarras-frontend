import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { publicationService } from "../services/PublicationService";

const PublicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pub, setPub] = useState(null);
  const [error, setError] = useState("");
  const [interestMessage, setInterestMessage] = useState("");
  const [loadingInterest, setLoadingInterest] = useState(false);

  const loadPublication = useCallback(async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    const data = await publicationService.getPublication(token, id);
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

  const handleMarkInterest = async () => {
    try {
      setLoadingInterest(true);
      setInterestMessage("");
      const token = sessionStorage.getItem("token");
      const response = await publicationService.markInterest(token, id);
      setInterestMessage(
        response.message ||
          "¡Interés registrado exitosamente, revisa tu correo!",
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingInterest(false);
    }
  };

  if (error)
    return (
      <div className="page">
        <p className="error">{error}</p>
      </div>
    );
  if (!pub)
    return (
      <div className="page">
        <div className="home-loading">
          <span className="spinner" /> Cargando mascota...
        </div>
      </div>
    );

  return (
    <div className="page page--detail">
      <div className="container publication-detail-shell">
        <div className="publication-detail-top">
          <button
            className="ui-btn ui-btn--ghost"
            type="button"
            onClick={() => navigate("/home")}
          >
            ← Volver al inicio
          </button>
        </div>

        <div className="detail-layout">
          <div className="detail-left">
            <div className="carousel-container">
              {pub.photos && pub.photos.length > 0 ? (
                pub.photos.map((photo, i) => (
                  <img
                    key={photo.id || i}
                    src={photo.url || photo}
                    alt={pub.petName}
                    className="carousel-img"
                  />
                ))
              ) : (
                <div className="carousel-empty">
                  {pub.type === "DOG" ? "🐶" : "🐱"}
                </div>
              )}
            </div>
          </div>

          <div className="detail-right">
            <div className="publication-detail-hero">
              <span className="publication-card__tag publication-card__tag--hero">
                {pub.type === "DOG" ? "Perro" : "Gato"}
              </span>

              <h1>¡Hola, soy {pub.petName}!</h1>

              <div className="publication-detail-meta">
                <span>
                  <strong>Raza:</strong> {pub.breed || "Mestizo"}
                </span>
                <span>
                  <strong>C.P.:</strong> {pub.zipCode}
                </span>
              </div>
            </div>

            <div className="publication-section">
              <h3>Mi historia</h3>
              <p className="publication-section__text">{pub.description}</p>
            </div>

            <div className="interest-section">
              <h3>¿Te gustaría adoptarme?</h3>

              <button
                className="ui-btn ui-btn--primary"
                type="button"
                onClick={handleMarkInterest}
                disabled={loadingInterest}
              >
                {loadingInterest ? "Procesando..." : "¡Me interesa!"}
              </button>

              {interestMessage && <p className="success">{interestMessage}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicationDetail;
