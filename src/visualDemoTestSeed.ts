import { defaultCityId } from "./config/cities";
import { activityOptions } from "./data";
import type { Activity, ActivityMember, Language } from "./types";

const visualDemoStorageKey = "go-irl-visual-demo-activities-v2";
const visualDemoSeedMarkerKey = "go-irl-visual-demo-all-40-2026-08-01-v1";
const visualDemoSeedVersion = "2026-08-01:40";
const visualDemoUserKey = "telegram:999999";
const visualDemoUserName = "Vit_Test";
const eventDate = "2026-08-01";
const languages: Language[] = ["ru", "uk", "cs", "en"];
const addresses = [
  "Horní náměstí, Olomouc",
  "Smetanovy sady, Olomouc",
  "Bezručovy sady, Olomouc",
  "Korunní pevnůstka, Olomouc",
  "Dolní náměstí, Olomouc",
  "Výstaviště Flora, Olomouc",
];
const demoNames = ["Maks", "Vita", "Anna", "Petra", "Tomáš", "Olena", "Martin", "Katka", "David", "Ira", "Pavel", "Nina"];

type DemoOption = (typeof activityOptions)[keyof typeof activityOptions][number];
const taxonomyEntries = Object.entries(activityOptions) as Array<[string, DemoOption[]]>;

const localize = (option: DemoOption, prefix: Record<Language, string>) =>
  Object.fromEntries(languages.map((language) => [language, `${prefix[language]} ${option.name[language]}`])) as Activity["description"];

const eventTime = (index: number) => {
  const totalMinutes = (8 * 60) + (index * 15);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const buildMembers = (index: number, capacity: number): ActivityMember[] => {
  const joinedCount = index % 9 === 8 ? capacity : Math.min(capacity - 1, 1 + (index % 5));
  const members: ActivityMember[] = Array.from({ length: joinedCount }, (_, memberIndex) => ({
    userKey: `demo:user-${index}-${memberIndex}`,
    name: demoNames[(index + memberIndex) % demoNames.length],
    status: "joined",
  }));

  if (index % 5 === 0) {
    members[0] = { userKey: visualDemoUserKey, name: visualDemoUserName, status: "joined" };
  } else if (index % 5 === 1) {
    members.push({ userKey: visualDemoUserKey, name: visualDemoUserName, status: "pending" });
  } else if (index % 5 === 2) {
    members.push({ userKey: visualDemoUserKey, name: visualDemoUserName, status: "waiting" });
  }

  return members;
};

export const buildVisualDemoTestActivities = (): Activity[] => {
  let index = 0;

  return taxonomyEntries.flatMap(([categoryId, options]) =>
    options.map((option) => {
      const eventIndex = index;
      index += 1;
      const capacity = 4 + (eventIndex % 9);
      const members = buildMembers(eventIndex, capacity);
      const participants = members.filter((member) => member.status === "joined").length;
      const activity = Object.fromEntries(
        languages.map((language) => [language, `${option.icon} ${option.name[language]}`]),
      ) as Activity["activity"];

      return {
        id: `demo-all-40-${String(eventIndex + 1).padStart(2, "0")}-${option.name.en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
        type: categoryId === "sport" ? "sport" : "custom",
        categoryId,
        activity,
        title: { ...option.name },
        description: localize(option, {
          ru: "Тестовая карточка:",
          uk: "Тестова картка:",
          cs: "Testovací karta:",
          en: "Test card:",
        }),
        date: eventDate,
        time: eventTime(eventIndex),
        cityId: defaultCityId,
        address: addresses[eventIndex % addresses.length],
        locationUrl: "https://www.google.com/maps/search/?api=1&query=Olomouc",
        participantNote: "Visual QA seed: all 40 taxonomy variants.",
        price: eventIndex % 4 === 0 ? 0 : (eventIndex % 4) * 50,
        capacity,
        participants,
        members,
        organizer: eventIndex % 4 === 0 ? visualDemoUserName : `GO IRL Demo ${1 + (eventIndex % 4)}`,
        organizerKey: eventIndex % 4 === 0 ? visualDemoUserKey : `demo:organizer-${1 + (eventIndex % 4)}`,
        visibility: "public",
        urgent: eventIndex % 11 === 0,
        popular: participants >= 4,
        metadata: categoryId === "sport"
          ? {
              sport: {
                sportType: option.name.en,
                level: eventIndex % 3 === 0 ? "beginner" : eventIndex % 3 === 1 ? "intermediate" : "advanced",
                format: eventIndex % 3 === 0 ? "casual" : eventIndex % 3 === 1 ? "training" : "competition",
                environment: eventIndex % 2 === 0 ? "outdoor" : "indoor",
                equipmentNeeded: eventIndex % 2 === 1,
                bring: "Water and suitable clothing",
                durationMinutes: 45 + ((eventIndex % 4) * 15),
              },
            }
          : undefined,
      } satisfies Activity;
    }),
  );
};

export const seedVisualDemoTestActivities = () => {
  if (typeof window === "undefined") return;

  try {
    const existingSeed = localStorage.getItem(visualDemoStorageKey);
    const marker = localStorage.getItem(visualDemoSeedMarkerKey);
    if (marker === visualDemoSeedVersion && existingSeed) return;

    localStorage.setItem(visualDemoStorageKey, JSON.stringify(buildVisualDemoTestActivities()));
    localStorage.setItem(visualDemoSeedMarkerKey, visualDemoSeedVersion);
  } catch {
    // Visual preview must remain usable when storage is unavailable.
  }
};
