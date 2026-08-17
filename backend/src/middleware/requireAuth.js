const jwt = require('jsonwebtoken');

// HU3 pide un "cierre de sesión" que invalide el token. Un JWT es, por
// diseño, stateless: el servidor no guarda sesiones, así que no hay nada
// que "borrar" en el backend cuando el usuario cierra sesión. La invalidación
// real ocurre del lado del cliente (se descarta el token, ver LogoutButton
// en el frontend). Lo que sí corresponde al backend es este middleware:
// rechazar cualquier request a una ruta protegida que no traiga un token
// válido, que es la pieza que le da sentido a "cerrar sesión" en primer
// lugar. Se usará en Épica 2 para proteger /api/reports.
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No se proporcionó un token de acceso.' });
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

module.exports = requireAuth;
