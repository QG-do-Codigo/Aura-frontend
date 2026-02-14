import { Dashboard } from "../pages/dashboard";
import { DashboardLayout } from "../layouts/DashboardLayout";
// import { NotesPage } from "../pages/dashboard/Notes";
import { ShoppingPage } from "../pages/dashboard/Shopping";
import { IdeasPage } from "../pages/dashboard/Ideas";
import { SleepPage } from "../pages/dashboard/SleepPage";
import { FinancePage } from "../pages/dashboard/Finance";
import { HealthPage } from "../pages/dashboard/Health";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "../pages/auth/signIn";
import SignUp from "../pages/auth/signUp";
import { NotesPage } from "../pages/notes/components/notesPage";
import { TasksPage } from "../pages/Tasks/TaskPage";
import { PrivateRoute } from "./PrivateRoute";
import { ToastContainer } from "react-toastify";
import { RootRedirect } from "../pages/auth/redirect";

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
            <Route path="shopping" element={<ShoppingPage />} />
            <Route path="health" element={<HealthPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="sleep" element={<SleepPage />} />
            <Route path="ideas" element={<IdeasPage />} />
          </Route>
        </Route>
      </Routes>

      <ToastContainer />
    </BrowserRouter>
  );
}

export default AppRoutes;
