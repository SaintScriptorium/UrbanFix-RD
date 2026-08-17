const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// 10 rondas es el estándar recomendado por bcrypt hoy: suficientemente
// costoso para frenar ataques de fuerza bruta, sin volver el registro
// perceptiblemente lento para el usuario.
const SALT_ROUNDS = 10;

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * POST /api/auth/register
 * HU1 — Registro de usuario.
 */
const register = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ message: 'Nombre, correo y contraseña son obligatorios.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'El correo electrónico no es válido.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
  }

  // Normalizamos el correo para que "Ana@Gmail.com" y "ana@gmail.com" se
  // traten como la misma cuenta, tanto aquí como en el login.
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);

  if (existingUser.rows.length > 0) {
    // 409 Conflict: la petición es válida, pero choca con el estado actual
    // del servidor (ya existe un recurso con ese correo).
    return res.status(409).json({ message: 'Ya existe una cuenta registrada con este correo.' });
  }

  // Nunca guardamos la contraseña tal cual llega; bcrypt.hash genera el
  // salt internamente y lo empaqueta dentro del propio hash resultante,
  // por lo que no hace falta almacenar el salt en una columna aparte.
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const { rows } = await pool.query(
    `INSERT INTO users (full_name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, full_name, email, created_at`,
    [fullName.trim(), normalizedEmail, passwordHash]
  );

  return res.status(201).json({ user: rows[0] });
};

/**
 * POST /api/auth/login
 * HU2 — Inicio de sesión.
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json({ message: 'Correo y contraseña son obligatorios.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const { rows } = await pool.query(
    'SELECT id, full_name, email, password_hash FROM users WHERE email = $1',
    [normalizedEmail]
  );

  // Mensaje genérico e idéntico tanto si el correo no existe como si la
  // contraseña no coincide (así lo pide el criterio de aceptación de HU2):
  // no le decimos a un atacante cuál de los dos datos falló.
  const invalidCredentials = { message: 'Correo o contraseña incorrectos.' };

  if (rows.length === 0) {
    return res.status(401).json(invalidCredentials);
  }

  const user = rows[0];
  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    return res.status(401).json(invalidCredentials);
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
    },
  });
};

module.exports = { register, login };
