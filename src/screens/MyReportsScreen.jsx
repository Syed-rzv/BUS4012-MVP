import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import PageLayout from '../components/PageLayout'
import { apiFetch } from '../lib/api'

/**
 * MyReportsScreen — fetches and displays the logged-in user's reports.
 *
 * Props:
 *   @param {string} token — Bearer token for authenticated requests
 */
export default function MyReportsScreen({ token }) {
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch('/reports', { token })
        setReports(data.reports)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  return (
    <PageLayout
      panelHighlight="Your reports"
      panelDescription="Every report you file helps keep your community informed."
    >
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <h2 className="text-lg font-bold text-gray-800 mb-4">My Reports</h2>

      {loading && (
        <p className="text-sm text-gray-500 text-center py-8">Loading reports…</p>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-8">
          You haven't filed any reports yet.
        </p>
      )}

      {!loading && !error && reports.length > 0 && (
        <div className="flex flex-col gap-3 mb-5">
          {reports.map((r) => (
            <Card
              key={r.id}
              title={`${r.hazard_type} — ${r.location}`}
              description={r.description}
            />
          ))}
        </div>
      )}

      <Button
        label="Report a Hazard"
        onClick={() => navigate('/submit')}
        variant="primary"
      />
    </div>
    </PageLayout>
  )
}