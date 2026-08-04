import { useEffect, useState } from "react";
import {
  listServiceBookings,
  subscribeServiceBookings,
  type ServiceBooking,
} from "../services/servicesBookingRepository";

export const countBeautyWorkspaceAttention = (bookings: ServiceBooking[]) =>
  bookings.filter((booking) => booking.status === "pending").length;

export const useBeautyWorkspaceAttentionCount = () => {
  const readCount = () => countBeautyWorkspaceAttention(listServiceBookings());
  const [count, setCount] = useState(readCount);

  useEffect(() => subscribeServiceBookings(() => setCount(readCount())), []);

  return count;
};
