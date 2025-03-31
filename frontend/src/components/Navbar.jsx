import React from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import "../styles/Navbar.css";
import logoutIcon from "../assets/logout.svg"; // Import the logout SVG

function Navbar({ title }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Clear tokens or any stored data
    navigate("/login"); // Redirect to login page
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-title">
        HOME
      </Link>
      <button className="navbar-logout" onClick={handleLogout}>
        <img src={logoutIcon} alt="Logout Icon" className="logout-icon" /> Logout
      </button>
    </nav>
  );
}

export default Navbar;