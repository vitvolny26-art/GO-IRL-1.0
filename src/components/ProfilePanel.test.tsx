import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProfilePanel } from "./ProfilePanel";

describe("ProfilePanel", () => {
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
