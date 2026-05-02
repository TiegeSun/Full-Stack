const asyncHandler = require('express-async-handler')
const mongoose = require('mongoose')
const Project = require('../models/projectModel')
const Task = require('../models/taskModel')
const {
  requireWorkspaceMember,
  requireWorkspaceOwner,
} = require('../utils/workspaceAccess')

const populateProject = (query) =>
  query
    .populate('createdBy', 'name email')
    .populate('workspace', 'name owner members')

const getProjects = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query

  if (!workspaceId) {
    res.status(400)
    throw new Error('workspaceId is required')
  }

  await requireWorkspaceMember(workspaceId, req.user.id)

  const projects = await populateProject(
    Project.find({ workspace: workspaceId }).sort({ updatedAt: -1 })
  ).lean()

  const taskCounts = await Task.aggregate([
    { $match: { workspace: new mongoose.Types.ObjectId(workspaceId) } },
    { $group: { _id: '$project', total: { $sum: 1 } } },
  ])

  const countsByProject = taskCounts.reduce((acc, item) => {
    acc[item._id.toString()] = item.total
    return acc
  }, {})

  res.status(200).json(
    projects.map((project) => ({
      ...project,
      taskCount: countsByProject[project._id.toString()] || 0,
    }))
  )
})

const createProject = asyncHandler(async (req, res) => {
  const { workspace, name, description, status, color, dueDate } = req.body

  if (!workspace || !name) {
    res.status(400)
    throw new Error('Workspace and project name are required')
  }

  await requireWorkspaceOwner(workspace, req.user.id)

  const project = await Project.create({
    workspace,
    name,
    description,
    status,
    color,
    dueDate,
    createdBy: req.user.id,
  })

  const populatedProject = await populateProject(Project.findById(project._id))

  res.status(201).json({ ...populatedProject.toObject(), taskCount: 0 })
})

const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)

  if (!project) {
    res.status(404)
    throw new Error('Project not found')
  }

  await requireWorkspaceOwner(project.workspace, req.user.id)

  const updates = {
    name: req.body.name,
    description: req.body.description,
    status: req.body.status,
    color: req.body.color,
    dueDate: req.body.dueDate,
  }

  Object.keys(updates).forEach((key) => {
    if (updates[key] === undefined) {
      delete updates[key]
    }
  })

  const updatedProject = await populateProject(
    Project.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
  )

  const taskCount = await Task.countDocuments({ project: req.params.id })

  res.status(200).json({ ...updatedProject.toObject(), taskCount })
})

const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)

  if (!project) {
    res.status(404)
    throw new Error('Project not found')
  }

  await requireWorkspaceOwner(project.workspace, req.user.id)

  await Task.deleteMany({ project: req.params.id })
  await Project.findByIdAndDelete(req.params.id)

  res.status(200).json({ id: req.params.id })
})

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
}
