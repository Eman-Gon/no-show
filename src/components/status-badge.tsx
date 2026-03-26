// StatusBadge — A colored pill that displays the appointment status
// Maps each status to a distinct color for quick visual scanning in the dashboard table.

import { AppointmentStatus } from "@/lib/types";

// Map each status to its Tailwind color classes and display label
const statusConfig: Record<
  AppointmentStatus,
  { label: string; classes: string }
> = {
  pending: {
    label: "Pending",
    classes: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  calling: {
    label: "Calling…",
    classes: "bg-blue-100 text-blue-800 border-blue-200 animate-pulse",
  },
  rescheduled: {
    label: "Rescheduled",
    classes: "bg-green-100 text-green-800 border-green-200",
  },
  "no-answer": {
    label: "No Answer",
    classes: "bg-red-100 text-red-800 border-red-200",
  },
  declined: {
    label: "Declined",
    classes: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

interface StatusBadgeProps {
  status: AppointmentStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes}`}
    >
      {/* Small colored dot before the label for extra visual clarity */}
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === "pending"
            ? "bg-yellow-500"
            : status === "calling"
            ? "bg-blue-500 animate-ping"
            : status === "rescheduled"
            ? "bg-green-500"
            : status === "no-answer"
            ? "bg-red-500"
            : "bg-gray-500"
        }`}
      />
      {config.label}
    </span>
  );
}
