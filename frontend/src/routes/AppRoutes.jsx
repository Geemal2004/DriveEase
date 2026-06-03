import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";

import Dashboard from "../pages/Dashboard";
import Providers from "../pages/Providers";
import Contracts from "../pages/Contracts";
import Vehicles from "../pages/Vehicles";
import SearchVehicles from "../pages/SearchVehicles";
import Customers from "../pages/Customers";
import Bookings from "../pages/Bookings";
import Login from "../pages/Login";
import RegisterUser from "../pages/RegisterUser";
import Drivers from "../pages/Drivers";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/unauthorized"
        element={
          <div className="login-container">
            <div className="panel-card" style={{ maxWidth: "520px" }}>
              <h2 style={{ marginBottom: "12px" }}>Unauthorized</h2>
              <p className="muted-text">
                You do not have permission to access this section with the current role.
              </p>
            </div>
          </div>
        }
      />
      
      <Route element={<ProtectedRoute />}>
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/vehicles" element={<Vehicles />} />
                <Route path="/search-vehicles" element={<SearchVehicles />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/bookings" element={<Bookings />} />

                {/* Admin + Manager Only Routes */}
                <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER"]} />}>
                  <Route path="/providers" element={<Providers />} />
                  <Route path="/contracts" element={<Contracts />} />
                  <Route path="/drivers" element={<Drivers/>} />
                </Route>
                
                {/* Admin Only Route */}
                <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
                  <Route path="/register-user" element={<RegisterUser />} />
                </Route>
              </Routes>
            </Layout>
          }
        />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
