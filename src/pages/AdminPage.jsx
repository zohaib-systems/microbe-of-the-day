import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ADMIN_LOGIN_PATH } from '../config/adminRoute'

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

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.name.trim() || !formData.date) {
      setMessage('Please add at least a microbe name and date.')
      return
    }

    const image = formData.imageData || formData.imageUrl

    if (!image) {
      setMessage('Please add an image URL or upload an image file.')
      return
    }

    const microbeData = {
      name: formData.name.trim(),
      date: formData.date,
      image,
      history: formData.history.trim(),
      pathogenesis: formData.pathogenesis.trim(),
      biotech: formData.biotech.trim(),
      industrial: formData.industrial.trim(),
    }

    try {
      const response = await fetch('/api/microbes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(microbeData),
      })

      if (response.ok) {
        setMessage(`Saved microbe for ${formData.date}. The data is now available to all users.`)
      } else {
        const errorData = await response.json()
        setMessage(`Error: ${errorData.message || 'Failed to save microbe.'}`)
      }
    } catch (error) {
      console.error('Failed to save microbe:', error)
      setMessage('An unexpected error occurred. Please try again.')
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSchedule))
    setMessage(`Saved for ${formData.date}. It will appear automatically on that date.`)
  }

  const handleLogout = () => {
    localStorage.removeItem('microbe_admin_auth')
    navigate(ADMIN_LOGIN_PATH, { replace: true })
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl rounded-3xl border border-white/15 bg-white/[0.04] p-5 backdrop-blur-md sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100/70">Control panel</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Admin · Daily Microbe</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/" className="rounded-lg border border-white/30 px-3 py-1.5 text-slate-100 transition hover:bg-white/10">
              Go to main page
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-white/30 px-3 py-1.5 text-slate-100 transition hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </div>

        <p className="mt-3 text-[15px] leading-7 text-slate-300">
          Add the microbe you want to publish for a specific date.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <input
            className="rounded-xl border border-white/20 bg-slate-900/75 px-3 py-2.5 outline-none transition focus:border-cyan-300"
            placeholder="Microbe name"
            value={formData.name}
            onChange={(event) => updateField('name', event.target.value)}
          />
          <input
            type="date"
            className="rounded-xl border border-white/20 bg-slate-900/75 px-3 py-2.5 outline-none transition focus:border-cyan-300"
            value={formData.date}
            onChange={(event) => updateField('date', event.target.value)}
          />
          <input
            className="sm:col-span-2 rounded-xl border border-white/20 bg-slate-900/75 px-3 py-2.5 outline-none transition focus:border-cyan-300"
            placeholder="Image URL (https://...)"
            value={formData.imageUrl}
            onChange={(event) => updateField('imageUrl', event.target.value)}
          />
          <label className="sm:col-span-2 rounded-xl border border-white/20 bg-slate-900/75 px-3 py-2.5 text-sm font-medium text-slate-200">
            Upload image file
            <input
              type="file"
              accept="image/*"
              onChange={handleImageFile}
              className="mt-2 block w-full text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-500/90 file:px-3 file:py-1.5 file:font-medium file:text-slate-950"
            />
          </label>

          {formData.imageData || formData.imageUrl ? (
            <img
              src={formData.imageData || formData.imageUrl}
              alt="Microbe preview"
              className="sm:col-span-2 h-44 w-full rounded-xl object-cover"
            />
          ) : null}

          <textarea
            className="sm:col-span-2 min-h-24 rounded-xl border border-white/20 bg-slate-900/75 px-3 py-2.5 outline-none transition focus:border-cyan-300"
            placeholder="History"
            value={formData.history}
            onChange={(event) => updateField('history', event.target.value)}
          />
          <textarea
            className="sm:col-span-2 min-h-24 rounded-xl border border-white/20 bg-slate-900/75 px-3 py-2.5 outline-none transition focus:border-cyan-300"
            placeholder="Pathogenesis"
            value={formData.pathogenesis}
            onChange={(event) => updateField('pathogenesis', event.target.value)}
          />
          <textarea
            className="sm:col-span-2 min-h-24 rounded-xl border border-white/20 bg-slate-900/75 px-3 py-2.5 outline-none transition focus:border-cyan-300"
            placeholder="Biotech Importance"
            value={formData.biotech}
            onChange={(event) => updateField('biotech', event.target.value)}
          />
          <textarea
            className="sm:col-span-2 min-h-24 rounded-xl border border-white/20 bg-slate-900/75 px-3 py-2.5 outline-none transition focus:border-cyan-300"
            placeholder="Industrial Importance"
            value={formData.industrial}
            onChange={(event) => updateField('industrial', event.target.value)}
          />

          <button
            type="submit"
            className="sm:col-span-2 rounded-xl bg-cyan-500/90 px-4 py-2.5 font-medium text-slate-950 transition hover:bg-cyan-400/90"
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
