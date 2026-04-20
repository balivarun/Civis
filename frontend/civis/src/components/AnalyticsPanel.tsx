
type Props = {
  complaints: any[]
}

function countBy<T = any>(items: T[], key: (it: T) => string) {
  const map: Record<string, number> = {}
  items.forEach((it) => {
    const k = key(it) || 'Unknown'
    map[k] = (map[k] || 0) + 1
  })
  return map
}

export default function AnalyticsPanel({ complaints }: Props) {
  const byStatus = countBy(complaints, (c: any) => c.status)
  const byCategory = countBy(complaints, (c: any) => c.category)
  const total = complaints.length

  const maxStatus = Math.max(...Object.values(byStatus), 1)
  const maxCategory = Math.max(...Object.values(byCategory), 1)

  return (
    <section className="admin-panel analytics-panel">
      <h3>Analytics</h3>
      <div className="analytics-kpis">
        <div className="kpi">
          <div className="kpi-value">{total}</div>
          <div className="kpi-label">Total complaints</div>
        </div>
        <div className="kpi">
          <div className="kpi-value">{byStatus['Resolved'] || 0}</div>
          <div className="kpi-label">Resolved</div>
        </div>
        <div className="kpi">
          <div className="kpi-value">{Object.keys(byCategory).length}</div>
          <div className="kpi-label">Categories</div>
        </div>
      </div>

      <div className="analytics-charts">
        <div className="chart">
          <h4>By status</h4>
          <div className="chart-bars">
            {Object.entries(byStatus).map(([k, v]) => (
              <div key={k} className="chart-row">
                <div className="chart-label">{k}</div>
                <div className="chart-bar" style={{ width: `${(v / maxStatus) * 100}%` }}>
                  <span className="chart-val">{v}</span>
                </div>
              </div>
            ))}
            {Object.keys(byStatus).length === 0 && <div className="muted">No data</div>}
          </div>
        </div>

        <div className="chart">
          <h4>By category</h4>
          <div className="chart-bars">
            {Object.entries(byCategory).map(([k, v]) => (
              <div key={k} className="chart-row">
                <div className="chart-label">{k}</div>
                <div className="chart-bar" style={{ width: `${(v / maxCategory) * 100}%` }}>
                  <span className="chart-val">{v}</span>
                </div>
              </div>
            ))}
            {Object.keys(byCategory).length === 0 && <div className="muted">No data</div>}
          </div>
        </div>
      </div>
    </section>
  )
}
