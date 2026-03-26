// StatsCards — A row of metric cards showing real-time recovery stats
// Calculates totals from the appointments data and estimates recovered revenue.
// Renders at the top of the dashboard for immediate visual impact.

"use client";

import { Appointment, Patient } from "@/lib/types";

// Combined type matching what the API returns
type AppointmentWithPatient = Appointment & { patient: Patient };

// Average revenue per appointment — industry standard for primary care
const AVG_REVENUE_PER_APPOINTMENT = 200;

interface StatsCardsProps {
  appointments: AppointmentWithPatient[];
}

export default function StatsCards({ appointments }: StatsCardsProps) {
  // Calculate metrics from the live appointment data
  const total = appointments.length;
  const rescheduled = appointments.filter((a) => a.status === "rescheduled").length;
  const noAnswer = appointments.filter((a) => a.status === "no-answer").length;
  const declined = appointments.filter((a) => a.status === "declined").length;
  const pending = appointments.filter((a) => a.status === "pending").length;

  // Recovery rate = rescheduled / (total that have been contacted)
  const contacted = rescheduled + noAnswer + declined;
  const recoveryRate = contacted > 0 ? Math.round((rescheduled / contacted) * 100) : 0;

  // Estimated recovered revenue
  const recoveredRevenue = rescheduled * AVG_REVENUE_PER_APPOINTMENT;

  // Card definitions — each with an icon, label, value, and color
  const cards = [
    {
      label: "Missed Today",
      value: total.toString(),
      subtext: `${pending} pending`,
      color: "text-red-600",
      bgColor: "bg-red-50",
      icon: (
        // Calendar-X icon
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Rescheduled",
      value: rescheduled.toString(),
      subtext: `${recoveryRate}% recovery rate`,
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: (
        // Check-circle icon
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Revenue Recovered",
      value: `$${recoveredRevenue.toLocaleString()}`,
      subtext: `$${AVG_REVENUE_PER_APPOINTMENT}/appointment avg`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: (
        // Dollar icon
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Contacted",
      value: contacted.toString(),
      subtext: `${noAnswer} no answer · ${declined} declined`,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      icon: (
        // Phone icon
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center gap-3 mb-3">
            {/* Colored icon container */}
            <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center ${card.color}`}>
              {card.icon}
            </div>
            <span className="text-sm font-medium text-gray-500">{card.label}</span>
          </div>
          {/* Main metric value */}
          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          {/* Subtext with additional context */}
          <p className="text-xs text-gray-400 mt-1">{card.subtext}</p>
        </div>
      ))}
    </div>
  );
}
