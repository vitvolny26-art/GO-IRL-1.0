import { describe, expect, it } from "vitest";
import headerSource from "../components/AppHeader.tsx?raw";
import slugEditorSource from "./BeautyPublicSlugEditor.tsx?raw";
import navigationSource from "./ServicesBottomNavigationPortal.tsx?raw";
import pendingHookSource from "./useBeautyProfessionalPendingBookings.ts?raw";

describe("Beauty services request indicators", () => {
  it("renders the professional link only inside the master Page tab", () => {
    expect(slugEditorSource).toContain('document.querySelector(".beauty-workspace-page-view")');
    expect(slugEditorSource).toContain('path === "/beauty/workspace" || path === "/services/beauty/master"');
    expect(slugEditorSource).not.toContain('document.querySelector(".beauty-workspace-page")');
  });

  it("shows pending server booking requests on Services navigation and header bell", () => {
    expect(pendingHookSource).toContain("loadProfessionalServiceBookings");
    expect(pendingHookSource).toContain('booking.status === "pending"');
    expect(navigationSource).toContain("services-workspace-notification-badge");
    expect(headerSource).toContain("beautyRequestCopy");
    expect(headerSource).toContain('href="/beauty/workspace"');
  });
});
