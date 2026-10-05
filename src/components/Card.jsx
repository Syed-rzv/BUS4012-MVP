/**
 * Card — reusable card component.
 *
 * Used in two contexts:
 *   1. Hazard type selection (SubmitReportScreen Step 1) — clickable cards
 *   2. Report summary display (ConfirmationScreen) — static cards
 *
 * @param {string}   title       - Card heading
 * @param {string}   description - Card body text
 * @param {function} onClick     - Click handler (optional; omit for static display)
 * @param {boolean}  selected    - Whether the card is currently selected (optional)
 */
export default function Card({ title, description, onClick, selected = false }) {
  const isClickable = typeof onClick === 'function'

  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-lg border-2 shadow-sm transition-all duration-150
        ${isClickable ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : ''}
        ${selected
          ? 'border-amber-500 bg-amber-50 shadow-md ring-1 ring-amber-200'
          : 'border-gray-200 bg-white hover:border-gray-300'
        }
      `}
    >
      <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
      {description && (
        <p className="text-gray-500 text-sm mt-1">{description}</p>
      )}
    </div>
  )
}
