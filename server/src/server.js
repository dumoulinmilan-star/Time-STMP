require("dotenv").config()

const app = require("./app")
const connectDatabase = require("./config/database")

const port = process.env.PORT || 3000

async function startServer() {
  try {
    await connectDatabase()

    app.listen(port, () => {
      console.log(`TimeSTMP server running on http://localhost:${port}`)
    })
  } catch (error) {
    console.error("Could not start the server:", error.message)
    process.exit(1)
  }
}

startServer()

