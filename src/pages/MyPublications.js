import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { interestApi, publicationsApi } from "../services/api";
import Toast from "../components/Toast";

const MyPublications = () => {
  const navigate = useNavigate();
  const [publications, setPublications] = useState([]);
  const [adoptedIds, setAdoptedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showInterestedFor, setShowInterestedFor] = useState(null);
  const [interestedUsers, setInterestedUsers] = useState([]);
  const [loadingInt, setLoadingInt] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [toast, setToast] = useState(null);

  const loadMyData = async () => {
    setLoading(true);
    try {
      const data = await publicationsApi.listMine();
      setPublications(data.content || []);
    } catch (err) {
      setToast({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyData();
    const stored = sessionStorage.getItem("adoptedIds");
    if (stored) {
      try {
        setAdoptedIds(new Set(JSON.parse(stored)));
      } catch (_e) {
        /* ignore */
      }
    }
  }, []);

  const persistAdopted = (next) => {
    setAdoptedIds(next);
    sessionStorage.setItem("adoptedIds", JSON.stringify([...next]));
  };

  const handleShowInterested = async (id) => {
    if (showInterestedFor === id) {
      setShowInterestedFor(null);
      return;
    }
    setLoadingInt(true);
    setShowInterestedFor(id);
    try {
      const users = await interestApi.list(id);
      setInterestedUsers(users || []);
    } catch (err) {
      setToast({ type: "error", message: err.message });
      setShowInterestedFor(null);
    } finally {
      setLoadingInt(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar la publicación de ${name}?`)) return;
    setActionId(id);
    try {
      await publicationsApi.remove(id);
      setPublications((cur) => cur.filter((p) => p.id !== id));
      setToast({ type: "success", message: "Publicación eliminada." });
    } catch (err) {
      setToast({ type: "error", message: err.message });
    } finally {
      setActionId(null);
    }
  };

  const handleMarkAdopted = async (id, name) => {
    if (!window.confirm(`¿Marcar a ${name} como adoptada?`)) return;
    setActionId(id);
    try {
      await publicationsApi.markAdopted(id);
      const next = new Set(adoptedIds);
      next.add(id);
      persistAdopted(next);
      setToast({ type: "success", message: `${name} marcada como adoptada 🎉` });
    } catch (err) {
      setToast({ type: "error", message: err.message });
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="page page--list">
      <div className="container publications-shell">
        <div className="publication-detail-top">
          <button
            className="ui-btn ui-btn--ghost"
            type="button"
            onClick={() => navigate("/profile")}
          >
            ← Volver al perfil
          </button>
        </div>

        <div className="publications-header publications-header--compact">
          <div>
            <h2>Mis mascotas en adopción</h2>
            <p className="publications-subtitle">
              Revisa el estado de cada publicación y administra a los interesados.
            </p>
          </div>
          <button
            className="ui-btn ui-btn--primary"
            type="button"
            onClick={() => navigate("/publications/new")}
          >
            + Nueva publicación
          </button>
        </div>

        {loading && (
          <div className="home-loading home-loading--inline">
            <span className="spinner" /> Cargando...
          </div>
        )}

        {!loading && publications.length === 0 && (
          <div className="publications-empty">
            <h3>Aún no has publicado mascotas</h3>
            <p>Crea tu primera publicación para empezar a recibir interesados.</p>
            <button
              className="ui-btn ui-btn--primary"
              onClick={() => navigate("/publications/new")}
            >
              Crear primera publicación
            </button>
          </div>
        )}

        {!loading && publications.length > 0 && (
          <div className="publications-grid">
            {publications.map((pub) => {
              const isAdopted = adoptedIds.has(pub.id);
              return (
                <article
                  key={pub.id}
                  className={`publication-card publication-card--dashboard${
                    isAdopted ? " publication-card--adopted" : ""
                  }`}
                >
                  <div className="publication-card__media publication-card__media--short">
                    {pub.thumbnail ? (
                      <img
                        src={pub.thumbnail}
                        alt={pub.petName}
                        loading="lazy"
                        className="publication-card__image"
                      />
                    ) : (
                      <span className="publication-card__emoji" aria-hidden="true">
                        {pub.type === "DOG" ? "🐶" : "🐱"}
                      </span>
                    )}
                    {isAdopted && (
                      <span className="publication-card__adopted-badge" aria-label="Adoptada">
                        ✓ Adoptada
                      </span>
                    )}
                  </div>

                  <div className="publication-card__body">
                    <div className="publication-card__title-row publication-card__title-row--stack">
                      <h3>{pub.petName}</h3>
                      <span className="publication-card__tag">
                        {pub.type === "DOG" ? "Perro" : "Gato"}
                      </span>
                    </div>
                    <p className="publication-card__summary">
                      {pub.breed || "Mestizo"} · 📍 C.P. {pub.zipCode}
                    </p>

                    <div className="publication-card__actions publication-card__actions--stack">
                      <button
                        type="button"
                        className="ui-btn ui-btn--ghost ui-btn--dense"
                        onClick={() => handleShowInterested(pub.id)}
                      >
                        {showInterestedFor === pub.id
                          ? "Ocultar interesados"
                          : "Ver interesados"}
                      </button>
                      <div className="publication-card__action-row">
                        <button
                          className="ui-btn ui-btn--ghost ui-btn--dense"
                          type="button"
                          onClick={() => navigate(`/publications/${pub.id}/edit`)}
                          disabled={isAdopted}
                        >
                          Editar
                        </button>
                        <button
                          className="ui-btn ui-btn--ghost ui-btn--danger ui-btn--dense"
                          type="button"
                          disabled={actionId === pub.id}
                          onClick={() => handleDelete(pub.id, pub.petName)}
                        >
                          Borrar
                        </button>
                      </div>
                      {!isAdopted && (
                        <button
                          className="ui-btn ui-btn--primary ui-btn--dense"
                          type="button"
                          disabled={actionId === pub.id}
                          onClick={() => handleMarkAdopted(pub.id, pub.petName)}
                        >
                          {actionId === pub.id ? "Marcando..." : "✓ Marcar como adoptada"}
                        </button>
                      )}
                      {isAdopted && (
                        <div className="publication-card__adopted-note">
                          🎉 Esta mascota ya encontró hogar
                        </div>
                      )}
                    </div>

                    {showInterestedFor === pub.id && (
                      <div className="publication-card__interest-panel">
                        {loadingInt ? (
                          <span className="ui-hint">Cargando interesados...</span>
                        ) : interestedUsers.length === 0 ? (
                          <span className="ui-hint">Nadie interesado aún 💔</span>
                        ) : (
                          <ul className="publication-card__interest-list">
                            {interestedUsers.map((u) => (
                              <li key={u.id}>
                                <strong>{u.username}</strong>
                                <br />
                                {u.email}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
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

export default MyPublications;
