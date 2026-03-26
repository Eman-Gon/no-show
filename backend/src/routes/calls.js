const express = require("express");
const { patients } = require("../data/patients");
const { initiateCall } = require("../services/vapi");

const router = express.Router();

// POST /api/calls/trigger — trigger a call for a specific patient
router.post("/trigger", async (req, res) => {
  const { patientId, phoneOverride } = req.body;

  const patient = patients.find((p) => p.id === patientId);
  if (!patient) return res.status(404).json({ error: "Patient not found" });

  // For demo: allow overriding the phone number so judges can receive the call
  const callPatient = phoneOverride
    ? { ...patient, phone: phoneOverride }
    : patient;

  try {
    patient.callStatus = "calling";
    const callData = await initiateCall(callPatient);
    patient.callId = callData.id;

    res.json({
      message: `Call initiated to ${callPatient.phone}`,
      callId: callData.id,
      patient: patient,
    });
  } catch (err) {
    patient.callStatus = "failed";
    console.error("Vapi call error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to initiate call",
      details: err.response?.data || err.message,
    });
  }
});

// POST /api/calls/trigger-all — trigger calls for all pending patients
router.post("/trigger-all", async (req, res) => {
  const pending = patients.filter((p) => p.callStatus === "pending");

  const results = [];
  for (const patient of pending) {
    try {
      patient.callStatus = "calling";
      const callData = await initiateCall(patient);
      patient.callId = callData.id;
      results.push({ patientId: patient.id, callId: callData.id, status: "initiated" });
    } catch (err) {
      patient.callStatus = "failed";
      results.push({ patientId: patient.id, status: "failed", error: err.message });
    }
  }

  res.json({ triggered: results.length, results });
});

module.exports = router;
