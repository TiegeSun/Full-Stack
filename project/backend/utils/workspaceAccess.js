const Workspace = require('../models/workspaceModel')

const findWorkspaceForUser = async (workspaceId, userId) => {
  const workspace = await Workspace.findById(workspaceId)

  if (!workspace) {
    return null
  }

  const member = workspace.members.find(
    (workspaceMember) => workspaceMember.user.toString() === userId.toString()
  )

  if (!member) {
    return null
  }

  return { workspace, role: member.role }
}

const requireWorkspaceMember = async (workspaceId, userId) => {
  const access = await findWorkspaceForUser(workspaceId, userId)

  if (!access) {
    const error = new Error('Workspace not found or access denied')
    error.statusCode = 403
    throw error
  }

  return access
}

const requireWorkspaceOwner = async (workspaceId, userId) => {
  const access = await requireWorkspaceMember(workspaceId, userId)

  if (access.role !== 'owner') {
    const error = new Error('Only workspace owners can perform this action')
    error.statusCode = 403
    throw error
  }

  return access
}

const isWorkspaceMember = (workspace, userId) =>
  workspace.members.some(
    (workspaceMember) => workspaceMember.user.toString() === userId.toString()
  )

module.exports = {
  findWorkspaceForUser,
  requireWorkspaceMember,
  requireWorkspaceOwner,
  isWorkspaceMember,
}
