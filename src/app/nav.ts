import {
  CalendarCheckIcon,
  CalendarDaysIcon,
  CalendarRangeIcon,
  LayoutDashboardIcon,
  LightbulbIcon,
  SettingsIcon,
  SparklesIcon,
  TrendingUpIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  /** Build phase in which this screen gets its full functionality. */
  comingInPhase?: number
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboardIcon, end: true },
  { to: '/learnings', label: 'My Learnings', icon: LightbulbIcon },
  { to: '/mistakes', label: 'My Mistakes', icon: TriangleAlertIcon },
  { to: '/calendar', label: 'Learning Calendar', icon: CalendarDaysIcon, comingInPhase: 4 },
  { to: '/reviews/weekly', label: 'Weekly Review', icon: CalendarCheckIcon, comingInPhase: 5 },
  { to: '/reviews/monthly', label: 'Monthly Review', icon: CalendarRangeIcon, comingInPhase: 5 },
  { to: '/growth', label: 'Growth Analytics', icon: TrendingUpIcon, comingInPhase: 7 },
  { to: '/insights', label: 'AI Journal Insights', icon: SparklesIcon, comingInPhase: 8 },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]
