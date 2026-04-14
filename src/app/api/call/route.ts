// POST /api/call — Triggers an outbound Vapi call for a specific appointment
// Called when the user clicks "Trigger Demo Call" on the dashboard.

import { NextRequest, NextResponse } from "next/server";
import { getAppointmentById, getPatientById, updateAppointment } from "@/lib/mock-data";
import { createOutboundCall } from "@/lib/vapi";
import { createOutboundCallBland } from "@/lib/bland";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body to get the target appointment ID
    const body = await request.json();
    const { appointmentId, phoneOverride } = body;

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

    // Initiate the outbound call — try Vapi first, fall back to Bland if it fails
    const callNumber = phoneOverride || patient.phone;
    let callResult: { id: string; status: string };
    let provider = "vapi";

    try {
      callResult = await createOutboundCall(callNumber, patient.name, appointment.type);
    } catch (vapiError) {
      console.warn("Vapi call failed:", vapiError);
      if (process.env.BLAND_API_KEY) {
        console.warn("Falling back to Bland...");
        provider = "bland";
        callResult = await createOutboundCallBland(callNumber, patient.name, appointment.type);
      } else {
        throw vapiError;
      }
    }

    console.log(`Call initiated via ${provider} — call ID: ${callResult.id}`);

    // Update the appointment with the call ID, timestamp, and "calling" status
    updateAppointment(appointmentId, {
      callId: callResult.id,
      lastCalledAt: new Date().toISOString(),
      status: "calling",
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
