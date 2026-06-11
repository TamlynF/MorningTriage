'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/lib/supabase/useSupabase'
import { DumpItem } from '@/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function DumpCapturePage() {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState(false)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<DumpItem[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const supabase = useSupabase()

  useEffect(() => {
    if (supabase) {
      loadItems()
    }
  }, [supabase])

  const loadItems = async () => {
    if (!supabase) return

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const response = await fetch('/api/dump', {
      headers: { 'x-user-id': user.id },
    })
    const data = await response.json()
    setItems(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !supabase) return

    setLoading(true)
    setMessage(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const response = await fetch('/api/dump', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          raw_text: text,
          user_priority_flag: priority,
        }),
      })

      if (response.ok) {
        setText('')
        setPriority(false)
        setMessage('Captured!')
        await loadItems()
        setTimeout(() => setMessage(null), 3000)
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.error}`)
      }
    } catch (error) {
      setMessage('An error occurred')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <Link href="/dashboard" className="text-blue-600 hover:underline">
        Back to dashboard
      </Link>

      <div>
        <h2 className="text-2xl font-bold">Dump Capture</h2>
        <p className="mt-2 text-gray-600">
          Write anything on your mind. No filtering needed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="text" className="block text-sm font-medium">
            What is on your mind?
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type anything..."
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 h-32"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="priority"
            type="checkbox"
            checked={priority}
            onChange={(e) => setPriority(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="priority" className="text-sm">
            Mark as priority
          </label>
        </div>

        {message && (
          <div className="rounded-md bg-blue-50 p-3 text-blue-800">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Capturing...' : 'Capture'}
        </button>
      </form>

      <div>
        <h3 className="text-lg font-semibold mb-4">Recent captures</h3>
        <div className="space-y-2">
          {items.length === 0 ? (
            <p className="text-gray-500">No items yet</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-gray-200 p-3 text-sm"
              >
                <div className="flex justify-between">
                  <p>{item.raw_text}</p>
                  <span className="ml-2 text-xs text-gray-500">
                    {item.type}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
