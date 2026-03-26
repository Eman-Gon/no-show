// POST /api/call — Triggers an outbound Vapi call for a specific appointment
// Called when the user clicks "Trigger Demo Call" on the dashboard.

import { NextRequest, NextResponse } from "next/server";
import { getAppointmentById, getPatientById, updateAppointment } from "@/lib/mock-data";
import { createOutboundCall } from "@/lib/vapi";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body to get the target appointment ID
    const body = await request.json();
    const { appointmentId } = body;

    // Validate the required field is present
    if (!appointmentId) {
      return NextResponse.json(
        { success: false, error: "appointmentId is required" },
        { status: 400 }
      );
    }

    // Look up the appointment in our mock data
    const appointment = getAppointmentById(appointmentId);
    if (!appointment) {
      return NextResponse.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Look up the associated patient
    const patient = getPatientById(appointment.patientId);
    if (!patient) {
      return NextResponse.json(
        { success: false, error: "Patient not found" },
        { status: 404 }
      );
    }

    // Build the webhook URL that Vapi will call with status updates.
    // In production, this would be a public URL. For dev, use ngrok.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const webhookUrl = `${baseUrl}/api/vapi/webhook`;

    // Initiate the outbound call via Vapi API
    const callResult = await createOutboundCall(
      patient.phone,
      patient.name,
      webhookUrl
    );

    // Update the appointment with the call ID and timestamp
    updateAppointment(appointmentId, {
      callId: callResult.id,
      lastCalledAt: new Date().toISOString(),
    });

    // Return success with the call details
    return NextResponse.json({
      success: true,
      data: {
        callId: callResult.id,
        appointmentId,
        patientName: patient.name,
      },
    });
  } catch (error) {
    // Log the error server-side for debugging
    console.error("Error triggering call:", error);

    // Return a generic error to the client (don't leak internal details)
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
