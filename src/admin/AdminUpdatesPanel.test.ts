import { describe, expect, it } from "vitest";
import { buildAdminUpdateItems, countReadyUpdateSources } from "./AdminUpdatesPanel";

describe("AdminUpdatesPanel release status model", () => {
  it("counts only a confirmed client build as ready", () => {
    expect(countReadyUpdateSources("8c2c7f658c1c33bed00c17328943707c6c492c32")).toBe(1);
    expect(countReadyUpdateSources("unknown")).toBe(0);
    expect(countReadyUpdateSources(" ")).toBe(0);
  });

  it("keeps protected release operations disconnected", () => {
    const items = buildAdminUpdateItems("8c2c7f658c1c33bed00c17328943707c6c492c32", "2026-08-01T08:13:05.000Z");

    expect(items).toHaveLength(4);
    expect(items[0]).toMatchObject({ name: "Клиентская сборка", state: "ready", status: "Развёрнуто" });
    expect(items.slice(1).every((item) => item.state === "not-connected")).toBe(true);
  });

  it("reports missing build metadata without inventing a release", () => {
    const [build] = buildAdminUpdateItems("unknown", "unknown");
    expect(build).toMatchObject({ state: "unavailable", status: "Недоступно" });
  });
});
