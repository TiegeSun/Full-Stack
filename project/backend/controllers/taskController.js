const asyncHandler = require('express-async-handler')
const Project = require('../models/projectModel')
const Task = require('../models/taskModel')
const {
  requireWorkspaceMember,
  isWorkspaceMember,
} = require('../utils/workspaceAccess')

const populateTask = (query) =>
  query
    .populate('project', 'name color status')
    .populate('assignee', 'name email')
    .populate('reporter', 'name email')

const buildTaskFilter = (query) => {
  const filter = {}

  if (query.workspaceId) {
    filter.workspace = query.workspaceId
  }

  if (query.projectId) {
    filter.project = query.projectId
  }

  if (query.status) {
    filter.status = query.status
  }

  if (query.priority) {
    filter.priority = query.priority
  }

  if (query.assignee) {
    filter.assignee = query.assignee === 'unassigned' ? { $exists: false } : query.assignee
  }

  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
      { tags: { $regex: query.search, $options: 'i' } },
    ]
  }

  if (query.due === 'overdue') {
    filter.status = { $ne: 'done' }
    filter.dueDate = { $lt: new Date() }
  }

  if (query.due === 'week') {
    const now = new Date()
    const weekFromNow = new Date()
    weekFromNow.setDate(now.getDate() + 7)
    filter.dueDate = { $gte: now, $lte: weekFromNow }
  }

  return filter
}

const getTasks = asyncHandler(async (req, res) => {
  if (!req.query.workspaceId) {
    res.status(400)
    throw new Error('workspaceId is required')
  }

  await requireWorkspaceMember(req.query.workspaceId, req.user.id)

  const tasks = await populateTask(
    Task.find(buildTaskFilter(req.query)).sort({ dueDate: 1, updatedAt: -1 })
  )

  res.status(200).json(tasks)
})

const createTask = asyncHandler(async (req, res) => {
  const {
    workspace,
    project,
    title,
    description,
    status,
    priority,
    assignee,
    tags,
    dueDate,
  } = req.body

  if (!workspace || !project || !title) {
    res.status(400)
    throw new Error('Workspace, project, and title are required')
  }

  const { workspace: workspaceDoc } = await requireWorkspaceMember(
    workspace,
    req.user.id
  )

  const projectDoc = await Project.findOne({ _id: project, workspace })

  if (!projectDoc) {
    res.status(404)
    throw new Error('Project not found in this workspace')
  }

  if (assignee && !isWorkspaceMember(workspaceDoc, assignee)) {
    res.status(400)
    throw new Error('Assignee must be a workspace member')
  }

  const task = await Task.create({
    workspace,
    project,
    title,
    description,
    status,
    priority,
    assignee: assignee || undefined,
    reporter: req.user.id,
    tags: Array.isArray(tags) ? tags : String(tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
    dueDate,
    completedAt: status === 'done' ? new Date() : undefined,
  })

  const populatedTask = await populateTask(Task.findById(task._id))

  res.status(201).json(populatedTask)
})

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)

  if (!task) {
    res.status(404)
    throw new Error('Task not found')
  }

  const { workspace: workspaceDoc } = await requireWorkspaceMember(
    task.workspace,
    req.user.id
  )

  const updates = {
    title: req.body.title,
    description: req.body.description,
    status: req.body.status,
    priority: req.body.priority,
    assignee: req.body.assignee,
    tags: Array.isArray(req.body.tags)
      ? req.body.tags
      : req.body.tags === undefined
      ? undefined
      : String(req.body.tags).split(',').map((tag) => tag.trim()).filter(Boolean),
    dueDate: req.body.dueDate,
  }

  if (updates.assignee && !isWorkspaceMember(workspaceDoc, updates.assignee)) {
    res.status(400)
    throw new Error('Assignee must be a workspace member')
  }

  if (updates.status === 'done' && task.status !== 'done') {
    updates.completedAt = new Date()
  }

  if (updates.status && updates.status !== 'done') {
    updates.completedAt = null
  }

  Object.keys(updates).forEach((key) => {
    if (updates[key] === undefined) {
      delete updates[key]
    }
  })

  const updatedTask = await populateTask(
    Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
  )

  res.status(200).json(updatedTask)
})

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)

  if (!task) {
    res.status(404)
    throw new Error('Task not found')
  }

  const access = await requireWorkspaceMember(task.workspace, req.user.id)
  const isReporter = task.reporter.toString() === req.user.id

  if (access.role !== 'owner' && !isReporter) {
    res.status(403)
    throw new Error('Only owners or reporters can delete this task')
  }

  await task.remove()

  res.status(200).json({ id: req.params.id })
})

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
}
