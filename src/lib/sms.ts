// Plivo SMS client for sending follow-up text messages after calls
// Uses Plivo REST API directly (no SDK dependency needed).
// Docs: https://www.plivo.com/docs/messaging/use-cases/send-an-sms/

import { CLINIC } from "./mock-data";

// ─── Plivo API Config ──────────────────────────────────────

// Plivo REST API base URL — includes the auth ID as part of the path
function getPlivoUrl(): string {
  const authId = process.env.PLIVO_AUTH_ID;
  if (!authId) throw new Error("PLIVO_AUTH_ID environment variable is not set");
  return `https://api.plivo.com/v1/Account/${authId}/Message/`;
}

// Build the Basic auth header from auth_id:auth_token
function getPlivoAuthHeader(): string {
  const authId = process.env.PLIVO_AUTH_ID;
  const authToken = process.env.PLIVO_AUTH_TOKEN;
  if (!authId || !authToken) {
    throw new Error("PLIVO_AUTH_ID and PLIVO_AUTH_TOKEN must be set");
  }
  // Plivo uses HTTP Basic auth: base64(auth_id:auth_token)
  const credentials = Buffer.from(`${authId}:${authToken}`).toString("base64");
  return `Basic ${credentials}`;
}

// ─── SMS Message Templates ────────────────────────────────

// Template for when a patient successfully reschedules
function rescheduledMessage(
  patientName: string,
  appointmentType: string,
  newTime: string
): string {
  const firstName = patientName.split(" ")[0];
  return `Hi ${firstName}! ✅ Your ${appointmentType} at ${CLINIC.name} has been rescheduled for ${newTime}. Reply CONFIRM to acknowledge or call us to change. We look forward to seeing you!`;
}

// Template for when we couldn't reach the patient (no answer)
function noAnswerMessage(
  patientName: string,
  appointmentType: string
): string {
  const firstName = patientName.split(" ")[0];
  return `Hi ${firstName}, we tried reaching you about your missed ${appointmentType} at ${CLINIC.name}. We'd love to help you reschedule — reply to this text or call us at your convenience. 📞`;
}

// Template for when the patient declined to reschedule
function declinedMessage(
  patientName: string,
  appointmentType: string
): string {
  const firstName = patientName.split(" ")[0];
  return `Hi ${firstName}, thanks for chatting with Maya from ${CLINIC.name}. Whenever you're ready to reschedule your ${appointmentType}, just reply to this text or give us a call. We're here for you! 💙`;
}

// ─── Send SMS via Plivo ────────────────────────────────────

// Core function that sends an SMS through Plivo's REST API
async function sendSms(to: string, body: string): Promise<void> {
  // The Plivo phone number to send FROM (must be SMS-enabled)
  const fromNumber = process.env.PLIVO_PHONE_NUMBER;
  if (!fromNumber) {
    console.error("[Plivo SMS] ❌ PLIVO_PHONE_NUMBER env var is NOT set");
    throw new Error("PLIVO_PHONE_NUMBER environment variable is not set");
  }

  const authId = process.env.PLIVO_AUTH_ID;
  const authToken = process.env.PLIVO_AUTH_TOKEN;
  console.log(`[Plivo SMS] 📱 Config check — AUTH_ID: ${authId ? authId.substring(0, 6) + "..." : "MISSING"}, AUTH_TOKEN: ${authToken ? "SET" : "MISSING"}, FROM: ${fromNumber}`);

  const payload = {
    src: fromNumber,   // Sender — our Plivo number
    dst: to,           // Recipient — patient's phone number (E.164)
    text: body,        // The SMS body text
  };

  const url = getPlivoUrl();
  console.log(`[Plivo SMS] 🔗 URL: ${url}`);
  console.log(`[Plivo SMS] 📤 Sending to ${to}`);
  console.log(`[Plivo SMS] 💬 Message: "${body}"`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: getPlivoAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  console.log(`[Plivo SMS] 📬 Response status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Plivo SMS] ❌ Error ${response.status}: ${errorText}`);
    throw new Error(`Plivo SMS failed: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  console.log(`[Plivo SMS] Sent successfully. Message UUID: ${result.message_uuid?.[0] || "unknown"}`);
}

// ─── Public API ────────────────────────────────────────────

// Send a follow-up text after a successful reschedule
export async function sendRescheduledSms(
  phoneNumber: string,
  patientName: string,
  appointmentType: string,
  newTime: string
): Promise<void> {
  const body = rescheduledMessage(patientName, appointmentType, newTime);
  await sendSms(phoneNumber, body);
}

// Send a follow-up text after a missed/unanswered call
export async function sendNoAnswerSms(
  phoneNumber: string,
  patientName: string,
  appointmentType: string
): Promise<void> {
  const body = noAnswerMessage(patientName, appointmentType);
  await sendSms(phoneNumber, body);
}

// Send a follow-up text after a patient declines to reschedule
export async function sendDeclinedSms(
  phoneNumber: string,
  patientName: string,
  appointmentType: string
): Promise<void> {
  const body = declinedMessage(patientName, appointmentType);
  await sendSms(phoneNumber, body);
}
