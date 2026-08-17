import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LogoutButton from '../components/LogoutButton';
import ReportCard from '../components/ReportCard';
import ReportFormModal from '../components/ReportFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  fetchReports,
  fetchMeta,
  createReport,
  updateReport,
  deleteReport,
  completeReport,
} from '../api/reportService';

export default function FeedPage() {
  const { user } = useAuth();

  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Un solo estado describe qué modal está abierto y sobre qué reporte.
  // Con tres booleanos separados sería posible abrir dos a la vez por error.
  const [dialog, setDialog] = useState({ type: null, report: null });
  const [isProcessing, setIsProcessing] = useState(false);

  const closeDialog = () => setDialog({ type: null, report: null });

  // useCallback porque esta función es dependencia del useEffect de abajo:
  // sin memoizar, se recrearía en cada render y dispararía la petición en
  // bucle infinito.
  const loadReports = useCallback(async (category) => {
    setIsLoading(true);
    setLoadError('');
    try {
      setReports(await fetchReports(category));
    } catch (error) {
      setLoadError('No se pudieron cargar los reportes. Revisa tu conexión.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Se dispara al montar y cada vez que cambia el filtro (HU10). El filtrado
  // ocurre en el servidor, no en el cliente, para que el feed siga siendo
  // rápido cuando la tabla crezca.
  useEffect(() => {
    loadReports(activeCategory);
  }, [activeCategory, loadReports]);

  // Las listas de categorías y provincias vienen del backend una sola vez.
  useEffect(() => {
    fetchMeta()
      .then(({ categories: cats, provinces: provs }) => {
        setCategories(cats);
        setProvinces(provs);
      })
      .catch(() => {
        // Si falla, los <select> quedan vacíos pero el feed sigue usable.
      });
  }, []);

  // HU5 — Crear. Se antepone el nuevo reporte al estado local en vez de
  // recargar todo el feed: la respuesta del POST ya trae el reporte
  // completo, así que una segunda petición sería trabajo repetido.
  const handleCreate = async (form) => {
    const nuevo = await createReport(form);
    // Si hay un filtro activo y el reporte no pertenece a esa categoría,
    // no debe aparecer en la vista actual.
    if (!activeCategory || nuevo.category === activeCategory) {
      setReports((prev) => [nuevo, ...prev]);
    }
  };

  // HU6 — Editar. Reemplaza el reporte en su posición actual.
  const handleUpdate = async (form) => {
    const actualizado = await updateReport(dialog.report.id, form);
    setReports((prev) =>
      // Si el usuario cambió la categoría y hay un filtro activo, el reporte
      // deja de pertenecer a esta vista, así que se retira.
      activeCategory && actualizado.category !== activeCategory
        ? prev.filter((r) => r.id !== actualizado.id)
        : prev.map((r) => (r.id === actualizado.id ? actualizado : r))
    );
  };

  // HU7 — Eliminar (borrado real).
  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await deleteReport(dialog.report.id);
      setReports((prev) => prev.filter((r) => r.id !== dialog.report.id));
      closeDialog();
    } catch (error) {
      setLoadError('No se pudo eliminar el reporte.');
      closeDialog();
    } finally {
      setIsProcessing(false);
    }
  };

  // HU8 — Completar. Sale del feed pero permanece en la base de datos.
  const handleComplete = async () => {
    setIsProcessing(true);
    try {
      await completeReport(dialog.report.id);
      setReports((prev) => prev.filter((r) => r.id !== dialog.report.id));
      closeDialog();
    } catch (error) {
      setLoadError('No se pudo completar el reporte.');
      closeDialog();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-asphalt-50">
      {/* HU3 — el botón de cerrar sesión vive aquí, en la barra superior. */}
      <header className="bg-blueprint-950 text-white">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <span className="font-display text-lg tracking-tight">UrbanFix RD</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-asphalt-100/70 hidden sm:inline">
              {user?.fullName}
            </span>
            <span className="text-asphalt-100/30 hidden sm:inline">·</span>
            <div className="text-asphalt-100/70 hover:text-white">
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl text-asphalt-800">Reportes abiertos</h1>
            <p className="text-sm text-asphalt-600 mt-1">
              Incidencias pendientes de resolver en tu comunidad.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDialog({ type: 'create', report: null })}
            className="px-4 py-2.5 rounded-md bg-signal-500 text-white text-sm font-medium
              hover:bg-signal-600 transition-colors"
          >
            Reportar incidencia
          </button>
        </div>

        {/* HU10 — Filtro por categoría, con "Ver todos" como valor vacío. */}
        <div className="mb-6">
          <label className="block">
            <span className="sr-only">Filtrar por categoría</span>
            <select
              value={activeCategory}
              onChange={(event) => setActiveCategory(event.target.value)}
              className="w-full sm:w-auto rounded-md border border-asphalt-100 bg-white
                px-3 py-2 text-sm text-asphalt-800
                focus:outline-none focus:ring-2 focus:ring-signal-500 focus:border-signal-500"
            >
              <option value="">Ver todos</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loadError && (
          <p className="text-alert-600 text-sm mb-4" role="alert">
            {loadError}
          </p>
        )}

        {isLoading ? (
          <p className="text-sm text-asphalt-400 py-12 text-center">Cargando reportes…</p>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-asphalt-100 rounded-lg">
            <p className="text-asphalt-600 text-sm">
              {activeCategory
                ? 'No hay reportes abiertos en esta categoría.'
                : 'Todavía no hay reportes. Publica el primero.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                isOwner={report.authorId === user?.id}
                onEdit={(r) => setDialog({ type: 'edit', report: r })}
                onDelete={(r) => setDialog({ type: 'delete', report: r })}
                onComplete={(r) => setDialog({ type: 'complete', report: r })}
              />
            ))}
          </div>
        )}
      </main>

      {(dialog.type === 'create' || dialog.type === 'edit') && (
        <ReportFormModal
          initialReport={dialog.type === 'edit' ? dialog.report : null}
          categories={categories}
          provinces={provinces}
          onSubmit={dialog.type === 'edit' ? handleUpdate : handleCreate}
          onClose={closeDialog}
        />
      )}

      {dialog.type === 'delete' && (
        <ConfirmDialog
          title="Eliminar reporte"
          message="¿Estás seguro que deseas eliminar este reporte? Esta acción no se puede deshacer."
          confirmLabel="Confirmar"
          tone="danger"
          isProcessing={isProcessing}
          onConfirm={handleDelete}
          onCancel={closeDialog}
        />
      )}

      {dialog.type === 'complete' && (
        <ConfirmDialog
          title="Completar reporte"
          message="¿Estás seguro que este reporte fue completado? Dejará de aparecer en el feed."
          confirmLabel="Confirmar"
          isProcessing={isProcessing}
          onConfirm={handleComplete}
          onCancel={closeDialog}
        />
      )}
    </div>
  );
}
