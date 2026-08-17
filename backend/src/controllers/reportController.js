const pool = require('../config/db');
const { CATEGORIES, PROVINCES } = require('../utils/constants');

// Forma en que el feed devuelve cada reporte. Se declara una sola vez
// porque las cinco consultas de abajo deben devolver exactamente las mismas
// columnas: si el frontend espera authorName, todas tienen que traerlo.
const REPORT_FIELDS = `
  r.id,
  r.title,
  r.description,
  r.category,
  r.province,
  r.is_completed,
  r.created_at,
  r.user_id,
  u.full_name AS author_name
`;

// Traduce la fila cruda de Postgres (snake_case) al shape que consume React
// (camelCase). Centralizarlo evita que cada endpoint invente su propio
// formato y que el frontend tenga que lidiar con dos convenciones.
const mapReport = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category,
  province: row.province,
  isCompleted: row.is_completed,
  createdAt: row.created_at,
  authorId: row.user_id,
  authorName: row.author_name,
});

// Validación compartida por crear (HU5) y editar (HU6): ambas exigen los
// mismos cuatro campos con las mismas reglas.
const validateReportInput = ({ title, description, category, province }) => {
  const errors = {};

  if (!title?.trim()) {
    errors.title = 'El título es obligatorio.';
  } else if (title.trim().length > 140) {
    errors.title = 'El título no puede superar los 140 caracteres.';
  }

  if (!description?.trim()) {
    errors.description = 'La descripción es obligatoria.';
  }

  if (!category) {
    errors.category = 'Selecciona una categoría.';
  } else if (!CATEGORIES.includes(category)) {
    errors.category = 'La categoría seleccionada no es válida.';
  }

  if (!province) {
    errors.province = 'Selecciona una provincia.';
  } else if (!PROVINCES.includes(province)) {
    errors.province = 'La provincia seleccionada no es válida.';
  }

  return errors;
};

/**
 * GET /api/reports
 * HU9 — Feed general. HU10 — Filtro por categoría vía ?category=
 */
const listReports = async (req, res) => {
  const { category } = req.query;

  // Solo se filtra si viene una categoría válida. Un ?category= vacío o
  // con basura se ignora y devuelve el feed completo, en vez de reventar:
  // es el comportamiento de "Ver todos" que pide HU10.
  const shouldFilter = category && CATEGORIES.includes(category);

  const sql = `
    SELECT ${REPORT_FIELDS}
    FROM reports r
    JOIN users u ON u.id = r.user_id
    WHERE r.is_completed = FALSE
    ${shouldFilter ? 'AND r.category = $1' : ''}
    ORDER BY r.created_at DESC
  `;

  const { rows } = await pool.query(sql, shouldFilter ? [category] : []);

  return res.json({ reports: rows.map(mapReport) });
};

/**
 * POST /api/reports
 * HU5 — Crear reporte de incidencia.
 */
const createReport = async (req, res) => {
  const { title, description, category, province } = req.body;

  const errors = validateReportInput({ title, description, category, province });
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Revisa los campos marcados.', errors });
  }

  // El autor NO viene del body: se toma del token verificado por requireAuth.
  // Si viniera del cliente, cualquiera podría publicar a nombre de otro.
  const { rows } = await pool.query(
    `WITH nuevo AS (
       INSERT INTO reports (user_id, title, description, category, province)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *
     )
     SELECT ${REPORT_FIELDS}
     FROM nuevo r
     JOIN users u ON u.id = r.user_id`,
    [req.user.id, title.trim(), description.trim(), category, province]
  );

  return res.status(201).json({ report: mapReport(rows[0]) });
};

/**
 * PUT /api/reports/:id
 * HU6 — Editar reporte de incidencia.
 */
const updateReport = async (req, res) => {
  const { id } = req.params;
  const { title, description, category, province } = req.body;

  const errors = validateReportInput({ title, description, category, province });
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Revisa los campos marcados.', errors });
  }

  // El "AND user_id = $6" es la autorización: si el reporte existe pero es
  // de otro usuario, el UPDATE no afecta ninguna fila y caemos en el 404 de
  // abajo. Así no hace falta un SELECT previo, y no se filtra la existencia
  // de reportes ajenos.
  const { rows } = await pool.query(
    `WITH actualizado AS (
       UPDATE reports
       SET title = $1, description = $2, category = $3, province = $4
       WHERE id = $5 AND user_id = $6
       RETURNING *
     )
     SELECT ${REPORT_FIELDS}
     FROM actualizado r
     JOIN users u ON u.id = r.user_id`,
    [title.trim(), description.trim(), category, province, id, req.user.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: 'Reporte no encontrado o no te pertenece.' });
  }

  return res.json({ report: mapReport(rows[0]) });
};

/**
 * DELETE /api/reports/:id
 * HU7 — Eliminar reporte (borrado real de la base de datos).
 */
const deleteReport = async (req, res) => {
  const { id } = req.params;

  const { rowCount } = await pool.query(
    'DELETE FROM reports WHERE id = $1 AND user_id = $2',
    [id, req.user.id]
  );

  if (rowCount === 0) {
    return res.status(404).json({ message: 'Reporte no encontrado o no te pertenece.' });
  }

  // 204 No Content: la operación tuvo éxito y no hay cuerpo que devolver.
  return res.status(204).send();
};

/**
 * PATCH /api/reports/:id/complete
 * HU8 — Marcar como completado (NO borra el registro).
 */
const completeReport = async (req, res) => {
  const { id } = req.params;

  const { rows } = await pool.query(
    `WITH completado AS (
       UPDATE reports
       SET is_completed = TRUE
       WHERE id = $1 AND user_id = $2 AND is_completed = FALSE
       RETURNING *
     )
     SELECT ${REPORT_FIELDS}
     FROM completado r
     JOIN users u ON u.id = r.user_id`,
    [id, req.user.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({
      message: 'Reporte no encontrado, no te pertenece o ya estaba completado.',
    });
  }

  return res.json({ report: mapReport(rows[0]) });
};

/**
 * GET /api/reports/meta
 * Alimenta los <select> del frontend desde una única fuente de verdad,
 * en vez de duplicar las listas en el código de React.
 */
const getMeta = async (req, res) => {
  return res.json({ categories: CATEGORIES, provinces: PROVINCES });
};

module.exports = {
  listReports,
  createReport,
  updateReport,
  deleteReport,
  completeReport,
  getMeta,
};
