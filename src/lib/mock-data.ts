// Mock patient and appointment data for the NoShow.ai demo
// This module acts as an in-memory "database" — data resets on server restart.
// In production, this would be replaced by real EHR/EMR integrations.

import { Patient, Appointment, AvailableSlot } from "./types";

// ─── Clinic Info ───────────────────────────────────────────
// The clinic identity used across the voice agent and dashboard
export const CLINIC = {
  name: "Bayshore Family Medicine",
  address: "2450 Bayshore Blvd, Suite 310, San Francisco, CA 94134",
  phone: "+14155550100",
};

// ─── Patients ──────────────────────────────────────────────
// Realistic patient records for a family medicine practice demo
export const patients: Patient[] = [
  {
    id: "p1",
    name: "Maria Gonzalez",
    phone: "+15857975153",
    dateOfBirth: "1988-04-12",
    provider: "Dr. Anita Raj",
  },
  {
    id: "p2",
    name: "David Kim",
    phone: "+14154006707",
    dateOfBirth: "1975-11-03",
    provider: "Dr. Anita Raj",
  },
  {
    id: "p3",
    name: "Jasmine Okafor",
    phone: "+15857975153",
    dateOfBirth: "1992-07-22",
    provider: "Dr. Michael Torres",
  },
  {
    id: "p4",
    name: "Robert Chen",
    phone: "+14154006707",
    dateOfBirth: "1960-02-14",
    provider: "Dr. Michael Torres",
  },
  {
    id: "p5",
    name: "Aisha Rahman",
    phone: "+15857975153",
    dateOfBirth: "1999-09-30",
    provider: "Dr. Anita Raj",
  },
];

// ─── Appointments ──────────────────────────────────────────
// Each appointment represents a missed visit that needs follow-up.
// `status` starts as "pending" and gets updated by the webhook handler.
export const appointments: Appointment[] = [
  {
    id: "apt1",
    patientId: "p1",
    type: "Annual Physical Exam",
    missedAt: "2026-03-25T09:00:00Z",
    status: "pending",
    rescheduledTo: null,
    callId: null,
    lastCalledAt: null,
  },
  {
    id: "apt2",
    patientId: "p2",
    type: "Diabetes Follow-Up",
    missedAt: "2026-03-25T10:30:00Z",
    status: "pending",
    rescheduledTo: null,
    callId: null,
    lastCalledAt: null,
  },
  {
    id: "apt3",
    patientId: "p3",
    type: "New Patient Consultation",
    missedAt: "2026-03-25T11:00:00Z",
    status: "pending",
    rescheduledTo: null,
    callId: null,
    lastCalledAt: null,
  },
  {
    id: "apt4",
    patientId: "p4",
    type: "Blood Pressure Check",
    missedAt: "2026-03-25T14:00:00Z",
    status: "pending",
    rescheduledTo: null,
    callId: null,
    lastCalledAt: null,
  },
  {
    id: "apt5",
    patientId: "p5",
    type: "Prescription Refill Visit",
    missedAt: "2026-03-25T15:30:00Z",
    status: "pending",
    rescheduledTo: null,
    callId: null,
    lastCalledAt: null,
  },
];

// ─── Available Slots ───────────────────────────────────────
// Time slots the voice agent will offer to patients for rescheduling.
// Realistic openings across the next few business days.
export const availableSlots: AvailableSlot[] = [
  {
    id: "slot1",
    datetime: "2026-03-26T14:00:00Z",   // Tomorrow (Thursday) 2 PM
    label: "tomorrow, Thursday, at 2:00 PM",
  },
  {
    id: "slot2",
    datetime: "2026-03-27T10:00:00Z",   // Friday 10 AM
    label: "Friday at 10:00 AM",
  },
  {
    id: "slot3",
    datetime: "2026-03-30T09:00:00Z",   // Next Monday 9 AM
    label: "next Monday at 9:00 AM",
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
