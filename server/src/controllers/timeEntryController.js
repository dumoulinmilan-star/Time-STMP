const mongoose = require("mongoose")

const Project = require("../models/Project")
const TimeEntry = require("../models/TimeEntry")

function publicTimeEntry(entry) {
  return {
    id: entry._id,
    user: {
      id: entry.user._id,
      name: entry.user.name
    },
    project: {
      id: entry.project._id,
      name: entry.project.name,
      clientName: entry.project.clientName
    },
    date: entry.date.toISOString().slice(0, 10),
    hours: entry.hours,
    description: entry.description
  }
}

function validEntry(date, hours, description) {
  const quarterHour = Number.isInteger(hours * 4)
  return date && !Number.isNaN(date.getTime()) && hours >= 0.25 && hours <= 24 && quarterHour && description
}

async function assignedActiveProject(projectId, userId) {
  if (!mongoose.Types.ObjectId.isValid(projectId)) return null

  return Project.findOne({
    _id: projectId,
    active: true,
    members: userId
  })
}

async function getTimeEntries(req, res) {
  try {
    const filter = req.user.role === "admin" ? {} : { user: req.user._id }
    const entries = await TimeEntry.find(filter)
      .populate("user", "name")
      .populate("project", "name clientName")
      .sort({ date: -1, createdAt: -1 })

    res.json({ entries: entries.map(publicTimeEntry) })
  } catch (error) {
    res.status(500).json({ message: "Could not get time entries." })
  }
}

async function createTimeEntry(req, res) {
  try {
    const date = new Date(req.body.date)
    const hours = Number(req.body.hours)
    const description = req.body.description?.trim()

    if (!validEntry(date, hours, description)) {
      return res.status(400).json({ message: "Enter a valid date, description, and hours in 0.25 increments." })
    }

    const project = await assignedActiveProject(req.body.project, req.user._id)

    if (!project) {
      return res.status(400).json({ message: "Choose an active project assigned to you." })
    }

    const entry = await TimeEntry.create({
      user: req.user._id,
      project: project._id,
      date,
      hours,
      description
    })

    await entry.populate("user", "name")
    await entry.populate("project", "name clientName")
    res.status(201).json({ entry: publicTimeEntry(entry) })
  } catch (error) {
    res.status(500).json({ message: "Could not create time entry." })
  }
}

async function updateTimeEntry(req, res) {
  try {
    const entry = await TimeEntry.findById(req.params.id)

    if (!entry) {
      return res.status(404).json({ message: "Time entry not found." })
    }

    if (req.user.role !== "admin" && !entry.user.equals(req.user._id)) {
      return res.status(403).json({ message: "You can only edit your own time entries." })
    }

    const date = new Date(req.body.date)
    const hours = Number(req.body.hours)
    const description = req.body.description?.trim()

    if (!validEntry(date, hours, description)) {
      return res.status(400).json({ message: "Enter a valid date, description, and hours in 0.25 increments." })
    }

    const keepingSameProject = entry.project.equals(req.body.project)
    const project = keepingSameProject
      ? await Project.findById(entry.project)
      : await assignedActiveProject(req.body.project, entry.user)

    if (!project) {
      return res.status(400).json({ message: "Choose an active project assigned to this team member." })
    }

    entry.project = project._id
    entry.date = date
    entry.hours = hours
    entry.description = description

    await entry.save()
    await entry.populate("user", "name")
    await entry.populate("project", "name clientName")
    res.json({ entry: publicTimeEntry(entry) })
  } catch (error) {
    res.status(400).json({ message: "Could not update time entry." })
  }
}

async function deleteTimeEntry(req, res) {
  try {
    const entry = await TimeEntry.findById(req.params.id)

    if (!entry) {
      return res.status(404).json({ message: "Time entry not found." })
    }

    if (req.user.role !== "admin" && !entry.user.equals(req.user._id)) {
      return res.status(403).json({ message: "You can only delete your own time entries." })
    }

    await entry.deleteOne()
    res.json({ message: "Time entry deleted." })
  } catch (error) {
    res.status(400).json({ message: "Could not delete time entry." })
  }
}

module.exports = {
  getTimeEntries,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry
}
