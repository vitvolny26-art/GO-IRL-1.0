export type VisualDemoActivity = {
  id: string;
  date: string;
};

export type VisualDemoSnapshot<T extends VisualDemoActivity> = {
  seededOn: string;
  activities: T[];
};

export const localDateKey = (value = new Date()) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parsedSnapshot = <T extends VisualDemoActivity>(raw: string | null) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as VisualDemoSnapshot<T> | T[];
    if (Array.isArray(parsed)) return { seededOn: "", activities: parsed };
    if (parsed && typeof parsed.seededOn === "string" && Array.isArray(parsed.activities)) return parsed;
  } catch {
    // Invalid demo-only state is replaced with a fresh seed.
  }
  return null;
};

export const reconcileVisualDemoSnapshot = <T extends VisualDemoActivity>(
  raw: string | null,
  seeded: T[],
  now: Date,
  isVisible: (activity: T) => boolean,
): VisualDemoSnapshot<T> => {
  const today = localDateKey(now);
  const stored = parsedSnapshot<T>(raw);
  if (stored?.seededOn === today) {
    return { seededOn: today, activities: stored.activities.filter(isVisible) };
  }

  const seedIds = new Set(seeded.map((activity) => activity.id));
  const customActivities = (stored?.activities || [])
    .filter((activity) => !seedIds.has(activity.id))
    .filter(isVisible);
  return { seededOn: today, activities: [...seeded, ...customActivities] };
};
