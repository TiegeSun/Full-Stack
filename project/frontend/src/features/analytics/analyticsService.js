import api, { authHeader } from '../../services/api'

const getOverview = async ({ workspaceId, projectId }, token) => {
  const query = new URLSearchParams({ workspaceId })
  if (projectId) {
    query.set('projectId', projectId)
  }
  const response = await api.get(
    `/analytics/overview?${query.toString()}`,
    authHeader(token)
  )
  return response.data
}

const analyticsService = {
  getOverview,
}

export default analyticsService
