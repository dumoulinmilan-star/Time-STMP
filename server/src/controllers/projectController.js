const mongoose = require("mongoose")

const Project = require("../models/Project")
const User = require("../models/User")

function publicProject(project) {
  return {
    id: project._id,
    name: project.name,
    clientName: project.clientName,
    members: project.members.map((member) => ({
      id: member._id,
      name: member.name,
      email: member.email,
      active: member.active
    })),
    active: project.active
  }
}

async function validMembers(memberIds) {
  if (!memberIds.every((id) => mongoose.Types.ObjectId.isValid(id))) {
    return false
  }

  const memberCount = await User.countDocuments({ _id: { $in: memberIds } })
  return memberCount === memberIds.length
}

async function getProjects(req, res) {
  try {
    const filter = req.user.role === "admin"
      ? {}
      : { active: true, members: req.user._id }

    const projects = await Project.find(filter)
      .populate("members", "name email active")
      .sort({ name: 1 })

    res.json({ projects: projects.map(publicProject) })
  } catch (error) {
    res.status(500).json({ message: "Could not get projects." })
  }
}

async function createProject(req, res) {
  try {
    const name = req.body.name?.trim()
    const clientName = req.body.clientName?.trim()
    const memberIds = [...new Set(req.body.members || [])]

    if (!name || !clientName) {
      return res.status(400).json({ message: "Project name and client name are required." })
    }

    if (!Array.isArray(req.body.members) || !(await validMembers(memberIds))) {
      return res.status(400).json({ message: "Choose valid team members." })
    }

    const project = await Project.create({
      name,
      clientName,
      members: memberIds
    })

    await project.populate("members", "name email active")
    res.status(201).json({ project: publicProject(project) })
  } catch (error) {
    res.status(500).json({ message: "Could not create project." })
  }
}

async function updateProject(req, res) {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({ message: "Project not found." })
    }

    if (req.body.members !== undefined) {
      const memberIds = [...new Set(req.body.members)]

      if (!Array.isArray(req.body.members) || !(await validMembers(memberIds))) {
        return res.status(400).json({ message: "Choose valid team members." })
      }

      project.members = memberIds
    }

    if (req.body.name !== undefined) project.name = req.body.name.trim()
    if (req.body.clientName !== undefined) project.clientName = req.body.clientName.trim()
    if (req.body.active !== undefined) project.active = req.body.active

    await project.save()
    await project.populate("members", "name email active")

    res.json({ project: publicProject(project) })
  } catch (error) {
    res.status(400).json({ message: "Could not update project." })
  }
}

module.exports = {
  getProjects,
  createProject,
  updateProject
}

