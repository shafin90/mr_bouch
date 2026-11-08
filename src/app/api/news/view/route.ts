import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeSource(value: unknown, appOrigin: string) {
  if (typeof value !== "string" || !value.trim()) return "Direct";
  try {
    const source = new URL(value);
    if (source.protocol !== "https:" && source.protocol !== "http:") return "Direct";
    if (source.origin === appOrigin) {
      const section = source.pathname.split("/").filter(Boolean).slice(0, 2).join("/");
      return section ? `Site /${section}` : "Site /";
    }
    return source.hostname.toLowerCase().slice(0, 255);
  } catch {
    return "Direct";
  }
}

function countryCode(req: NextRequest) {
  const code = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || "";
  return /^[A-Z]{2}$/i.test(code) ? code.toUpperCase() : "Unknown";
}

function deviceType(req: NextRequest): "mobile" | "tablet" | "desktop" {
  const ua = req.headers.get("user-agent") || "";
  if (/ipad|tablet|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android/i.test(ua)) return "mobile";
  return "desktop";
}

// A visitor records one anonymous page-view event when leaving an article.
// Raw IP addresses, full referrer URLs, and user-agent strings are never stored.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slug = typeof body.slug === "string" ? body.slug.trim().slice(0, 200) : "";
    const viewId = typeof body.viewId === "string" ? body.viewId : "";
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
    const engagedSeconds = Number(body.engagedSeconds);
    if (!slug || !uuidPattern.test(viewId) || !uuidPattern.test(sessionId) || !Number.isFinite(engagedSeconds)) {
      return NextResponse.json({ error: "Invalid analytics event." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: article, error: articleError } = await supabase
      .from("news")
      .select("id")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    if (articleError || !article) return NextResponse.json({ error: "Article not found." }, { status: 404 });

    const { error: insertError } = await supabase.from("news_analytics").insert({
      view_id: viewId,
      session_id: sessionId,
      news_id: article.id,
      country_code: countryCode(req),
      source: normalizeSource(body.referrer, req.nextUrl.origin),
      device_type: deviceType(req),
      engaged_seconds: Math.max(0, Math.min(86400, Math.floor(engagedSeconds))),
    });

    // Repeated delivery of a pagehide beacon is harmless because view_id is unique.
    if (insertError && insertError.code !== "23505") {
      console.error("News analytics insert failed:", insertError.message);
      return NextResponse.json({ error: "Could not record analytics." }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("News analytics request failed:", error);
    return NextResponse.json({ error: "Could not record analytics." }, { status: 500 });
  }
}

// Detailed analytics are available only to authenticated dashboard users.
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const events: Array<{
    news_id: string;
    session_id: string;
    country_code: string;
    source: string;
    device_type: string;
    engaged_seconds: number;
    viewed_at: string;
  }> = [];

  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase
      .from("news_analytics")
      .select("news_id,session_id,country_code,source,device_type,engaged_seconds,viewed_at")
      .order("viewed_at", { ascending: false })
      .range(offset, offset + 999);
    if (error) {
      console.error("News analytics read failed:", error.message);
      return NextResponse.json({ error: "Could not load news analytics." }, { status: 500 });
    }
    events.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }

  type ArticleStats = {
    views: number;
    uniqueSessions: number;
    averageEngagedSeconds: number;
    countries: Record<string, number>;
    sources: Record<string, number>;
    devices: Record<string, number>;
    dailyViews: Record<string, number>;
    sessionIds: Set<string>;
    engagedTotal: number;
  };
  const grouped: Record<string, ArticleStats> = {};
  const globalSessions = new Set<string>();
  const today = new Date();
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - 13);
  cutoff.setUTCHours(0, 0, 0, 0);

  for (const event of events) {
    const stats = grouped[event.news_id] ??= {
      views: 0,
      uniqueSessions: 0,
      averageEngagedSeconds: 0,
      countries: {},
      sources: {},
      devices: {},
      dailyViews: {},
      sessionIds: new Set<string>(),
      engagedTotal: 0,
    };
    stats.views += 1;
    stats.sessionIds.add(event.session_id);
    globalSessions.add(event.session_id);
    stats.engagedTotal += event.engaged_seconds || 0;
    stats.countries[event.country_code || "Unknown"] = (stats.countries[event.country_code || "Unknown"] || 0) + 1;
    stats.sources[event.source || "Direct"] = (stats.sources[event.source || "Direct"] || 0) + 1;
    stats.devices[event.device_type || "Unknown"] = (stats.devices[event.device_type || "Unknown"] || 0) + 1;

    const viewedAt = new Date(event.viewed_at);
    if (viewedAt >= cutoff) {
      const day = event.viewed_at.slice(0, 10);
      stats.dailyViews[day] = (stats.dailyViews[day] || 0) + 1;
    }
  }

  const stats: Record<string, Omit<ArticleStats, "sessionIds" | "engagedTotal">> = {};
  const views: Record<string, number> = {};
  for (const [newsId, item] of Object.entries(grouped)) {
    const { sessionIds, engagedTotal, ...summary } = item;
    summary.uniqueSessions = sessionIds.size;
    summary.averageEngagedSeconds = item.views ? Math.round(engagedTotal / item.views) : 0;
    stats[newsId] = summary;
    views[newsId] = item.views;
  }

  const engagedTotal = events.reduce((total, event) => total + (event.engaged_seconds || 0), 0);
  const viewsLast30Days = events.filter((event) => Date.now() - new Date(event.viewed_at).getTime() <= 30 * 86400000).length;
  return NextResponse.json({
    success: true,
    views,
    stats,
    totalViews: events.length,
    uniqueSessions: globalSessions.size,
    averageEngagedSeconds: events.length ? Math.round(engagedTotal / events.length) : 0,
    viewsLast30Days,
  }, { headers: { "Cache-Control": "private, no-store" } });
}
