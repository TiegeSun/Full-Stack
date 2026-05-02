const asyncHandler = require('express-async-handler')
const Workspace = require('../models/workspaceModel')
const Project = require('../models/projectModel')
const Task = require('../models/taskModel')
const User = require('../models/userModel')
const {
  requireWorkspaceMember,
  requireWorkspaceOwner,
} = require('../utils/workspaceAccess')

const populateWorkspace = (query) =>
  query.populate('owner', 'name email').populate('members.user', 'name email')

const getWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await populateWorkspace(
    Workspace.find({ 'members.user': req.user.id }).sort({ updatedAt: -1 })
  )

  res.status(200).json(workspaces)
})

const createWorkspace = asyncHandler(async (req, res) => {
  const { name, description } = req.body

  if (!name) {
    res.status(400)
    throw new Error('Please add a workspace name')
  }

  const workspace = await Workspace.create({
    name,
    description,
    owner: req.user.id,
    members: [{ user: req.user.id, role: 'owner' }],
  })

  const populatedWorkspace = await populateWorkspace(
    Workspace.findById(workspace._id)
  )

  res.status(201).json(populatedWorkspace)
})

const getWorkspace = asyncHandler(async (req, res) => {
  await requireWorkspaceMember(req.params.id, req.user.id)

  const workspace = await populateWorkspace(Workspace.findById(req.params.id))

  res.status(200).json(workspace)
})

const updateWorkspace = asyncHandler(async (req, res) => {
  await requireWorkspaceOwner(req.params.id, req.user.id)

  const updates = {
    name: req.body.name,
    description: req.body.description,
  }

  Object.keys(updates).forEach((key) => {
    if (updates[key] === undefined) {
      delete updates[key]
    }
  })

  const workspace = await populateWorkspace(
    Workspace.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
  )

  res.status(200).json(workspace)
})

const deleteWorkspace = asyncHandler(async (req, res) => {
  await requireWorkspaceOwner(req.params.id, req.user.id)

  await Task.deleteMany({ workspace: req.params.id })
  await Project.deleteMany({ workspace: req.params.id })
  await Workspace.findByIdAndDelete(req.params.id)

  res.status(200).json({ id: req.params.id })
})

const addWorkspaceMember = asyncHandler(async (req, res) => {
  const { workspace } = await requireWorkspaceOwner(req.params.id, req.user.id)
  const email = (req.body.email || '').trim().toLowerCase()

  if (!email) {
    res.status(400)
    throw new Error('Please provide a member email')
  }

  const user = await User.findOne({ email })

  if (!user) {
    res.status(404)
    throw new Error('No registered user found with that email')
  }

  const alreadyMember = workspace.members.some(
    (member) => member.user.toString() === user._id.toString()
  )

  if (!alreadyMember) {
    workspace.members.push({ user: user._id, role: 'member' })
    await workspace.save()
  }

  const populatedWorkspace = await populateWorkspace(
    Workspace.findById(req.params.id)
  )

  res.status(200).json(populatedWorkspace)
})

const removeWorkspaceMember = asyncHandler(async (req, res) => {
  const { workspace } = await requireWorkspaceOwner(req.params.id, req.user.id)

  if (workspace.owner.toString() === req.params.memberId) {
    res.status(400)
    throw new Error('Workspace owner cannot be removed')
  }

  workspace.members = workspace.members.filter(
    (member) => member.user.toString() !== req.params.memberId
  )
  await workspace.save()

  await Task.updateMany(
    { workspace: workspace._id, assignee: req.params.memberId },
    { $unset: { assignee: '' } }
  )

  const populatedWorkspace = await populateWorkspace(
    Workspace.findById(req.params.id)
  )

  res.status(200).json(populatedWorkspace)
})

module.exports = {
  getWorkspaces,
  createWorkspace,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addWorkspaceMember,
  removeWorkspaceMember,
}
