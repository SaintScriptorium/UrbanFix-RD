const dateFormatter = new Intl.DateTimeFormat('es-DO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export default function ReportCard({ report, isOwner, onEdit, onDelete, onComplete }) {
  return (
    <article className="bg-white border border-asphalt-100 rounded-lg p-5 hover:border-asphalt-400/40 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium px-2 py-1 rounded bg-blueprint-900/8 text-blueprint-700">
            {report.category}
          </span>
          <span className="text-xs font-medium px-2 py-1 rounded bg-signal-500/12 text-signal-600">
            {report.province}
          </span>
        </div>
        <time className="text-xs text-asphalt-400 whitespace-nowrap">
          {dateFormatter.format(new Date(report.createdAt))}
        </time>
      </div>

      <h3 className="font-display text-lg text-asphalt-800 mb-1.5">{report.title}</h3>
      <p className="text-sm text-asphalt-600 whitespace-pre-line mb-4">{report.description}</p>

      <div className="flex items-center justify-between gap-4 pt-3 border-t border-asphalt-100">
        <span className="text-xs text-asphalt-400">Reportado por {report.authorName}</span>

        {/* Las acciones solo se muestran al autor. Es una comodidad de UI,
            no la medida de seguridad: el backend vuelve a verificar la
            propiedad en cada PUT/DELETE/PATCH. */}
        {isOwner && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onEdit(report)}
              className="text-xs font-medium text-blueprint-700 hover:underline"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => onComplete(report)}
              className="text-xs font-medium text-signal-600 hover:underline"
            >
              Completar
            </button>
            <button
              type="button"
              onClick={() => onDelete(report)}
              className="text-xs font-medium text-alert-600 hover:underline"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
