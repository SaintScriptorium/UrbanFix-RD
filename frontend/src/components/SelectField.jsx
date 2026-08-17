
export default function SelectField({ label, error, options = [], placeholder, ...selectProps }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-asphalt-800 mb-1.5">{label}</span>
      <select
        {...selectProps}
        className={`w-full rounded-md border px-3 py-2.5 text-sm text-asphalt-800 bg-white
          focus:outline-none focus:ring-2 focus:ring-signal-500 focus:border-signal-500
          ${error ? 'border-alert-600' : 'border-asphalt-100'}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <span className="block text-alert-600 text-xs mt-1.5">{error}</span>}
    </label>
  );
}
