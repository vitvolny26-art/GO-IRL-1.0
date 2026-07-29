import { useEffect, useRef, type ReactNode } from "react";
import { showBackButton } from "../telegram";
import {
  profilePathForSection,
  resolveProfileSectionFromPath,
} from "../profile/profileRoute";
import {
  defaultProfilePanelSection,
  resolveProfilePanelBackTarget,
} from "../profile/profilePanelNavigation";
import type { ProfilePanelSection } from "../profile/profilePanelTypes";

export type ProfileLayoutProps = {
  activeSection: ProfilePanelSection;
  editing: boolean;
  onSectionChange: (section: ProfilePanelSection) => void;
  children: ReactNode;
};

export function ProfileLayout({
  activeSection,
  editing,
  onSectionChange,
  children,
}: ProfileLayoutProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pathSection = resolveProfileSectionFromPath(window.location.pathname);
    if (pathSection !== activeSection && !editing) onSectionChange(pathSection);
  }, [activeSection, editing, onSectionChange]);

  useEffect(() => {
    const onPopState = () => {
      const nextSection = resolveProfileSectionFromPath(window.location.pathname);
      if (editing && nextSection !== defaultProfilePanelSection) {
        window.history.replaceState({}, "", profilePathForSection(defaultProfilePanelSection));
        return;
      }
      onSectionChange(nextSection);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [editing, onSectionChange]);

  useEffect(() => {
    if (!editing) return undefined;
    const guard = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [editing]);

  useEffect(() => {
    const backTarget = resolveProfilePanelBackTarget(activeSection);
    if (!backTarget) return undefined;
    return showBackButton(() => {
      if (editing) return;
      window.history.back();
    });
  }, [activeSection, editing]);

  useEffect(() => {
    contentRef.current?.focus({ preventScroll: true });
  }, [activeSection]);

  return (
    <section className="profile-layout" data-profile-route={profilePathForSection(activeSection)}>
      <div className="profile-layout-content" ref={contentRef} tabIndex={-1}>
        {children}
      </div>
    </section>
  );
}
