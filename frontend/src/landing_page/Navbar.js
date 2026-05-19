import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Dashboard", path: "/dashboard" },
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
