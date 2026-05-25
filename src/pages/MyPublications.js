import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicationService } from "../services/PublicationService";

const MyPublications = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);

  // Estado para manejar qué lista de interesados estamos viendo
  const [showInterestedFor, setShowInterestedFor] = useState(null);
  const [interestedUsers, setInterestedUsers] = useState([]);
  const [loadingInt, setLoadingInt] = useState(false);

  const navigate = useNavigate();

  const loadMyData = async () => {
    const token = sessionStorage.getItem("token");
    setLoading(true);
    try {
      const data = await publicationService.listMyPublications(token, {
        size: 50,
        sort: "id,desc",
      });
      setPublications(data.content || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyData();
  }, []);

  const handleShowInterested = async (id) => {
    if (showInterestedFor === id) {
      setShowInterestedFor(null);
      return;
    }
    setLoadingInt(true);
    try {
      const token = sessionStorage.getItem("token");
      const users = await publicationService.getInterested(token, id);
      setInterestedUsers(users);
      setShowInterestedFor(id);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingInt(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar a ${name}?`)) return;
    try {
      await publicationService.deletePublication(
        sessionStorage.getItem("token"),
        id,
      );
      loadMyData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading)
    return (
      <div className="home-loading">
        <span className="spinner" /> Cargando...
      </div>
    );

  return (
    <div className="page page--list">
      <div className="container publications-shell">
        <div className="publication-detail-top">
          <button
            className="ui-btn ui-btn--ghost"
            type="button"
            onClick={() => navigate("/profile")}
          >
            ← Volver al Perfil
          </button>
        </div>

        <div className="publications-header publications-header--compact">
          <div>
            <h2>Mis Mascotas en Adopción</h2>
            <p className="publications-subtitle">
              Revisa el estado de cada publicación y administra los interesados.
            </p>
          </div>
        </div>

        <div className="publications-grid">
          {publications.map((pub) => (
            <article
              key={pub.id}
              className="publication-card publication-card--dashboard"
            >
              <div className="publication-card__media publication-card__media--short">
                {pub.thumbnail ? (
                  <img
                    src={pub.thumbnail}
                    alt={pub.petName}
                    className="publication-card__image"
                  />
                ) : (
                  <span className="publication-card__emoji" aria-hidden="true">
                    {pub.type === "DOG" ? "🐶" : "🐱"}
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

                <button
                  type="button"
                  className="ui-btn ui-btn--primary ui-btn--dense"
                  onClick={() => handleShowInterested(pub.id)}
                >
                  {showInterestedFor === pub.id
                    ? "Ocultar interesados"
                    : "Ver interesados"}
                </button>

                {showInterestedFor === pub.id && (
                  <div className="publication-card__interest-panel">
                    {loadingInt ? (
                      "Cargando..."
                    ) : interestedUsers.length === 0 ? (
                      "Nadie interesado aún 💔"
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

                <div className="publication-card__actions">
                  <button
                    className="ui-btn ui-btn--ghost"
                    type="button"
                    onClick={() => navigate(`/publications/${pub.id}/edit`)}
                  >
                    Editar
                  </button>
                  <button
                    className="ui-btn ui-btn--ghost ui-btn--danger"
                    type="button"
                    onClick={() => handleDelete(pub.id, pub.petName)}
                  >
                    Borrar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyPublications;
