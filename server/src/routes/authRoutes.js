const express = require("express")

const authController = require("../controllers/authController")
const requireLogin = require("../middleware/requireLogin")

const router = express.Router()

router.post("/login", authController.login)
router.get("/me", requireLogin, authController.getCurrentUser)
router.post("/logout", requireLogin, authController.logout)

module.exports = router

