import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export const authHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
})

export default api
