// TriggerCallButton — Button that initiates an outbound Vapi call
// Sends a POST to /api/call with the appointment ID and shows loading state.
// Includes an optional phone override field for demo with real numbers.
// Disabled for appointments that have already been called.

"use client";

import { useState } from "react";
import { AppointmentStatus } from "@/lib/types";

interface TriggerCallButtonProps {
  appointmentId: string;
  status: AppointmentStatus;
  onCallTriggered?: () => void; // Callback to refresh data after the call is triggered
}

export default function TriggerCallButton({
  appointmentId,
  status,
  onCallTriggered,
}: TriggerCallButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneOverride, setPhoneOverride] = useState("");

  // Only allow calling for "pending" appointments
  const isCallable = status === "pending";

  async function handleClick() {
    if (!isCallable || loading) return;

    // If no phone override provided yet, show the input first
    if (!showPhoneInput) {
      setShowPhoneInput(true);
      return;
    }

    // Validate E.164 format if a phone override is entered
    if (phoneOverride && !/^\+[1-9]\d{1,14}$/.test(phoneOverride)) {
      setError("Phone must be E.164 format (e.g. +14155550123)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Send the call trigger request to our API route
      const response = await fetch("/api/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          // Send phone override so Vapi calls a real number instead of mock data
          ...(phoneOverride && { phoneOverride }),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Failed to trigger call");
      } else {
        // Call was initiated — notify parent to refresh the table
        onCallTriggered?.();
      }
    } catch (err) {
      setError("Network error — check your connection");
      console.error("Call trigger error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Show different states based on the appointment status
  if (!isCallable) {
    return (
      <span className="text-xs text-gray-400 italic">
        {status === "rescheduled"
          ? "Done"
          : status === "no-answer"
          ? "No answer"
          : status === "declined"
          ? "Declined"
          : "—"}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      {/* Phone override input — shown after first click */}
      {showPhoneInput && (
        <input
          type="tel"
          placeholder="+14155550123"
          value={phoneOverride}
          onChange={(e) => setPhoneOverride(e.target.value)}
          className="w-36 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      )}
      <button
        onClick={handleClick}
        disabled={loading}
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
          transition-all duration-150
          ${
            loading
              ? "bg-blue-100 text-blue-400 cursor-wait"
              : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 cursor-pointer"
          }
        `}
      >
        {/* Phone icon */}
        <svg
          className={`w-3.5 h-3.5 ${loading ? "animate-pulse" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
        {loading ? "Calling..." : showPhoneInput ? "Call This Number" : "Call Now"}
      </button>
      {/* Show inline error message if the call fails */}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
