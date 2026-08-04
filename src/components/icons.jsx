const common = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function SunIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
    </svg>
  )
}

export function CalendarIcon(props) {
  return (
    <svg {...common} {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
    </svg>
  )
}

export function CheckIcon(props) {
  return (
    <svg {...common} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M8.2 12.3l2.6 2.6 5-5.4" />
    </svg>
  )
}

export function SparkleIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M12 3.5c.6 3.4 1.6 4.4 5 5-3.4.6-4.4 1.6-5 5-.6-3.4-1.6-4.4-5-5 3.4-.6 4.4-1.6 5-5z" />
      <path d="M19 15c.3 1.7.8 2.2 2.5 2.5-1.7.3-2.2.8-2.5 2.5-.3-1.7-.8-2.2-2.5-2.5 1.7-.3 2.2-.8 2.5-2.5z" />
    </svg>
  )
}

export function FeatherIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M20.5 3.5c-6 0-13 3-15 9-1 3 .5 5.5 3 6.5 6 2 12-3 12-9 0-2 0-4.5 0-6.5z" />
      <path d="M4.5 20.5L15 10" />
    </svg>
  )
}

export function PlusIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function TrashIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M4 7h16M9 7V4.8c0-.4.4-.8.9-.8h4.2c.5 0 .9.4.9.8V7M6.5 7l.7 12.2c0 .9.8 1.6 1.7 1.6h6.2c.9 0 1.7-.7 1.7-1.6L17.5 7" />
    </svg>
  )
}
