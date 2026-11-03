const bcrypt = require("bcrypt")
const crypto = require("crypto")

const Session = require("../models/Session")
const User = require("../models/User")

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }
}

async function login(req, res) {
  try {
    const email = req.body.email?.trim().toLowerCase()
    const password = req.body.password

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." })
    }

    const user = await User.findOne({ email })

    if (!user || !user.active) {
      return res.status(401).json({ message: "Incorrect email or password." })
    }

    const correctPassword = await bcrypt.compare(password, user.password)

    if (!correctPassword) {
      return res.status(401).json({ message: "Incorrect email or password." })
    }

    const token = crypto.randomBytes(24).toString("hex")
    await Session.create({ token, user: user._id })

    res.json({ token, user: publicUser(user) })
  } catch (error) {
    res.status(500).json({ message: "Could not log in." })
  }
}

function getCurrentUser(req, res) {
  res.json({ user: publicUser(req.user) })
}

async function logout(req, res) {
  await Session.deleteOne({ token: req.token })
  res.json({ message: "Logged out." })
}

module.exports = {
  login,
  getCurrentUser,
  logout
}

