import api, { authHeader } from '../../services/api'

const API_URL = '/users/'

// Register user
const register = async (userData) => {
  const response = await api.post(API_URL, userData)

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data))
  }

  return response.data
}

// Login user
const login = async (userData) => {
  const response = await api.post(API_URL + 'login', userData)

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data))
  }

  return response.data
}

// Logout user
const logout = () => {
  localStorage.removeItem('user')
}

const getMe = async (token) => {
  const response = await api.get(API_URL + 'me', authHeader(token))
  return response.data
}

const searchUsers = async (query, token) => {
  const response = await api.get(
    API_URL + `search?query=${encodeURIComponent(query)}`,
    authHeader(token)
  )
  return response.data
}

const authService = {
  register,
  logout,
  login,
  getMe,
  searchUsers,
}

export default authService
