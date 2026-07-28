export type ProfilePanelSection =
  | "profile"
  | "activities"
  | "preferences"
  | "notifications"
  | "privacy"
  | "support"
  | "diagnostics";

export type ProfilePanelSectionDefinition = {
  id: ProfilePanelSection;
  betaVisible: boolean;
  requiresOwnerContext?: boolean;
};

export type ProfilePanelState = {
  activeSection: ProfilePanelSection;
  editing: boolean;
};
