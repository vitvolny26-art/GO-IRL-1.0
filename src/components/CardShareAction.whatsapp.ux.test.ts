import { describe, expect, it } from "vitest";
import source from "./CardShareAction.tsx?raw";

describe("WhatsApp prepared share UX", () => {
  it("prepares separate preview and download URLs before showing the modal", () => {
    const handler = source.slice(
      source.indexOf("const prepareWhatsAppCard = async () =>"),
      source.indexOf("const share = async"),
    );
    expect(handler).toContain("buildCardShareImageUrl(content)");
    expect(handler).toContain("buildCardShareDownloadUrl(content)");
    expect(handler).toContain("downloadAccepted: false");
    expect(handler).not.toContain("openExternalShareTarget");
  });

  it("binds card preparation directly to the WhatsApp channel button", () => {
    const channelClick = source.slice(
      source.indexOf('if (channel.id === "whatsapp")'),
      source.indexOf("</button>", source.indexOf('if (channel.id === "whatsapp")')),
    );
    expect(channelClick).toContain("void prepareWhatsAppCard()");
    expect(channelClick).not.toContain("navigator.share(");
  });

  it("uses Telegram downloadFile without requiring an in-memory File", () => {
    const handler = source.slice(
      source.indexOf("const downloadPreparedWhatsApp = () =>"),
      source.indexOf("const openPreparedWhatsApp = () =>"),
    );
    expect(handler).toContain("if (!prepared?.downloadUrl) return");
    expect(handler).toContain('webApp.isVersionAtLeast("8.0")');
    expect(handler).toContain("webApp.downloadFile(");
    expect(handler).toContain('file_name: "go-irl-card.jpg"');
    expect(handler.indexOf("webApp.downloadFile(")).toBeLessThan(handler.indexOf("if (!prepared.file)"));
  });

  it("keeps an object URL download only as the browser fallback", () => {
    const handler = source.slice(
      source.indexOf("const downloadPreparedWhatsApp = () =>"),
      source.indexOf("const openPreparedWhatsApp = () =>"),
    );
    expect(handler).toContain("URL.createObjectURL(prepared.file)");
    expect(handler).toContain('anchor.download = "go-irl-card.jpg"');
    expect(handler).toContain("URL.revokeObjectURL(objectUrl)");
  });

  it("opens wa.me only after a separate accepted download and never shares files", () => {
    const handler = source.slice(
      source.indexOf("const openPreparedWhatsApp = () =>"),
      source.indexOf("const activate = () =>"),
    );
    expect(handler).toContain("if (!preparedWhatsApp?.downloadAccepted) return");
    expect(handler).toContain("https://wa.me/?text=");
    expect(handler).toContain("openExternalShareTarget(whatsappUrl)");
    expect(source).not.toContain("files: [preparedWhatsApp.file]");
    expect(source).not.toContain("sendPreparedWhatsApp");
  });

  it("labels the second action honestly as opening WhatsApp", () => {
    expect(source).toContain('open: "Открыть WhatsApp"');
    expect(source).toContain('download: "Скачать JPEG"');
    expect(source).toContain("disabled={!preparedWhatsApp.downloadAccepted}");
  });
});
