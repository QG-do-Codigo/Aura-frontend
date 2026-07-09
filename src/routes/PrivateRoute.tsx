import { Navigate, Outlet } from "react-router-dom";
import { getAuthToken, hasValidAuthToken } from "../services/auth/authSession";

export function PrivateRoute() {
  const token = getAuthToken();

  if (!hasValidAuthToken(token)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Outlet />
    </>
  );
}
