import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getDefaultPageContent } from "./site-content-definitions";

export { SITE_CONTENT_PAGES, getDefaultPageContent } from "./site-content-definitions";
export type { SiteContentField, SiteContentPage, SiteContentKey } from "./site-content-definitions";

export const getPublishedPageContent = cache(async (pageKey: string): Promise<Record<string, string>> => {
  const fallback = getDefaultPageContent(pageKey);
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("site_page_content")
      .select("published_content")
      .eq("page_key", pageKey)
      .eq("published", true)
      .maybeSingle();
    return { ...fallback, ...(data?.published_content ?? {}) };
  } catch {
    return fallback;
  }
});
