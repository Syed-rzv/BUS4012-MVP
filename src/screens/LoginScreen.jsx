import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InputField from '../components/InputField'
import Button from '../components/Button'
import PageLayout from '../components/PageLayout'
import { apiFetch } from '../lib/api'

/**
 * LoginScreen — real authentication via the FastAPI backend.
 *
 * Props:
 *   @param {function} onAuth - Called with { token, userId } on successful sign-in
 *
 * Supports both Sign In and Sign Up modes via a toggle.
 */
export default function LoginScreen({ onAuth }) {
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.')
      return
    }

    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        await apiFetch('/auth/signup', {
          method: 'POST',
          body: { email, password },
        })
        // Auto sign-in with the same credentials after successful signup
        const signinData = await apiFetch('/auth/signin', {
          method: 'POST',
          body: { email, password },
        })
        onAuth({ token: signinData.access_token, userId: signinData.user_id })
        navigate('/submit')
      } else {
        const data = await apiFetch('/auth/signin', {
          method: 'POST',
          body: { email, password },
        })
        onAuth({ token: data.access_token, userId: data.user_id })
        navigate('/submit')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
    setEmail('')
    setPassword('')
    setError('')
  }

  return (
    <PageLayout
      panelHighlight="See it. Report it."
      panelDescription="Help your neighbours stay safe by flagging hazards in your area."
    >
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <h2 className="text-lg font-bold text-gray-800 mb-0.5">
        {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        {mode === 'signin'
          ? 'Sign in to report hazards in your area.'
          : 'Sign up to start reporting hazards in your area.'}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <InputField
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="you@example.com"
      />

      <InputField
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="••••••••"
      />

      <div className="mt-2">
        <Button
          label={loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          onClick={handleSubmit}
          variant="primary"
        />
      </div>

      <p className="text-center text-sm text-gray-500 mt-3">
        {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button
          onClick={toggleMode}
          className="text-slate-700 font-medium hover:underline cursor-pointer"
        >
          {mode === 'signin' ? 'Sign Up' : 'Sign In'}
        </button>
      </p>
    </div>
    </PageLayout>
  )
}
