const express = require("express")

const requireAdmin = require("../middleware/requireAdmin")
const requireLogin = require("../middleware/requireLogin")
const userController = require("../controllers/userController")

const router = express.Router()

router.use(requireLogin, requireAdmin)

router.get("/", userController.getUsers)
router.post("/", userController.createUser)
router.put("/:id", userController.updateUser)

module.exports = router

