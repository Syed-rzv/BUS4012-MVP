/**
 * InputField — reusable labeled input component.
 *
 * @param {string}   label  - Label text displayed above the input
 * @param {string}   value  - Current input value (controlled)
 * @param {function} onChange - Change handler
 * @param {string}   type   - HTML input type (default: 'text')
 * @param {string}   placeholder - Placeholder text (optional)
 */
export default function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
}) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400
                   placeholder-gray-400 transition-shadow duration-150"
      />
    </div>
  )
}
