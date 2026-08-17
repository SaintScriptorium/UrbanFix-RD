import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Envuelve cualquier página que exija sesión (el feed de Épica 3, por
// ejemplo). Si no hay token, redirige al login en vez de dejar que la
// página intente pedir datos a una API que le va a responder 401.
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
