// Quick test script to verify Plivo SMS credentials work
// Run with: npx tsx scripts/test-sms.ts
// This sends a test SMS to verify the Plivo API is configured correctly.

import * as dotenv from "dotenv";
import * as path from "path";

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testSms() {
  const authId = process.env.PLIVO_AUTH_ID;
  const authToken = process.env.PLIVO_AUTH_TOKEN;
  const fromNumber = process.env.PLIVO_PHONE_NUMBER;

  console.log("=== Plivo SMS Test ===");
  console.log(`AUTH_ID:    ${authId || "❌ MISSING"}`);
  console.log(`AUTH_TOKEN: ${authToken ? "✅ SET (" + authToken.length + " chars)" : "❌ MISSING"}`);
  console.log(`FROM:       ${fromNumber || "❌ MISSING"}`);

  if (!authId || !authToken || !fromNumber) {
    console.error("\n❌ Missing required env vars. Check .env.local");
    process.exit(1);
  }

  // Test phone — use one of the team numbers
  const toNumber = "+14154006707";

  const url = `https://api.plivo.com/v1/Account/${authId}/Message/`;
  const credentials = Buffer.from(`${authId}:${authToken}`).toString("base64");

  const payload = {
    src: fromNumber,
    dst: toNumber,
    text: "🧪 NoShow.ai SMS test — if you see this, Plivo is working!",
  };

  console.log(`\nSending test SMS to ${toNumber}...`);
  console.log(`URL: ${url}`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log(`\nResponse status: ${response.status}`);
    const body = await response.text();
    console.log(`Response body: ${body}`);

    if (response.ok) {
      console.log("\n✅ SMS sent successfully!");
    } else {
      console.error("\n❌ SMS failed. Check credentials and phone number.");
    }
  } catch (error) {
    console.error("\n❌ Network error:", error);
  }
}

testSms();
