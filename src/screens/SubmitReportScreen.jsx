import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import InputField from '../components/InputField'
import Button from '../components/Button'
import PageLayout from '../components/PageLayout'
import { apiFetch } from '../lib/api'
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '../components/Stepper'

const STEPS = [0, 1]

/**
 * Hazard type options shown as selectable Cards in Step 1.
 * Each entry has a label, an emoji icon, and a short description.
 */
const HAZARD_OPTIONS = [
  {
    type: 'Pothole',
    icon: '🕳️',
    description: 'Road surface damage or craters',
  },
  {
    type: 'Flooding',
    icon: '🌊',
    description: 'Standing water or overflow',
  },
  {
    type: 'Fallen Tree',
    icon: '🌳',
    description: 'Tree blocking path or road',
  },
  {
    type: 'Damaged Sign',
    icon: '⚠️',
    description: 'Missing or broken road signs',
  },
  {
    type: 'Other',
    icon: '📋',
    description: 'Any other local hazard',
  },
]

/**
 * SubmitReportScreen — two-step hazard report form.
 *
 * Props:
 *   @param {string}   token     - Bearer token for authenticated requests
 *   @param {object}   report    - Current report state (null until saved)
 *   @param {function} setReport - Sets the saved backend report object
 *
 * Step 1 → pick hazard type (Card grid) + enter location (InputField)
 * Step 2 → enter description (InputField) + submit to backend
 *
 * On success, sets report to the backend response and navigates to /confirmation.
 */
export default function SubmitReportScreen({ token, report, setReport }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(0) // 0-indexed: 0 = step 1, 1 = step 2
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Local form state for the two steps
  const [hazardType, setHazardType] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')

  /** Validate Step 1 and advance to Step 2 */
  const handleNext = () => {
    if (!hazardType) {
      setError('Please select a hazard type.')
      return
    }
    if (!location.trim()) {
      setError('Please enter a location.')
      return
    }
    setError('')
    setStep(1)
  }

  /** Validate Step 2 and submit to backend */
  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Please enter a description.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const data = await apiFetch('/reports', {
        method: 'POST',
        token,
        body: { hazard_type: hazardType, location, description },
      })
      setReport(data.report)
      navigate('/confirmation')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout
      panelHighlight={step === 0 ? 'What did you spot?' : 'Almost done'}
      panelDescription={
        step === 0
          ? 'Every report helps your community stay one step ahead.'
          : 'A few more details help others understand the risk.'
      }
    >
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      {/* Step indicator — visual stepper */}
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        Report a Hazard
      </h2>
      <Stepper value={step} className="mb-5">
        {STEPS.map((s) => (
          <StepperItem key={s} step={s} className="[&:not(:last-child)]:flex-1">
            <StepperTrigger>
              <StepperTitle className="sr-only">Step {s + 1}</StepperTitle>
              <StepperIndicator>{s + 1}</StepperIndicator>
            </StepperTrigger>
            {s < STEPS.length - 1 && <StepperSeparator />}
          </StepperItem>
        ))}
      </Stepper>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Step 1: Hazard Type + Location ── */}
      {step === 0 && (
        <>
          <p className="text-sm text-gray-500 mb-2">
            What type of hazard did you spot?
          </p>
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {HAZARD_OPTIONS.map((option) => (
              <Card
                key={option.type}
                title={`${option.icon} ${option.type}`}
                description={option.description}
                selected={hazardType === option.type}
                onClick={() => setHazardType(option.type)}
              />
            ))}
          </div>

          <InputField
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Main St & 5th Ave"
          />

          <Button label="Next" onClick={handleNext} variant="primary" />
        </>
      )}

      {/* ── Step 2: Description + Submit ── */}
      {step === 1 && (
        <>
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">Hazard Type</p>
            <p className="text-sm font-medium text-gray-800">{hazardType}</p>
            <p className="text-xs text-gray-500 mt-2">Location</p>
            <p className="text-sm font-medium text-gray-800">{location}</p>
          </div>

          <InputField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the hazard (size, severity, etc.)"
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <Button
                label="Back"
                onClick={() => {
                  setError('')
                  setStep(0)
                }}
                variant="secondary"
              />
            </div>
            <div className="flex-1">
              <Button
                label={loading ? 'Submitting…' : 'Submit Report'}
                onClick={handleSubmit}
                variant="primary"
              />
            </div>
          </div>
        </>
      )}
    </div>
    </PageLayout>
  )
}
