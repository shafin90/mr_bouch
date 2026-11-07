"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

export function ViewTracker({ slug, initialViews }: { slug: string; initialViews?: number }) {
  const [views, setViews] = useState<number>(initialViews || 0);

  useEffect(() => {
    let isMounted = true;

    // Track view once per session
    const sessionKey = `viewed_news_${slug}`;
    const alreadyViewed = sessionStorage.getItem(sessionKey);

    if (!alreadyViewed) {
      sessionStorage.setItem(sessionKey, "true");
      fetch("/api/news/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (isMounted && data.success && data.views) {
            setViews(data.views);
          }
        })
        .catch(() => {});
    } else {
      // Just fetch current views
      fetch("/api/news/view")
        .then((r) => r.json())
        .then((data) => {
          if (isMounted && data.views && data.views[slug]) {
            setViews(data.views[slug]);
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (views === 0) return null;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        color: "var(--muted)",
        fontSize: "11px",
        fontWeight: 600,
      }}
    >
      <Eye style={{ width: 13, height: 13, color: "var(--gold)" }} />
      <span>{views.toLocaleString()} lectures</span>
    </span>
  );
}
