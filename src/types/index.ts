export type DumpItemType = 'task' | 'reply_needed' | 'worry' | 'idea' | 'someday'
export type EnergyLevel = 'low' | 'normal' | null
export type CheckInResponse = 'low' | 'normal' | 'none'

export interface User {
  id: string
  email: string
  created_at: string
  preferences: {
    skip_greeting: boolean
    energy_level_check: boolean
  }
}

export interface DumpItem {
  id: string
  user_id: string
  raw_text: string
  created_at: string
  type: DumpItemType
  times_deferred: number
  user_priority_flag: boolean
  last_seen_in_big3: string | null
  deleted_at: string | null
}

export interface Big3Task {
  task_id: string
  title: string
  why_today: string
  first_step: string
  estimated_minutes: number
  suggested_window: string
}

export interface AvoidedThing {
  task_id: string
  title: string
  gentle_reframe: string
  two_minute_version: string
  include_in_big_3: boolean
}

export interface MorningPlan {
  id: string
  user_id: string
  plan_date: string
  greeting: string
  big_3: Big3Task[]
  avoided_thing: AvoidedThing | null
  deferred_count: number
  deferred_note: string
  energy_check: EnergyLevel
  created_at: string
  user_check_in: CheckInResponse
}

export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  start_time: string
  end_time: string
  location: string | null
  source: string
}

export interface YesterdayOutcome {
  id: string
  morning_plan_id: string
  task_id: string | null
  title: string
  completed: boolean
}
