const cors = require("cors")
const express = require("express")
const path = require("path")

const authRoutes = require("./routes/authRoutes")
const projectRoutes = require("./routes/projectRoutes")
const timeEntryRoutes = require("./routes/timeEntryRoutes")
const userRoutes = require("./routes/userRoutes")

const app = express()
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://127.0.0.1:5173"
]

app.use(cors({
  origin: allowedOrigins
}))
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/time-entries", timeEntryRoutes)
app.use("/api/users", userRoutes)

app.get("/api/health", (req, res) => {
  res.json({ message: "TimeSTMP API is running" })
})

if (process.env.NODE_ENV === "production") {
  const clientFolder = path.join(__dirname, "../../client/dist")

  app.use(express.static(clientFolder))

  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientFolder, "index.html"))
  })
}

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" })
})

module.exports = app
