"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Video,
  Building2,
  User,
  Mail,
  MessageSquare
} from "lucide-react";

const STANDARD_TIMESLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export function MeetingRequestForm({ copy }: { copy: Record<string, string> }) {

  // Calendar dates
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Default selected date: tomorrow or next Monday
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 1);
  const [selectedDate, setSelectedDate] = useState<string>(
    defaultDate.toISOString().split("T")[0]
  );

  const [selectedTime, setSelectedTime] = useState<string>("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // Form inputs
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [message, setMessage] = useState("");

  // Submission state
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch booked slots whenever selectedDate changes
  useEffect(() => {
    async function fetchSlots() {
      if (!selectedDate) return;
      setLoadingSlots(true);
      try {
        const res = await fetch(`/api/meetings/slots?date=${selectedDate}`);
        const data = await res.json();
        if (data.slots) {
          const booked = data.slots
            .filter((s: any) => s.isBooked)
            .map((s: any) => s.time);
          setBookedSlots(booked);
          // If the currently selected time is booked, unselect it
          if (booked.includes(selectedTime)) {
            setSelectedTime("");
          }
        }
      } catch (e) {
        console.error("Error loading slots:", e);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [selectedDate]);

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // Monday = 0

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setErrorMessage("Veuillez sélectionner une date et un créneau horaire disponible.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/meetings/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          organization,
          date: selectedDate,
          time: selectedTime,
          format: "online",
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de la réservation.");
      }

      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Erreur de connexion au serveur.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-border bg-white p-8 md:p-12 text-center shadow-soft">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-6">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-bronze">
          {copy.requestSentEyebrow}
        </span>
        <h3 className="mt-2 font-display text-2xl md:text-3xl text-navy">
          {copy.meetingSuccessTitle}
        </h3>
        <p className="mt-3 text-sm text-slate max-w-lg mx-auto leading-relaxed">
          {copy.meetingSuccessBody} <strong className="text-navy">{selectedDate} at {selectedTime}</strong> (Video conference).
        </p>

        <div className="mt-6 inline-flex flex-col gap-2 rounded-lg border border-border bg-[#FBF9F3] p-5 text-left text-xs text-navy max-w-md mx-auto w-full">
          <div className="flex justify-between border-b border-border/60 pb-2">
            <span className="text-slate">{copy.participantLabel}</span>
            <span className="font-semibold">{fullName}</span>
          </div>
          <div className="flex justify-between border-b border-border/60 pb-2">
            <span className="text-slate">{copy.emailLabel}</span>
            <span className="font-semibold">{email}</span>
          </div>
          <div className="flex justify-between border-b border-border/60 pb-2">
            <span className="text-slate">{copy.dateTimeLabel}</span>
            <span className="font-semibold text-bronze">{selectedDate} à {selectedTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate">{copy.formatLabel}</span>
            <span className="font-semibold">Video conference</span>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate">
          {copy.meetingPendingNote}
        </p>

        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setSelectedTime("");
            setMessage("");
          }}
          className="mt-8 rounded-none bg-navy px-8 py-3 text-xs font-semibold uppercase tracking-widest text-ivory transition hover:bg-navy-deep hover:shadow-soft"
        >
            {copy.newRequestCta}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white shadow-soft overflow-hidden">
      {/* Calendly Header bar */}
      <div className="border-b border-border bg-[#081928] px-6 py-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#b38938] font-bold">
            <Clock className="h-4 w-4" /> {copy.meetingFormTitle}
          </div>
          <h2 className="mt-1 font-display text-2xl md:text-3xl font-light">
            {copy.meetingHost}
          </h2>
          <p className="mt-1 text-xs text-slate-300">
            {copy.meetingDuration}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0c2438] px-3 py-2 text-xs font-medium text-white">
          <Video className="h-4 w-4 text-[#dfbe73]" /> Video conference only
        </div>
      </div>

      {/* Main Calendly 2-Column Split: Calendar & Timeslots */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Left Column: Interactive Date Picker */}
        <div className="lg:col-span-5 p-6 bg-[#FAFAF8]">
          <div className="flex items-center justify-between mb-4">
            <span className="font-display text-lg text-navy capitalize font-medium">
              {new Date(currentYear, currentMonth).toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded hover:bg-slate-200 text-navy transition"
                title="Mois précédent"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded hover:bg-slate-200 text-navy transition"
                title="Mois suivant"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mer</span>
            <span>Jeu</span>
            <span>Ven</span>
            <span>Sam</span>
            <span>Dim</span>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-9" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateObj = new Date(currentYear, currentMonth, day);
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
              const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6; // Sunday or Saturday
              const isDisabled = isPast || isWeekend;
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setSelectedTime("");
                  }}
                  className={`h-9 w-full rounded flex items-center justify-center text-xs font-medium transition ${
                    isSelected
                      ? "bg-navy text-white font-bold ring-2 ring-gold"
                      : isDisabled
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-navy hover:bg-[#EDE8DC] hover:text-navy cursor-pointer"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Disponible
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-400" /> {copy.occupiedSlotLabel}
            </span>
          </div>
        </div>

        {/* Right Column: Calendly Timeslots selector & Form */}
        <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3 mb-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-bronze">
                  {copy.availableSlotsLabel}
                </p>
                <p className="text-sm font-semibold text-navy">
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              {loadingSlots && (
                <span className="text-xs text-slate animate-pulse">Chargement...</span>
              )}
            </div>

            {/* Calendly Slots Buttons List */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
              {STANDARD_TIMESLOTS.map((slot) => {
                const isBooked = bookedSlots.includes(slot);
                const isSelected = selectedTime === slot;

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isBooked}
                    onClick={() => setSelectedTime(slot)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded border text-xs font-semibold transition ${
                      isBooked
                        ? "border-red-200 bg-red-50/50 text-red-400 cursor-not-allowed opacity-75"
                        : isSelected
                        ? "border-navy bg-navy text-white shadow-soft"
                        : "border-border bg-white text-navy hover:border-[#b38938] hover:bg-amber-50/40"
                    }`}
                  >
                    <span>{slot}</span>
                    {isBooked ? (
                      <span className="flex items-center gap-1 text-[10px] text-red-500 uppercase font-bold tracking-wider">
                        <Lock className="h-3 w-3" /> {copy.bookedSlotLabel}
                      </span>
                    ) : isSelected ? (
                      <span className="text-[10px] text-[#b38938] uppercase tracking-wider font-bold">
                        {copy.selectedSlotLabel} ✓
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-medium">{copy.freeSlotLabel}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Information Form Inputs */}
          <form onSubmit={handleBook} className="space-y-4 pt-4 border-t border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-navy mb-1">
                  {copy.fullNameLabel}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={copy.fullNamePlaceholder}
                    className="w-full rounded border border-border bg-white pl-9 pr-3 py-2 text-xs text-navy placeholder:text-slate-400 focus:border-navy focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-navy mb-1">
                  {copy.emailFieldLabel}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={copy.emailPlaceholder}
                    className="w-full rounded border border-border bg-white pl-9 pr-3 py-2 text-xs text-navy placeholder:text-slate-400 focus:border-navy focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-navy mb-1">
                {copy.organizationLabel}
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder={copy.organizationPlaceholder}
                  className="w-full rounded border border-border bg-white pl-9 pr-3 py-2 text-xs text-navy placeholder:text-slate-400 focus:border-navy focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-navy mb-1">
                {copy.messageLabel}
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={copy.messagePlaceholder}
                  className="w-full rounded border border-border bg-white pl-9 pr-3 py-2 text-xs text-navy placeholder:text-slate-400 focus:border-navy focus:outline-none resize-none"
                />
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded border border-red-200">
                {errorMessage}
              </p>
            )}

            <p className="text-[11px] leading-relaxed text-slate">{copy.meetingPrivacy}</p>

            <button
              type="submit"
              disabled={status === "submitting" || !selectedTime}
              className="w-full rounded bg-navy py-3 text-xs font-semibold uppercase tracking-widest text-ivory transition hover:bg-navy-deep disabled:opacity-50 disabled:cursor-not-allowed shadow-soft"
            >
              {status === "submitting"
                ? copy.submitLoading
                : selectedTime
                ? `${copy.meetingSubmit} ${selectedTime} ➔`
                : copy.selectTimePrompt}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
