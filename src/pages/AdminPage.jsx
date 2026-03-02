import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function AdminPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    imageUrl: '',
    imageData: '',
    history: '',
    pathogenesis: '',
    biotech: '',
    industrial: '',
  })

  const [message, setMessage] = useState('')

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleImageFile = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const imageData = typeof reader.result === 'string' ? reader.result : ''
      updateField('imageData', imageData)
      setMessage('Image loaded from local file.')
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setMessage('Saved locally. Connect this form to your backend or API next.')
  }

  const handleLogout = () => {
    localStorage.removeItem('microbe_admin_auth')
    navigate('/admin-login', { replace: true })
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/20 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Admin · Daily Microbe</h1>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-cyan-300 hover:text-cyan-200">
              Go to main page
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-white/30 px-3 py-1.5 text-sm text-white hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </div>

        <p className="mt-2 text-sm text-slate-300">
          Add the microbe you want to publish for a specific date.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <input
            className="rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2 outline-none focus:border-cyan-400"
            placeholder="Microbe name"
            value={formData.name}
            onChange={(event) => updateField('name', event.target.value)}
          />
          <input
            type="date"
            className="rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2 outline-none focus:border-cyan-400"
            value={formData.date}
            onChange={(event) => updateField('date', event.target.value)}
          />
          <input
            className="rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2 outline-none focus:border-cyan-400"
            placeholder="Image URL (https://...)"
            value={formData.imageUrl}
            onChange={(event) => updateField('imageUrl', event.target.value)}
          />
          <label className="rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2 text-sm text-slate-200">
            Upload image file
            <input
              type="file"
              accept="image/*"
              onChange={handleImageFile}
              className="mt-2 block w-full text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-500 file:px-3 file:py-1.5 file:font-medium file:text-slate-950"
            />
          </label>

          {formData.imageData || formData.imageUrl ? (
            <img
              src={formData.imageData || formData.imageUrl}
              alt="Microbe preview"
              className="h-40 w-full rounded-lg object-cover"
            />
          ) : null}

          <textarea
            className="min-h-24 rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2 outline-none focus:border-cyan-400"
            placeholder="History"
            value={formData.history}
            onChange={(event) => updateField('history', event.target.value)}
          />
          <textarea
            className="min-h-24 rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2 outline-none focus:border-cyan-400"
            placeholder="Pathogenesis"
            value={formData.pathogenesis}
            onChange={(event) => updateField('pathogenesis', event.target.value)}
          />
          <textarea
            className="min-h-24 rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2 outline-none focus:border-cyan-400"
            placeholder="Biotech Importance"
            value={formData.biotech}
            onChange={(event) => updateField('biotech', event.target.value)}
          />
          <textarea
            className="min-h-24 rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2 outline-none focus:border-cyan-400"
            placeholder="Industrial Importance"
            value={formData.industrial}
            onChange={(event) => updateField('industrial', event.target.value)}
          />

          <button
            type="submit"
            className="rounded-lg bg-cyan-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-cyan-400"
          >
            Save Daily Microbe
          </button>
        </form>

        {message ? <p className="mt-4 text-sm text-emerald-300">{message}</p> : null}
      </div>
    </main>
  )
}

export default AdminPage
