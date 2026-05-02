import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getOverview } from '../features/analytics/analyticsSlice'
import { getTasks } from '../features/tasks/taskSlice'
import { updateTask } from '../features/tasks/taskSlice'
import { getActiveWorkspace, formatDate } from '../utils/formatters'
import DistributionBars from '../components/DistributionBars'
import EmptyState from '../components/EmptyState'
import MetricCard from '../components/MetricCard'
import TaskList from '../components/TaskList'

function Dashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { workspaces, activeWorkspaceId } = useSelector(
    (state) => state.workspaces
  )
  const { overview } = useSelector((state) => state.analytics)
  const { tasks } = useSelector((state) => state.tasks)
  const activeWorkspace = useMemo(
    () => getActiveWorkspace(workspaces, activeWorkspaceId),
    [workspaces, activeWorkspaceId]
  )

  useEffect(() => {
    if (activeWorkspaceId) {
      dispatch(getOverview({ workspaceId: activeWorkspaceId }))
      dispatch(
        getTasks({
          workspaceId: activeWorkspaceId,
          assignee: user?._id,
        })
      )
    }
  }, [activeWorkspaceId, dispatch, user])

  const handleStatusChange = async (task, status) => {
    await dispatch(updateTask({ id: task._id, taskData: { status } }))
    dispatch(getOverview({ workspaceId: activeWorkspaceId }))
  }

  if (!activeWorkspace) {
    return null
  }

  const myOpenTasks = tasks.filter((task) => task.status !== 'done').slice(0, 5)

  return (
    <div className='page-stack'>
      <section className='page-heading'>
        <div>
          <p className='eyebrow'>Overview</p>
          <h2>Good to see you, {user?.name}</h2>
          <p>
            {activeWorkspace.name} has {overview.summary.openTasks} open tasks
            and {overview.overdueCount} overdue items.
          </p>
        </div>
      </section>

      <section className='metrics-grid'>
        <MetricCard
          label='Open tasks'
          value={overview.summary.openTasks}
          detail={`${overview.summary.totalTasks} total tasks`}
        />
        <MetricCard
          label='Completion'
          value={`${overview.summary.completionRate}%`}
          detail={`${overview.summary.completedTasks} completed`}
        />
        <MetricCard
          label='Active projects'
          value={overview.summary.activeProjects}
          detail={`${overview.summary.totalProjects} total projects`}
        />
        <MetricCard
          label='Due this week'
          value={overview.dueThisWeekCount}
          detail={`${overview.overdueCount} overdue`}
        />
      </section>

      <div className='two-column-grid'>
        <DistributionBars title='Tasks by status' items={overview.byStatus} />
        <DistributionBars
          title='Tasks by priority'
          items={overview.byPriority}
          type='priority'
        />
      </div>

      <div className='two-column-grid'>
        <section className='panel'>
          <div className='panel-heading'>
            <h2>My tasks</h2>
          </div>
          {myOpenTasks.length ? (
            <TaskList
              compact
              tasks={myOpenTasks}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <EmptyState title='No open tasks assigned to you' />
          )}
        </section>

        <section className='panel'>
          <div className='panel-heading'>
            <h2>Upcoming work</h2>
          </div>
          <div className='timeline-list'>
            {overview.upcomingTasks.length ? (
              overview.upcomingTasks.map((task) => (
                <div className='timeline-item' key={task._id}>
                  <div>
                    <strong>{task.title}</strong>
                    <span>{task.project?.name}</span>
                  </div>
                  <time>{formatDate(task.dueDate)}</time>
                </div>
              ))
            ) : (
              <EmptyState title='No upcoming due dates' />
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
