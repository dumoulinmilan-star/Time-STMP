const cors = require("cors")
const express = require("express")

const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
}))
app.use(express.json())

app.get("/api/health", (req, res) => {
  res.json({ message: "TimeSTMP API is running" })
})

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" })
})

module.exports = app

