import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const email = e.target[0].value
    const password = e.target[1].value

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setError(data?.message || 'Invalid administrator credentials.')
        return
      }

      if (data.role !== 'ADMIN') {
        setError('This account does not have administrator privileges.')
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('loginMode', 'ADMIN')

      const user = {
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
      }

      localStorage.setItem('user', JSON.stringify(user))

      navigate('/dashboard/admin')
    } catch (err) {
      console.error(err)
      setError('Login failed. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primaryLight flex items-center justify-center px-6 font-body text-ink">
      <div className="w-full max-w-sm bg-white border border-line rounded-2xl p-8 shadow-sm">
        <button onClick={() => navigate('/role-select')} className="text-sm text-sub mb-6 hover:text-ink transition-colors">
          ← Back to roles
        </button>
        <h1 className="font-display font-600 text-2xl text-ink">Admin login</h1>
        <p className="text-sm text-sub mt-1 mb-6">Manage users, providers, services and marketplace operations.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-sub">Email</label>
            <input
              type="email"
              required
              placeholder="admin@serveconnect.com"
              className="mt-1 w-full border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm text-sub">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="mt-1 w-full border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-medium hover:bg-primaryDark transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log in as Admin'}
          </button>
        </form>
      </div>
    </div>
  )
}
