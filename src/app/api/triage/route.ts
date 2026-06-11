import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateMorningTriage } from '@/lib/anthropic/triage'

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      )
    }

    const { user_check_in } = await req.json()
    const supabase = createServerClient()
    const today = new Date().toISOString().split('T')[0]

    // Check if plan already exists for today
    const { data: existingPlan } = await supabase
      .from('morning_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('plan_date', today)
      .single()

    if (existingPlan) {
      return NextResponse.json(existingPlan, { status: 200 })
    }

    // Get dump items, calendar events, and yesterday's outcomes
    const [
      { data: dumpItems },
      { data: calendarEvents },
      { data: yesterdayPlan },
    ] = await Promise.all([
      supabase
        .from('dump_items')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null),
      supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId),
      supabase
        .from('morning_plans')
        .select('id')
        .eq('user_id', userId)
        .eq('plan_date', new Date(Date.now() - 86400000).toISOString().split('T')[0])
        .single(),
    ])

    // Get yesterday's outcomes if there was a plan
    let yesterdayOutcomes = []
    if (yesterdayPlan) {
      const { data } = await supabase
        .from('yesterday_outcomes')
        .select('*')
        .eq('morning_plan_id', yesterdayPlan.id)
      yesterdayOutcomes = data || []
    }

    // Generate the morning plan
    const plan = await generateMorningTriage(
      dumpItems || [],
      calendarEvents || [],
      yesterdayOutcomes,
      user_check_in,
    )

    // Save to database
    const { data: savedPlan, error } = await supabase
      .from('morning_plans')
      .insert({
        user_id: userId,
        plan_date: today,
        greeting: plan.greeting,
        big_3: plan.big_3,
        avoided_thing: plan.avoided_thing,
        deferred_count: plan.deferred_count,
        deferred_note: plan.deferred_note,
        energy_check: plan.energy_check,
        user_check_in: user_check_in || 'none',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update times_deferred for items in the plan
    if (plan.big_3 && plan.big_3.length > 0) {
      const big3Ids = plan.big_3.map((t: { task_id: string }) => t.task_id)
      await supabase
        .from('dump_items')
        .update({
          last_seen_in_big3: today,
        })
        .in('id', big3Ids)
    }

    return NextResponse.json(savedPlan, { status: 201 })
  } catch (error) {
    console.error('Error generating morning triage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      )
    }

    const today = new Date().toISOString().split('T')[0]
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('morning_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('plan_date', today)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || null)
  } catch (error) {
    console.error('Error fetching morning triage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
