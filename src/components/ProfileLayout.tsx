import { useEffect, useRef, type ReactNode } from "react";
import { showBackButton } from "../telegram";
import { useAppStore } from "../store";
import {
  isProfilePath,
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
  const sectionChangeRef = useRef(onSectionChange);

  useEffect(() => {
    sectionChangeRef.current = onSectionChange;
  }, [onSectionChange]);

  useEffect(() => {
    const pathname = window.location.pathname;
    if (!isProfilePath(pathname)) return;
    const pathSection = resolveProfileSectionFromPath(pathname);
    if (pathSection !== activeSection && !editing) sectionChangeRef.current(pathSection);
  }, [activeSection, editing]);

  useEffect(() => {
    const onPopState = () => {
      const pathname = window.location.pathname;
      if (!isProfilePath(pathname)) {
        if (editing) {
          window.history.pushState({}, "", profilePathForSection(activeSection));
          return;
        }
        useAppStore.getState().setView("home");
        return;
      }

      const nextSection = resolveProfileSectionFromPath(pathname);
      if (editing && nextSection !== defaultProfilePanelSection) {
        window.history.replaceState({}, "", profilePathForSection(defaultProfilePanelSection));
        return;
      }
      sectionChangeRef.current(nextSection);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [activeSection, editing]);

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
