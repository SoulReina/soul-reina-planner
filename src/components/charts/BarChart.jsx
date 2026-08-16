import './charts.css'

function monthShortFR(year, monthIndex) {
  const d = new Date(year, monthIndex, 1)
  const label = new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(d)
  return label.replace('.', '').charAt(0).toUpperCase() + label.replace('.', '').slice(1)
}

export default function BarChart({
  data,
  year,
  onYearChange,
  minYear,
  maxYear,
  formatValue,
  positiveColor = 'var(--color-gold)',
  negativeColor = 'var(--color-danger)',
}) {
  const maxPos = Math.max(0, ...data.map((d) => d.value))
  const maxNeg = Math.max(0, ...data.map((d) => -d.value))
  const range = maxPos + maxNeg || 1
  const baselineFromTop = (maxPos / range) * 100

  return (
    <div className="chart">
      <div className="chart__year-nav">
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          onClick={() => onYearChange(year - 1)}
          disabled={year <= minYear}
          aria-label="Année précédente"
        >
          ‹
        </button>
        <span className="chart__year-label">{year}</span>
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          onClick={() => onYearChange(year + 1)}
          disabled={year >= maxYear}
          aria-label="Année suivante"
        >
          ›
        </button>
      </div>

      <div className="bar-chart">
        <div className="bar-chart__baseline" style={{ top: `${baselineFromTop}%` }} />
        {data.map((d) => {
          const isNegative = d.value < 0
          const height = (Math.abs(d.value) / range) * 100
          return (
            <div className="bar-chart__col" key={d.key} title={`${d.label} : ${formatValue(d.value)}`}>
              <div className="bar-chart__track">
                <div
                  className={'bar-chart__bar' + (isNegative ? ' is-negative' : '')}
                  style={{
                    height: `${height}%`,
                    top: isNegative ? `${baselineFromTop}%` : undefined,
                    bottom: isNegative ? undefined : `${100 - baselineFromTop}%`,
                    background: isNegative ? negativeColor : positiveColor,
                  }}
                />
              </div>
              <span className="bar-chart__label">{d.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function monthlyBarData(year, getAmountForMonth) {
  return Array.from({ length: 12 }, (_, i) => {
    const month = `${year}-${String(i + 1).padStart(2, '0')}-01`
    return { key: month, label: monthShortFR(year, i), value: getAmountForMonth(month) }
  })
}
