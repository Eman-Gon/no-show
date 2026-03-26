// Shared TypeScript types for the NoShow.ai application
// These types define the shape of data flowing through the entire system:
// mock data → API routes → dashboard UI → Vapi webhooks

// Possible states an appointment can be in after a no-show event
export type AppointmentStatus = "pending" | "rescheduled" | "no-answer" | "declined";

// Represents a patient in the clinic's system
export interface Patient {
  id: string;           // Unique patient identifier (e.g., "p1")
  name: string;         // Full name displayed in the dashboard
  phone: string;        // Phone number Vapi will call (E.164 format ideally)
  dateOfBirth: string;  // Date of birth (for display / verification)
  provider: string;     // Assigned doctor or provider name
}

// Represents a missed appointment and its current resolution status
export interface Appointment {
  id: string;                        // Unique appointment identifier (e.g., "apt1")
  patientId: string;                 // Foreign key linking to a Patient
  type: string;                      // Appointment type (e.g., "Annual Physical", "Follow-Up")
  missedAt: string;                  // ISO timestamp of the original missed appointment
  status: AppointmentStatus;         // Current status after the no-show follow-up
  rescheduledTo: string | null;      // ISO timestamp of the new appointment (if rescheduled)
  callId: string | null;             // Vapi call ID (set once call is initiated)
  lastCalledAt: string | null;       // ISO timestamp of the most recent call attempt
}

// Available time slots the voice agent can offer to patients
export interface AvailableSlot {
  id: string;           // Unique slot identifier (e.g., "slot1")
  datetime: string;     // ISO timestamp of the available slot
  label: string;        // Human-readable label (e.g., "Thursday at 2:00 PM")
}

// Shape of the data returned by the /api/appointments endpoint
export interface AppointmentsResponse {
  success: boolean;
  data?: (Appointment & { patient: Patient })[];  // Joined appointment + patient data
  error?: string;
}

// Payload sent to POST /api/call to trigger an outbound call
export interface TriggerCallPayload {
  appointmentId: string;  // Which appointment to follow up on
}

// Standardized API response wrapper used by all endpoints
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
