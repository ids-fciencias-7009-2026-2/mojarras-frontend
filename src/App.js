import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import UpdateProfile from "./pages/UpdateProfile";
import Home from "./pages/Home";
import Publications from "./pages/Publications";
import CreatePublication from "./pages/CreatePublication";
import PublicationDetail from "./pages/PublicationDetail";
import PublicationComplete from "./pages/PublicationComplete";

function PrivateRoute({ children }) {
  const token = sessionStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protegidas */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/update-profile"
          element={
            <PrivateRoute>
              <UpdateProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/publications"
          element={
            <PrivateRoute>
              <Publications />
            </PrivateRoute>
          }
        />
        <Route
          path="/publications/new"
          element={
            <PrivateRoute>
              <CreatePublication />
            </PrivateRoute>
          }
        />
        <Route
          path="/publications/:id"
          element={
            <PrivateRoute>
              <PublicationDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/publications/:id/complete"
          element={
            <PrivateRoute>
              <PublicationComplete />
            </PrivateRoute>
          }
        />

        {/* Raíz: si hay sesión Home, si no Login */}
        <Route
          path="/"
          element={
            sessionStorage.getItem("token") ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
