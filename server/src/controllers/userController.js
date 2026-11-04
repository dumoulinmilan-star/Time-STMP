const bcrypt = require("bcrypt")

const User = require("../models/User")

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    internalRate: user.internalRate,
    billingRate: user.billingRate,
    active: user.active
  }
}

async function getUsers(req, res) {
  try {
    const users = await User.find().sort({ name: 1 })
    res.json({ users: users.map(publicUser) })
  } catch (error) {
    res.status(500).json({ message: "Could not get team members." })
  }
}

async function createUser(req, res) {
  try {
    const name = req.body.name?.trim()
    const email = req.body.email?.trim().toLowerCase()
    const password = req.body.password
    const role = req.body.role || "user"
    const internalRate = Number(req.body.internalRate)
    const billingRate = Number(req.body.billingRate)

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." })
    }

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: "Choose a valid role." })
    }

    if (internalRate < 0 || billingRate < 0 || Number.isNaN(internalRate) || Number.isNaN(billingRate)) {
      return res.status(400).json({ message: "Rates must be zero or greater." })
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(409).json({ message: "A team member with that email already exists." })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      internalRate,
      billingRate
    })

    res.status(201).json({ user: publicUser(user) })
  } catch (error) {
    res.status(500).json({ message: "Could not create team member." })
  }
}

async function updateUser(req, res) {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "Team member not found." })
    }

    if (req.body.active === false && user._id.equals(req.user._id)) {
      return res.status(400).json({ message: "You cannot deactivate your own account." })
    }

    if (req.body.role && user._id.equals(req.user._id) && req.body.role !== "admin") {
      return res.status(400).json({ message: "You cannot remove your own admin access." })
    }

    if (req.body.name !== undefined) user.name = req.body.name.trim()
    if (req.body.email !== undefined) user.email = req.body.email.trim().toLowerCase()
    if (req.body.role !== undefined) user.role = req.body.role
    if (req.body.internalRate !== undefined) user.internalRate = Number(req.body.internalRate)
    if (req.body.billingRate !== undefined) user.billingRate = Number(req.body.billingRate)
    if (req.body.active !== undefined) user.active = req.body.active

    await user.save()
    res.json({ user: publicUser(user) })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A team member with that email already exists." })
    }

    res.status(400).json({ message: "Could not update team member." })
  }
}

module.exports = {
  getUsers,
  createUser,
  updateUser
}
