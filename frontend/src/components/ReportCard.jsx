const dateFormatter = new Intl.DateTimeFormat('es-DO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export default function ReportCard({ report, isOwner, onEdit, onDelete, onComplete }) {
  return (
    <article
      data-testid="report-card"
      data-report-id={report.id}
      className="bg-white border border-asphalt-100 rounded-lg p-5 hover:border-asphalt-400/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex flex-wrap gap-2">
          <span
            data-testid="report-category"
            className="text-xs font-medium px-2 py-1 rounded bg-blueprint-900/8 text-blueprint-700"
          >
            {report.category}
          </span>
          <span
            data-testid="report-province"
            className="text-xs font-medium px-2 py-1 rounded bg-signal-500/12 text-signal-600"
          >
            {report.province}
          </span>
        </div>
        <time data-testid="report-date" className="text-xs text-asphalt-400 whitespace-nowrap">
          {dateFormatter.format(new Date(report.createdAt))}
        </time>
      </div>

      <h3 data-testid="report-title" className="font-display text-lg text-asphalt-800 mb-1.5">
        {report.title}
      </h3>
      <p data-testid="report-description" className="text-sm text-asphalt-600 whitespace-pre-line mb-4">
        {report.description}
      </p>

      <div className="flex items-center justify-between gap-4 pt-3 border-t border-asphalt-100">
        <span data-testid="report-author" className="text-xs text-asphalt-400">
          Reportado por {report.authorName}
        </span>

        {isOwner && (
          <div className="flex gap-3">
            <button
              type="button"
              data-testid="report-edit"
              onClick={() => onEdit(report)}
              className="text-xs font-medium text-blueprint-700 hover:underline"
            >
              Editar
            </button>
            <button
              type="button"
              data-testid="report-complete"
              onClick={() => onComplete(report)}
              className="text-xs font-medium text-signal-600 hover:underline"
            >
              Completar
            </button>
            <button
              type="button"
              data-testid="report-delete"
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
