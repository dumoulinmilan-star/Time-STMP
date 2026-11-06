const express = require("express")

const projectController = require("../controllers/projectController")
const requireAdmin = require("../middleware/requireAdmin")
const requireLogin = require("../middleware/requireLogin")

const router = express.Router()

router.get("/", requireLogin, projectController.getProjects)
router.post("/", requireLogin, requireAdmin, projectController.createProject)
router.put("/:id", requireLogin, requireAdmin, projectController.updateProject)

module.exports = router

