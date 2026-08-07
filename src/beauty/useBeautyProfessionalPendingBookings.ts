import { useEffect, useState } from "react";
import {
  loadProfessionalServiceBookings,
  type ProfessionalServiceBooking,
} from "../services/servicesBookingProfessionalRepository";
import { subscribeServiceBookings } from "../services/servicesBookingRepository";
import type { Language, UserRole } from "../types";

const refreshIntervalMs = 30_000;

const canLoadProfessionalBookings = (role: UserRole) =>
  role === "professional" || role === "admin";

export function useBeautyProfessionalPendingBookings(
  language: Language,
  userRole: UserRole,
  enabled = true,
) {
  const [bookings, setBookings] = useState<ProfessionalServiceBooking[]>([]);

  useEffect(() => {
    if (!enabled || !canLoadProfessionalBookings(userRole)) {
      setBookings([]);
      return undefined;
    }

    let active = true;
    const refresh = async () => {
      try {
        const snapshot = await loadProfessionalServiceBookings(language);
        if (!active) return;
        setBookings(snapshot.bookings.filter((booking) => booking.status === "pending"));
      } catch {
        if (active) setBookings([]);
      }
    };
    const refreshWhenVisible = () => {
      if (!document.hidden) void refresh();
    };

    void refresh();
    const unsubscribe = subscribeServiceBookings(() => { void refresh(); });
    const intervalId = window.setInterval(refreshWhenVisible, refreshIntervalMs);
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      active = false;
      unsubscribe();
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [enabled, language, userRole]);

  return bookings;
}
