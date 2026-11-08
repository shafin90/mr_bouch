"use client";

import { useEffect, useRef } from "react";

let analyticsSessionId: string | null = null;

function getOrCreateSessionId() {
  analyticsSessionId ??= crypto.randomUUID();
  return analyticsSessionId;
}

export function ViewTracker({ slug }: { slug: string; initialViews?: number }) {
  const pendingExit = useRef<{ slug: string; timer: number } | null>(null);

  useEffect(() => {
    // React Strict Mode replays effects in development. Cancel only that same-page cleanup.
    if (pendingExit.current?.slug === slug) {
      window.clearTimeout(pendingExit.current.timer);
      pendingExit.current = null;
    }

    const startedAt = Date.now();
    const viewId = crypto.randomUUID();
    const sessionId = getOrCreateSessionId();
    const referrer = document.referrer;
    let activeSince: number | null = document.visibilityState === "visible" ? startedAt : null;
    let activeMilliseconds = 0;
    let sent = false;

    function updateVisibility() {
      if (document.visibilityState === "hidden") {
        if (activeSince !== null) activeMilliseconds += Date.now() - activeSince;
        activeSince = null;
      } else if (activeSince === null) {
        activeSince = Date.now();
      }
    }

    function recordView() {
      if (sent) return;
      sent = true;
      const visibleTime = activeMilliseconds + (activeSince === null ? 0 : Date.now() - activeSince);
      const payload = JSON.stringify({
        slug,
        viewId,
        sessionId,
        referrer,
        engagedSeconds: Math.min(86400, Math.floor(visibleTime / 1000)),
      });

      const beaconSent = navigator.sendBeacon(
        "/api/news/view",
        new Blob([payload], { type: "application/json" })
      );
      if (!beaconSent) {
        void fetch("/api/news/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    }

    function onPageHide() {
      recordView();
    }

    document.addEventListener("visibilitychange", updateVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", updateVisibility);
      window.removeEventListener("pagehide", onPageHide);
      const timer = window.setTimeout(recordView, 200);
      pendingExit.current = { slug, timer };
    };
  }, [slug]);

  // Analytics are displayed in the authenticated admin dashboard, not as public counters.
  return null;
}
