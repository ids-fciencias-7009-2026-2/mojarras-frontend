import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  interestApi,
  mapApi,
  publicationsApi,
} from "../services/api";
import LocationMap from "../components/LocationMap";
import Toast from "../components/Toast";

const PublicationDetail = () => {
  const { id } = useParams();
  const numericId = Number(id);
  const navigate = useNavigate();
  const [pub, setPub] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);
  const [error, setError] = useState("");
  const [interestMessage, setInterestMessage] = useState("");
  const [loadingInterest, setLoadingInterest] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [adopted, setAdopted] = useState(false);
  const [marking, setMarking] = useState(false);
  const [toast, setToast] = useState(null);

  const loadPublication = useCallback(async () => {
    const data = await publicationsApi.get(id);
    setPub(data);
    setActivePhoto(0);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadPublication();
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadPublication]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const loc = await mapApi.publicationLocation(id);
        if (!cancelled) setLocation(loc);
      } catch (_e) {
        if (!cancelled) setLocationError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mine = await publicationsApi.listMine({ size: 100 });
        if (cancelled) return;
        const ids = (mine.content || []).map((p) => p.id);
        setIsOwner(ids.includes(numericId));
      } catch (_e) {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [numericId]);

  useEffect(() => {
    const stored = sessionStorage.getItem("adoptedIds");
    if (stored) {
      try {
        const ids = JSON.parse(stored);
        setAdopted(ids.includes(numericId));
      } catch (_e) {
        /* ignore */
      }
    }
  }, [numericId]);

  const handleMarkInterest = async () => {
    try {
      setLoadingInterest(true);
      setInterestMessage("");
      const response = await interestApi.mark(id);
      setInterestMessage(
        response?.message || "¡Interés registrado! Revisa tu correo.",
      );
    } catch (e) {
      setToast({ type: "error", message: e.message });
    } finally {
      setLoadingInterest(false);
    }
  };

  const handleMarkAdopted = async () => {
    if (!window.confirm(`¿Marcar a ${pub.petName} como adoptada?`)) return;
    setMarking(true);
    try {
      await publicationsApi.markAdopted(id);
      setAdopted(true);
      const stored = sessionStorage.getItem("adoptedIds");
      const ids = stored ? new Set(JSON.parse(stored)) : new Set();
      ids.add(numericId);
      sessionStorage.setItem("adoptedIds", JSON.stringify([...ids]));
      setToast({ type: "success", message: "¡Mascota marcada como adoptada!" });
    } catch (e) {
      setToast({ type: "error", message: e.message });
    } finally {
      setMarking(false);
    }
  };

  if (error) {
    return (
      <div className="page">
        <div className="container">
          <p className="error">{error}</p>
          <button className="ui-btn ui-btn--ghost" onClick={() => navigate("/home")}>
            ← Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (!pub) {
    return (
      <div className="page">
        <div className="home-loading">
          <span className="spinner" /> Cargando mascota...
        </div>
      </div>
    );
  }

  const photos = pub.photos || [];
  const photoCount = photos.length;

  return (
    <div className="page page--detail">
      <div className="container publication-detail-shell">
        <div className="publication-detail-top">
          <button
            className="ui-btn ui-btn--ghost"
            type="button"
            onClick={() => navigate(-1)}
          >
            ← Volver
          </button>
          {isOwner && (
            <button
              className="ui-btn ui-btn--ghost ui-btn--dense"
              type="button"
              onClick={() => navigate(`/publications/${id}/edit`)}
            >
              Editar publicación
            </button>
          )}
        </div>

        <div className="detail-layout">
          <div className="detail-left">
            <div className="carousel-container">
              {photoCount > 0 ? (
                <>
                  <img
                    src={photos[activePhoto].url || photos[activePhoto]}
                    alt={pub.petName}
                    className="carousel-img carousel-img--main"
                  />
                  {photoCount > 1 && (
                    <div className="carousel-thumbs">
                      {photos.map((p, i) => (
                        <button
                          key={p.id || i}
                          type="button"
                          className={`carousel-thumb${
                            i === activePhoto ? " carousel-thumb--active" : ""
                          }`}
                          onClick={() => setActivePhoto(i)}
                          aria-label={`Foto ${i + 1}`}
                        >
                          <img src={p.url || p} alt="" loading="lazy" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="carousel-empty">
                  {pub.type === "DOG" ? "🐶" : "🐱"}
                </div>
              )}
            </div>
          </div>

          <div className="detail-right">
            <div className="publication-detail-hero">
              <div className="publication-detail-hero__tags">
                <span className="publication-card__tag publication-card__tag--hero">
                  {pub.type === "DOG" ? "🐶 Perro" : "🐱 Gato"}
                </span>
                {adopted && (
                  <span className="publication-card__adopted-badge publication-card__adopted-badge--inline">
                    ✓ Adoptada
                  </span>
                )}
              </div>

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

            {pub.breedInfo && (
              <div className="publication-section breed-info">
                <h3>Sobre la raza {pub.breedInfo.breedName}</h3>
                <div className="breed-info__grid">
                  {pub.breedInfo.temperament && (
                    <div className="breed-info__item">
                      <span className="breed-info__label">Temperamento</span>
                      <span>{pub.breedInfo.temperament}</span>
                    </div>
                  )}
                  {pub.breedInfo.origin && (
                    <div className="breed-info__item">
                      <span className="breed-info__label">Origen</span>
                      <span>{pub.breedInfo.origin}</span>
                    </div>
                  )}
                  {pub.breedInfo.lifeSpan && (
                    <div className="breed-info__item">
                      <span className="breed-info__label">Esperanza de vida</span>
                      <span>{pub.breedInfo.lifeSpan} años</span>
                    </div>
                  )}
                </div>
                {pub.breedInfo.description && (
                  <p className="breed-info__description">
                    {pub.breedInfo.description}
                  </p>
                )}
              </div>
            )}

            <div className="publication-section">
              <h3>Ubicación</h3>
              {locationError ? (
                <div className="map-shell map-shell--unavailable" style={{ height: 200 }}>
                  <p>No pudimos obtener la ubicación de este C.P.</p>
                </div>
              ) : location ? (
                <LocationMap
                  lat={location.lat}
                  lng={location.lng}
                  label={`${pub.petName} · C.P. ${location.zipCode}`}
                />
              ) : (
                <div className="home-loading home-loading--inline" style={{ height: 200 }}>
                  <span className="spinner" /> Cargando mapa...
                </div>
              )}
            </div>

            <div className="publication-section">
              <h3>Mi historia</h3>
              <p className="publication-section__text">{pub.description}</p>
            </div>

            {isOwner ? (
              <div className="interest-section">
                <h3>Esta es tu publicación</h3>
                {adopted ? (
                  <p className="publication-card__adopted-note">
                    🎉 Esta mascota ya encontró hogar
                  </p>
                ) : (
                  <>
                    <p className="ui-hint">
                      Cuando completes la adopción, marca la publicación para cerrarla.
                    </p>
                    <button
                      className="ui-btn ui-btn--primary"
                      type="button"
                      disabled={marking}
                      onClick={handleMarkAdopted}
                    >
                      {marking ? "Marcando..." : "✓ Marcar como adoptada"}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="interest-section">
                <h3>¿Te gustaría adoptarme?</h3>
                <button
                  className="ui-btn ui-btn--primary"
                  type="button"
                  onClick={handleMarkInterest}
                  disabled={loadingInterest || adopted}
                >
                  {loadingInterest ? "Procesando..." : "¡Me interesa!"}
                </button>
                {interestMessage && <p className="success">{interestMessage}</p>}
                {adopted && (
                  <p className="ui-hint">Esta mascota ya fue adoptada.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default PublicationDetail;
