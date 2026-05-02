const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const dotenv = require('dotenv')
const connectDB = require('../config/db')
const User = require('../models/userModel')
const Workspace = require('../models/workspaceModel')
const Project = require('../models/projectModel')
const Task = require('../models/taskModel')

dotenv.config()

const addDays = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

const users = [
  {
    name: 'Ava Product',
    email: 'ava@sprinthub.dev',
    password: 'password123',
  },
  {
    name: 'Noah Engineer',
    email: 'noah@sprinthub.dev',
    password: 'password123',
  },
]

const seedData = async () => {
  await connectDB()

  await Promise.all([
    User.deleteMany({ email: { $in: users.map((user) => user.email) } }),
    Workspace.deleteMany({ name: 'SprintHub Demo Workspace' }),
  ])

  const salt = await bcrypt.genSalt(10)
  const createdUsers = await User.insertMany(
    await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, salt),
      }))
    )
  )

  const [owner, member] = createdUsers

  const workspace = await Workspace.create({
    name: 'SprintHub Demo Workspace',
    description: 'A portfolio-ready workspace with real collaboration data.',
    owner: owner._id,
    members: [
      { user: owner._id, role: 'owner' },
      { user: member._id, role: 'member' },
    ],
  })

  const projects = await Project.insertMany([
    {
      workspace: workspace._id,
      name: 'Hiring Dashboard',
      description: 'Interview-ready analytics and executive views.',
      status: 'active',
      color: '#2563eb',
      dueDate: addDays(21),
      createdBy: owner._id,
    },
    {
      workspace: workspace._id,
      name: 'Design System Refresh',
      description: 'Polish product UI primitives for repeated workflows.',
      status: 'active',
      color: '#16a34a',
      dueDate: addDays(35),
      createdBy: owner._id,
    },
    {
      workspace: workspace._id,
      name: 'Release Operations',
      description: 'Keep launch tasks, QA, and handoff actions visible.',
      status: 'on_hold',
      color: '#f97316',
      dueDate: addDays(49),
      createdBy: owner._id,
    },
  ])

  await Task.insertMany([
    {
      workspace: workspace._id,
      project: projects[0]._id,
      title: 'Build analytics overview endpoint',
      description: 'Return task totals, status distribution, and due date risk.',
      status: 'done',
      priority: 'high',
      assignee: member._id,
      reporter: owner._id,
      tags: ['api', 'analytics'],
      dueDate: addDays(-2),
      completedAt: addDays(-1),
    },
    {
      workspace: workspace._id,
      project: projects[0]._id,
      title: 'Wire dashboard charts to live data',
      description: 'Connect status and priority charts to the analytics API.',
      status: 'in_progress',
      priority: 'urgent',
      assignee: owner._id,
      reporter: owner._id,
      tags: ['frontend', 'charts'],
      dueDate: addDays(2),
    },
    {
      workspace: workspace._id,
      project: projects[0]._id,
      title: 'Document demo credentials',
      description: 'Make the README useful for recruiters and reviewers.',
      status: 'review',
      priority: 'medium',
      assignee: member._id,
      reporter: owner._id,
      tags: ['docs'],
      dueDate: addDays(5),
    },
    {
      workspace: workspace._id,
      project: projects[1]._id,
      title: 'Create task drawer form',
      description: 'Support edit and create flows from the project detail page.',
      status: 'todo',
      priority: 'high',
      assignee: owner._id,
      reporter: member._id,
      tags: ['ui', 'forms'],
      dueDate: addDays(7),
    },
    {
      workspace: workspace._id,
      project: projects[1]._id,
      title: 'Define responsive navigation',
      description: 'Keep app navigation comfortable on tablets and phones.',
      status: 'in_progress',
      priority: 'medium',
      assignee: member._id,
      reporter: owner._id,
      tags: ['responsive'],
      dueDate: addDays(10),
    },
    {
      workspace: workspace._id,
      project: projects[2]._id,
      title: 'QA owner-only project actions',
      description: 'Verify project creation and deletion stay owner-only.',
      status: 'todo',
      priority: 'low',
      assignee: member._id,
      reporter: owner._id,
      tags: ['qa', 'permissions'],
      dueDate: addDays(14),
    },
    {
      workspace: workspace._id,
      project: projects[2]._id,
      title: 'Clean overdue launch checklist',
      description: 'Resolve or reassign stale launch-prep actions.',
      status: 'todo',
      priority: 'urgent',
      assignee: owner._id,
      reporter: owner._id,
      tags: ['ops'],
      dueDate: addDays(-3),
    },
  ])

  console.log('SprintHub seed data created')
  console.log('Owner: ava@sprinthub.dev / password123')
  console.log('Member: noah@sprinthub.dev / password123')
  await mongoose.connection.close()
}

seedData().catch(async (error) => {
  console.error(error)
  await mongoose.connection.close()
  process.exit(1)
})
