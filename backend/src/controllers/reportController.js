const pool = require('../config/db');
const { CATEGORIES, PROVINCES } = require('../utils/constants');


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


const listReports = async (req, res) => {
  const { category } = req.query;


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


const createReport = async (req, res) => {
  const { title, description, category, province } = req.body;

  const errors = validateReportInput({ title, description, category, province });
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Revisa los campos marcados.', errors });
  }


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


const updateReport = async (req, res) => {
  const { id } = req.params;
  const { title, description, category, province } = req.body;

  const errors = validateReportInput({ title, description, category, province });
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Revisa los campos marcados.', errors });
  }


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


const deleteReport = async (req, res) => {
  const { id } = req.params;

  const { rowCount } = await pool.query(
    'DELETE FROM reports WHERE id = $1 AND user_id = $2',
    [id, req.user.id]
  );

  if (rowCount === 0) {
    return res.status(404).json({ message: 'Reporte no encontrado o no te pertenece.' });
  }


  return res.status(204).send();
};


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
