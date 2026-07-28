export type ProfilePanelSection =
  | "identity"
  | "preferences"
  | "my-go-irl"
  | "diagnostics";

export type ProfilePanelSectionDefinition = {
  id: ProfilePanelSection;
  ownerOnly: boolean;
};

export type ProfilePanelState = {
  activeSection: ProfilePanelSection;
  editing: boolean;
};
