export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Morning Triage</h1>
        <p className="text-xl text-gray-600">Daily planning for ADHD brains</p>
        <a
          href="/login"
          className="mt-8 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Get started
        </a>
      </div>
    </main>
  )
}
