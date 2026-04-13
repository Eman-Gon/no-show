// Bland AI client — fallback outbound call provider when Vapi is unavailable
// Docs: https://docs.bland.ai

import { availableSlots, CLINIC } from "./mock-data";

const BLAND_API_BASE = "https://api.bland.ai/v1";

function buildTask(patientName: string, appointmentType: string): string {
  const slotList = availableSlots.map((s) => s.label).join(", or ");
  const firstName = patientName.split(" ")[0];

  return `You are Maya, a friendly scheduling assistant at ${CLINIC.name}. You are calling ${patientName} because they missed their ${appointmentType} appointment today.

GOAL: Reschedule their appointment.

CALL FLOW:
1. Verify you are speaking with ${patientName} (or ${firstName}).
2. If YES: Tell them you're calling about their missed ${appointmentType.toLowerCase()} today. Offer slots: ${slotList}. When they pick one, confirm it and say they'll get a confirmation text.
3. If NO / wrong person: Ask them to pass along the message to ${firstName} that ${CLINIC.name} called about rescheduling. Thank them and hang up.
4. If voicemail: Leave a brief message saying ${firstName} missed their ${appointmentType.toLowerCase()} and should call ${CLINIC.name} back to reschedule.
5. If they decline: Be understanding, say they can call back anytime, and wish them a good day.

RULES:
- Keep responses SHORT — 1-2 sentences max
- Always verify identity before discussing appointment details
- Be warm and natural, not robotic
- End the call after confirming, declining, or reaching voicemail`;
}

export async function createOutboundCallBland(
  phoneNumber: string,
  patientName: string,
  appointmentType: string
): Promise<{ id: string; status: string }> {
  const apiKey = process.env.BLAND_API_KEY;
  if (!apiKey) {
    throw new Error("BLAND_API_KEY is not set in .env.local");
  }

  const response = await fetch(`${BLAND_API_BASE}/calls`, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone_number: phoneNumber,
      task: buildTask(patientName, appointmentType),
      first_sentence: `Hi, this is Maya calling from ${CLINIC.name}. May I speak with ${patientName.split(" ")[0]}?`,
      voice: "maya",
      max_duration: 2, // minutes
      wait_for_greeting: true,
      record: true,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Bland API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();

  // Normalize to the same shape the rest of the app expects
  return {
    id: data.call_id,
    status: data.status ?? "queued",
  };
}
