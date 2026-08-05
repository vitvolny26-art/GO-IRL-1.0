import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import { useAppStore } from "../store";
import { ProfilePanel } from "./ProfilePanel";

describe("ProfilePanel", () => {
  beforeEach(() => {
    useAppStore.setState({ userRole: "user" });
  });

  it("renders the compact owned shell without portal coupling", () => {
    const html = renderToStaticMarkup(
      <ProfilePanel
        language="en"
        editing={false}
        renderSection={(section) => <div>{section}</div>}
      />,
    );

    expect(html).toContain("data-profile-panel-section=\"identity\"");
    expect(html).toContain(">Preferences<");
    expect(html).toContain(">My GO IRL<");
    expect(html).toContain(">Privacy<");
    expect(html).toContain(">Diagnostics<");
    expect(html).not.toContain("profile-page");
    expect(html).not.toContain("/beauty/workspace");
  });

  it("shows the Beauty workspace entry to professionals", () => {
    useAppStore.setState({ userRole: "professional" });
    const html = renderToStaticMarkup(
      <ProfilePanel
        language="en"
        editing={false}
        renderSection={(section) => <div>{section}</div>}
      />,
    );

    expect(html).toContain("/beauty/workspace");
    expect(html).toContain("GO IRL Beauty");
  });

  it("shows the Beauty workspace entry to admins", () => {
    useAppStore.setState({ userRole: "admin" });
    const html = renderToStaticMarkup(
      <ProfilePanel
        language="en"
        editing={false}
        renderSection={(section) => <div>{section}</div>}
      />,
    );

    expect(html).toContain("/beauty/workspace");
  });

  it("blocks other sections while identity editing is active", () => {
    const html = renderToStaticMarkup(
      <ProfilePanel
        language="en"
        editing
        renderSection={(section) => <div>{section}</div>}
      />,
    );

    expect(html).toContain("title=\"Finish editing your profile first\"");
    expect(html.match(/disabled=""/g)).toHaveLength(4);
  });
});
