import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/UserService";
import { publicationService } from "../services/PublicationService";

const emptyFilters = { type: "", zipCode: "", breed: "" };

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

  if (error) return <div className="home-error">{error}</div>;
  if (!user)
    return (
      <div className="home-loading">
        <span className="spinner" />
        Cargando panel...
      </div>
    );

  const publications = page?.content || [];

  return (
    <div className="page page--list">
      <div className="container publications-shell">
        
        {/* Encabezado del Home */}
        <div className="publications-header">
          <div>
            <h2>¡Hola, {user.firstName}!</h2>
            <p className="publications-subtitle">
              Encuentra a tu próximo mejor amigo. Explora las mascotas en adopción.
            </p>
          </div>
          <div className="publications-actions">
            <button
              className="ui-btn ui-btn--primary"
              onClick={() => navigate("/publications/new")}
            >
              + Dar en adopción
            </button>
          </div>
        </div>

        {/* Barra de Filtros */}
        <form className="publications-filters" onSubmit={onSubmitFilters}>
          <select
            name="type"
            value={filters.type}
            onChange={onFilterChange}
            className="ui-input"
          >
            <option value="">Tipo: Todos</option>
            <option value="DOG">Perro</option>
            <option value="CAT">Gato</option>
          </select>
          <input
            name="breed"
            value={filters.breed}
            onChange={onFilterChange}
            className="ui-input"
            placeholder="Filtrar por raza..."
          />
          <input
            name="zipCode"
            value={filters.zipCode}
            onChange={onFilterChange}
            className="ui-input"
            placeholder="Código postal..."
          />
          <button className="ui-btn ui-btn--primary" type="submit">
            Filtrar
          </button>
          <button
            className="ui-btn ui-btn--ghost"
            type="button"
            onClick={clearFilters}
          >
            Limpiar
          </button>
        </form>

        {loading && !page && (
          <div className="home-loading" style={{ height: '200px' }}>
            <span className="spinner" />
            Buscando mascotas...
          </div>
        )}

        {!loading && publications.length === 0 && (
          <div className="publications-empty">
            <h3>No encontramos mascotas con esos filtros</h3>
            <p>Intenta quitando el código postal o buscando otro tipo de mascota.</p>
          </div>
        )}

        {/* Cuadrícula de Tarjetas de Mascotas con Fotos */}
        {publications.length > 0 && (
          <div className="publications-grid">
            {publications.map((pub) => (
              <button
                key={pub.id}
                className="publication-card"
                style={{ padding: 0, overflow: 'hidden', alignItems: 'flex-start', border: 'none' }}
                onClick={() => navigate(`/publications/${pub.id}`)}
              >
                {/* Foto */}
                <div style={{ width: '100%', height: '200px', backgroundColor: '#e4ecf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {pub.thumbnail ? (
                    <img 
                      src={pub.thumbnail} 
                      alt={pub.petName} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <span style={{ fontSize: '4rem' }}>{pub.type === 'DOG' ? '🐶' : '🐱'}</span>
                  )}
                </div>
                
                {/* Nombre y CP */}
                <div style={{ padding: '16px', width: '100%', textAlign: 'left', backgroundColor: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937' }}>{pub.petName}</h3>
                    <span style={{ fontSize: '0.75rem', background: 'var(--primary-soft)', color: 'var(--primary-dark)', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
                      {pub.type === 'DOG' ? 'Perro' : 'Gato'}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>
                    {pub.breed || "Mestizo"}
                  </p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#5f6f82', fontWeight: '600', fontSize: '0.9rem' }}>
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