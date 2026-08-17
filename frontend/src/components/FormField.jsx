export default function FormField({ label, error, ...inputProps }) {
  // El testid del input se reusa para nombrar su mensaje de error
  // (ej. "register-email" -> "register-email-error"), asi las pruebas
  // localizan el error sin depender de la posicion en el DOM.
  const testId = inputProps['data-testid'];

  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-asphalt-800 mb-1.5">{label}</span>
      <input
        {...inputProps}
        className={`w-full rounded-md border px-3 py-2.5 text-sm text-asphalt-800
          placeholder:text-asphalt-400 bg-white
          focus:outline-none focus:ring-2 focus:ring-signal-500 focus:border-signal-500
          ${error ? 'border-alert-600' : 'border-asphalt-100'}`}
      />
      {error && (
        <span
          data-testid={testId ? `${testId}-error` : undefined}
          className="block text-alert-600 text-xs mt-1.5"
        >
          {error}
        </span>
      )}
    </label>
  );
}
