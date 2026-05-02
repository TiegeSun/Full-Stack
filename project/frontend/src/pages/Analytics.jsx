import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getOverview } from '../features/analytics/analyticsSlice'
import DistributionBars from '../components/DistributionBars'
import MetricCard from '../components/MetricCard'

function Analytics() {
  const dispatch = useDispatch()
  const [projectId, setProjectId] = useState('')
  const { activeWorkspaceId } = useSelector((state) => state.workspaces)
  const { projects } = useSelector((state) => state.projects)
  const { overview } = useSelector((state) => state.analytics)

  useEffect(() => {
    if (activeWorkspaceId) {
      dispatch(getOverview({ workspaceId: activeWorkspaceId, projectId }))
    }
  }, [activeWorkspaceId, projectId, dispatch])

  return (
    <div className='page-stack'>
      <section className='page-heading with-actions'>
        <div>
          <p className='eyebrow'>Analytics</p>
          <h2>Workspace performance</h2>
          <p>Track delivery health, workload mix, and due date pressure.</p>
        </div>
        <select value={projectId} onChange={(event) => setProjectId(event.target.value)}>
          <option value=''>All projects</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      </section>

      <section className='metrics-grid'>
        <MetricCard label='Total tasks' value={overview.summary.totalTasks} />
        <MetricCard label='Completed' value={overview.summary.completedTasks} />
        <MetricCard label='Open' value={overview.summary.openTasks} />
        <MetricCard label='Completion rate' value={`${overview.summary.completionRate}%`} />
      </section>

      <div className='two-column-grid'>
        <DistributionBars title='Status distribution' items={overview.byStatus} />
        <DistributionBars
          title='Priority distribution'
          items={overview.byPriority}
          type='priority'
        />
      </div>
    </div>
  )
}

export default Analytics
