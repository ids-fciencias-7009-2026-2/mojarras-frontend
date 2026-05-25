import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/UserService";
import "../assets/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem("token");
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

  useEffect(() => {
    const handlePointerDown = (event) => {
      const target = event.target;

      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <nav className="home-nav">
      <button
        type="button"
        className="home-nav__brand"
        onClick={() => navigate("/home")}
      >
        <span className="home-nav__fish" aria-hidden="true">
          🐟
        </span>
        <span className="home-nav__title">Mojarras</span>
      </button>

      <div className="home-nav__right">
        {user && (
          <span className="home-nav__greeting">
            ¡Bienvenido de vuelta,{" "}
            <strong>
              {user.firstName} {user.lastName}
            </strong>
            !
          </span>
        )}

        <div className="nav-dropdown-container" ref={menuRef}>
          <button
            ref={buttonRef}
            type="button"
            className="nav-avatar-btn"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={
              user
                ? `Abrir menú de ${user.firstName} ${user.lastName}`
                : "Abrir menú de usuario"
            }
            onClick={() => setMenuOpen((current) => !current)}
          >
            {user
              ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
              : "⚙️"}
          </button>

          {menuOpen && (
            <div className="nav-dropdown-menu" role="menu">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/profile");
                }}
              >
                👤 Mi Perfil
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="logout-text"
              >
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
