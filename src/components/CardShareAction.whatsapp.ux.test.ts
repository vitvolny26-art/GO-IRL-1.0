import { describe, expect, it } from "vitest";
import source from "./CardShareAction.tsx?raw";

describe("WhatsApp prepared share UX", () => {
  it("prepares the JPEG before a second user-triggered native share", () => {
    expect(source).toContain("const prepareWhatsAppCard = async () =>");
    expect(source).toContain("setPreparedWhatsApp({");
    expect(source).toContain("const sendPreparedWhatsApp = () =>");
    expect(source).toContain("onClick={sendPreparedWhatsApp}");
    expect(source).toContain("files: [preparedWhatsApp.file]");
  });

  it("binds card preparation directly to the WhatsApp channel button", () => {
    const channelClick = source.slice(
      source.indexOf('if (channel.id === "whatsapp")'),
      source.indexOf("</button>", source.indexOf('if (channel.id === "whatsapp")')),
    );
    expect(channelClick).toContain("void prepareWhatsAppCard()");
    expect(channelClick).not.toContain("navigator.share(");
  });

  it("never falls back to the text-only WhatsApp target", () => {
    const handler = source.slice(
      source.indexOf("const prepareWhatsAppCard = async () =>"),
      source.indexOf("const share = async"),
    );
    expect(handler).not.toContain("openExternalShareTarget");
    expect(handler).not.toContain('buildCardShareTarget("whatsapp"');
    expect(handler).not.toContain("navigator.canShare");
    expect(handler).toContain("file,");
    expect(handler).toContain("error: null");
  });

  it("does not await network work inside the final share click", () => {
    const handler = source.slice(
      source.indexOf("const sendPreparedWhatsApp = () =>"),
      source.indexOf("const activate = () =>"),
    );
    expect(handler).not.toContain("fetch(");
    expect(handler).not.toContain("await ");
    expect(handler).toContain("navigator.share({");
    expect(handler).toContain("error: whatsappCopy.unsupported");
  });
});
