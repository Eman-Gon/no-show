// GET /api/appointments — Returns all appointments joined with patient data
// Used by the dashboard to populate the table and poll for status updates.

import { NextResponse } from "next/server";
import { getAppointmentsWithPatients } from "@/lib/mock-data";

export async function GET() {
  // Fetch all appointments with their associated patient info
  const data = getAppointmentsWithPatients();

  // Return the joined data in our standard API response shape
  return NextResponse.json({
    success: true,
    data,
  });
}
