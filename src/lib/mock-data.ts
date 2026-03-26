// Mock patient and appointment data for the NoShow.ai demo
// This module acts as an in-memory "database" — data resets on server restart.
// In production, this would be replaced by real EHR/EMR integrations.

import { Patient, Appointment, AvailableSlot } from "./types";

// ─── Patients ──────────────────────────────────────────────
// Hardcoded patient records simulating a clinic's patient list
export const patients: Patient[] = [
  {
    id: "p1",
    name: "Sarah Johnson",
    phone: "+15551234567",   // Replace with a real number for live demo
  },
  {
    id: "p2",
    name: "Michael Chen",
    phone: "+15559876543",
  },
  {
    id: "p3",
    name: "Emily Rodriguez",
    phone: "+15554567890",
  },
  {
    id: "p4",
    name: "James Williams",
    phone: "+15553216549",
  },
  {
    id: "p5",
    name: "Priya Patel",
    phone: "+15557891234",
  },
];

// ─── Appointments ──────────────────────────────────────────
// Each appointment represents a missed visit that needs follow-up.
// `status` starts as "pending" and gets updated by the webhook handler.
export const appointments: Appointment[] = [
  {
    id: "apt1",
    patientId: "p1",
    missedAt: "2026-03-25T09:00:00Z",   // Missed morning appointment
    status: "pending",
    rescheduledTo: null,
    callId: null,
    lastCalledAt: null,
  },
  {
    id: "apt2",
    patientId: "p2",
    missedAt: "2026-03-25T10:30:00Z",
    status: "pending",
    rescheduledTo: null,
    callId: null,
    lastCalledAt: null,
  },
  {
    id: "apt3",
    patientId: "p3",
    missedAt: "2026-03-25T11:00:00Z",
    status: "pending",
    rescheduledTo: null,
    callId: null,
    lastCalledAt: null,
  },
  {
    id: "apt4",
    patientId: "p4",
    missedAt: "2026-03-25T14:00:00Z",
    status: "pending",
    rescheduledTo: null,
    callId: null,
    lastCalledAt: null,
  },
  {
    id: "apt5",
    patientId: "p5",
    missedAt: "2026-03-25T15:30:00Z",
    status: "pending",
    rescheduledTo: null,
    callId: null,
    lastCalledAt: null,
  },
];

// ─── Available Slots ───────────────────────────────────────
// Time slots the voice agent will offer to patients for rescheduling.
// These are the options Maya reads out during the call.
export const availableSlots: AvailableSlot[] = [
  {
    id: "slot1",
    datetime: "2026-03-27T14:00:00Z",   // Thursday 2 PM
    label: "Thursday at 2:00 PM",
  },
  {
    id: "slot2",
    datetime: "2026-03-28T10:00:00Z",   // Friday 10 AM
    label: "Friday at 10:00 AM",
  },
  {
    id: "slot3",
    datetime: "2026-03-30T09:00:00Z",   // Monday 9 AM
    label: "Monday at 9:00 AM",
  },
];

// ─── Helper Functions ──────────────────────────────────────

// Look up a patient by their ID
export function getPatientById(id: string): Patient | undefined {
  return patients.find((p) => p.id === id);
}

// Look up an appointment by its ID
export function getAppointmentById(id: string): Appointment | undefined {
  return appointments.find((a) => a.id === id);
}

// Get all appointments joined with their patient data for the dashboard
export function getAppointmentsWithPatients() {
  return appointments.map((apt) => ({
    ...apt,
    patient: patients.find((p) => p.id === apt.patientId)!,
  }));
}

// Update an appointment's status and optional fields.
// Mutates the in-memory array directly (no DB).
export function updateAppointment(
  id: string,
  updates: Partial<Pick<Appointment, "status" | "rescheduledTo" | "callId" | "lastCalledAt">>
): Appointment | undefined {
  const apt = appointments.find((a) => a.id === id);
  if (!apt) return undefined;

  // Apply each provided field to the appointment
  if (updates.status !== undefined) apt.status = updates.status;
  if (updates.rescheduledTo !== undefined) apt.rescheduledTo = updates.rescheduledTo;
  if (updates.callId !== undefined) apt.callId = updates.callId;
  if (updates.lastCalledAt !== undefined) apt.lastCalledAt = updates.lastCalledAt;

  return apt;
}
