import { describe, expect, it } from "vitest";
import source from "./CardShareAction.tsx?raw";

describe("WhatsApp prepared share UX", () => {
  it("prepares separate preview and download URLs before showing the modal", () => {
    const handler = source.slice(
      source.indexOf("const prepareWhatsAppCard = async () =>"),
      source.indexOf("const share = async"),
    );
    expect(handler).toContain("const directSend = canPrepareBeautyTelegramShare(url)");
    expect(handler).toContain("buildCardShareImageUrl(content)");
    expect(handler).toContain("buildCardShareDownloadUrl(content)");
    expect(handler).toContain("directSend,");
    expect(handler).toContain("downloadAccepted: false");
    expect(handler).not.toContain("openExternalShareTarget");
  });

  it("binds card preparation directly to the WhatsApp channel button for every card", () => {
    const channelClick = source.slice(
      source.indexOf('if (channel.id === "whatsapp")'),
      source.indexOf("</button>", source.indexOf('if (channel.id === "whatsapp")')),
    );
    expect(channelClick).toContain("void prepareWhatsAppCard()");
    expect(channelClick).not.toContain("canPrepareBeautyTelegramShare(url)");
    expect(channelClick).not.toContain("openExternalShareTarget");
    expect(channelClick).not.toContain("navigator.share(");
  });

  it("shows the Beauty preview modal and allows direct WhatsApp send without a download", () => {
    const openHandler = source.slice(
      source.indexOf("const openPreparedWhatsApp = () =>"),
      source.indexOf("const activate = () =>"),
    );
    const modal = source.slice(
      source.indexOf('className="whatsapp-share-prepared-backdrop"'),
      source.indexOf("document.body,", source.indexOf('className="whatsapp-share-prepared-backdrop"')),
    );
    expect(openHandler).toContain("(!prepared.directSend && !prepared.downloadAccepted)");
    expect(openHandler).toContain('buildCardShareTarget("whatsapp", content)');
    expect(modal).toContain("!preparedWhatsApp.directSend ? (");
    expect(modal).toContain("disabled={!preparedWhatsApp.directSend && !preparedWhatsApp.downloadAccepted}");
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

  it("keeps manual download gating for non-Beauty cards and never shares files", () => {
    const handler = source.slice(
      source.indexOf("const openPreparedWhatsApp = () =>"),
      source.indexOf("const activate = () =>"),
    );
    expect(handler).toContain("!prepared.directSend && !prepared.downloadAccepted");
    expect(handler).toContain("https://wa.me/?text=");
    expect(handler).toContain("openExternalShareTarget(whatsappUrl)");
    expect(source).not.toContain("files: [preparedWhatsApp.file]");
    expect(source).not.toContain("sendPreparedWhatsApp");
  });

  it("labels the primary preview action as sending to WhatsApp", () => {
    expect(source).toContain('open: "Отправить в WhatsApp"');
    expect(source).toContain('download: "Скачать JPEG"');
    expect(source).toContain("disabled={!preparedWhatsApp.directSend && !preparedWhatsApp.downloadAccepted}");
  });
});
