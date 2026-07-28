import { useMemo, useState, type ReactNode } from "react";
import {
  defaultProfilePanelSection,
  transitionProfilePanel,
  visibleProfilePanelSections,
} from "../profile/profilePanelNavigation";
import type { ProfilePanelSection, ProfilePanelState } from "../profile/profilePanelTypes";

export type ProfilePanelLabels = Record<ProfilePanelSection, string> & {
  navigationLabel: string;
  editingBlockedLabel: string;
};

type ProfilePanelProps = {
  labels: ProfilePanelLabels;
  editing: boolean;
  hasOwnerContext: boolean;
  initialSection?: ProfilePanelSection;
  renderSection: (section: ProfilePanelSection) => ReactNode;
  onSectionChange?: (section: ProfilePanelSection) => void;
};

export function ProfilePanel({
  labels,
  editing,
  hasOwnerContext,
  initialSection = defaultProfilePanelSection,
  renderSection,
  onSectionChange,
}: ProfilePanelProps) {
  const [activeSection, setActiveSection] = useState<ProfilePanelSection>(initialSection);
  const sections = useMemo(
    () => visibleProfilePanelSections(hasOwnerContext),
    [hasOwnerContext],
  );

  const selectSection = (requested: ProfilePanelSection) => {
    const current: ProfilePanelState = { activeSection, editing };
    const next = transitionProfilePanel(current, requested, hasOwnerContext);
    if (next.activeSection === activeSection) return;
    setActiveSection(next.activeSection);
    onSectionChange?.(next.activeSection);
  };

  return (
    <section className="profile-panel" data-profile-panel-section={activeSection}>
      <nav className="profile-panel-navigation" aria-label={labels.navigationLabel}>
        {sections.map((section) => {
          const blocked = editing && section.id !== "profile";
          return (
            <button
              key={section.id}
              type="button"
              className={section.id === activeSection ? "is-active" : undefined}
              aria-current={section.id === activeSection ? "page" : undefined}
              disabled={blocked}
              title={blocked ? labels.editingBlockedLabel : undefined}
              onClick={() => selectSection(section.id)}
            >
              {labels[section.id]}
            </button>
          );
        })}
      </nav>
      <div className="profile-panel-content" data-section={activeSection}>
        {renderSection(activeSection)}
      </div>
    </section>
  );
}
