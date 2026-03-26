const express = require("express");
const { patients } = require("../data/patients");
const { availableSlots } = require("../data/slots");

const router = express.Router();

// In-memory call log for the dashboard
const callLog = [];

// POST /api/webhook/vapi — receives Vapi webhook events
router.post("/vapi", (req, res) => {
  const event = req.body;
  console.log("Vapi webhook event:", JSON.stringify(event, null, 2));

  const { message } = event;
  if (!message) return res.json({ ok: true });

  switch (message.type) {
    case "function-call": {
      handleFunctionCall(message, res);
      return;
    }

    case "end-of-call-report": {
      handleEndOfCall(message);
      break;
    }

    case "status-update": {
      handleStatusUpdate(message);
      break;
    }

    default:
      console.log("Unhandled webhook type:", message.type);
  }

  res.json({ ok: true });
});

function handleFunctionCall(message, res) {
  const { functionCall } = message;
  if (!functionCall) return res.json({ ok: true });

  const { name, parameters } = functionCall;
  console.log(`Function call: ${name}`, parameters);

  if (name === "confirmReschedule") {
    const { patientId, selectedSlot } = parameters;
    const patient = patients.find((p) => p.id === patientId);

    if (patient) {
      const slot = availableSlots.find(
        (s) => s.label.toLowerCase() === selectedSlot.toLowerCase()
      );

      patient.callStatus = "rescheduled";
      patient.newAppointment = slot || {
        label: selectedSlot,
        date: "TBD",
        time: "TBD",
      };

      logCall(patient, "rescheduled", selectedSlot);
      console.log(`Patient ${patient.name} rescheduled to ${selectedSlot}`);
    }

    return res.json({ result: "Appointment confirmed." });
  }

  if (name === "declineReschedule") {
    const { patientId } = parameters;
    const patient = patients.find((p) => p.id === patientId);

    if (patient) {
      patient.callStatus = "declined";
      logCall(patient, "declined");
      console.log(`Patient ${patient.name} declined to reschedule`);
    }

    return res.json({ result: "Noted. We hope to see you soon." });
  }

  res.json({ result: "OK" });
}

function handleEndOfCall(message) {
  const patientId = message.call?.metadata?.patientId;
  if (!patientId) return;

  const patient = patients.find((p) => p.id === patientId);
  if (!patient) return;

  // If still in "calling" state after call ended, mark as no_answer
  if (patient.callStatus === "calling") {
    patient.callStatus = "no_answer";
    logCall(patient, "no_answer");
    console.log(`Patient ${patient.name} — no answer`);
  }
}

function handleStatusUpdate(message) {
  const patientId = message.call?.metadata?.patientId;
  if (!patientId) return;

  const patient = patients.find((p) => p.id === patientId);
  if (!patient) return;

  const status = message.status;
  console.log(`Call status update for ${patient.name}: ${status}`);

  if (status === "in-progress") {
    patient.callStatus = "in_progress";
  }
}

function logCall(patient, outcome, slot) {
  callLog.push({
    patientId: patient.id,
    patientName: patient.name,
    outcome,
    slot: slot || null,
    timestamp: new Date().toISOString(),
  });
}

// GET /api/webhook/log — get call log for dashboard
router.get("/log", (req, res) => {
  res.json(callLog);
});

module.exports = router;
