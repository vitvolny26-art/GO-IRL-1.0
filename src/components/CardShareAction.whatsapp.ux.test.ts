import { describe, expect, it } from "vitest";
import source from "./CardShareAction.tsx?raw";

describe("WhatsApp prepared share UX", () => {
  it("prepares the JPEG before a second user-triggered native share", () => {
    expect(source).toContain("setPreparedWhatsApp({");
    expect(source).toContain("const sendPreparedWhatsApp = () =>");
    expect(source).toContain("onClick={sendPreparedWhatsApp}");
    expect(source).toContain("files: [preparedWhatsApp.file]");
  });

  it("does not await network work inside the final share click", () => {
    const handler = source.slice(
      source.indexOf("const sendPreparedWhatsApp = () =>"),
      source.indexOf("const activate = () =>"),
    );
    expect(handler).not.toContain("fetch(");
    expect(handler).not.toContain("await ");
    expect(handler).toContain("navigator.share({");
  });
});
