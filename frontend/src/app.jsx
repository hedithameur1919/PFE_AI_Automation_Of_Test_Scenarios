import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ProtectedRoute from "./protectedroute";
import Login from "./login";
import LandingPage from "./landingpage";
import ForgotPassword from "./forgotpassword";
import ResetPassword from "./resetpassword";
import Home from "./home";
import Admin from "./admin";
import ManageUser from "./manageuser";
import ManageRequirement from "./managerequirement";
import ManageRequirementDetail from "./managerequirementdetail";

// Define custom MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#007bff",
    },
    secondary: {
      main: "#6c757d",
    },
    background: {
      default: "#f8f9fa",
    },
    text: {
      primary: "#212529",
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute requiredRole="user">
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/requirements"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageRequirement />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/requirements/:id" 
          element={
            <ProtectedRoute requiredRole="admin">
              <ManageRequirementDetail />
            </ProtectedRoute>
          }
          />

          <Route path="/landing" element={<LandingPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/landing" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
