/**
 * api.js — Centralized fetch helper for the GroundTruth backend.
 *
 * All requests go to import.meta.env.VITE_API_URL.
 * Authenticated requests automatically include the Bearer token.
 */

const API_URL = import.meta.env.VITE_API_URL

/**
 * Generic fetch wrapper.
 * @param {string} path   — e.g. '/auth/signin'
 * @param {object} options — fetch options (method, body, token, etc.)
 * @returns {Promise<object>} — parsed JSON response
 */
export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()

  if (!res.ok) {
    const message =
      typeof data.detail === 'string'
        ? data.detail
        : Array.isArray(data.detail)
          ? data.detail.map((d) => d.msg).join(', ')
          : 'Something went wrong'
    throw new Error(message)
  }

  return data
}