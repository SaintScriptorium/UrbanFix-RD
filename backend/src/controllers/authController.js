const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const SALT_ROUNDS = 10;

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);

  if (existingUser.rows.length > 0) {
    return res.status(409).json({ message: 'Ya existe una cuenta registrada con este correo.' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const { rows } = await pool.query(
    `INSERT INTO users (full_name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, full_name, email, created_at`,
    [fullName.trim(), normalizedEmail, passwordHash]
  );

  return res.status(201).json({ user: rows[0] });
};

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
