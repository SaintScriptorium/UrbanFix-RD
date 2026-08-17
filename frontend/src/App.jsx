import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// El feed (Épica 3) todavía no existe; se deja el placeholder para que el
// flujo de login → redirección sea probable de punta a punta desde ya.
// Cuando se construya /feed real, solo hay que reemplazar este componente
// y envolverlo en <ProtectedRoute>.
function FeedPlaceholder() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-asphalt-50">
      <p className="text-asphalt-600 text-sm">Feed de reportes — Épica 3, pendiente.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/feed" element={<FeedPlaceholder />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
