import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./assets/App.css";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import UpdateProfile from "./pages/UpdateProfile";
import Home from "./pages/Home";
import CreatePublication from "./pages/CreatePublication";
import PublicationDetail from "./pages/PublicationDetail";
import MyPublications from "./pages/MyPublications";
import EditPublication from "./pages/EditPublication";
import VerifyAccount from "./pages/VerifyAccount";
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

const protectedRoutes = [
  { path: "/home", element: <Home /> },
  { path: "/profile", element: <Profile /> },
  { path: "/update-profile", element: <UpdateProfile /> },
  { path: "/publications/new", element: <CreatePublication /> },
  { path: "/publications/:id", element: <PublicationDetail /> },
  { path: "/publications/:id/edit", element: <EditPublication /> },
  { path: "/my-publications", element: <MyPublications /> },
];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyAccount />} />

        {protectedRoutes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={<PrivateRoute>{element}</PrivateRoute>}
          />
        ))}

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
