const express = require("express");
const { patients } = require("../data/patients");

const router = express.Router();

// GET /api/patients — list all patients with their call statuses
router.get("/", (req, res) => {
  res.json(patients);
});

// GET /api/patients/:id — single patient
router.get("/:id", (req, res) => {
  const patient = patients.find((p) => p.id === req.params.id);
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  res.json(patient);
});

module.exports = router;
