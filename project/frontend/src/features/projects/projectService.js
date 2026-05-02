import api, { authHeader } from '../../services/api'

const API_URL = '/projects/'

const getProjects = async (workspaceId, token) => {
  const response = await api.get(
    API_URL + `?workspaceId=${workspaceId}`,
    authHeader(token)
  )
  return response.data
}

const createProject = async (projectData, token) => {
  const response = await api.post(API_URL, projectData, authHeader(token))
  return response.data
}

const updateProject = async ({ id, projectData }, token) => {
  const response = await api.patch(API_URL + id, projectData, authHeader(token))
  return response.data
}

const deleteProject = async (id, token) => {
  const response = await api.delete(API_URL + id, authHeader(token))
  return response.data
}

const projectService = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
}

export default projectService
