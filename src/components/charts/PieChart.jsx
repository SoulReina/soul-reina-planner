import './charts.css'

function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) }
}

function describeSlice(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ')
}

export default function PieChart({ data, formatValue }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total <= 0) {
    return <p className="empty-hint">Aucune donnée à répartir pour l’instant.</p>
  }

  let cursor = 0
  const slices = data
    .filter((d) => d.value > 0)
    .map((d) => {
      const fraction = d.value / total
      const startAngle = cursor * 360
      cursor += fraction
      const endAngle = cursor * 360
      const percent = Math.round(fraction * 100)
      const midAngle = (startAngle + endAngle) / 2
      const labelPos = polarToCartesian(50, 50, 30, midAngle)
      return { ...d, startAngle, endAngle, percent, labelPos }
    })

  return (
    <div className="pie-chart">
      <svg viewBox="0 0 100 100" className="pie-chart__svg" role="img" aria-label="Répartition">
        {slices.map((s) =>
          slices.length === 1 ? (
            <circle key={s.key} cx="50" cy="50" r="48" fill={s.color}>
              <title>
                {s.label} — {formatValue(s.value)} ({s.percent}%)
              </title>
            </circle>
          ) : (
            <path
              key={s.key}
              d={describeSlice(50, 50, 48, s.startAngle, s.endAngle)}
              fill={s.color}
              stroke="var(--color-card)"
              strokeWidth="2"
            >
              <title>
                {s.label} — {formatValue(s.value)} ({s.percent}%)
              </title>
            </path>
          )
        )}
        {slices
          .filter((s) => s.percent >= 5)
          .map((s) => (
            <text
              key={s.key + '-label'}
              x={s.labelPos.x}
              y={s.labelPos.y}
              className="pie-chart__slice-label"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {s.percent}%
            </text>
          ))}
      </svg>

      <ul className="pie-chart__legend">
        {slices.map((s) => (
          <li key={s.key} className="pie-chart__legend-item">
            <span className="pie-chart__swatch" style={{ background: s.color }} />
            <span className="pie-chart__legend-label">{s.label}</span>
            <span className="pie-chart__legend-value">
              {formatValue(s.value)} · {s.percent}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
