import api, { authHeader } from '../../services/api'

const API_URL = '/workspaces/'

const getWorkspaces = async (token) => {
  const response = await api.get(API_URL, authHeader(token))
  return response.data
}

const createWorkspace = async (workspaceData, token) => {
  const response = await api.post(API_URL, workspaceData, authHeader(token))
  return response.data
}

const updateWorkspace = async ({ id, workspaceData }, token) => {
  const response = await api.patch(API_URL + id, workspaceData, authHeader(token))
  return response.data
}

const deleteWorkspace = async (id, token) => {
  const response = await api.delete(API_URL + id, authHeader(token))
  return response.data
}

const addMember = async ({ id, email }, token) => {
  const response = await api.post(
    API_URL + `${id}/members`,
    { email },
    authHeader(token)
  )
  return response.data
}

const removeMember = async ({ id, memberId }, token) => {
  const response = await api.delete(
    API_URL + `${id}/members/${memberId}`,
    authHeader(token)
  )
  return response.data
}

const workspaceService = {
  getWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  removeMember,
}

export default workspaceService
