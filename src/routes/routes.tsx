import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "../pages/auth/signIn";
import SignUp from "../pages/auth/signUp";
import { Dashboard } from "../pages/dashboard";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
