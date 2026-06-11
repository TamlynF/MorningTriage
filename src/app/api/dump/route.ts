import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { parseDumpItem } from '@/lib/anthropic/parse'

export async function POST(req: NextRequest) {
  try {
    const { raw_text, user_priority_flag } = await req.json()

    if (!raw_text || typeof raw_text !== 'string') {
      return NextResponse.json(
        { error: 'raw_text is required' },
        { status: 400 },
      )
    }

    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      )
    }

    // Parse the dump item type using Haiku
    const type = await parseDumpItem(raw_text)

    // Save to database
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('dump_items')
      .insert({
        user_id: userId,
        raw_text,
        type,
        user_priority_flag: user_priority_flag || false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating dump item:', error)
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

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('dump_items')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching dump items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
