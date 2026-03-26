// POST /api/vapi/webhook — Receives webhook events from Vapi
// Vapi sends events here as the call progresses (started, ended, etc.).
// We use these events to update appointment statuses in our mock data.

import { NextRequest, NextResponse } from "next/server";
import { appointments, updateAppointment, availableSlots, getPatientById } from "@/lib/mock-data";
import { sendRescheduledSms, sendNoAnswerSms, sendDeclinedSms } from "@/lib/sms";

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming webhook payload from Vapi
    const body = await request.json();

    // Vapi sends a "message" field containing the event type and data
    const { message } = body;

    if (!message) {
      return NextResponse.json({ success: true }); // Acknowledge unknown payloads
    }

    const messageType = message.type;
    const callId = message.call?.id;

    // Log the event for debugging during development
    console.log(`[Vapi Webhook] Event: ${messageType}, Call ID: ${callId}`);

    // Find the appointment associated with this call ID
    const appointment = callId
      ? appointments.find((a) => a.callId === callId)
      : undefined;

    switch (messageType) {
      // ─── Call Status Updates ───────────────────────────────
      case "status-update": {
        const status = message.status;
        console.log(`[Vapi Webhook] Call status: ${status}`);

        // When the call ends, check the reason to determine outcome
        if (status === "ended" && appointment) {
          const endedReason = message.endedReason;
          console.log(`[Vapi Webhook] Call ended. Reason: ${endedReason}`);

          // If the call wasn't answered or failed, mark as no-answer
          if (
            endedReason === "customer-did-not-answer" ||
            endedReason === "customer-busy" ||
            endedReason === "voicemail"
          ) {
            updateAppointment(appointment.id, { status: "no-answer" });

            // Send a follow-up text so the patient knows we tried
            const patient = getPatientById(appointment.patientId);
            if (patient) {
              sendNoAnswerSms(
                patient.phone,
                patient.name,
                appointment.type
              ).catch((err) =>
                console.error("[Plivo SMS] Failed to send no-answer SMS:", err)
              );
            }
          }
        }
        break;
      }

      // ─── End of Call Report ────────────────────────────────
      // This event fires after the call completes with full transcript
      case "end-of-call-report": {
        if (!appointment) break;

        const transcript = message.transcript || "";
        const summary = message.summary || "";

        console.log(`[Vapi Webhook] End of call report for appointment ${appointment.id}`);
        console.log(`[Vapi Webhook] Summary: ${summary}`);

        // Analyze the transcript/summary to determine outcome
        const fullText = `${transcript} ${summary}`.toLowerCase();

        // Check if the patient selected a time slot
        const selectedSlot = availableSlots.find(
          (slot) =>
            fullText.includes(slot.label.toLowerCase()) ||
            fullText.includes("thursday") ||
            fullText.includes("friday") ||
            fullText.includes("monday")
        );

        if (
          selectedSlot &&
          (fullText.includes("got you down") ||
            fullText.includes("perfect") ||
            fullText.includes("confirmed") ||
            fullText.includes("rescheduled") ||
            fullText.includes("booked"))
        ) {
          // Patient successfully rescheduled
          updateAppointment(appointment.id, {
            status: "rescheduled",
            rescheduledTo: selectedSlot.datetime,
          });
          console.log(
            `[Vapi Webhook] Appointment ${appointment.id} rescheduled to ${selectedSlot.label}`
          );

          // Send confirmation text with the new appointment time
          const rescheduledPatient = getPatientById(appointment.patientId);
          if (rescheduledPatient) {
            sendRescheduledSms(
              rescheduledPatient.phone,
              rescheduledPatient.name,
              appointment.type,
              selectedSlot.label
            ).catch((err) =>
              console.error("[Plivo SMS] Failed to send rescheduled SMS:", err)
            );
          }
        } else if (
          fullText.includes("decline") ||
          fullText.includes("no thank") ||
          fullText.includes("not interested") ||
          fullText.includes("don't want") ||
          fullText.includes("call back")
        ) {
          // Patient declined to reschedule
          updateAppointment(appointment.id, { status: "declined" });
          console.log(`[Vapi Webhook] Appointment ${appointment.id} declined`);

          // Send a gentle follow-up text for when they're ready
          const declinedPatient = getPatientById(appointment.patientId);
          if (declinedPatient) {
            sendDeclinedSms(
              declinedPatient.phone,
              declinedPatient.name,
              appointment.type
            ).catch((err) =>
              console.error("[Plivo SMS] Failed to send declined SMS:", err)
            );
          }
        } else if (appointment.status === "pending") {
          // If we can't determine the outcome, check if the call actually connected
          const endedReason = message.endedReason;
          if (
            endedReason === "customer-did-not-answer" ||
            endedReason === "customer-busy"
          ) {
            updateAppointment(appointment.id, { status: "no-answer" });

            // Send follow-up text for unanswered calls detected in report
            const noAnswerPatient = getPatientById(appointment.patientId);
            if (noAnswerPatient) {
              sendNoAnswerSms(
                noAnswerPatient.phone,
                noAnswerPatient.name,
                appointment.type
              ).catch((err) =>
                console.error("[Plivo SMS] Failed to send no-answer SMS:", err)
              );
            }
          }
          // Otherwise leave as pending for manual review
        }
        break;
      }

      // ─── Function Calls (future extensibility) ────────────
      case "function-call": {
        console.log(`[Vapi Webhook] Function call:`, message.functionCall);
        break;
      }

      // ─── Catch-all for other event types ───────────────────
      default: {
        console.log(`[Vapi Webhook] Unhandled event type: ${messageType}`);
      }
    }

    // Always return 200 to acknowledge receipt (Vapi retries on non-2xx)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Vapi Webhook] Error processing webhook:", error);
    // Still return 200 to prevent Vapi from retrying on parse errors
    return NextResponse.json({ success: true });
  }
}
