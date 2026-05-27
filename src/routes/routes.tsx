import { TasksPage } from "../pages/Tasks";

import { RootRedirect } from "../pages/auth/redirect";
import { Dashboard } from "../pages/dashboard";
import { DashboardLayout } from "../layouts/DashboardLayout";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "../pages/auth/SignIn";
import SignUp from "../pages/auth/SignUp";
import { NotesPage } from "../pages/notes/components/NotesPage";
import { PrivateRoute } from "./PrivateRoute";
import { ToastContainer } from "react-toastify";
import { ShoppingListPage } from "../pages/shopping";
import { FinancePage } from "../pages/finance";

import { HealthPage } from "../pages/health";
import { SleepPage } from "../pages/sleep";
import { UserPage } from "../pages/user";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        {/* rotas públicas */}
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />

        {/* rotas privadas – agrupadas em um único PrivateRoute pai */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="shopping" element={<ShoppingListPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="health" element={<HealthPage />} />
            <Route path="sleep" element={<SleepPage />} />
            <Route path="profile" element={<UserPage />} />
          </Route>
        </Route>
      </Routes>

      <ToastContainer />
    </BrowserRouter>
  );
}

export default AppRoutes;
