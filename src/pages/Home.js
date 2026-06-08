import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mapApi, publicationsApi, usersApi, ApiError } from "../services/api";
import Map from "../components/Map";

const emptyFilters = { type: "", zipCode: "", breed: "" };

const typeOptions = [
  { value: "", label: "Todas", icon: "🐾" },
  { value: "DOG", label: "Perros", icon: "🐶" },
  { value: "CAT", label: "Gatos", icon: "🐱" },
];

function pluralPets(n) {
  return n === 1 ? "mascota" : "mascotas";
}

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);

  const [clusters, setClusters] = useState([]);
  const [pubsPage, setPubsPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [selectedCluster, setSelectedCluster] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const profile = await usersApi.me();
        if (!cancelled) setUser(profile);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          navigate("/login");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const loadData = useCallback(async (queryFilters) => {
    setError(null);
    try {
      const [clusterData, listData] = await Promise.all([
        mapApi.cluster(queryFilters),
        publicationsApi.list(queryFilters),
      ]);
      setClusters(clusterData || []);
      setPubsPage(listData);
    } catch (err) {
      setError(err.message || "Error cargando datos");
      if (err instanceof ApiError && err.status === 401) {
        navigate("/login");
      }
    }
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadData(appliedFilters);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [appliedFilters, loadData]);

  const applyFilters = (next) => {
    setSelectedCluster(null);
    setSelectedId(null);
    setAppliedFilters(next);
  };

  const onSearch = (event) => {
    event.preventDefault();
    applyFilters(filters);
  };

  const selectCategory = (value) => {
    const next = { ...filters, type: value };
    setFilters(next);
    applyFilters(next);
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    applyFilters(emptyFilters);
  };

  const handleClusterClick = useCallback((cluster) => {
    setSelectedCluster(cluster);
    setSelectedId(cluster.publications?.[0]?.id || null);
  }, []);

  const handlePublicationClick = useCallback((pub, cluster) => {
    setSelectedCluster(cluster);
    setSelectedId(pub.id);
  }, []);

  const totalOnMap = useMemo(
    () => clusters.reduce((acc, c) => acc + (c.count || 0), 0),
    [clusters],
  );

  const publications = pubsPage?.content || [];
  const hasFilters =
    appliedFilters.type || appliedFilters.zipCode || appliedFilters.breed;

  const refresh = async () => {
    setRefreshing(true);
    await loadData(appliedFilters);
    setRefreshing(false);
  };

  return (
    <div className="page page--home">
      <section className="home-hero-band home-hero-band--compact">
        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <span className="home-hero-eyebrow">🐾 Adopta, no compres</span>
            <h1 className="home-hero-title">
              {user ? `Hola ${user.firstName},` : "Hola,"} encuentra a tu próximo mejor amigo
            </h1>
            <p className="home-hero-text">
              Explora mascotas cerca de ti en el mapa o navega la lista completa.
            </p>
          </div>

          <form className="home-search" onSubmit={onSearch}>
            <div className="home-search__field">
              <label className="home-search__label">Tipo</label>
              <select
                name="type"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
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
                onChange={(e) => setFilters({ ...filters, breed: e.target.value })}
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
                inputMode="numeric"
                onChange={(e) => setFilters({ ...filters, zipCode: e.target.value })}
                className="home-search__input"
                placeholder="Cerca de ti"
              />
            </div>
            <button className="home-search__btn" type="submit" aria-label="Buscar">
              <span aria-hidden="true">🔍</span>
              <span className="home-search__btn-text">Buscar</span>
            </button>
          </form>
        </div>
      </section>

      <div className="container home-content">
        <div className="home-categories" role="tablist" aria-label="Categorías">
          {typeOptions.map((cat) => (
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
          {hasFilters && (
            <button
              className="home-results-clear"
              type="button"
              onClick={clearFilters}
            >
              Limpiar filtros
            </button>
          )}
          <button
            type="button"
            className="ui-btn ui-btn--primary ui-btn--dense home-publish-btn"
            onClick={() => navigate("/publications/new")}
          >
            + Dar en adopción
          </button>
        </div>

        {error && <div className="home-error">{error}</div>}

        <section className="home-map-section" aria-label="Mapa de mascotas">
          <header className="home-map-header">
            <div>
              <h2>Mapa de adopciones</h2>
              <p className="home-map-subtitle">
                {loading
                  ? "Buscando mascotas..."
                  : `${totalOnMap} ${pluralPets(totalOnMap)} en ${clusters.length} ${
                      clusters.length === 1 ? "ubicación" : "ubicaciones"
                    }`}
              </p>
            </div>
            <button
              type="button"
              className="ui-btn ui-btn--ghost ui-btn--dense"
              onClick={refresh}
              disabled={refreshing || loading}
            >
              {refreshing ? "Actualizando..." : "Refrescar"}
            </button>
          </header>

          <div className="home-map-wrap">
            <div className="home-map-canvas">
              {loading ? (
                <div className="home-loading home-loading--inline">
                  <span className="spinner" />
                  Cargando mapa...
                </div>
              ) : clusters.length === 0 ? (
                <div className="publications-empty publications-empty--map">
                  <h3>No encontramos mascotas en esta búsqueda</h3>
                  <p>Cambia los filtros o limpia la búsqueda.</p>
                </div>
              ) : (
                <Map
                  clusters={clusters}
                  selectedId={selectedId}
                  onSelectPublication={handlePublicationClick}
                  onSelectCluster={handleClusterClick}
                />
              )}
            </div>

            <aside className="home-map-side" aria-label="Información del marcador">
              {selectedCluster ? (
                <div className="map-side-card">
                  <div className="map-side-card__header">
                    <span className="map-side-card__zip">📍 C.P. {selectedCluster.zipCode}</span>
                    <span className="map-side-card__count">
                      {selectedCluster.count} {pluralPets(selectedCluster.count)}
                    </span>
                  </div>
                  <ul className="map-side-card__list">
                    {selectedCluster.publications.map((p) => (
                      <li
                        key={p.id}
                        className={`map-side-card__item${
                          p.id === selectedId ? " map-side-card__item--active" : ""
                        }`}
                      >
                        <button
                          type="button"
                          className="map-side-card__row"
                          onClick={() => setSelectedId(p.id)}
                        >
                          <span className="map-side-card__thumb">
                            {p.thumbnail ? (
                              <img src={p.thumbnail} alt={p.petName} loading="lazy" />
                            ) : (
                              <span aria-hidden>{p.type === "DOG" ? "🐶" : "🐱"}</span>
                            )}
                          </span>
                          <span className="map-side-card__meta">
                            <strong>{p.petName}</strong>
                            <span>{p.breed || "Mestizo"}</span>
                          </span>
                        </button>
                        <button
                          type="button"
                          className="ui-btn ui-btn--primary ui-btn--dense"
                          onClick={() => navigate(`/publications/${p.id}`)}
                        >
                          Ver
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="map-side-empty">
                  <h3>Selecciona un marcador</h3>
                  <p>Toca cualquier punto del mapa para ver las mascotas disponibles en esa zona.</p>
                </div>
              )}
            </aside>
          </div>
        </section>

        <section className="home-list-section">
          <div className="home-results-bar">
            <h2>
              {hasFilters ? "Resultados de tu búsqueda" : "Mascotas disponibles"}
            </h2>
            {!loading && (
              <span className="home-results-count">
                {publications.length} {pluralPets(publications.length)}
              </span>
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
              <p>Intenta quitar el código postal o probar otro tipo de mascota.</p>
            </div>
          )}

          {!loading && publications.length > 0 && (
            <div className="publications-grid">
              {publications.map((pub, index) => (
                <button
                  key={pub.id}
                  type="button"
                  className={`publication-card publication-card--rich publication-card--fade${
                    pub.id === selectedId ? " publication-card--selected" : ""
                  }`}
                  style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
                  onClick={() => navigate(`/publications/${pub.id}`)}
                  aria-label={`Ver publicación de ${pub.petName}`}
                >
                  <div className="publication-card__media">
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
                    <span className="publication-card__zip">📍 C.P. {pub.zipCode}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
