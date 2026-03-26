// DashboardTable — The main table showing all missed appointments and their statuses
// Receives data as props from DashboardShell (parent owns the polling state).

"use client";

import { Appointment, Patient } from "@/lib/types";
import StatusBadge from "./status-badge";
import TriggerCallButton from "./trigger-call-btn";

// Combined type: appointment data joined with patient info
type AppointmentWithPatient = Appointment & { patient: Patient };

interface DashboardTableProps {
  appointments: AppointmentWithPatient[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export default function DashboardTable({
  appointments,
  loading,
  error,
  onRefresh,
}: DashboardTableProps) {

  // Format an ISO date string into a human-readable time (e.g., "9:00 AM")
  function formatTime(isoString: string): string {
    return new Date(isoString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Format an ISO date string into a human-readable date + time
  function formatDateTime(isoString: string): string {
    return new Date(isoString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // ─── Loading State ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-500">Loading appointments...</span>
      </div>
    );
  }

  // ─── Error State ───────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  // ─── Table ─────────────────────────────────────────────────
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Column headers */}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Patient
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Appointment Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Missed At
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Rescheduled To
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              SMS
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>

        {/* Table rows — one per appointment */}
        <tbody className="bg-white divide-y divide-gray-200">
          {appointments.map((apt) => (
            <tr
              key={apt.id}
              className="hover:bg-gray-50 transition-colors duration-150"
            >
              {/* Patient name, provider, and phone */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {apt.patient.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {apt.patient.provider}
                  </span>
                </div>
              </td>

              {/* Appointment type */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900">{apt.type}</span>
              </td>

              {/* Original missed appointment time */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                Today at {formatTime(apt.missedAt)}
              </td>

              {/* Status badge */}
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={apt.status} />
              </td>

              {/* Rescheduled time (if any) */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {apt.rescheduledTo
                  ? formatDateTime(apt.rescheduledTo)
                  : "—"}
              </td>

              {/* SMS sent indicator */}
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {apt.smsSentAt ? (
                  <span className="text-green-600" title={`Sent at ${new Date(apt.smsSentAt).toLocaleTimeString()}`}>
                    ✉️ Sent
                  </span>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>

              {/* Call action button */}
              <td className="px-6 py-4 whitespace-nowrap">
                <TriggerCallButton
                  appointmentId={apt.id}
                  status={apt.status}
                  onCallTriggered={onRefresh}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Empty state */}
      {appointments.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No missed appointments today
        </div>
      )}
    </div>
  );
}
