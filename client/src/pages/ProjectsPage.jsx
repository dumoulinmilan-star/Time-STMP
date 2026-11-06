import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000/api" : "/api")

const emptyForm = {
  name: "",
  clientName: "",
  members: []
}

function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const headers = { Authorization: localStorage.getItem("token") }

    try {
      const [projectsResponse, usersResponse] = await Promise.all([
        fetch(`${apiUrl}/projects`, { headers }),
        fetch(`${apiUrl}/users`, { headers })
      ])
      const projectsData = await projectsResponse.json()
      const usersData = await usersResponse.json()

      if (!projectsResponse.ok) throw new Error(projectsData.message)
      if (!usersResponse.ok) throw new Error(usersData.message)

      setProjects(projectsData.projects)
      setUsers(usersData.users)
    } catch (error) {
      setError(error.message || "Could not load projects.")
    } finally {
      setLoading(false)
    }
  }

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  function toggleMember(userId) {
    const members = form.members.includes(userId)
      ? form.members.filter((id) => id !== userId)
      : [...form.members, userId]

    setForm({ ...form, members })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")

    const url = editingId ? `${apiUrl}/projects/${editingId}` : `${apiUrl}/projects`
    const method = editingId ? "PUT" : "POST"

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token")
        },
        body: JSON.stringify(form)
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.message)

      if (editingId) {
        setProjects(projects.map((project) => project.id === editingId ? data.project : project))
      } else {
        setProjects([...projects, data.project].sort((a, b) => a.name.localeCompare(b.name)))
      }

      cancelEdit()
    } catch (error) {
      setError(error.message || "Could not save project.")
    }
  }

  function editProject(project) {
    setEditingId(project.id)
    setForm({
      name: project.name,
      clientName: project.clientName,
      members: project.members.map((member) => member.id)
    })
    setError("")
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function toggleActive(project) {
    setError("")

    try {
      const response = await fetch(`${apiUrl}/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token")
        },
        body: JSON.stringify({ active: !project.active })
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.message)

      setProjects(projects.map((item) => item.id === project.id ? data.project : item))
    } catch (error) {
      setError(error.message || "Could not update project.")
    }
  }

  return (
    <main className="page wide-page">
      <section className="card wide-card">
        <p className="eyebrow">Admin</p>
        <h1>Projects</h1>
        <Link to="/dashboard">Return to dashboard</Link>

        <form className="team-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit project" : "Add project"}</h2>

          <label htmlFor="name">Project name</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} required />

          <label htmlFor="clientName">Client name</label>
          <input id="clientName" name="clientName" value={form.clientName} onChange={handleChange} required />

          <fieldset>
            <legend>Assign team members</legend>
            <div className="member-list">
              {users.map((user) => (
                <label className="member-option" key={user.id}>
                  <input
                    type="checkbox"
                    checked={form.members.includes(user.id)}
                    onChange={() => toggleMember(user.id)}
                    disabled={!user.active && !form.members.includes(user.id)}
                  />
                  {user.name}{!user.active && " (inactive)"}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="actions">
            <button type="submit">{editingId ? "Save changes" : "Add project"}</button>
            {editingId && <button className="secondary" type="button" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>

        {error && <p className="error" role="alert">{error}</p>}

        {loading ? (
          <p>Loading projects...</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Team members</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>{project.name}</td>
                    <td>{project.clientName}</td>
                    <td>{project.members.length ? project.members.map((member) => member.name).join(", ") : "Unassigned"}</td>
                    <td>{project.active ? "Active" : "Inactive"}</td>
                    <td>
                      <div className="actions">
                        <button className="secondary" type="button" onClick={() => editProject(project)}>Edit</button>
                        <button className="secondary" type="button" onClick={() => toggleActive(project)}>
                          {project.active ? "Deactivate" : "Reactivate"}
                        </button>
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

export default ProjectsPage

