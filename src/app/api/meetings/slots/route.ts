import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseMeetingRequest } from "@/lib/meeting-request";

// Standard available business slots for meetings
const DEFAULT_TIMESLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date"); // YYYY-MM-DD

    const supabase = await createClient();

    // Query meeting_requests to see booked slots
    const { data: meetings, error } = await supabase
      .from("meeting_requests")
      .select("id, message, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("DB fetch error in slots API:", error);
      return NextResponse.json({ error: "Impossible de charger les disponibilités." }, { status: 500 });
    }

    const bookedByDate: Record<string, string[]> = {};

    (meetings || []).forEach((m) => {
      const details = parseMeetingRequest(m.message);
      if (details.date && details.time && details.status === "accepted") {
        bookedByDate[details.date] = bookedByDate[details.date] || [];
        if (!bookedByDate[details.date].includes(details.time)) bookedByDate[details.date].push(details.time);
      }
    });

    if (date) {
      const bookedSlots = bookedByDate[date] || [];
      const slotsWithStatus = DEFAULT_TIMESLOTS.map((slot) => ({
        time: slot,
        available: !bookedSlots.includes(slot),
        isBooked: bookedSlots.includes(slot),
      }));

      return NextResponse.json({
        date,
        slots: slotsWithStatus,
        bookedCount: bookedSlots.length,
      });
    }

    return NextResponse.json({
      allBooked: bookedByDate,
      defaultSlots: DEFAULT_TIMESLOTS,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Book a slot safely without schema error
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, organization, date, time, message } = body;
    const format = "online";

    if (!name || !email || !date || !time) {
      return NextResponse.json(
        { error: "Veuillez renseigner votre nom, email, date et créneau horaire." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Check if slot is already booked
    const { data: existing, error: existingError } = await supabase
      .from("meeting_requests")
      .select("id, message")
      .limit(500);
    if (existingError) {
      return NextResponse.json({ error: "Impossible de vérifier les disponibilités." }, { status: 500 });
    }

    const isAlreadyBooked = (existing || []).some((m) => {
      const details = parseMeetingRequest(m.message);
      return details.status === "accepted" && details.date === date && details.time === time;
    });

    if (isAlreadyBooked) {
      return NextResponse.json(
        { error: "Ce créneau horaire vient d'être réservé. Veuillez choisir une autre heure." },
        { status: 409 }
      );
    }

    // 2. Insert using standard columns guaranteed to exist: { name, email, organization, message }
    // Store all structured metadata securely in the message payload to never trigger schema cache error
    const formattedMessage = `[Créneau: ${date} ${time}] [Date: ${date}] [Heure: ${time}] [Format: ${format}] [Statut: pending]\n\nObjet / Message :\n${message || "Demande de session individuelle"}`;

    const { data, error } = await supabase
      .from("meeting_requests")
      .insert({
        name: name.trim(),
        email: email.trim(),
        organization: organization?.trim() || null,
        message: formattedMessage,
      })
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      booking: {
        date,
        time,
        format,
      },
    });
  } catch (err: any) {
    console.error("Slot booking POST error:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}
