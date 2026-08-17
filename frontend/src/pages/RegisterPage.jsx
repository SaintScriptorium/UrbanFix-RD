import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';

const initialForm = { fullName: '', email: '', password: '' };

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  // Validación en el cliente: no reemplaza la del backend (que sigue
  // siendo la fuente de verdad), pero evita un viaje de red completo por
  // un error que ya podemos detectar mirando el formulario.
  const validate = () => {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = 'Ingresa tu nombre completo.';
    if (!form.email.trim()) errors.email = 'Ingresa tu correo electrónico.';
    if (form.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register(form);
      // HU1: registro exitoso redirige al login. Pasamos un flag por state
      // (no por query string) para no dejar rastro en la URL ni en el
      // historial del navegador.
      navigate('/login', { state: { justRegistered: true } });
    } catch (error) {
      const message = error.response?.data?.message || 'No se pudo completar el registro. Intenta de nuevo.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Crear cuenta"
      title="Súmate a UrbanFix RD"
      subtitle="Regístrate para empezar a reportar incidencias en tu comunidad."
    >
      <form onSubmit={handleSubmit} noValidate>
        <FormField
          label="Nombre completo"
          type="text"
          autoComplete="name"
          value={form.fullName}
          onChange={handleChange('fullName')}
          error={fieldErrors.fullName}
        />
        <FormField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange('email')}
          error={fieldErrors.email}
        />
        <FormField
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange('password')}
          error={fieldErrors.password}
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
          {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      <p className="text-sm text-asphalt-600 mt-6">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-blueprint-700 font-medium hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
