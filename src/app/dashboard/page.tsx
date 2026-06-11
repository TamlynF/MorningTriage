'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const router = useRouter()

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Good morning</h2>
        <p className="mt-2 text-gray-600">
          Generate today plan or capture what is on your mind
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Link href="/dashboard/morning-plan">
          <button className="w-full rounded-lg border-2 border-blue-200 p-6 text-left hover:bg-blue-50 transition">
            <h3 className="text-lg font-semibold text-blue-900">
              View Morning Plan
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              See today Big 3 and what has been deferred
            </p>
          </button>
        </Link>

        <Link href="/dashboard/dump-capture">
          <button className="w-full rounded-lg border-2 border-green-200 p-6 text-left hover:bg-green-50 transition">
            <h3 className="text-lg font-semibold text-green-900">
              Capture a Task
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Dump anything that is on your mind
            </p>
          </button>
        </Link>
      </div>

      <div className="rounded-lg bg-white p-6">
        <h3 className="font-semibold">Quick Start</h3>
        <ol className="mt-4 space-y-3 text-sm">
          <li>
            1. <Link href="/dashboard/dump-capture" className="text-blue-600 hover:underline">Capture</Link> what is on your mind
          </li>
          <li>
            2. Go to <Link href="/dashboard/morning-plan" className="text-blue-600 hover:underline">Morning Plan</Link> and click "Generate"
          </li>
          <li>3. Check your Big 3 for today</li>
        </ol>
      </div>
    </div>
  )
}
