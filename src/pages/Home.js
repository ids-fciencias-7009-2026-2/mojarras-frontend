import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const Home = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const loadUser = async () => {
      try {
        const data = await api.getProfile(token);
        setUser(data);
      } catch (err) {
        setError('Sesión inválida. Por favor inicia sesión nuevamente.');
        sessionStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    loadUser();
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  if (error) return <div className="home-error">{error}</div>;
  if (!user) return <div className="home-loading"><span className="spinner" />Cargando...</div>;

  return (
    <div className="home-wrapper">
      {/* Navbar */}
      <nav className="home-nav">
        <div className="home-nav__brand">
          <span className="home-nav__fish">🐟</span>
          <span className="home-nav__title">Mojarras</span>
        </div>
        <div className="home-nav__actions">
          <button
            className="home-nav__btn home-nav__btn--profile"
            onClick={() => navigate('/profile')}
          >
            Mi Perfil
          </button>
          <button
            className="home-nav__btn home-nav__btn--logout"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero__content">
          <p className="home-hero__greeting">¡Bienvenido de vuelta,</p>
          <h1 className="home-hero__name">{user.firstName} {user.lastName}!</h1>
          <p className="home-hero__sub">@{user.username} · {user.email}</p>
        </div>
        <div className="home-hero__badge">
          {user.firstName?.charAt(0).toUpperCase()}{user.lastName?.charAt(0).toUpperCase()}
        </div>
      </section>

      {/* Cards */}
      <section className="home-cards">
        <div className="home-card" onClick={() => navigate('/profile')}>
          <div className="home-card__icon">👤</div>
          <div className="home-card__info">
            <h3>Mi Perfil</h3>
            <p>Consulta tu información personal</p>
          </div>
          <span className="home-card__arrow">→</span>
        </div>

        <div className="home-card" onClick={() => navigate('/update-profile')}>
          <div className="home-card__icon">✏️</div>
          <div className="home-card__info">
            <h3>Editar Perfil</h3>
            <p>Actualiza tus datos personales</p>
          </div>
          <span className="home-card__arrow">→</span>
        </div>

        <div className="home-card home-card--logout" onClick={handleLogout}>
          <div className="home-card__icon">🚪</div>
          <div className="home-card__info">
            <h3>Cerrar Sesión</h3>
            <p>Salir de tu cuenta de forma segura</p>
          </div>
          <span className="home-card__arrow">→</span>
        </div>
      </section>

      {/* Footer info */}
      <footer className="home-footer">
        <p>Código Postal: <strong>{user.zipCode || 'No registrado'}</strong></p>
      </footer>
    </div>
  );
};

export default Home;