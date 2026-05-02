const express = require('express')
const router = express.Router()
const { getOverview } = require('../controllers/analyticsController')
const { protect } = require('../middleware/authMiddleware')

router.route('/overview').get(protect, getOverview)

module.exports = router
