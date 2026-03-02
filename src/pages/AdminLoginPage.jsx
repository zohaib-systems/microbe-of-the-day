import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()

    if (password !== 'microbe-admin') {
      setError('Invalid password')
      return
    }

    localStorage.setItem('microbe_admin_auth', 'true')
    navigate('/admin', { replace: true })
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto mt-24 w-full max-w-md rounded-2xl border border-white/20 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold">Admin Login</h1>
        <p className="mt-2 text-sm text-slate-300">
          Sign in to access the daily microbe management page.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-slate-200">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2 text-white outline-none focus:border-cyan-400"
              placeholder="Enter admin password"
            />
          </div>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-cyan-400"
          >
            Login
          </button>
        </form>
      </div>
    </main>
  )
}

export default AdminLoginPage
