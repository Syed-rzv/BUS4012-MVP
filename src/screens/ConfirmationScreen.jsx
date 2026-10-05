import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import PageLayout from '../components/PageLayout'

/**
 * ConfirmationScreen — displays a success message and a summary of the submitted report.
 *
 * Props:
 *   @param {object} report - The backend report object { id, hazard_type, location, description, status, created_at }
 *   @param {string} token  - Bearer token (passed through for navigation)
 *
 * Uses Card to render the report summary in a consistent, reusable way.
 */
export default function ConfirmationScreen({ report }) {
  const navigate = useNavigate()

  return (
    <PageLayout
      panelHighlight="Thanks for reporting"
      panelDescription="Your report helps keep your community safer."
    >
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 text-center">
      {/* Success icon */}
      <div className="text-4xl mb-2">✅</div>

      <h2 className="text-lg font-bold text-gray-800 mb-0.5">
        Report Submitted!
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Thank you for helping keep your community safe.
      </p>

      {/* Report summary rendered via the reusable Card component */}
      <div className="text-left mb-4">
        <Card
          title={`${report?.hazard_type || 'N/A'} — ${report?.location || 'N/A'}`}
          description={report?.description || 'No description provided.'}
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <Button
          label="Report Another Hazard"
          onClick={() => navigate('/submit')}
          variant="primary"
        />
        <Button
          label="View My Reports"
          onClick={() => navigate('/my-reports')}
          variant="secondary"
        />
      </div>
    </div>
    </PageLayout>
  )
}
