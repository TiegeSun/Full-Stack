import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from '../features/projects/projectSlice'
import EmptyState from '../components/EmptyState'
import { formatDate, getActiveWorkspace, getUserRole, statusLabels } from '../utils/formatters'

const initialProjectForm = {
  name: '',
  description: '',
  status: 'active',
  color: '#2563eb',
  dueDate: '',
}

function Projects() {
  const dispatch = useDispatch()
  const [formData, setFormData] = useState(initialProjectForm)
  const [editingProjectId, setEditingProjectId] = useState('')
  const { user } = useSelector((state) => state.auth)
  const { workspaces, activeWorkspaceId } = useSelector(
    (state) => state.workspaces
  )
  const { projects } = useSelector((state) => state.projects)
  const activeWorkspace = useMemo(
    () => getActiveWorkspace(workspaces, activeWorkspaceId),
    [workspaces, activeWorkspaceId]
  )
  const isOwner = getUserRole(activeWorkspace, user?._id) === 'owner'

  useEffect(() => {
    if (activeWorkspaceId) {
      dispatch(getProjects(activeWorkspaceId))
    }
  }, [activeWorkspaceId, dispatch])

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const resetForm = () => {
    setFormData(initialProjectForm)
    setEditingProjectId('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Project name is required')
      return
    }

    const payload = {
      ...formData,
      workspace: activeWorkspaceId,
      dueDate: formData.dueDate || undefined,
    }

    const result = editingProjectId
      ? await dispatch(
          updateProject({
            id: editingProjectId,
            projectData: payload,
          })
        )
      : await dispatch(createProject(payload))

    if (
      createProject.fulfilled.match(result) ||
      updateProject.fulfilled.match(result)
    ) {
      toast.success(editingProjectId ? 'Project updated' : 'Project created')
      resetForm()
    } else {
      toast.error(result.payload)
    }
  }

  const handleEdit = (project) => {
    setEditingProjectId(project._id)
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status,
      color: project.color,
      dueDate: project.dueDate ? project.dueDate.slice(0, 10) : '',
    })
  }

  const handleDelete = async (projectId) => {
    const result = await dispatch(deleteProject(projectId))
    if (deleteProject.fulfilled.match(result)) {
      toast.success('Project deleted')
    } else {
      toast.error(result.payload)
    }
  }

  return (
    <div className='page-stack'>
      <section className='page-heading'>
        <div>
          <p className='eyebrow'>Projects</p>
          <h2>Plan and track delivery</h2>
          <p>Projects group tasks, owners, status, and due date risk.</p>
        </div>
      </section>

      {isOwner && (
        <section className='panel'>
          <div className='panel-heading'>
            <h2>{editingProjectId ? 'Edit project' : 'Create project'}</h2>
          </div>
          <form className='project-form' onSubmit={handleSubmit}>
            <input
              name='name'
              value={formData.name}
              onChange={handleChange}
              placeholder='Project name'
            />
            <input
              name='description'
              value={formData.description}
              onChange={handleChange}
              placeholder='Short description'
            />
            <select name='status' value={formData.status} onChange={handleChange}>
              <option value='active'>Active</option>
              <option value='on_hold'>On hold</option>
              <option value='completed'>Completed</option>
            </select>
            <input
              aria-label='Project color'
              name='color'
              type='color'
              value={formData.color}
              onChange={handleChange}
            />
            <input
              name='dueDate'
              type='date'
              value={formData.dueDate}
              onChange={handleChange}
            />
            <div className='form-actions'>
              {editingProjectId && (
                <button className='ghost-button' type='button' onClick={resetForm}>
                  Cancel
                </button>
              )}
              <button className='primary-button' type='submit'>
                {editingProjectId ? 'Save changes' : 'Create project'}
              </button>
            </div>
          </form>
        </section>
      )}

      {projects.length ? (
        <section className='project-grid'>
          {projects.map((project) => (
            <article className='project-card' key={project._id}>
              <div className='project-color' style={{ background: project.color }} />
              <div className='project-card-body'>
                <div className='project-card-title'>
                  <div>
                    <h3>{project.name}</h3>
                    <p>{project.description || 'No description'}</p>
                  </div>
                  <span className={`status-badge status-${project.status}`}>
                    {statusLabels[project.status]}
                  </span>
                </div>
                <div className='project-meta'>
                  <span>{project.taskCount || 0} tasks</span>
                  <span>{formatDate(project.dueDate)}</span>
                </div>
                <div className='project-actions'>
                  <Link className='primary-button' to={`/projects/${project._id}`}>
                    Open
                  </Link>
                  {isOwner && (
                    <>
                      <button
                        className='ghost-button'
                        type='button'
                        onClick={() => handleEdit(project)}
                      >
                        Edit
                      </button>
                      <button
                        className='danger-button'
                        type='button'
                        onClick={() => handleDelete(project._id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState
          title='No projects yet'
          text='Owners can create the first project for this workspace.'
        />
      )}
    </div>
  )
}

export default Projects
