import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Chặn khách hàng không được vào admin
  if (user.roleId === 2) return <Navigate to="/login" replace />;

  return children;
}
