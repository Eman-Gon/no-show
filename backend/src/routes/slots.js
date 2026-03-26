const express = require("express");
const { availableSlots } = require("../data/slots");

const router = express.Router();

// GET /api/slots — list available appointment slots
router.get("/", (req, res) => {
  res.json(availableSlots);
});

module.exports = router;
