import { useState } from 'react';
import Modal from './Modal';
import FormField from './FormField';
import SelectField from './SelectField';

const EMPTY_FORM = { title: '', description: '', category: '', province: '' };

// Un solo componente cubre HU5 (crear) y HU6 (editar): la única diferencia
// entre ambos flujos es con qué valores arranca el formulario y a qué
// función del padre se le entrega el resultado. Duplicarlo en dos modales
// casi idénticos solo crearía dos sitios donde arreglar el mismo bug.
export default function ReportFormModal({
  initialReport = null,
  categories,
  provinces,
  onSubmit,
  onClose,
}) {
  const isEditing = Boolean(initialReport);

  const [form, setForm] = useState(() =>
    initialReport
      ? {
          title: initialReport.title,
          description: initialReport.description,
          category: initialReport.category,
          province: initialReport.province,
        }
      : EMPTY_FORM
  );
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  // Espeja la validación del backend para dar feedback inmediato, pero el
  // servidor sigue siendo la fuente de verdad: si algo se cuela, el 400
  // que devuelve se muestra igual en formError.
  const validate = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = 'El título es obligatorio.';
    if (!form.description.trim()) errors.description = 'La descripción es obligatoria.';
    if (!form.category) errors.category = 'Selecciona una categoría.';
    if (!form.province) errors.province = 'Selecciona una provincia.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (error) {
      // El backend devuelve errors por campo cuando la validación falla;
      // los reusamos para resaltar los inputs correspondientes.
      const data = error.response?.data;
      if (data?.errors) setFieldErrors(data.errors);
      setFormError(data?.message || 'No se pudo guardar el reporte. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={isEditing ? 'Editar reporte' : 'Nuevo reporte'} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <FormField
          label="Título"
          type="text"
          placeholder="Hoyo profundo frente al colmado"
          value={form.title}
          onChange={handleChange('title')}
          error={fieldErrors.title}
        />

        <label className="block mb-4">
          <span className="block text-sm font-medium text-asphalt-800 mb-1.5">Descripción</span>
          <textarea
            rows={4}
            placeholder="Describe el problema, dónde está y desde cuándo."
            value={form.description}
            onChange={handleChange('description')}
            className={`w-full rounded-md border px-3 py-2.5 text-sm text-asphalt-800 bg-white
              placeholder:text-asphalt-400 resize-y
              focus:outline-none focus:ring-2 focus:ring-signal-500 focus:border-signal-500
              ${fieldErrors.description ? 'border-alert-600' : 'border-asphalt-100'}`}
          />
          {fieldErrors.description && (
            <span className="block text-alert-600 text-xs mt-1.5">{fieldErrors.description}</span>
          )}
        </label>

        <SelectField
          label="Categoría"
          placeholder="Selecciona una categoría"
          options={categories}
          value={form.category}
          onChange={handleChange('category')}
          error={fieldErrors.category}
        />

        <SelectField
          label="Provincia"
          placeholder="Selecciona una provincia"
          options={provinces}
          value={form.province}
          onChange={handleChange('province')}
          error={fieldErrors.province}
        />

        {formError && (
          <p className="text-alert-600 text-sm mb-4" role="alert">
            {formError}
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md text-sm font-medium text-asphalt-600
              border border-asphalt-100 hover:bg-asphalt-50 transition-colors disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md bg-blueprint-900 text-white text-sm font-medium
              hover:bg-blueprint-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Publicar reporte'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
