export type MeetingRequestDetails = {
  date: string | null;
  time: string | null;
  format: "online" | "in_person";
  status: "pending" | "accepted" | "rejected";
};

export function parseMeetingRequest(message: string | null | undefined): MeetingRequestDetails {
  const value = message ?? "";
  const slot = value.match(/\[Créneau:\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\]/i);
  const date = value.match(/\[Date:\s*(\d{4}-\d{2}-\d{2})\]/i);
  const time = value.match(/\[Heure:\s*(\d{2}:\d{2})\]/i);
  const format = value.match(/\[Format:\s*(online|in_person)\]/i)?.[1]?.toLowerCase();
  const status = value.match(/\[Statut:\s*(pending|accepted|rejected|refusé)\]/i)?.[1]?.toLowerCase();

  return {
    date: slot?.[1] ?? date?.[1] ?? null,
    time: slot?.[2] ?? time?.[1] ?? null,
    format: format === "in_person" ? "in_person" : "online",
    status: status === "accepted" ? "accepted" : status === "rejected" || status === "refusé" ? "rejected" : "pending",
  };
}

export function withMeetingStatus(message: string | null | undefined, status: MeetingRequestDetails["status"], date = new Date()) {
  const retained = (message ?? "")
    .replace(/\s*\[Statut:\s*(?:pending|accepted|rejected|refusé)\]/gi, "")
    .replace(/\s*(?:Confirmé|Décliné|Refusé) par le cabinet le .*$/gim, "")
    .trim();
  const label = status === "accepted" ? "accepted" : status === "rejected" ? "rejected" : "pending";
  const dateLabel = date.toLocaleDateString("en-GB");
  return `${retained} [Statut: ${label}]\n${status === "accepted" ? "Confirmé" : status === "rejected" ? "Décliné" : "En attente"} par le cabinet le ${dateLabel}`.trim();
}
