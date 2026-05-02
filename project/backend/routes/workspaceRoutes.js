const express = require('express')
const router = express.Router()
const {
  getWorkspaces,
  createWorkspace,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addWorkspaceMember,
  removeWorkspaceMember,
} = require('../controllers/workspaceController')
const { protect } = require('../middleware/authMiddleware')

router.route('/').get(protect, getWorkspaces).post(protect, createWorkspace)
router
  .route('/:id')
  .get(protect, getWorkspace)
  .patch(protect, updateWorkspace)
  .delete(protect, deleteWorkspace)
router.route('/:id/members').post(protect, addWorkspaceMember)
router.route('/:id/members/:memberId').delete(protect, removeWorkspaceMember)

module.exports = router
