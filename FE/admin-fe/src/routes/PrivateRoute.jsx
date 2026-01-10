import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user.roleId === 3) return <Navigate to="/login" replace />; // chặn ông nào = 2 thì ko được vào

  return children;
}
