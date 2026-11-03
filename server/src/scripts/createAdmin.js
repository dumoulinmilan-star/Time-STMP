require("dotenv").config()

const bcrypt = require("bcrypt")

const connectDatabase = require("../config/database")
const User = require("../models/User")

async function createAdmin() {
  const name = process.argv[2]
  const email = process.argv[3]?.toLowerCase()
  const password = process.argv[4]

  if (!name || !email || !password) {
    console.log('Usage: npm run create-admin -- "Name" "email@example.com" "password"')
    process.exit(1)
  }

  try {
    await connectDatabase()

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      console.log("A user with that email already exists.")
      process.exit(1)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin"
    })

    console.log("Admin account created.")
    process.exit(0)
  } catch (error) {
    console.error("Could not create admin:", error.message)
    process.exit(1)
  }
}

createAdmin()

