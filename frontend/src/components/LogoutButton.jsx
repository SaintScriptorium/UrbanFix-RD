import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
      data-testid="logout-button"
      onClick={handleLogout}
      className="text-sm font-medium text-asphalt-600 hover:text-alert-600 transition-colors"
    >
      Cerrar sesión
    </button>
  );
}
