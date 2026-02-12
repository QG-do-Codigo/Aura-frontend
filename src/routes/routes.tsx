import { Dashboard } from "../pages/dashboard";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { TasksPage } from "../pages/dashboard/Tasks";
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
import { PrivateRoute } from "./PrivateRoute";
import { ToastContainer } from "react-toastify";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {'Rotas publicas'}
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />

        {'Rotas privadas'}
        <Route path="/dashboard" element={<PrivateRoute><DashboardLayout/></PrivateRoute>}>
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="tasks" element={<PrivateRoute><TasksPage /></PrivateRoute>} />
        <Route path="notes" element={<PrivateRoute><NotesPage /></PrivateRoute>} />
        <Route path="shopping" element={<PrivateRoute><ShoppingPage /></PrivateRoute>} />
        <Route path="health" element={<PrivateRoute><HealthPage /></PrivateRoute>} />
        <Route path="finance" element={<PrivateRoute><FinancePage /></PrivateRoute>} />
        <Route path="sleep" element={<PrivateRoute><SleepPage /></PrivateRoute>} />
        <Route path="ideas" element={<PrivateRoute><IdeasPage /></PrivateRoute>} />
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default AppRoutes;
