import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/UserService';
import '../assets/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem('token');
      if (token) {
        try {
          const data = await userService.getProfile(token);
          setUser(data);
        } catch (error) {
          console.error("Error al cargar usuario en el navbar", error);
        }
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="home-nav new-theme-nav">
      <div 
        className="home-nav__brand" 
        onClick={() => navigate('/home')} 
        style={{ cursor: 'pointer' }}
      >
        <span className="home-nav__fish">🐟</span>
        <span className="home-nav__title">Mojarras</span>
      </div>

      <div className="home-nav__right">
        {user && (
          <span className="home-nav__greeting">
            ¡Bienvenido de vuelta, <strong>{user.firstName} {user.lastName}</strong>!
          </span>
        )}
        <div 
          className="nav-dropdown-container"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <button className="nav-avatar-btn">
            {user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : '⚙️'}
          </button>
          {dropdownOpen && (
            <div className="nav-dropdown-menu">
              <button onClick={() => navigate('/profile')}>
                👤 Mi Perfil
              </button>
              <button onClick={handleLogout} className="logout-text">
                🚪 Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;