import api, { authHeader } from '../../services/api'

const API_URL = '/tasks/'

const buildQuery = (params) => {
  const searchParams = new URLSearchParams()
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value)
    }
  })
  return searchParams.toString()
}

const getTasks = async (params, token) => {
  const response = await api.get(API_URL + `?${buildQuery(params)}`, authHeader(token))
  return response.data
}

const createTask = async (taskData, token) => {
  const response = await api.post(API_URL, taskData, authHeader(token))
  return response.data
}

const updateTask = async ({ id, taskData }, token) => {
  const response = await api.patch(API_URL + id, taskData, authHeader(token))
  return response.data
}

const deleteTask = async (id, token) => {
  const response = await api.delete(API_URL + id, authHeader(token))
  return response.data
}

const taskService = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
}

export default taskService
