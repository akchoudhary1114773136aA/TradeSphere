import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
const DASHBOARD_URL = process.env.REACT_APP_DASHBOARD_URL || "http://localhost:3001";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleDashboardClick = (event) => {
    event.preventDefault();
    closeMenu();
    const token = localStorage.getItem("stockly_token");
    if (token) {
      window.location.href = `${DASHBOARD_URL}?token=${encodeURIComponent(token)}`;
    } else {
      navigate("/login");
    }
  };

  const navItems = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Products", path: "/product" },
    { label: "Pricing", path: "/pricing" },
    { label: "Support", path: "/support" },
  ];

  return (
    <nav className="navbar-tradesphere">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/" onClick={closeMenu}>
            <img src="media/images/logo.svg" alt="Logo" />
          </Link>
        </div>
        <ul className={`navbar-menu ${menuOpen ? "active" : ""}`}>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  isActive ? "navbar-link active" : "navbar-link"
                }
                onClick={closeMenu}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
          <li>
            <a
              href={DASHBOARD_URL}
              className="navbar-link"
              onClick={handleDashboardClick}
            >
              Dashboard
            </a>
          </li>
          <li className="navbar-actions">
            <Link to="/signup" className="navbar-cta" onClick={closeMenu}>
              Sign up
            </Link>
          </li>
        </ul>
        <button
          className="navbar-hamburger"
          type="button"
          onClick={toggleMenu}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
        >
          <span className={menuOpen ? "line active" : "line"}></span>
          <span className={menuOpen ? "line active" : "line"}></span>
          <span className={menuOpen ? "line active" : "line"}></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
