import type {
  ProfilePanelSection,
  ProfilePanelSectionDefinition,
  ProfilePanelState,
} from "./profilePanelTypes";

export const profilePanelSections: readonly ProfilePanelSectionDefinition[] = [
  { id: "profile", betaVisible: true },
  { id: "activities", betaVisible: true, requiresOwnerContext: true },
  { id: "preferences", betaVisible: true, requiresOwnerContext: true },
  { id: "notifications", betaVisible: false, requiresOwnerContext: true },
  { id: "privacy", betaVisible: false, requiresOwnerContext: true },
  { id: "support", betaVisible: false },
  { id: "diagnostics", betaVisible: true, requiresOwnerContext: true },
] as const;

export const defaultProfilePanelSection: ProfilePanelSection = "profile";

export const visibleProfilePanelSections = (
  hasOwnerContext: boolean,
): readonly ProfilePanelSectionDefinition[] => profilePanelSections.filter((section) => (
  section.betaVisible && (!section.requiresOwnerContext || hasOwnerContext)
));

export const isProfilePanelSection = (value: unknown): value is ProfilePanelSection => (
  typeof value === "string" && profilePanelSections.some((section) => section.id === value)
);

export const resolveProfilePanelSection = (
  requested: unknown,
  hasOwnerContext: boolean,
): ProfilePanelSection => {
  if (!isProfilePanelSection(requested)) return defaultProfilePanelSection;
  const section = profilePanelSections.find((candidate) => candidate.id === requested);
  if (!section?.betaVisible) return defaultProfilePanelSection;
  if (section.requiresOwnerContext && !hasOwnerContext) return defaultProfilePanelSection;
  return requested;
};

export const transitionProfilePanel = (
  state: ProfilePanelState,
  requested: unknown,
  hasOwnerContext: boolean,
): ProfilePanelState => {
  const nextSection = resolveProfilePanelSection(requested, hasOwnerContext);
  if (state.editing && nextSection !== "profile") return state;
  return { ...state, activeSection: nextSection };
};
