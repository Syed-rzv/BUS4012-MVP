/**
 * Button — reusable button component.
 *
 * @param {string}   label    - Button text
 * @param {function} onClick  - Click handler
 * @param {string}   variant  - 'primary' | 'secondary' | 'danger' (default: 'primary')
 */
export default function Button({ label, onClick, variant = 'primary' }) {
  const baseClasses =
    'w-full py-2.5 px-4 rounded-lg font-semibold text-sm shadow-sm cursor-pointer transition-all duration-150 active:scale-[0.98]'

  const variantClasses = {
    primary: 'bg-slate-700 text-white hover:bg-slate-800',
    secondary:
      'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary}`}
    >
      {label}
    </button>
  )
}
