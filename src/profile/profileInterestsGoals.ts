export type BetaProfileInterestId =
  | "volleyball"
  | "running"
  | "walking"
  | "coffee-meetup"
  | "board-games"
  | "language-exchange";

export type ProfileInterestState = "favorite" | "interested" | "want_to_try" | "hidden";

export type ProfileInterestsGoalsState = {
  interests: Partial<Record<BetaProfileInterestId, ProfileInterestState>>;
  privateGoal: string;
  updatedAt: string;
};

export const maxFavoriteProfileInterests = 5;
export const maxPrivateGoalLength = 240;

export const betaProfileInterestIds: readonly BetaProfileInterestId[] = [
  "volleyball",
  "running",
  "walking",
  "coffee-meetup",
  "board-games",
  "language-exchange",
] as const;

const legacyInterestIds: Record<BetaProfileInterestId, string> = {
  volleyball: "volleyball",
  running: "running",
  walking: "walks",
  "coffee-meetup": "coffee",
  "board-games": "board-games",
  "language-exchange": "language-exchange",
};

const allowedStates = new Set<ProfileInterestState>([
  "favorite",
  "interested",
  "want_to_try",
  "hidden",
]);

export const profileInterestStorageKey = (userKey: string) =>
  `go-irl-profile-interests-goals:${userKey || "guest-local"}`;

export const legacyInterestIdForProfileInterest = (id: BetaProfileInterestId) => legacyInterestIds[id];

export const profileInterestIdFromLegacy = (value: string): BetaProfileInterestId | null => {
  const entry = Object.entries(legacyInterestIds).find(([, legacyId]) => legacyId === value);
  return entry ? entry[0] as BetaProfileInterestId : null;
};

export const emptyProfileInterestsGoalsState = (): ProfileInterestsGoalsState => ({
  interests: {},
  privateGoal: "",
  updatedAt: "",
});

export const normalizeProfileInterestsGoalsState = (value: unknown): ProfileInterestsGoalsState => {
  if (!value || typeof value !== "object") return emptyProfileInterestsGoalsState();
  const candidate = value as Partial<ProfileInterestsGoalsState>;
  const inputInterests = candidate.interests && typeof candidate.interests === "object"
    ? candidate.interests
    : {};
  const interests: Partial<Record<BetaProfileInterestId, ProfileInterestState>> = {};

  for (const id of betaProfileInterestIds) {
    const state = (inputInterests as Record<string, unknown>)[id];
    if (typeof state === "string" && allowedStates.has(state as ProfileInterestState)) {
      interests[id] = state as ProfileInterestState;
    }
  }

  const favorites = betaProfileInterestIds.filter((id) => interests[id] === "favorite");
  for (const id of favorites.slice(maxFavoriteProfileInterests)) interests[id] = "interested";

  return {
    interests,
    privateGoal: typeof candidate.privateGoal === "string"
      ? candidate.privateGoal.slice(0, maxPrivateGoalLength)
      : "",
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : "",
  };
};

export const migrateLegacyFavoriteInterests = (
  state: ProfileInterestsGoalsState,
  legacyIds: readonly string[],
): ProfileInterestsGoalsState => {
  const next = normalizeProfileInterestsGoalsState(state);
  let favoriteCount = betaProfileInterestIds.filter((id) => next.interests[id] === "favorite").length;

  for (const legacyId of legacyIds) {
    const id = profileInterestIdFromLegacy(legacyId);
    if (!id || next.interests[id] || favoriteCount >= maxFavoriteProfileInterests) continue;
    next.interests[id] = "favorite";
    favoriteCount += 1;
  }

  return next;
};

export const setProfileInterestState = (
  state: ProfileInterestsGoalsState,
  id: BetaProfileInterestId,
  nextState: ProfileInterestState | null,
  now: () => Date = () => new Date(),
): ProfileInterestsGoalsState => {
  const current = normalizeProfileInterestsGoalsState(state);
  if (nextState === "favorite" && current.interests[id] !== "favorite") {
    const favoriteCount = betaProfileInterestIds.filter((item) => current.interests[item] === "favorite").length;
    if (favoriteCount >= maxFavoriteProfileInterests) throw new Error("profile_favorite_limit_exceeded");
  }

  const interests = { ...current.interests };
  if (nextState) interests[id] = nextState;
  else delete interests[id];

  return { ...current, interests, updatedAt: now().toISOString() };
};

export const updatePrivateProfileGoal = (
  state: ProfileInterestsGoalsState,
  privateGoal: string,
  now: () => Date = () => new Date(),
): ProfileInterestsGoalsState => ({
  ...normalizeProfileInterestsGoalsState(state),
  privateGoal: privateGoal.slice(0, maxPrivateGoalLength),
  updatedAt: now().toISOString(),
});

export const favoriteLegacyInterestIds = (state: ProfileInterestsGoalsState) =>
  betaProfileInterestIds
    .filter((id) => normalizeProfileInterestsGoalsState(state).interests[id] === "favorite")
    .map(legacyInterestIdForProfileInterest);

export const loadProfileInterestsGoals = (
  storage: Storage,
  userKey: string,
): ProfileInterestsGoalsState => {
  try {
    return normalizeProfileInterestsGoalsState(JSON.parse(storage.getItem(profileInterestStorageKey(userKey)) || "null"));
  } catch {
    return emptyProfileInterestsGoalsState();
  }
};

export const saveProfileInterestsGoals = (
  storage: Storage,
  userKey: string,
  state: ProfileInterestsGoalsState,
) => {
  const normalized = normalizeProfileInterestsGoalsState(state);
  storage.setItem(profileInterestStorageKey(userKey), JSON.stringify(normalized));
  return normalized;
};
