export const statusLabels = {
  todo: 'To do',
  in_progress: 'In progress',
  review: 'Review',
  done: 'Done',
  active: 'Active',
  on_hold: 'On hold',
  completed: 'Completed',
}

export const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export const formatDate = (date) => {
  if (!date) {
    return 'No date'
  }

  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const getMemberName = (member) => member?.user?.name || member?.name || 'Unassigned'

export const getActiveWorkspace = (workspaces, activeWorkspaceId) =>
  workspaces.find((workspace) => workspace._id === activeWorkspaceId)

export const getUserRole = (workspace, userId) =>
  workspace?.members?.find((member) => member.user?._id === userId)?.role || 'member'
