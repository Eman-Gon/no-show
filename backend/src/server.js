require("dotenv").config();
const express = require("express");
const cors = require("cors");

const patientsRouter = require("./routes/patients");
const callsRouter = require("./routes/calls");
const webhookRouter = require("./routes/webhook");
const slotsRouter = require("./routes/slots");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/patients", patientsRouter);
app.use("/api/calls", callsRouter);
app.use("/api/webhook", webhookRouter);
app.use("/api/slots", slotsRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`NoShow backend running on http://localhost:${PORT}`);
});
