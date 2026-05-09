import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "../src/assets/App.css";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import UpdateProfile from "./pages/UpdateProfile";
import Home from "./pages/Home";
import CreatePublication from "./pages/CreatePublication";
import PublicationDetail from "./pages/PublicationDetail";
import PublicationComplete from "./pages/PublicationComplete";
import MyPublications from "./pages/MyPublications";
import EditPublication from "./pages/EditPublication";
import Navbar from "./components/Navbar";

function PrivateRoute({ children }) {
  const token = sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <Navbar />
      {children}
    </>
  );
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
        <Route
          path="/my-publications"
          element={
            <PrivateRoute>
              <MyPublications />
            </PrivateRoute>
          }
        />
        <Route
          path="/publications/:id/edit"
          element={
            <PrivateRoute>
              <EditPublication />
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
