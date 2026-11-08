import http from "http";

function post(path: string, payload: any): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request(
      "http://localhost:3000" + path,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode || 0, body: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode || 0, body: raw });
          }
        });
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function get(path: string): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    http.get("http://localhost:3000" + path, (res) => {
      let raw = "";
      res.on("data", (c) => (raw += c));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode || 0, body: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode || 0, body: raw });
        }
      });
    }).on("error", reject);
  });
}

async function runEdgeCases() {
  console.log("=== RUNNING RESERVATION EDGE CASE AUDIT ===\n");
  const testDate = "2026-12-01";
  const testTime = "11:00";

  // Edge Case 1: Empty payload
  console.log("Edge Case 1: Missing all fields");
  const ec1 = await post("/api/meetings/slots", {});
  console.log("-> Status:", ec1.status, "Error response:", ec1.body?.error);

  // Edge Case 2: Invalid email format
  console.log("\nEdge Case 2: Incomplete contact information");
  const ec2 = await post("/api/meetings/slots", { name: "Test User", date: testDate, time: testTime });
  console.log("-> Status:", ec2.status, "Error response:", ec2.body?.error);

  // Edge Case 3: Initial booking of a valid slot
  console.log("\nEdge Case 3: Valid First Booking");
  const ec3 = await post("/api/meetings/slots", {
    name: "Valid Booker",
    email: "valid@test.com",
    organization: "Test Fund",
    date: testDate,
    time: testTime,
    format: "in_person",
    message: "Meeting on real estate development"
  });
  console.log("-> Status:", ec3.status, "Success:", ec3.body?.success);

  // Edge Case 4: Double-booking / Race condition on same slot
  console.log("\nEdge Case 4: Double-booking prevention on same slot");
  const ec4 = await post("/api/meetings/slots", {
    name: "Second Attempter",
    email: "second@test.com",
    organization: "Another Firm",
    date: testDate,
    time: testTime,
    format: "online",
    message: "Trying to take same slot"
  });
  console.log("-> Status:", ec4.status, "(Expected 409 Conflict)");
  console.log("-> Error message:", ec4.body?.error);

  // Edge Case 5: Verify GET slots marks it as booked / locked
  console.log("\nEdge Case 5: Verification in Slots API");
  const ec5 = await get(`/api/meetings/slots?date=${testDate}`);
  const slotObj = ec5.body?.slots?.find((s: any) => s.time === testTime);
  console.log(`-> Slot ${testTime} on ${testDate}:`, slotObj);
  console.log("-> Is marked as booked:", slotObj?.isBooked, "| Available:", slotObj?.available);

  // Edge Case 6: Weekend or Past date handling in API
  console.log("\nEdge Case 6: Past date booking attempt");
  const ec6 = await post("/api/meetings/slots", {
    name: "Past Booker",
    email: "past@test.com",
    date: "2020-01-01",
    time: "10:00",
  });
  console.log("-> Past date status:", ec6.status, ec6.body?.error || "Allowed or Blocked");

  console.log("\n=== AUDIT COMPLETED ===");
}

runEdgeCases();
