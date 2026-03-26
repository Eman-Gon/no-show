// DashboardShell — Client-side wrapper that owns the shared appointments state
// Passes data down to both StatsCards and DashboardTable so they stay in sync.
// Polls /api/appointments every 3 seconds for real-time updates.

"use client";

import { useEffect, useState, useCallback } from "react";
import { Appointment, Patient } from "@/lib/types";
import StatsCards from "./stats-cards";
import DashboardTable from "./dashboard-table";

// Combined type: appointment data joined with patient info
type AppointmentWithPatient = Appointment & { patient: Patient };

export default function DashboardShell() {
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch appointments from the API
  const fetchAppointments = useCallback(async () => {
    try {
      const response = await fetch("/api/appointments");
      const data = await response.json();

      if (data.success) {
        setAppointments(data.data);
        setError(null);
      } else {
        setError(data.error || "Failed to fetch appointments");
      }
    } catch {
      setError("Network error — check your connection");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + set up polling interval (every 3 seconds)
  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 3000);
    return () => clearInterval(interval);
  }, [fetchAppointments]);

  return (
    <>
      {/* Stats cards — show real-time metrics */}
      <StatsCards appointments={appointments} />

      {/* Main appointments table */}
      <DashboardTable
        appointments={appointments}
        loading={loading}
        error={error}
        onRefresh={fetchAppointments}
      />
    </>
  );
}
