// Vapi AI client helpers for creating outbound calls
// This module wraps the Vapi REST API to initiate calls with our voice agent.
// Docs: https://docs.vapi.ai

import { availableSlots, CLINIC } from "./mock-data";

// ─── Constants ─────────────────────────────────────────────

// Base URL for all Vapi API requests
const VAPI_API_BASE = "https://api.vapi.ai";

function getVapiPrivateApiKey() {
  // Prefer an explicitly named private key env var, but keep the original
  // VAPI_API_KEY fallback so existing setups do not break.
  return process.env.VAPI_PRIVATE_KEY || process.env.VAPI_API_KEY;
}

// ─── Assistant Configuration ──────────────────────────────
// Builds the inline assistant config that defines how the voice agent behaves.
// This is passed directly in the create-call request (no need for a pre-created assistant).
function buildAssistantConfig(patientName: string, appointmentType: string) {
  // Format the available slots into a readable string for the voice prompt
  const slotList = availableSlots
    .map((s) => s.label)
    .join(", or ");

  return {
    // The system prompt defines Maya's personality and call flow
    firstMessage: `Hi, this is Maya calling from ${CLINIC.name}. May I speak with ${patientName}?`,

    model: {
      provider: "openai",
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are Maya, a friendly and professional clinic scheduling assistant at ${CLINIC.name}. You are calling to reach ${patientName} because they missed their ${appointmentType} appointment today.

Your goal is to confirm you're speaking with the right person, then reschedule their appointment. Be warm, concise, and helpful.

AVAILABLE SLOTS:
${availableSlots.map((s) => `- ${s.label}`).join("\n")}

CALL FLOW:
1. You already introduced yourself. FIRST verify you are speaking with ${patientName} (or ${patientName.split(" ")[0]}).
2. If the person says YES / confirms they are ${patientName.split(" ")[0]}:
   - Say: "Great! I'm reaching out because it looks like you missed your ${appointmentType.toLowerCase()} appointment earlier today. I'd love to help you get rescheduled — it'll only take a moment."
   - Then offer time slots: "We have openings ${slotList}. Which works best for you?"
   - When they pick a slot, confirm: "Perfect, I've got you down for [slot] for your ${appointmentType.toLowerCase()}. You'll get a confirmation text shortly. Have a great day!"
   - If they decline or can't make those times: "No problem at all. You can always call us back at ${CLINIC.name} to schedule at your convenience. Have a great day!"
3. If the person says NO / it's someone else:
   - Say: "No worries! Could you let ${patientName.split(" ")[0]} know that ${CLINIC.name} called about rescheduling their appointment? They can call us back at their convenience. Thanks so much, have a great day!"
   - Then end the call politely.
4. If you reach voicemail:
   - Leave a message: "Hi ${patientName.split(" ")[0]}, this is Maya from ${CLINIC.name}. I was calling about your missed ${appointmentType.toLowerCase()} appointment today. Please give us a call back to reschedule. Have a great day!"
5. If they ask who you are or seem confused: "I'm Maya, an AI scheduling assistant at ${CLINIC.name}. I'm calling to help reschedule a missed appointment."

RULES:
- Keep responses SHORT (1-2 sentences max)
- Be natural and conversational — sound like a real person
- ALWAYS verify identity before discussing appointment details (HIPAA)
- Don't repeat the full slot list unless asked
- Use the patient's first name (${patientName.split(" ")[0]}) naturally once identity is confirmed
- End the call politely after confirming, declining, or if wrong person
- If asked about medical questions, say you're only able to help with scheduling and they should speak with their provider`,
        },
      ],
    },

    // Cartesia Sonic voice for natural-sounding TTS
    voice: {
      provider: "cartesia",
      voiceId: "a0e99841-438c-4a64-b679-ae501e7d6091", // Cartesia "British Lady" - warm, professional
    },

    // End call after 120 seconds max to avoid runaway calls
    maxDurationSeconds: 120,

    // Silence timeout — end call if patient doesn't respond for 30s
    silenceTimeoutSeconds: 30,

    // Webhook URL where Vapi sends call status events
    // Must be set on the assistant (not in the call payload)
    serverUrl: process.env.NEXT_PUBLIC_BASE_URL
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/vapi/webhook`
      : "http://localhost:3000/api/vapi/webhook",
  };
}

// ─── Create Outbound Call ──────────────────────────────────
// Initiates a Vapi outbound call to the given phone number.
// Returns the Vapi call object (includes call ID for tracking).
export async function createOutboundCall(
  phoneNumber: string,
  patientName: string,
  appointmentType: string
): Promise<{ id: string; status: string }> {
  // Read the API key from environment variables (server-side only)
  const apiKey = getVapiPrivateApiKey();
  if (!apiKey) {
    throw new Error(
      "Vapi private API key is missing. Set VAPI_PRIVATE_KEY (preferred) or VAPI_API_KEY in .env.local and restart the Next.js server."
    );
  }

  // The phone number ID from your Vapi dashboard (the caller ID)
  const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;
  if (!phoneNumberId) {
    throw new Error("VAPI_PHONE_NUMBER_ID environment variable is not set");
  }

  // Build the request payload for Vapi's create-call endpoint
  const payload = {
    // Use an inline assistant definition (no pre-created assistant needed)
    assistant: buildAssistantConfig(patientName, appointmentType),

    // The Vapi phone number to call FROM
    phoneNumberId,

    // The patient's phone number to call TO (must be E.164 format: +14155550123)
    customer: {
      number: phoneNumber,
    },
  };

  // Make the API call to Vapi
  const response = await fetch(`${VAPI_API_BASE}/call/phone`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  // Handle API errors
  if (!response.ok) {
    const errorBody = await response.text();
    if (response.status === 401) {
      throw new Error(
        "Vapi authentication failed (401). This server route must use your Vapi Private API Key, not the browser/public key. Update VAPI_PRIVATE_KEY (or VAPI_API_KEY) in .env.local, then restart the Next.js server."
      );
    }

    throw new Error(`Vapi API error (${response.status}): ${errorBody}`);
  }

  // Return the call object (we mainly need the call ID)
  return response.json();
}
