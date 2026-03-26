// Dashboard page — the main UI for NoShow.ai
// Shows a header with branding, stats summary, and the appointments table.
// This is a server component that renders the client-side DashboardTable.

import DashboardShell from "@/components/dashboard-shell";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Header ───────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and title */}
            <div className="flex items-center gap-3">
              {/* Phone icon with status indicator */}
              <div className="relative">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                {/* Green dot indicating the system is live */}
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  NoShow<span className="text-blue-600">.ai</span>
                </h1>
                <p className="text-xs text-gray-500">
                  AI-Powered No-Show Recovery
                </p>
              </div>
            </div>

            {/* Right side: clinic name */}
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">
                Bayshore Family Medicine
              </p>
              <p className="text-xs text-gray-400">Dashboard</p>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section title */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Today&apos;s Missed Appointments
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Click &quot;Call Now&quot; to trigger an AI voice call that
            reschedules the patient automatically.
          </p>
        </div>

        {/* Stats cards + appointments table (client component) */}
        <DashboardShell />

        {/* ─── ROI Banner ───────────────────────────────────── */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                $150B lost annually to no-shows
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                Healthcare providers lose an average of $200 per missed
                appointment. NoShow.ai automatically recovers these patients
                with AI voice agents — no staff time required.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
