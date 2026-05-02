import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  createTask,
  deleteTask,
  getTasks,
  resetTaskFilters,
  setTaskFilters,
  updateTask,
} from '../features/tasks/taskSlice'
import { getOverview } from '../features/analytics/analyticsSlice'
import EmptyState from '../components/EmptyState'
import TaskList from '../components/TaskList'
import {
  getActiveWorkspace,
  getUserRole,
  priorityLabels,
  statusLabels,
} from '../utils/formatters'

const initialTaskForm = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  assignee: '',
  tags: '',
  dueDate: '',
}

function ProjectDetail() {
  const { projectId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState('')
  const [formData, setFormData] = useState(initialTaskForm)
  const { user } = useSelector((state) => state.auth)
  const { workspaces, activeWorkspaceId } = useSelector(
    (state) => state.workspaces
  )
  const { projects } = useSelector((state) => state.projects)
  const { tasks, filters } = useSelector((state) => state.tasks)
  const activeWorkspace = useMemo(
    () => getActiveWorkspace(workspaces, activeWorkspaceId),
    [workspaces, activeWorkspaceId]
  )
  const project = projects.find((item) => item._id === projectId)
  const role = getUserRole(activeWorkspace, user?._id)
  const isOwner = role === 'owner'

  useEffect(() => {
    if (activeWorkspaceId && projectId) {
      dispatch(getTasks({ workspaceId: activeWorkspaceId, projectId, ...filters }))
    }
  }, [activeWorkspaceId, projectId, filters, dispatch])

  useEffect(() => {
    if (activeWorkspaceId && projects.length && !project) {
      navigate('/projects')
    }
  }, [activeWorkspaceId, projects, project, navigate])

  const refreshAnalytics = () => {
    dispatch(getOverview({ workspaceId: activeWorkspaceId, projectId }))
  }

  const handleFilterChange = (event) => {
    dispatch(setTaskFilters({ [event.target.name]: event.target.value }))
  }

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const openCreateForm = () => {
    setEditingTaskId('')
    setFormData(initialTaskForm)
    setIsFormOpen(true)
  }

  const openEditForm = (task) => {
    setEditingTaskId(task._id)
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assignee: task.assignee?._id || '',
      tags: task.tags?.join(', ') || '',
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    })
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingTaskId('')
    setFormData(initialTaskForm)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Task title is required')
      return
    }

    const payload = {
      ...formData,
      workspace: activeWorkspaceId,
      project: projectId,
      assignee: formData.assignee || undefined,
      dueDate: formData.dueDate || undefined,
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    }

    const result = editingTaskId
      ? await dispatch(updateTask({ id: editingTaskId, taskData: payload }))
      : await dispatch(createTask(payload))

    if (createTask.fulfilled.match(result) || updateTask.fulfilled.match(result)) {
      toast.success(editingTaskId ? 'Task updated' : 'Task created')
      closeForm()
      refreshAnalytics()
    } else {
      toast.error(result.payload)
    }
  }

  const handleStatusChange = async (task, status) => {
    const result = await dispatch(updateTask({ id: task._id, taskData: { status } }))
    if (updateTask.fulfilled.match(result)) {
      refreshAnalytics()
    } else {
      toast.error(result.payload)
    }
  }

  const handleDelete = async (task) => {
    const canDelete = isOwner || task.reporter?._id === user?._id
    if (!canDelete) {
      toast.error('Only owners or reporters can delete this task')
      return
    }
    const result = await dispatch(deleteTask(task._id))
    if (deleteTask.fulfilled.match(result)) {
      toast.success('Task deleted')
      refreshAnalytics()
    } else {
      toast.error(result.payload)
    }
  }

  return (
    <div className='page-stack'>
      <section className='page-heading with-actions'>
        <div>
          <p className='eyebrow'>
            <Link to='/projects'>Projects</Link> / {project?.name || 'Project'}
          </p>
          <h2>{project?.name || 'Project tasks'}</h2>
          <p>{project?.description || 'Manage project execution and ownership.'}</p>
        </div>
        <button className='primary-button' type='button' onClick={openCreateForm}>
          New task
        </button>
      </section>

      <section className='filters-panel'>
        <input
          name='search'
          value={filters.search}
          onChange={handleFilterChange}
          placeholder='Search tasks'
        />
        <select name='status' value={filters.status} onChange={handleFilterChange}>
          <option value=''>All status</option>
          {Object.entries(statusLabels)
            .filter(([key]) => ['todo', 'in_progress', 'review', 'done'].includes(key))
            .map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
        </select>
        <select name='priority' value={filters.priority} onChange={handleFilterChange}>
          <option value=''>All priority</option>
          {Object.entries(priorityLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <select name='assignee' value={filters.assignee} onChange={handleFilterChange}>
          <option value=''>All assignees</option>
          <option value='unassigned'>Unassigned</option>
          {activeWorkspace?.members?.map((member) => (
            <option key={member.user._id} value={member.user._id}>
              {member.user.name}
            </option>
          ))}
        </select>
        <select name='due' value={filters.due} onChange={handleFilterChange}>
          <option value=''>Any due date</option>
          <option value='overdue'>Overdue</option>
          <option value='week'>Due this week</option>
        </select>
        <button
          className='ghost-button'
          type='button'
          onClick={() => dispatch(resetTaskFilters())}
        >
          Reset
        </button>
      </section>

      {tasks.length ? (
        <TaskList
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />
      ) : (
        <EmptyState title='No tasks match this view' text='Create a task or adjust filters.' />
      )}

      {isFormOpen && (
        <div className='drawer-backdrop'>
          <aside className='task-drawer'>
            <div className='panel-heading'>
              <h2>{editingTaskId ? 'Edit task' : 'Create task'}</h2>
              <button className='ghost-button small' type='button' onClick={closeForm}>
                Close
              </button>
            </div>
            <form className='drawer-form' onSubmit={handleSubmit}>
              <label>
                Title
                <input name='title' value={formData.title} onChange={handleChange} />
              </label>
              <label>
                Description
                <textarea
                  name='description'
                  rows='4'
                  value={formData.description}
                  onChange={handleChange}
                />
              </label>
              <div className='form-grid-two'>
                <label>
                  Status
                  <select name='status' value={formData.status} onChange={handleChange}>
                    <option value='todo'>To do</option>
                    <option value='in_progress'>In progress</option>
                    <option value='review'>Review</option>
                    <option value='done'>Done</option>
                  </select>
                </label>
                <label>
                  Priority
                  <select
                    name='priority'
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value='low'>Low</option>
                    <option value='medium'>Medium</option>
                    <option value='high'>High</option>
                    <option value='urgent'>Urgent</option>
                  </select>
                </label>
              </div>
              <label>
                Assignee
                <select name='assignee' value={formData.assignee} onChange={handleChange}>
                  <option value=''>Unassigned</option>
                  {activeWorkspace?.members?.map((member) => (
                    <option key={member.user._id} value={member.user._id}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Due date
                <input
                  name='dueDate'
                  type='date'
                  value={formData.dueDate}
                  onChange={handleChange}
                />
              </label>
              <label>
                Tags
                <input
                  name='tags'
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder='api, design, qa'
                />
              </label>
              <button className='primary-button' type='submit'>
                {editingTaskId ? 'Save task' : 'Create task'}
              </button>
            </form>
          </aside>
        </div>
      )}
    </div>
  )
}

export default ProjectDetail
