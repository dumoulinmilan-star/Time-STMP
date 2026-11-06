import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000/api" : "/api")

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "user",
  internalRate: "0",
  billingRate: "0"
}

function TeamPage({ currentUser }) {
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
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
      const [usersResponse, projectsResponse] = await Promise.all([
        fetch(`${apiUrl}/users`, { headers }),
        fetch(`${apiUrl}/projects`, { headers })
      ])
      const usersData = await usersResponse.json()
      const projectsData = await projectsResponse.json()

      if (!usersResponse.ok) throw new Error(usersData.message)
      if (!projectsResponse.ok) throw new Error(projectsData.message)

      setUsers(usersData.users)
      setProjects(projectsData.projects)
    } catch (error) {
      setError(error.message || "Could not load team members.")
    } finally {
      setLoading(false)
    }
  }

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")

    const url = editingId ? `${apiUrl}/users/${editingId}` : `${apiUrl}/users`
    const method = editingId ? "PUT" : "POST"
    const body = {
      name: form.name,
      email: form.email,
      role: form.role,
      internalRate: Number(form.internalRate),
      billingRate: Number(form.billingRate)
    }

    if (!editingId) body.password = form.password

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token")
        },
        body: JSON.stringify(body)
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.message)

      if (editingId) {
        setUsers(users.map((user) => user.id === editingId ? data.user : user))
      } else {
        setUsers([...users, data.user].sort((a, b) => a.name.localeCompare(b.name)))
      }

      cancelEdit()
    } catch (error) {
      setError(error.message || "Could not save team member.")
    }
  }

  function editUser(user) {
    setEditingId(user.id)
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      internalRate: String(user.internalRate),
      billingRate: String(user.billingRate)
    })
    setError("")
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function toggleActive(user) {
    setError("")

    try {
      const response = await fetch(`${apiUrl}/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token")
        },
        body: JSON.stringify({ active: !user.active })
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.message)

      setUsers(users.map((item) => item.id === user.id ? data.user : item))
    } catch (error) {
      setError(error.message || "Could not update team member.")
    }
  }

  return (
    <main className="page wide-page">
      <section className="card wide-card">
        <p className="eyebrow">Admin</p>
        <h1>Team members</h1>
        <Link to="/dashboard">Return to dashboard</Link>

        <form className="team-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit team member" : "Add team member"}</h2>

          <label htmlFor="name">Name</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} required />

          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />

          {!editingId && (
            <>
              <label htmlFor="password">Initial password</label>
              <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
            </>
          )}

          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            disabled={editingId === currentUser.id}
          >
            <option value="user">Team member</option>
            <option value="admin">Admin</option>
          </select>

          <label htmlFor="internalRate">Internal rate</label>
          <input id="internalRate" name="internalRate" type="number" min="0" step="0.01" value={form.internalRate} onChange={handleChange} required />

          <label htmlFor="billingRate">Billing rate</label>
          <input id="billingRate" name="billingRate" type="number" min="0" step="0.01" value={form.billingRate} onChange={handleChange} required />

          <div className="actions">
            <button type="submit">{editingId ? "Save changes" : "Add team member"}</button>
            {editingId && <button className="secondary" type="button" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>

        {error && <p className="error" role="alert">{error}</p>}

        {loading ? (
          <p>Loading team members...</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Projects</th>
                  <th>Internal rate</th>
                  <th>Billing rate</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}<br /><small>{user.email}</small></td>
                    <td>{user.role === "admin" ? "Admin" : "Team member"}</td>
                    <td>
                      {projects
                        .filter((project) => project.members.some((member) => member.id === user.id))
                        .map((project) => project.name)
                        .join(", ") || "None"}
                    </td>
                    <td>${user.internalRate.toFixed(2)}</td>
                    <td>${user.billingRate.toFixed(2)}</td>
                    <td>{user.active ? "Active" : "Inactive"}</td>
                    <td>
                      <div className="actions">
                        <button className="secondary" type="button" onClick={() => editUser(user)}>Edit</button>
                        <button
                          className="secondary"
                          type="button"
                          onClick={() => toggleActive(user)}
                          disabled={user.id === currentUser.id}
                        >
                          {user.active ? "Deactivate" : "Reactivate"}
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

export default TeamPage
