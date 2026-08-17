// Express no captura rechazos de promesas por sí solo: si un controller
// async lanza, la petición se queda colgada en vez de llegar al error
// handler. Envolver cada controller con esto delega ese catch a Express
// sin repetir un try/catch idéntico en cada función.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
