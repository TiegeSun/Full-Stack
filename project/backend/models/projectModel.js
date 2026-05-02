const mongoose = require('mongoose')

const projectSchema = mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a project name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'on_hold', 'completed'],
      default: 'active',
    },
    color: {
      type: String,
      default: '#2563eb',
      trim: true,
    },
    dueDate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

projectSchema.index({ workspace: 1, status: 1 })

module.exports = mongoose.model('Project', projectSchema)
