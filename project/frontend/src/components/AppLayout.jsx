import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  FaChartPie,
  FaFolderOpen,
  FaHome,
  FaPlus,
  FaSignOutAlt,
  FaUsers,
} from 'react-icons/fa'
import { logout, reset as resetAuth } from '../features/auth/authSlice'
import {
  addMember,
  createWorkspace,
  deleteWorkspace,
  getWorkspaces,
  removeMember,
  setActiveWorkspace,
  updateWorkspace,
} from '../features/workspaces/workspaceSlice'
import { getProjects } from '../features/projects/projectSlice'
import { resetProjectState } from '../features/projects/projectSlice'
import { getOverview } from '../features/analytics/analyticsSlice'
import { resetAnalyticsState } from '../features/analytics/analyticsSlice'
import { resetTaskState } from '../features/tasks/taskSlice'
import { getActiveWorkspace, getUserRole } from '../utils/formatters'
import EmptyState from './EmptyState'

function AppLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [workspaceName, setWorkspaceName] = useState('')
  const [workspaceDescription, setWorkspaceDescription] = useState('')
  const [workspaceSettings, setWorkspaceSettings] = useState({
    name: '',
    description: '',
  })
  const [memberEmail, setMemberEmail] = useState('')
  const { user } = useSelector((state) => state.auth)
  const { workspaces, activeWorkspaceId } = useSelector(
    (state) => state.workspaces
  )
  const activeWorkspace = useMemo(
    () => getActiveWorkspace(workspaces, activeWorkspaceId),
    [workspaces, activeWorkspaceId]
  )
  const role = getUserRole(activeWorkspace, user?._id)
  const isOwner = role === 'owner'

  useEffect(() => {
    if (user) {
      dispatch(getWorkspaces())
    }
  }, [dispatch, user])

  useEffect(() => {
    if (activeWorkspaceId) {
      dispatch(getProjects(activeWorkspaceId))
      dispatch(getOverview({ workspaceId: activeWorkspaceId }))
    }
  }, [activeWorkspaceId, dispatch])

  useEffect(() => {
    if (activeWorkspace) {
      setWorkspaceSettings({
        name: activeWorkspace.name,
        description: activeWorkspace.description || '',
      })
    }
  }, [activeWorkspace])

  const handleLogout = () => {
    dispatch(logout())
    dispatch(resetAuth())
    dispatch(resetProjectState())
    dispatch(resetTaskState())
    dispatch(resetAnalyticsState())
    localStorage.removeItem('activeWorkspaceId')
    navigate('/login')
  }

  const handleCreateWorkspace = async (event) => {
    event.preventDefault()
    if (!workspaceName.trim()) {
      toast.error('Workspace name is required')
      return
    }
    const result = await dispatch(
      createWorkspace({
        name: workspaceName,
        description: workspaceDescription,
      })
    )
    if (createWorkspace.fulfilled.match(result)) {
      setWorkspaceName('')
      setWorkspaceDescription('')
      toast.success('Workspace created')
    } else {
      toast.error(result.payload)
    }
  }

  const handleAddMember = async (event) => {
    event.preventDefault()
    if (!memberEmail.trim() || !activeWorkspaceId) {
      return
    }
    const result = await dispatch(
      addMember({ id: activeWorkspaceId, email: memberEmail })
    )
    if (addMember.fulfilled.match(result)) {
      setMemberEmail('')
      toast.success('Member added')
    } else {
      toast.error(result.payload)
    }
  }

  const handleUpdateWorkspace = async (event) => {
    event.preventDefault()
    if (!workspaceSettings.name.trim()) {
      toast.error('Workspace name is required')
      return
    }
    const result = await dispatch(
      updateWorkspace({
        id: activeWorkspaceId,
        workspaceData: workspaceSettings,
      })
    )
    if (updateWorkspace.fulfilled.match(result)) {
      toast.success('Workspace updated')
    } else {
      toast.error(result.payload)
    }
  }

  const handleDeleteWorkspace = async () => {
    if (!window.confirm('Delete this workspace and all related projects and tasks?')) {
      return
    }
    const result = await dispatch(deleteWorkspace(activeWorkspaceId))
    if (deleteWorkspace.fulfilled.match(result)) {
      toast.success('Workspace deleted')
      navigate('/')
    } else {
      toast.error(result.payload)
    }
  }

  const handleRemoveMember = async (memberId) => {
    const result = await dispatch(removeMember({ id: activeWorkspaceId, memberId }))
    if (removeMember.fulfilled.match(result)) {
      toast.success('Member removed')
    } else {
      toast.error(result.payload)
    }
  }

  return (
    <div className='app-shell'>
      <aside className='sidebar'>
        <div className='brand'>
          <div className='brand-mark'>S</div>
          <div>
            <strong>SprintHub</strong>
            <span>Team command center</span>
          </div>
        </div>

        <nav className='nav-list' aria-label='Main navigation'>
          <NavLink to='/' end>
            <FaHome /> Overview
          </NavLink>
          <NavLink to='/projects'>
            <FaFolderOpen /> Projects
          </NavLink>
          <NavLink to='/analytics'>
            <FaChartPie /> Analytics
          </NavLink>
        </nav>

        <div className='sidebar-panel'>
          <label htmlFor='workspace'>Workspace</label>
          <select
            id='workspace'
            value={activeWorkspaceId}
            onChange={(event) => dispatch(setActiveWorkspace(event.target.value))}
          >
            {workspaces.map((workspace) => (
              <option key={workspace._id} value={workspace._id}>
                {workspace.name}
              </option>
            ))}
          </select>
        </div>

        <form className='sidebar-panel compact-form' onSubmit={handleCreateWorkspace}>
          <label htmlFor='workspaceName'>New workspace</label>
          <input
            id='workspaceName'
            value={workspaceName}
            onChange={(event) => setWorkspaceName(event.target.value)}
            placeholder='Growth team'
          />
          <input
            value={workspaceDescription}
            onChange={(event) => setWorkspaceDescription(event.target.value)}
            placeholder='Short description'
          />
          <button className='icon-text-button' type='submit'>
            <FaPlus /> Create
          </button>
        </form>
      </aside>

      <main className='main-area'>
        <header className='topbar'>
          <div>
            <p className='eyebrow'>Current workspace</p>
            <h1>{activeWorkspace?.name || 'No workspace yet'}</h1>
          </div>
          <div className='topbar-actions'>
            {activeWorkspace && (
              <div className='member-count'>
                <FaUsers />
                {activeWorkspace.members?.length || 0} members
              </div>
            )}
            <button className='ghost-button' onClick={handleLogout} type='button'>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </header>

        {activeWorkspace && isOwner && (
          <section className='workspace-admin-grid'>
            <form className='admin-panel' onSubmit={handleUpdateWorkspace}>
              <div>
                <strong>Workspace settings</strong>
                <span>Owners can update or remove this workspace.</span>
              </div>
              <input
                value={workspaceSettings.name}
                onChange={(event) =>
                  setWorkspaceSettings((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
              <input
                value={workspaceSettings.description}
                onChange={(event) =>
                  setWorkspaceSettings((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder='Workspace description'
              />
              <div className='form-actions'>
                <button className='primary-button' type='submit'>
                  Save workspace
                </button>
                <button
                  className='danger-button'
                  type='button'
                  onClick={handleDeleteWorkspace}
                >
                  Delete
                </button>
              </div>
            </form>

            <div className='admin-panel'>
              <div>
                <strong>Members</strong>
                <span>Add registered users or remove workspace members.</span>
              </div>
              <form className='inline-form' onSubmit={handleAddMember}>
                <input
                  value={memberEmail}
                  onChange={(event) => setMemberEmail(event.target.value)}
                  placeholder='teammate@example.com'
                  type='email'
                />
                <button className='primary-button' type='submit'>
                  Add
                </button>
              </form>
              <div className='member-list'>
                {activeWorkspace.members?.map((member) => (
                  <div className='member-row' key={member.user._id}>
                    <div>
                      <strong>{member.user.name}</strong>
                      <span>{member.user.email}</span>
                    </div>
                    <div className='member-row-actions'>
                      <span className='role-badge'>{member.role}</span>
                      {member.role !== 'owner' && (
                        <button
                          className='ghost-button small'
                          type='button'
                          onClick={() => handleRemoveMember(member.user._id)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {workspaces.length === 0 ? (
          <EmptyState
            title='Create your first workspace'
            text='SprintHub starts with a shared workspace for projects, tasks, and analytics.'
          />
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  )
}

export default AppLayout
