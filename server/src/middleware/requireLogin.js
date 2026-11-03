const Session = require("../models/Session")

async function requireLogin(req, res, next) {
  try {
    const token = req.headers.authorization

    if (!token) {
      return res.status(401).json({ message: "Please log in." })
    }

    const session = await Session.findOne({ token }).populate("user")

    if (!session || !session.user || !session.user.active) {
      return res.status(401).json({ message: "Your login is no longer valid." })
    }

    req.token = token
    req.user = session.user
    next()
  } catch (error) {
    res.status(500).json({ message: "Could not check your login." })
  }
}

module.exports = requireLogin

