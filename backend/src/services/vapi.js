const axios = require("axios");
const { availableSlots } = require("../data/slots");

const VAPI_BASE_URL = "https://api.vapi.ai";

function getVapiHeaders() {
  return {
    Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
    "Content-Type": "application/json",
  };
}

function buildAssistantOverride(patient) {
  const slots = availableSlots.slice(0, 3);
  const slotList = slots.map((s) => s.label).join(", ");

  return {
    model: {
      provider: "openai",
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are Maya, a friendly and professional scheduling assistant calling from Sunrise Health Clinic. You are calling ${patient.name} because they missed their ${patient.missedAppointment.type} appointment with ${patient.missedAppointment.doctor} on ${patient.missedAppointment.date} at ${patient.missedAppointment.time}.

Your goal is to reschedule their appointment. Be warm, concise, and human-sounding.

CONVERSATION FLOW:
1. Greet the patient and identify yourself: "Hi, this is Maya calling from Sunrise Health Clinic."
2. Mention the missed appointment: "I'm reaching out because it looks like you missed your ${patient.missedAppointment.type} appointment with ${patient.missedAppointment.doctor} earlier. I can help you reschedule right now — it'll only take a second."
3. Offer available slots: "We have openings ${slotList}. Which works best for you?"
4. When they pick a slot, confirm it: "Perfect, I've got you down for [their choice]. You'll get a confirmation shortly. Have a great day!"
5. If they decline or want to cancel, be polite: "No problem at all. If you change your mind, just give us a call. Take care!"

RULES:
- Keep responses short and natural — 1-2 sentences max.
- Do not mention that you are an AI.
- If they ask about costs or medical questions, say "I'd recommend speaking with the front desk for that — I can transfer you or have them call back."
- Available slots are ONLY: ${slotList}. Do not offer other times.
- When the patient selects a slot, you MUST call the confirmReschedule function with the patient ID and selected slot label.
- If the patient declines to reschedule, call the declineReschedule function with the patient ID.`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "confirmReschedule",
            description:
              "Called when the patient selects a time slot to reschedule their appointment.",
            parameters: {
              type: "object",
              properties: {
                patientId: {
                  type: "string",
                  description: "The patient's ID",
                },
                selectedSlot: {
                  type: "string",
                  description:
                    "The slot the patient chose, e.g. 'Thursday at 2pm'",
                },
              },
              required: ["patientId", "selectedSlot"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "declineReschedule",
            description:
              "Called when the patient declines to reschedule their appointment.",
            parameters: {
              type: "object",
              properties: {
                patientId: {
                  type: "string",
                  description: "The patient's ID",
                },
              },
              required: ["patientId"],
            },
          },
        },
      ],
    },
    voice: {
      provider: "cartesia",
      voiceId: "a0e99841-438c-4a64-b679-ae501e7d6091", // Sonic 3 — "British Lady"
    },
    firstMessage: `Hi, this is Maya calling from Sunrise Health Clinic. I'm reaching out because it looks like you missed your ${patient.missedAppointment.type} appointment with ${patient.missedAppointment.doctor} earlier. I can help you reschedule right now — it'll only take a second.`,
  };
}

async function initiateCall(patient) {
  const payload = {
    phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
    assistantId: process.env.VAPI_ASSISTANT_ID,
    assistantOverrides: buildAssistantOverride(patient),
    customer: {
      number: patient.phone,
      name: patient.name,
    },
    metadata: {
      patientId: patient.id,
    },
  };

  const response = await axios.post(`${VAPI_BASE_URL}/call/phone`, payload, {
    headers: getVapiHeaders(),
  });

  return response.data;
}

module.exports = { initiateCall, buildAssistantOverride };
