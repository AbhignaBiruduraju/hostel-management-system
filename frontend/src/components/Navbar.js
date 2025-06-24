import { NavLink } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <img src="/logo.jpg" alt="Logo" className="logo" />
      <ul>
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")} end>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
            Login
          </NavLink>
        </li>
        <li>
          <NavLink to="/location" className={({ isActive }) => (isActive ? "active" : "")}>
            Location
          </NavLink>
        </li>
        
      </ul>
    </nav>
  );
};

export default Navbar;
