import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "missing slug or id" }, { status: 400 });

  const supabase = await createClient();
  const { data: event } = await supabase.from("events").select("*").eq("id", slug).single();
  if (!event) return NextResponse.json({ error: "not found" }, { status: 404 });

  const eventDate = event.date ? event.date.replace(/-/g, "") : "20260101";
  const startTime = (event.time || "09:00").replace(":", "");
  const endTime = (event.time ? `${Number(event.time.split(":")[0]) + 2}:00` : "11:00").replace(":", "");

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Cabinet Touré Ahmed Bouah//FR
BEGIN:VEVENT
SUMMARY:${event.title}
DTSTART:${eventDate}T${startTime}00
DTEND:${eventDate}T${endTime}00
LOCATION:${event.location || "Abidjan, Côte d'Ivoire"}
DESCRIPTION:${(event.description || "").replace(/\n/g, "\\n")}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="evenement-${slug}.ics"`,
    },
  });
}
