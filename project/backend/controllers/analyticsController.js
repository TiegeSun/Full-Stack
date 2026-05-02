const asyncHandler = require('express-async-handler')
const mongoose = require('mongoose')
const Project = require('../models/projectModel')
const Task = require('../models/taskModel')
const { requireWorkspaceMember } = require('../utils/workspaceAccess')

const STATUS_KEYS = ['todo', 'in_progress', 'review', 'done']
const PRIORITY_KEYS = ['low', 'medium', 'high', 'urgent']

const normalizeGroups = (keys, groups) => {
  const counts = groups.reduce((acc, group) => {
    acc[group._id] = group.count
    return acc
  }, {})

  return keys.map((key) => ({
    name: key,
    value: counts[key] || 0,
  }))
}

const getOverview = asyncHandler(async (req, res) => {
  const { workspaceId, projectId } = req.query

  if (!workspaceId) {
    res.status(400)
    throw new Error('workspaceId is required')
  }

  await requireWorkspaceMember(workspaceId, req.user.id)

  const taskMatch = {
    workspace: new mongoose.Types.ObjectId(workspaceId),
  }

  if (projectId) {
    taskMatch.project = new mongoose.Types.ObjectId(projectId)
  }

  const now = new Date()
  const weekFromNow = new Date()
  weekFromNow.setDate(now.getDate() + 7)

  const [
    totalProjects,
    activeProjects,
    totalTasks,
    completedTasks,
    byStatusRaw,
    byPriorityRaw,
    overdueCount,
    dueThisWeekCount,
    upcomingTasks,
  ] = await Promise.all([
    Project.countDocuments({ workspace: workspaceId }),
    Project.countDocuments({ workspace: workspaceId, status: 'active' }),
    Task.countDocuments(taskMatch),
    Task.countDocuments({ ...taskMatch, status: 'done' }),
    Task.aggregate([
      { $match: taskMatch },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Task.aggregate([
      { $match: taskMatch },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    Task.countDocuments({
      ...taskMatch,
      status: { $ne: 'done' },
      dueDate: { $lt: now },
    }),
    Task.countDocuments({
      ...taskMatch,
      status: { $ne: 'done' },
      dueDate: { $gte: now, $lte: weekFromNow },
    }),
    Task.find({
      ...taskMatch,
      status: { $ne: 'done' },
      dueDate: { $gte: now },
    })
      .sort({ dueDate: 1 })
      .limit(6)
      .populate('project', 'name color')
      .populate('assignee', 'name email'),
  ])

  res.status(200).json({
    summary: {
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      openTasks: totalTasks - completedTasks,
      completionRate: totalTasks
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0,
    },
    byStatus: normalizeGroups(STATUS_KEYS, byStatusRaw),
    byPriority: normalizeGroups(PRIORITY_KEYS, byPriorityRaw),
    overdueCount,
    dueThisWeekCount,
    upcomingTasks,
  })
})

module.exports = {
  getOverview,
}
