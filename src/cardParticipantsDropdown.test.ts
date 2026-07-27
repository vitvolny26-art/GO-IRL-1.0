import { describe, expect, it } from "vitest";
import type { Activity } from "./types";
import { joinedParticipants } from "./cardParticipantsDropdown";

const activity = {
  id: "sport-members",
  categoryId: "sport",
  activity: { ru: "Волейбол", uk: "Волейбол", cs: "Volejbal", en: "Volleyball" },
  title: { ru: "Игра", uk: "Гра", cs: "Hra", en: "Game" },
  description: { ru: "", uk: "", cs: "", en: "" },
  date: "2026-08-01",
  time: "18:00",
  cityId: "olomouc",
  address: "Olomouc",
  price: 0,
  capacity: 8,
  participants: 2,
  members: [
    { userKey: "joined-1", name: "Anna Novak", status: "joined" },
    { userKey: "waiting-1", name: "Petr Svoboda", status: "waiting" },
    { userKey: "pending-1", name: "Eva Mala", status: "pending" },
    { userKey: "joined-2", name: "Jan Novak", status: "joined" },
  ],
  organizer: "Organizer",
  organizerKey: "organizer-1",
  visibility: "public",
} satisfies Activity;

describe("card participant dropdown", () => {
  it("shows only joined participants in the card dropdown", () => {
    expect(joinedParticipants(activity).map((member) => member.userKey)).toEqual(["joined-1", "joined-2"]);
  });
});
