import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/UserService";
import { publicationService } from "../services/PublicationService";

const emptyFilters = { type: "", zipCode: "", breed: "" };

const categories = [
  { value: "", label: "Todas", icon: "🐾" },
  { value: "DOG", label: "Perros", icon: "🐶" },
  { value: "CAT", label: "Gatos", icon: "🐱" },
];

const Home = () => {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState(null);
  const [filters, setFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadData = async (queryFilters = filters) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!user) {
        const profile = await userService.getProfile(token);
        setUser(profile);
      }

      const params = { page: 0, size: 20, sort: "id,desc" };
      if (queryFilters.type) params.type = queryFilters.type;
      if (queryFilters.zipCode) params.zipCode = queryFilters.zipCode;
      if (queryFilters.breed) params.breed = queryFilters.breed;

      const data = await publicationService.listPublications(token, params);
      setPage(data);
    } catch (err) {
      setError("Error al cargar los datos. Por favor, intenta de nuevo.");
      if (err.message.includes("Sesión")) {
        sessionStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
    loadData(filters);
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    loadData(emptyFilters);
  };

  const selectCategory = (value) => {
    const next = { ...filters, type: value };
    setFilters(next);
    loadData(next);
  };

  if (error) return <div className="home-error">{error}</div>;
  if (!user)
    return (
      <div className="home-loading">
        <span className="spinner" />
        Cargando panel...
      </div>
    );

  const publications = page?.content || [];
  const hasFilters = filters.type || filters.zipCode || filters.breed;

  return (
    <div className="page page--home">
      <section className="home-hero-band">
        <div className="home-hero-inner">
          <span className="home-hero-eyebrow">🐾 Adopta, no compres</span>
          <h1 className="home-hero-title">
            Hola {user.firstName}, encuentra a tu próximo mejor amigo
          </h1>
          <p className="home-hero-text">
            Explora mascotas en adopción cerca de ti y dale un hogar a quien más
            lo necesita.
          </p>

          <form className="home-search" onSubmit={onSubmitFilters}>
            <div className="home-search__field">
              <label className="home-search__label">Tipo</label>
              <select
                name="type"
                value={filters.type}
                onChange={onFilterChange}
                className="home-search__input"
              >
                <option value="">Todas</option>
                <option value="DOG">Perro</option>
                <option value="CAT">Gato</option>
              </select>
            </div>
            <div className="home-search__divider" />
            <div className="home-search__field">
              <label className="home-search__label">Raza</label>
              <input
                name="breed"
                value={filters.breed}
                onChange={onFilterChange}
                className="home-search__input"
                placeholder="Cualquier raza"
              />
            </div>
            <div className="home-search__divider" />
            <div className="home-search__field">
              <label className="home-search__label">Código postal</label>
              <input
                name="zipCode"
                value={filters.zipCode}
                onChange={onFilterChange}
                className="home-search__input"
                placeholder="Cerca de ti"
              />
            </div>
            <button
              className="home-search__btn"
              type="submit"
              aria-label="Buscar"
            >
              <span aria-hidden="true">🔍</span>
              <span className="home-search__btn-text">Buscar</span>
            </button>
          </form>
        </div>
      </section>

      <div className="container home-content">
        <div className="home-categories" role="tablist" aria-label="Categorías">
          {categories.map((cat) => (
            <button
              key={cat.value || "all"}
              type="button"
              role="tab"
              aria-selected={filters.type === cat.value}
              className={`home-cat-pill${
                filters.type === cat.value ? " home-cat-pill--active" : ""
              }`}
              onClick={() => selectCategory(cat.value)}
            >
              <span aria-hidden="true">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
          <button
            type="button"
            className="ui-btn ui-btn--primary ui-btn--dense home-publish-btn"
            onClick={() => navigate("/publications/new")}
          >
            + Dar en adopción
          </button>
        </div>

        <div className="home-results-bar">
          <h2>
            {hasFilters ? "Resultados de tu búsqueda" : "Mascotas disponibles"}
          </h2>
          {!loading && (
            <span className="home-results-count">
              {publications.length}{" "}
              {publications.length === 1 ? "mascota" : "mascotas"}
            </span>
          )}
          {hasFilters && (
            <button
              className="home-results-clear"
              type="button"
              onClick={clearFilters}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {loading && (
          <div className="home-loading home-loading--inline">
            <span className="spinner" />
            Buscando mascotas...
          </div>
        )}

        {!loading && publications.length === 0 && (
          <div className="publications-empty">
            <h3>No encontramos mascotas con esos filtros</h3>
            <p>
              Intenta quitando el código postal o buscando otro tipo de mascota.
            </p>
          </div>
        )}

        {!loading && publications.length > 0 && (
          <div className="publications-grid">
            {publications.map((pub, index) => (
              <button
                key={pub.id}
                type="button"
                className="publication-card publication-card--rich publication-card--fade"
                style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
                onClick={() => navigate(`/publications/${pub.id}`)}
                aria-label={`Ver publicación de ${pub.petName}`}
              >
                <div className="publication-card__media">
                  {pub.thumbnail ? (
                    <img
                      src={pub.thumbnail}
                      alt={pub.petName}
                      className="publication-card__image"
                    />
                  ) : (
                    <span
                      className="publication-card__emoji"
                      aria-hidden="true"
                    >
                      {pub.type === "DOG" ? "🐶" : "🐱"}
                    </span>
                  )}
                  <span className="publication-card__media-tag">
                    {pub.type === "DOG" ? "Perro" : "Gato"}
                  </span>
                </div>

                <div className="publication-card__body">
                  <div className="publication-card__title-row">
                    <h3>{pub.petName}</h3>
                  </div>
                  <p className="publication-card__summary">
                    {pub.breed || "Mestizo"}
                  </p>
                  <span className="publication-card__zip">
                    📍 C.P. {pub.zipCode}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
