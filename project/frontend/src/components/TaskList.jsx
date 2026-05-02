import { formatDate, priorityLabels, statusLabels } from '../utils/formatters'

function TaskList({ tasks, onStatusChange, onEdit, onDelete, compact = false }) {
  return (
    <div className={compact ? 'task-list compact' : 'task-list'}>
      {tasks.map((task) => (
        <article className='task-card' key={task._id}>
          <div className='task-main'>
            <div>
              <div className='task-title-row'>
                <h3>{task.title}</h3>
                <span className={`priority-badge priority-${task.priority}`}>
                  {priorityLabels[task.priority]}
                </span>
              </div>
              {task.description && <p>{task.description}</p>}
            </div>
            <div className='task-meta'>
              <span>{task.project?.name || 'No project'}</span>
              <span>{task.assignee?.name || 'Unassigned'}</span>
              <span>{formatDate(task.dueDate)}</span>
            </div>
          </div>
          <div className='task-actions'>
            {onStatusChange && (
              <select
                value={task.status}
                onChange={(event) => onStatusChange(task, event.target.value)}
              >
                <option value='todo'>To do</option>
                <option value='in_progress'>In progress</option>
                <option value='review'>Review</option>
                <option value='done'>Done</option>
              </select>
            )}
            <span className={`status-badge status-${task.status}`}>
              {statusLabels[task.status]}
            </span>
            {onEdit && (
              <button className='ghost-button small' onClick={() => onEdit(task)}>
                Edit
              </button>
            )}
            {onDelete && (
              <button className='danger-button small' onClick={() => onDelete(task)}>
                Delete
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}

export default TaskList
