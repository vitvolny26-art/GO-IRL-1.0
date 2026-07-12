import { describe, expect, it } from "vitest";
import type { Activity } from "./types";
import { deriveParticipantJoinNotifications } from "./participantNotifications";

const activity = (members: Activity["members"]): Activity => ({
  id: "event-1",
  type: "custom",
  categoryId: "social",
  activity: { ru: "Общение", uk: "Спілкування", cs: "Setkání", en: "Social" },
  title: { ru: "Языковой обмен", uk: "Мовний обмін", cs: "Jazyková výměna", en: "Language exchange" },
  description: { ru: "", uk: "", cs: "", en: "" },
  date: "2026-07-20",
  time: "18:00",
  cityId: "olomouc",
  address: "Olomouc",
  price: 0,
  capacity: 4,
  participants: members.filter((member) => member.status === "joined").length,
  members,
  organizer: "Organizer",
  organizerKey: "telegram:organizer",
  visibility: "public",
});

describe("deriveParticipantJoinNotifications", () => {
  it("creates a notification for a joined participant on an organizer event", () => {
    const result = deriveParticipantJoinNotifications(
      [activity([
        { userKey: "telegram:organizer", name: "Organizer", status: "joined" },
        { userKey: "telegram:guest", name: "Anna", status: "joined" },
      ])],
      "telegram:organizer",
      new Set(),
      123,
    );

    expect(result).toEqual([{ 
      id: "participant-joined:event-1:telegram:guest",
      activityId: "event-1",
      memberKey: "telegram:guest",
      memberName: "Anna",
      activityTitle: { ru: "Языковой обмен", uk: "Мовний обмін", cs: "Jazyková výměna", en: "Language exchange" },
      createdAt: 123,
      read: false,
    }]);
  });

  it("ignores the organizer, pending requests, and existing notifications", () => {
    const result = deriveParticipantJoinNotifications(
      [activity([
        { userKey: "telegram:organizer", name: "Organizer", status: "joined" },
        { userKey: "telegram:pending", name: "Maks", status: "pending" },
        { userKey: "telegram:guest", name: "Anna", status: "joined" },
      ])],
      "telegram:organizer",
      new Set(["participant-joined:event-1:telegram:guest"]),
      123,
    );

    expect(result).toEqual([]);
  });

  it("does not create notifications for events owned by another user", () => {
    expect(deriveParticipantJoinNotifications(
      [activity([{ userKey: "telegram:guest", name: "Anna", status: "joined" }])],
      "telegram:someone-else",
      new Set(),
      123,
    )).toEqual([]);
  });
});
