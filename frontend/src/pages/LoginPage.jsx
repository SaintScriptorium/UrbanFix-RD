import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const justRegistered = Boolean(location.state?.justRegistered);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!form.email.trim() || !form.password) {
      setFormError('Ingresa tu correo y contraseña.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(form);
      navigate('/feed');
    } catch (error) {
      const message = error.response?.data?.message || 'No se pudo iniciar sesión. Intenta de nuevo.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Bienvenido de nuevo"
      title="Inicia sesión"
      subtitle="Entra a tu cuenta para ver y reportar incidencias."
    >
      {justRegistered && (
        <p className="text-sm text-blueprint-700 bg-blueprint-900/5 border border-blueprint-900/10 rounded-md px-3 py-2 mb-5">
          Cuenta creada. Ya puedes iniciar sesión.
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange('email')}
        />
        <FormField
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange('password')}
        />

        {formError && (
          <p className="text-alert-600 text-sm mb-4" role="alert">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-blueprint-900 text-white text-sm font-medium py-2.5
            hover:bg-blueprint-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
        </button>
      </form>

      <p className="text-sm text-asphalt-600 mt-6">
        ¿Aún no tienes cuenta?{' '}
        <Link to="/register" className="text-blueprint-700 font-medium hover:underline">
          Regístrate
        </Link>
      </p>
    </AuthLayout>
  );
}
