import { Link, Route, Routes } from "react-router-dom"

function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Simple project time tracking</p>
        <h1>Welcome to TimeSTMP</h1>
        <p>
          Track project hours, review team activity, and prepare billing reports.
        </p>
        <Link className="button" to="/login">Log in</Link>
      </section>
    </main>
  )
}

function LoginPage() {
  return (
    <main className="page">
      <section className="card">
        <h1>Log in</h1>
        <p>The login form will be added in the authentication stage.</p>
        <Link to="/">Return home</Link>
      </section>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  )
}

export default App

