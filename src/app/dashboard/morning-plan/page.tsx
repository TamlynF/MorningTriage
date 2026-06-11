'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/lib/supabase/useSupabase'
import { MorningPlan } from '@/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function MorningPlanPage() {
  const [plan, setPlan] = useState<MorningPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [checkIn, setCheckIn] = useState<'low' | 'normal' | 'none'>('none')
  const [message, setMessage] = useState<string | null>(null)
  const supabase = useSupabase()

  useEffect(() => {
    if (supabase) {
      loadPlan()
    }
  }, [supabase])

  const loadPlan = async () => {
    if (!supabase) return

    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const response = await fetch('/api/triage', {
        headers: { 'x-user-id': user.id },
      })
      const data = await response.json()
      setPlan(data)
    } catch (error) {
      console.error('Error loading plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!supabase) return

    setGenerating(true)
    setMessage(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ user_check_in: checkIn }),
      })

      if (response.ok) {
        const data = await response.json()
        setPlan(data)
        setMessage('Plan generated!')
        setTimeout(() => setMessage(null), 3000)
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.error}`)
      }
    } catch (error) {
      setMessage('An error occurred')
      console.error(error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-8">
      <Link href="/dashboard" className="text-blue-600 hover:underline">
        Back to dashboard
      </Link>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : plan ? (
        <>
          <div className="rounded-lg bg-white p-6">
            <h2 className="text-2xl font-bold">{plan.greeting}</h2>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Your Big 3</h3>
            <div className="space-y-4">
              {plan.big_3.map((task, i) => (
                <div key={i} className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h4 className="font-semibold text-blue-900">{task.title}</h4>
                  <p className="mt-2 text-sm text-blue-700">Why: {task.why_today}</p>
                  <p className="mt-2 text-sm text-blue-700">
                    First step: {task.first_step}
                  </p>
                  <p className="mt-2 text-sm text-blue-600">
                    ~{task.estimated_minutes} min • {task.suggested_window}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {plan.avoided_thing && (
            <div>
              <h3 className="text-xl font-bold mb-4">Worth Revisiting</h3>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h4 className="font-semibold text-amber-900">
                  {plan.avoided_thing.title}
                </h4>
                <p className="mt-2 text-sm text-amber-700">
                  {plan.avoided_thing.gentle_reframe}
                </p>
                <p className="mt-2 text-sm font-medium text-amber-800">
                  Quick win: {plan.avoided_thing.two_minute_version}
                </p>
              </div>
            </div>
          )}

          <div className="rounded-lg bg-gray-100 p-4">
            <p className="text-sm text-gray-700">
              <strong>{plan.deferred_count}</strong> other things are parked.
            </p>
            <p className="mt-2 text-sm text-gray-700">{plan.deferred_note}</p>
          </div>

          <button
            onClick={loadPlan}
            className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            Refresh
          </button>
        </>
      ) : (
        <>
          <div className="rounded-lg bg-gray-50 p-6">
            <h3 className="font-semibold mb-4">Generate Today Plan</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                How is your energy?
              </label>
              <select
                value={checkIn}
                onChange={(e) =>
                  setCheckIn(e.target.value as 'low' | 'normal' | 'none')
                }
                className="rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="none">Not sure</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>

            {message && (
              <div className="mb-4 rounded-md bg-blue-50 p-3 text-blue-800">
                {message}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate Plan'}
            </button>
          </div>

          <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
            <p className="text-sm text-blue-700">
              Tip: Make sure you have captured everything on your mind
              first. Then come back here to generate your plan.
            </p>
            <Link href="/dashboard/dump-capture" className="mt-2 text-blue-600 hover:underline text-sm">
              Go to Dump Capture
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
