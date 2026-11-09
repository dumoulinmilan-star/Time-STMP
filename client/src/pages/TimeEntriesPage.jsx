import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000/api" : "/api")

function today() {
  return new Date().toISOString().slice(0, 10)
}

function emptyForm() {
  return {
    project: "",
    date: today(),
    hours: "",
    description: ""
  }
}

function TimeEntriesPage({ currentUser }) {
  const [entries, setEntries] = useState([])
  const [projects, setProjects] = useState([])
  const [form, setForm] = useState(emptyForm())
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const headers = { Authorization: localStorage.getItem("token") }

    try {
      const [entriesResponse, projectsResponse] = await Promise.all([
        fetch(`${apiUrl}/time-entries`, { headers }),
        fetch(`${apiUrl}/projects`, { headers })
      ])
      const entriesData = await entriesResponse.json()
      const projectsData = await projectsResponse.json()

      if (!entriesResponse.ok) throw new Error(entriesData.message)
      if (!projectsResponse.ok) throw new Error(projectsData.message)

      setEntries(entriesData.entries)
      setProjects(projectsData.projects)
    } catch (error) {
      setError(error.message || "Could not load time entries.")
    } finally {
      setLoading(false)
    }
  }

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  function formProjects() {
    const entry = entries.find((item) => item.id === editingId)
    const userId = entry ? entry.user.id : currentUser.id

    const availableProjects = projects.filter((project) => {
      const isCurrentProject = entry?.project.id === project.id
      const isAssigned = project.members.some((member) => member.id === userId)
      return isCurrentProject || (project.active && isAssigned)
    })

    if (entry && !availableProjects.some((project) => project.id === entry.project.id)) {
      availableProjects.push(entry.project)
    }

    return availableProjects
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")

    const url = editingId ? `${apiUrl}/time-entries/${editingId}` : `${apiUrl}/time-entries`
    const method = editingId ? "PUT" : "POST"

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token")
        },
        body: JSON.stringify({ ...form, hours: Number(form.hours) })
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.message)

      if (editingId) {
        setEntries(entries.map((entry) => entry.id === editingId ? data.entry : entry))
      } else {
        setEntries([data.entry, ...entries])
      }

      cancelEdit()
    } catch (error) {
      setError(error.message || "Could not save time entry.")
    }
  }

  function editEntry(entry) {
    setEditingId(entry.id)
    setForm({
      project: entry.project.id,
      date: entry.date,
      hours: String(entry.hours),
      description: entry.description
    })
    setError("")
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm())
  }

  async function deleteEntry(entry) {
    if (!window.confirm("Delete this time entry?")) return

    setError("")

    try {
      const response = await fetch(`${apiUrl}/time-entries/${entry.id}`, {
        method: "DELETE",
        headers: { Authorization: localStorage.getItem("token") }
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.message)

      setEntries(entries.filter((item) => item.id !== entry.id))
      if (editingId === entry.id) cancelEdit()
    } catch (error) {
      setError(error.message || "Could not delete time entry.")
    }
  }

  const availableProjects = formProjects()

  return (
    <main className="page wide-page">
      <section className="card wide-card">
        <p className="eyebrow">Time tracking</p>
        <h1>{currentUser.role === "admin" ? "Time entries" : "My time"}</h1>
        <Link to="/dashboard">Return to dashboard</Link>

        <form className="team-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit time entry" : "Add time entry"}</h2>

          <label htmlFor="project">Project</label>
          <select id="project" name="project" value={form.project} onChange={handleChange} required>
            <option value="">Choose a project</option>
            {availableProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} – {project.clientName}
              </option>
            ))}
          </select>

          {!editingId && availableProjects.length === 0 && (
            <p>You do not have any active assigned projects.</p>
          )}

          <label htmlFor="date">Date</label>
          <input id="date" name="date" type="date" value={form.date} onChange={handleChange} required />

          <label htmlFor="hours">Hours</label>
          <input id="hours" name="hours" type="number" min="0.25" max="24" step="0.25" value={form.hours} onChange={handleChange} required />

          <label htmlFor="description">Work description</label>
          <textarea id="description" name="description" maxLength="500" value={form.description} onChange={handleChange} required />

          <div className="actions">
            <button type="submit" disabled={availableProjects.length === 0}>
              {editingId ? "Save changes" : "Add time entry"}
            </button>
            {editingId && <button className="secondary" type="button" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>

        {error && <p className="error" role="alert">{error}</p>}

        {loading ? (
          <p>Loading time entries...</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  {currentUser.role === "admin" && <th>Team member</th>}
                  <th>Project</th>
                  <th>Hours</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.date}</td>
                    {currentUser.role === "admin" && <td>{entry.user.name}</td>}
                    <td>{entry.project.name}<br /><small>{entry.project.clientName}</small></td>
                    <td>{entry.hours}</td>
                    <td>{entry.description}</td>
                    <td>
                      <div className="actions">
                        <button className="secondary" type="button" onClick={() => editEntry(entry)}>Edit</button>
                        <button className="secondary" type="button" onClick={() => deleteEntry(entry)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

export default TimeEntriesPage
