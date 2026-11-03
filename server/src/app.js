const cors = require("cors")
const express = require("express")

const authRoutes = require("./routes/authRoutes")

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

app.get("/api/health", (req, res) => {
  res.json({ message: "TimeSTMP API is running" })
})

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" })
})

module.exports = app
