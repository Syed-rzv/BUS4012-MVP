import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import LoginScreen from './screens/LoginScreen'
import SubmitReportScreen from './screens/SubmitReportScreen'
import ConfirmationScreen from './screens/ConfirmationScreen'
import MyReportsScreen from './screens/MyReportsScreen'

/**
 * App — root component.
 *
 * Owns:
 *   - token / userId (persisted in localStorage)
 *   - report (the most recently saved backend report object)
 *
 * Auth flow:
 *   LoginScreen calls onAuth({ token, userId }) → stored in state + localStorage
 *   Logout clears both → redirects to /
 */
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('gt_token'))
  const [userId, setUserId] = useState(() => localStorage.getItem('gt_userId'))
  const [report, setReport] = useState(null)

  /** Called by LoginScreen after successful sign-in or sign-up */
  const handleAuth = ({ token: t, userId: uid }) => {
    setToken(t)
    setUserId(uid)
    localStorage.setItem('gt_token', t)
    localStorage.setItem('gt_userId', uid)
  }

  const handleLogout = () => {
    setToken(null)
    setUserId(null)
    setReport(null)
    localStorage.removeItem('gt_token')
    localStorage.removeItem('gt_userId')
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-100 to-white">
        {/* App header */}
        <header className="bg-slate-800 text-white py-3 shadow-md">
          <div className="max-w-lg mx-auto px-4">
            <h1 className="text-xl font-bold">🌍 GroundTruth</h1>
            <p className="text-slate-400 text-sm">Hyperlocal Hazard Reporting</p>
          </div>
        </header>

        {/* Nav bar — only visible when logged in */}
        {token && <NavBar onLogout={handleLogout} />}

        {/* Route definitions */}
        <div className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                token
                  ? <Navigate to="/submit" replace />
                  : <LoginScreen onAuth={handleAuth} />
              }
            />
            <Route
              path="/submit"
              element={
                token
                  ? <SubmitReportScreen token={token} report={report} setReport={setReport} />
                  : <Navigate to="/" replace />
              }
            />
            <Route
              path="/confirmation"
              element={
                token
                  ? <ConfirmationScreen report={report} token={token} />
                  : <Navigate to="/" replace />
              }
            />
            <Route
              path="/my-reports"
              element={
                token
                  ? <MyReportsScreen token={token} />
                  : <Navigate to="/" replace />
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

/**
 * NavBar — persistent navigation shown on all authenticated screens.
 *
 * @param {function} onLogout — calls App's handleLogout
 */
function NavBar({ onLogout }) {
  const { pathname } = useLocation()

  const links = [
    { to: '/submit', label: 'Report a Hazard' },
    { to: '/my-reports', label: 'My Reports' },
  ]

  return (
    <nav className="bg-slate-700 shadow-sm">
      <div className="max-w-lg mx-auto px-4 flex items-center justify-between">
        <div className="flex gap-1">
          {links.map(({ to, label }) => {
            const active = pathname === to || pathname === '/confirmation' && to === '/submit'
            return (
              <Link
                key={to}
                to={to}
                className={`text-sm px-3 py-2 rounded-t transition-colors ${
                  active
                    ? 'text-white border-b-2 border-amber-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>
        <button
          onClick={onLogout}
          className="text-xs text-slate-300 hover:text-white border border-slate-500 hover:border-slate-400 rounded px-2.5 py-1 transition-colors cursor-pointer"
        >
          Log Out
        </button>
      </div>
    </nav>
  )
}
