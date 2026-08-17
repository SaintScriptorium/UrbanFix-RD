import { createContext, useContext, useEffect, useState } from 'react';
import { loginUser as loginRequest, registerUser as registerRequest } from '../api/authService';

const AuthContext = createContext(null);

const TOKEN_KEY = 'urbanfix_token';
const USER_KEY = 'urbanfix_user';

export function AuthProvider({ children }) {
  // El estado inicial se lee de localStorage con un inicializador perezoso
  // (la función pasada a useState), así la sesión sobrevive a un refresh
  // de página sin parpadear a "no autenticado" en el primer render.
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  // Mantenemos localStorage sincronizado con el estado de React en vez de
  // escribir en localStorage manualmente dentro de login/logout, para que
  // cualquier cambio futuro de token/user (por ejemplo, un refresh token)
  // quede persistido sin tener que acordarse de hacerlo en cada sitio.
  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  const register = async ({ fullName, email, password }) => {
    // HU1 solo pide crear la cuenta y redirigir al login, no dejar al
    // usuario ya autenticado. Por eso register() no toca token/user.
    await registerRequest({ fullName, email, password });
  };

  const login = async ({ email, password }) => {
    const { token: newToken, user: newUser } = await loginRequest({ email, password });
    setToken(newToken);
    setUser(newUser);
  };

  // HU3 — Cierre de sesión. Un JWT no se puede "revocar" desde el cliente;
  // lo único real que podemos hacer aquí es descartarlo. Es exactamente lo
  // que vuelve inútil al token: sin él, el interceptor de axiosClient deja
  // de enviarlo y cualquier ruta protegida por requireAuth responde 401.
  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token),
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }
  return context;
}
