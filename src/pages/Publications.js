import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const emptyFilters = { type: "", zipCode: "", breed: "" };

const Publications = () => {
  const [page, setPage] = useState(null);
  const [filters, setFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadPublications = async (queryFilters = filters) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = { page: 0, size: 20, sort: "id,desc" };
      if (queryFilters.type) params.type = queryFilters.type;
      if (queryFilters.zipCode) params.zipCode = queryFilters.zipCode;
      if (queryFilters.breed) params.breed = queryFilters.breed;

      const data = await api.listPublications(token, params);
      setPage(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const onFilterChange = (event) => {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const onSubmitFilters = (event) => {
    event.preventDefault();
    loadPublications(filters);
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    loadPublications(emptyFilters);
  };

  const publications = page?.content || [];

  return (
    <div className="page page--list">
      <div className="container publications-shell">
        <div className="publications-header">
          <div>
            <h2>Publicaciones de Adopcion</h2>
            <p className="publications-subtitle">
              Explora mascotas, revisa sus fotos y gestiona interes en un solo
              flujo.
            </p>
          </div>
          <div className="publications-actions">
            <button
              className="ui-btn ui-btn--ghost"
              onClick={() => navigate("/home")}
            >
              Volver al inicio
            </button>
            <button
              className="ui-btn ui-btn--primary"
              onClick={() => navigate("/publications/new")}
            >
              Crear publicacion
            </button>
          </div>
        </div>

        <form className="publications-filters" onSubmit={onSubmitFilters}>
          <select
            name="type"
            value={filters.type}
            onChange={onFilterChange}
            className="ui-input"
          >
            <option value="">Tipo: todos</option>
            <option value="DOG">Perro</option>
            <option value="CAT">Gato</option>
          </select>
          <input
            name="breed"
            value={filters.breed}
            onChange={onFilterChange}
            className="ui-input"
            placeholder="Filtrar por raza"
          />
          <input
            name="zipCode"
            value={filters.zipCode}
            onChange={onFilterChange}
            className="ui-input"
            placeholder="Codigo postal"
          />
          <button className="ui-btn ui-btn--primary" type="submit">
            Aplicar
          </button>
          <button
            className="ui-btn ui-btn--ghost"
            type="button"
            onClick={clearFilters}
          >
            Limpiar
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {loading && !page && (
          <div className="home-loading">
            <span className="spinner" />
            Cargando publicaciones...
          </div>
        )}

        {!loading && publications.length === 0 && (
          <div className="publications-empty">
            <h3>No hay publicaciones con esos filtros</h3>
            <p>Prueba con otros criterios o crea una nueva publicacion.</p>
          </div>
        )}

        {publications.length > 0 && (
          <div className="publications-grid">
            {publications.map((publication) => (
              <button
                key={publication.id}
                className="publication-card"
                onClick={() => navigate(`/publications/${publication.id}`)}
              >
                <span className="publication-card__tag">
                  {publication.type === "DOG" ? "Perro" : "Gato"}
                </span>
                <h3>{publication.petName}</h3>
                <p>{publication.breed || "Raza no especificada"}</p>
                <span className="publication-card__zip">
                  CP {publication.zipCode}
                </span>
              </button>
            ))}
          </div>
        )}

        {loading && page && (
          <p className="publications-refreshing">Actualizando resultados...</p>
        )}
      </div>
    </div>
  );
};

export default Publications;
