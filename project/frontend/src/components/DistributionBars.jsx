import { priorityLabels, statusLabels } from '../utils/formatters'

function DistributionBars({ title, items, type = 'status' }) {
  const total = items.reduce((sum, item) => sum + item.value, 0)
  const labels = type === 'priority' ? priorityLabels : statusLabels

  return (
    <section className='panel'>
      <div className='panel-heading'>
        <h2>{title}</h2>
      </div>
      <div className='distribution-list'>
        {items.map((item) => {
          const percent = total ? Math.round((item.value / total) * 100) : 0
          return (
            <div className='distribution-row' key={item.name}>
              <div className='distribution-meta'>
                <span>{labels[item.name] || item.name}</span>
                <strong>{item.value}</strong>
              </div>
              <div className='bar-track'>
                <div
                  className={`bar-fill ${type}-${item.name}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default DistributionBars
