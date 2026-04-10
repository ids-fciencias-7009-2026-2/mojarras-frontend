import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Profile from './pages/Profile';
import UpdateProfile from './pages/UpdateProfile';
import Login from './pages/Login'

const RutaProtegida = ({ children }) => {
    const token = sessionStorage.getItem('token');
    if (!token) return <Navigate to="/login" />;
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                {/* Rutas que exigen token */}
                <Route path="/profile" element={<RutaProtegida><Profile /></RutaProtegida>} />
                <Route path="/update-profile" element={<RutaProtegida><UpdateProfile /></RutaProtegida>} />

                {/* Redirección por defecto */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;