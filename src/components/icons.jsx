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

export function WalletIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M3.5 7.5c0-1.1.9-2 2-2h11c1.1 0 2 .9 2 2v9c0 1.1-.9 2-2 2h-11c-1.1 0-2-.9-2-2v-9z" />
      <path d="M15.5 12.2h3.2c.6 0 1 .4 1 1v1.6c0 .6-.4 1-1 1h-3.2c-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8z" />
      <path d="M3.5 8.2L14 4.6c1-.35 2 .38 2 1.44v1.46" />
    </svg>
  )
}

export function PiggyBankIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M4.5 13c0-3.3 3-6 7-6s7 1.9 7 5v1.2c0 .5.3.9.8 1l1.2.4-1 1.4-1 .1v1.4c0 .6-.5 1-1 1h-1.5c-.5 0-1-.4-1-1v-.6h-5v.6c0 .6-.5 1-1 1H7.5c-.5 0-1-.4-1-1V16c-1.2-.5-2-1.7-2-3z" />
      <circle cx="15.2" cy="10.6" r="0.7" fill="currentColor" stroke="none" />
      <path d="M9.5 7.2V5.4M7.2 8.3L6 6.8" />
    </svg>
  )
}

export function BriefcaseIcon(props) {
  return (
    <svg {...common} {...props}>
      <rect x="3.5" y="7.5" width="17" height="11.5" rx="2.5" />
      <path d="M8.5 7.5V6c0-1.1.9-2 2-2h3c1.1 0 2 .9 2 2v1.5" />
      <path d="M3.5 12.5h17M10.5 12.2v1.6M13.5 12.2v1.6" />
    </svg>
  )
}

export function ListIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M9 6.5h11M9 12h11M9 17.5h11" />
      <path d="M4 6.5l.9.9L6.6 5.6M4 12l.9.9L6.6 11.1M4 17.5l.9.9 1.7-1.8" />
    </svg>
  )
}

export function TikTokIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M13 3.5v11.2a3.3 3.3 0 1 1-2.6-3.22" />
      <path d="M13 3.5c.35 2.3 1.9 3.9 4.2 4.15" />
      <path d="M17.2 7.65V10a6.4 6.4 0 0 1-4.2-1.55" />
    </svg>
  )
}

export function InstagramIcon(props) {
  return (
    <svg {...common} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="16.3" cy="7.7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function FacebookIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M13.6 20.3v-6.3h2.1l.3-2.5h-2.4V9.9c0-.7.2-1.2 1.2-1.2h1.3V6.4c-.2 0-1-.1-1.9-.1-1.9 0-3.2 1.15-3.2 3.3v1.9H9v2.5h2v6.4" />
    </svg>
  )
}

export function ThreadsIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M12 3.6c-4.4 0-6.9 2.7-6.9 7.3v2.2c0 4.6 2.5 7.3 6.9 7.3s6.9-2.4 6.4-6c-.35-2.55-1.9-3.3-3.4-3.5-1.7-.25-3.3.2-3.4 1.55-.08 1 .7 1.7 1.9 1.7 1.5 0 2.7-.9 2.9-2.75" />
    </svg>
  )
}

export function PencilIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M4 20l.9-4 11-11a1.9 1.9 0 0 1 2.7 0l.4.4a1.9 1.9 0 0 1 0 2.7l-11 11-4 .9z" />
      <path d="M13.8 6l4.2 4.2" />
    </svg>
  )
}

export function GlobeIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.2 2.3 3.3 5.3 3.3 8.5s-1.1 6.2-3.3 8.5c-2.2-2.3-3.3-5.3-3.3-8.5s1.1-6.2 3.3-8.5z" />
    </svg>
  )
}
