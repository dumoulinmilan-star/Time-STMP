import { useState } from "react"
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom"

import ProjectsPage from "./pages/ProjectsPage"
import TeamPage from "./pages/TeamPage"

const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000/api" : "/api")

function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Time tracking for small teams</p>
        <h1>Welcome to TimeSTMP</h1>
        <p>Sign in to continue.</p>
        <Link className="button" to="/login">Log in</Link>
      </section>
    </main>
  )
}

function LoginPage({ setUser }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "The server could not log you in.")
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      setUser(data.user)
      navigate("/dashboard")
    } catch (error) {
      if (error instanceof TypeError) {
        setError("The server could not log you in.")
      } else {
        setError(error.message || "Could not log in. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <section className="card">
        <h1>Log in</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && <p className="error" role="alert">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
        <Link to="/">Return home</Link>
      </section>
    </main>
  )
}

function DashboardPage({ user, setUser }) {
  const navigate = useNavigate()

  async function logout() {
    const token = localStorage.getItem("token")

    await fetch(`${apiUrl}/auth/logout`, {
      method: "POST",
      headers: { Authorization: token }
    })

    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    navigate("/login")
  }

  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">Dashboard</p>
        <h1>Hello, {user.name}</h1>
        <p>You are logged in as {user.role === "admin" ? "admin" : "team member"}.</p>
        <div className="dashboard-actions">
          {user.role === "admin" && <Link className="button" to="/team">Manage team</Link>}
          {user.role === "admin" && <Link className="button" to="/projects">Manage projects</Link>}
          <button className="secondary" onClick={logout}>Log out</button>
        </div>
      </section>
    </main>
  )
}

function App() {
  const savedUser = localStorage.getItem("user")
  const [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : null)

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage setUser={setUser} />} />
      <Route
        path="/dashboard"
        element={user ? <DashboardPage user={user} setUser={setUser} /> : <Navigate to="/login" />}
      />
      <Route
        path="/team"
        element={user?.role === "admin" ? <TeamPage currentUser={user} /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/projects"
        element={user?.role === "admin" ? <ProjectsPage /> : <Navigate to="/dashboard" />}
      />
    </Routes>
  )
}

export default App
