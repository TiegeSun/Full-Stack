const express = require('express')
const router = express.Router()
const {
  registerUser,
  loginUser,
  getMe,
  searchUsers,
} = require('../controllers/userController')
const { protect } = require('../middleware/authMiddleware')

router.post('/', registerUser)
router.post('/login', loginUser)
router.get('/search', protect, searchUsers)
router.get('/me', protect, getMe)

module.exports = router
