// Vapi AI client helpers for creating outbound calls
// This module wraps the Vapi REST API to initiate calls with our voice agent.
// Docs: https://docs.vapi.ai

import { availableSlots } from "./mock-data";

// ─── Constants ─────────────────────────────────────────────

// Base URL for all Vapi API requests
const VAPI_API_BASE = "https://api.vapi.ai";

// The clinic name used in the voice agent's script
const CLINIC_NAME = "Sunrise Health Clinic";

// ─── Assistant Configuration ──────────────────────────────
// Builds the inline assistant config that defines how the voice agent behaves.
// This is passed directly in the create-call request (no need for a pre-created assistant).
function buildAssistantConfig(patientName: string) {
  // Format the available slots into a readable string for the voice prompt
  const slotList = availableSlots
    .map((s) => s.label)
    .join(", or ");

  return {
    // The system prompt defines Maya's personality and call flow
    firstMessage: `Hi, this is Maya calling from ${CLINIC_NAME}. I'm reaching out because it looks like you missed your appointment earlier today. I can help you reschedule right now — it'll only take a second.`,

    model: {
      provider: "openai",
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are Maya, a friendly and professional clinic scheduling assistant at ${CLINIC_NAME}. You are calling ${patientName} because they missed their appointment today.

Your goal is to reschedule their appointment. Be warm, concise, and helpful.

AVAILABLE SLOTS:
${availableSlots.map((s) => `- ${s.label}`).join("\n")}

CALL FLOW:
1. You already introduced yourself. Now offer the available time slots.
2. Say: "We have openings ${slotList}. Which works best for you?"
3. When they pick a slot, confirm it: "Perfect, I've got you down for [slot]. You'll get a confirmation text shortly. Have a great day!"
4. If they want to decline or can't make any of those times, say: "No problem at all. You can always call us back at the clinic to schedule at your convenience. Have a great day!"
5. If they ask who you are or seem confused, clarify: "I'm Maya, an AI assistant at ${CLINIC_NAME}. I'm calling to help reschedule your missed appointment."

RULES:
- Keep responses SHORT (1-2 sentences max)
- Be natural and conversational
- Don't repeat the full slot list unless asked
- End the call politely after confirming or declining`,
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
  patientName: string
): Promise<{ id: string; status: string }> {
  // Read the API key from environment variables (server-side only)
  const apiKey = process.env.VAPI_API_KEY;
  if (!apiKey) {
    throw new Error("VAPI_API_KEY environment variable is not set");
  }

  // The phone number ID from your Vapi dashboard (the caller ID)
  const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;
  if (!phoneNumberId) {
    throw new Error("VAPI_PHONE_NUMBER_ID environment variable is not set");
  }

  // Build the request payload for Vapi's create-call endpoint
  const payload = {
    // Use an inline assistant definition (no pre-created assistant needed)
    assistant: buildAssistantConfig(patientName),

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
    throw new Error(`Vapi API error (${response.status}): ${errorBody}`);
  }

  // Return the call object (we mainly need the call ID)
  return response.json();
}
