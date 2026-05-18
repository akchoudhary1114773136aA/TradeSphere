import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar-tradesphere">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <img src="media/images/logo.svg" alt="Logo" />
          </Link>
        </div>
        <ul className={`navbar-menu ${menuOpen ? "active" : ""}`}>
          <li>
            <Link to="/" className="navbar-link">
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className="navbar-link">
              About
            </Link>
          </li>
          <li>
            <Link to="/product" className="navbar-link">
              Products
            </Link>
          </li>
          <li>
            <Link to="/pricing" className="navbar-link">
              Pricing
            </Link>
          </li>
          <li>
            <Link to="/support" className="navbar-link">
              Support
            </Link>
          </li>
        </ul>
        <div className="navbar-hamburger" onClick={toggleMenu}>
          <span className={menuOpen ? "line active" : "line"}></span>
          <span className={menuOpen ? "line active" : "line"}></span>
          <span className={menuOpen ? "line active" : "line"}></span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
