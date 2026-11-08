import http from "http";

const BASE = "http://localhost:3000";

async function req(path: string, options: any = {}, body?: any): Promise<{ status: number; data: any; raw: string }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const headers = options.headers || {};
    let payload = "";
    if (body) {
      payload = typeof body === "string" ? body : JSON.stringify(body);
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
      headers["Content-Length"] = Buffer.byteLength(payload);
    }
    const r = http.request(
      url,
      {
        method: options.method || "GET",
        headers,
      },
      (res) => {
        let chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf-8");
          let data: any = null;
          try {
            data = JSON.parse(raw);
          } catch {
            data = raw;
          }
          resolve({ status: res.statusCode || 0, data, raw });
        });
      }
    );
    r.on("error", reject);
    if (payload) r.write(payload);
    r.end();
  });
}

async function runTests() {
  console.log("=== STARTING END-TO-END AUTOMATED TEST SUITE ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string, details?: any) {
    if (condition) {
      console.log(`✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${desc}`);
      if (details) console.error("   Details:", details);
      failed++;
    }
  }

  try {
    // 1. Test Public Routes (status 200)
    console.log("--- 1. Testing Public Pages Accessibility ---");
    const pages = [
      "/",
      "/actualites",
      "/evenements",
      "/rendez-vous",
      "/biographie",
      "/engagements",
      "/entrepreneuriat",
      "/admin/login",
      "/admin",
      "/admin/news",
      "/admin/events",
      "/admin/meetings",
    ];

    for (const p of pages) {
      const res = await req(p);
      assert(res.status === 200 || res.status === 307 || res.status === 308, `Route ${p} responds with ${res.status}`);
    }

    // 2. Test News View Count Tracking API
    console.log("\n--- 2. Testing News View Count Tracking (/api/news/view) ---");
    const getViewsBefore = await req("/api/news/view");
    assert(getViewsBefore.status === 200 && typeof getViewsBefore.data?.totalViews === "number", "GET /api/news/view returns view stats", getViewsBefore.data);
    const initialTotal = getViewsBefore.data?.totalViews || 0;

    // Test Incrementing View
    const testSlug = "e2e-test-slug-" + Date.now();
    const postView = await req("/api/news/view", { method: "POST" }, { slug: testSlug });
    assert(
      postView.status === 200 && postView.data?.success === true && postView.data?.views === 1,
      `POST /api/news/view incremented view count for ${testSlug} (returned views: ${postView.data?.views})`
    );

    // Verify incremented count reflected
    const getViewsAfter = await req("/api/news/view");
    assert(getViewsAfter.data?.views?.[testSlug] >= 1, "View count persists and is returned in subsequent GET /api/news/view");

    // 3. Test Event Booking API & Email Trigger
    console.log("\n--- 3. Testing Event Booking API (/api/events/book) ---");
    const testBookingPayload = {
      eventId: "e2e-dummy-event-id",
      fullName: "Test E2E Investor",
      email: "investor.e2e@example.com",
      phone: "+22507000000",
      seats: 2,
    };
    const bookRes = await req("/api/events/book", { method: "POST" }, testBookingPayload);
    assert(
      bookRes.status === 200 && bookRes.data?.success === true && !!bookRes.data?.confirmationCode,
      `Event booking succeeded with confirmation code: ${bookRes.data?.confirmationCode}`,
      bookRes.data
    );
    assert(
      bookRes.data?.emailSent === true || typeof bookRes.data?.previewUrl === "string",
      "Email notification handled (sent or Ethereal preview generated)",
      { previewUrl: bookRes.data?.previewUrl }
    );

    // 4. Test Meeting Approval & Email Confirmation API
    console.log("\n--- 4. Testing Meeting Confirmation API (/api/meetings/confirm) ---");
    const testMeetingPayload = {
      id: null,
      name: "Dr. Mamadou Traoré",
      email: "mamadou.traore.e2e@example.com",
      organization: "Banque d'Investissement Ouest-Africaine",
      preferred_date: "2026-12-15",
      preferred_time: "10:00",
      meeting_type: "in_person",
      status: "accepted",
    };
    const confirmRes = await req("/api/meetings/confirm", { method: "POST" }, testMeetingPayload);
    assert(
      confirmRes.status === 200 && confirmRes.data?.success === true,
      "Meeting approval API successfully processed request",
      confirmRes.data
    );
    assert(
      confirmRes.data?.sent === true || typeof confirmRes.data?.previewUrl === "string",
      "Approval confirmation email dispatched via Nodemailer",
      { previewUrl: confirmRes.data?.previewUrl }
    );

    // 5. Test iCalendar (.ics) export
    console.log("\n--- 5. Testing iCalendar (.ics) Export API (/api/ics) ---");
    const icsMissing = await req("/api/ics");
    assert(icsMissing.status === 400, "GET /api/ics without slug returns 400 Bad Request");

    console.log("\n==================================================");
    console.log(`TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log("==================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Fatal test error:", err);
    process.exit(1);
  }
}

runTests();
