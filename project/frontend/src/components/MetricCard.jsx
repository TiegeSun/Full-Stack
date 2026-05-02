function MetricCard({ label, value, detail }) {
  return (
    <div className='metric-card'>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  )
}

export default MetricCard
