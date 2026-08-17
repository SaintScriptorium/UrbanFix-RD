import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Pensado para vivir en la barra de navegación del feed (Épica 3), no en
// las páginas de auth. Se mantiene como su propio componente para no
// acoplar la lógica de logout a donde sea que termine viviendo esa barra.
export default function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-sm font-medium text-asphalt-600 hover:text-alert-600 transition-colors"
    >
      Cerrar sesión
    </button>
  );
}
