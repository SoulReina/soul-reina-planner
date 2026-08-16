import { TikTokIcon, InstagramIcon, FacebookIcon, ThreadsIcon, GlobeIcon } from './icons'

const ICON_BY_PLATFORM = {
  TikTok: TikTokIcon,
  Instagram: InstagramIcon,
  Facebook: FacebookIcon,
  Threads: ThreadsIcon,
}

export default function PlatformIcon({ platform, ...props }) {
  const Icon = ICON_BY_PLATFORM[platform] || GlobeIcon
  return <Icon {...props} />
}
