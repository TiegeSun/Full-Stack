const mongoose = require('mongoose')

const memberSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'member'],
      default: 'member',
    },
  },
  {
    _id: false,
  }
)

const workspaceSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a workspace name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: {
      type: [memberSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

workspaceSchema.index({ owner: 1 })
workspaceSchema.index({ 'members.user': 1 })

module.exports = mongoose.model('Workspace', workspaceSchema)
