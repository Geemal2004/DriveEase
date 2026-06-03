import { NavLink, useNavigate } from "react-router-dom";
import authService from "../services/authService";

function Sidebar() {
  const user = authService.getCurrentUser();
  const navigate = useNavigate();
  const canManageProvidersAndContractsAndDrivers =
    user?.roles?.includes("ROLE_ADMIN") || user?.roles?.includes("ROLE_MANAGER");

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div>
        <h2 className="logo">DriveEase</h2>

        <nav className="nav-menu">
          <NavLink to="/" className="nav-link">
            Dashboard
          </NavLink>

          {canManageProvidersAndContractsAndDrivers && (
            <NavLink to="/drivers" className="nav-link">
              Drivers
            </NavLink>
          )}

          {canManageProvidersAndContractsAndDrivers && (
            <NavLink to="/providers" className="nav-link">
              Providers
            </NavLink>
          )}

          {canManageProvidersAndContractsAndDrivers && (
            <NavLink to="/contracts" className="nav-link">
              Contracts
            </NavLink>
          )}

          <NavLink to="/vehicles" className="nav-link">
            Vehicles
          </NavLink>

          <NavLink to="/search-vehicles" className="nav-link">
            Search Vehicles
          </NavLink>

          <NavLink to="/customers" className="nav-link">
            Customers
          </NavLink>

          <NavLink to="/bookings" className="nav-link">
            Bookings
          </NavLink>

          {user && user.roles && user.roles.includes("ROLE_ADMIN") && (
            <NavLink to="/register-user" className="nav-link">
              Add User
            </NavLink>
          )}
        </nav>
      </div>
      <div className="sidebar-footer">
        {user && <p className="sidebar-user">Signed in as {user.username}</p>}
        <button className="danger-button" onClick={handleLogout} style={{ width: "100%" }}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
