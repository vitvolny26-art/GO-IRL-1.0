import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProfilePanel, type ProfilePanelLabels } from "./ProfilePanel";

const labels: ProfilePanelLabels = {
  navigationLabel: "Profile sections",
  editingBlockedLabel: "Finish editing first",
  profile: "Profile",
  activities: "Activities",
  preferences: "Preferences",
  notifications: "Notifications",
  privacy: "Privacy",
  support: "Support",
  diagnostics: "Diagnostics",
};

describe("ProfilePanel", () => {
  it("renders the owned beta navigation without portal coupling", () => {
    const html = renderToStaticMarkup(
      <ProfilePanel
        labels={labels}
        editing={false}
        hasOwnerContext
        renderSection={(section) => <div>{section}</div>}
      />,
    );

    expect(html).toContain("data-profile-panel-section=\"profile\"");
    expect(html).toContain(">Activities<");
    expect(html).toContain(">Privacy<");
    expect(html).not.toContain("profile-page");
  });

  it("shows only public-safe navigation without owner context", () => {
    const html = renderToStaticMarkup(
      <ProfilePanel
        labels={labels}
        editing={false}
        hasOwnerContext={false}
        renderSection={(section) => <div>{section}</div>}
      />,
    );

    expect(html).toContain(">Profile<");
    expect(html).toContain(">Support<");
    expect(html).not.toContain(">Preferences<");
    expect(html).not.toContain(">Diagnostics<");
  });

  it("disables section changes while profile editing is active", () => {
    const html = renderToStaticMarkup(
      <ProfilePanel
        labels={labels}
        editing
        hasOwnerContext
        renderSection={(section) => <div>{section}</div>}
      />,
    );

    expect(html).toContain("title=\"Finish editing first\"");
    expect(html).toContain("disabled=\"\"");
  });
});
