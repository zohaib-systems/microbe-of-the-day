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
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6">
      <div className="mx-auto mt-16 w-full max-w-md rounded-3xl border border-white/15 bg-white/[0.04] p-7 backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100/70">Administrative access</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Admin Login</h1>
        <p className="mt-2 text-[15px] leading-7 text-slate-300">
          Sign in to access the daily microbe management page.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-900/75 px-3 py-2.5 text-white outline-none transition focus:border-cyan-300"
              placeholder="Enter admin password"
            />
          </div>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-cyan-500/90 px-4 py-2.5 font-medium text-slate-950 transition hover:bg-cyan-400/90"
          >
            Login
          </button>
        </form>
      </div>
    </main>
  )
}

export default AdminLoginPage
