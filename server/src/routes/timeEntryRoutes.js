const express = require("express")

const requireLogin = require("../middleware/requireLogin")
const timeEntryController = require("../controllers/timeEntryController")

const router = express.Router()

router.use(requireLogin)

router.get("/", timeEntryController.getTimeEntries)
router.post("/", timeEntryController.createTimeEntry)
router.put("/:id", timeEntryController.updateTimeEntry)
router.delete("/:id", timeEntryController.deleteTimeEntry)

module.exports = router
