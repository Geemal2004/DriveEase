import { Navigate, Outlet } from "react-router-dom";
import authService from "../services/authService";

const ProtectedRoute = ({ allowedRoles }) => {
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !user.roles.some((role) => allowedRoles.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
