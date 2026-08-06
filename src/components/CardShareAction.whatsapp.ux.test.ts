import { describe, expect, it } from "vitest";
import source from "./CardShareAction.tsx?raw";

describe("WhatsApp Meta link preview UX", () => {
  it("opens the clean Meta landing directly without preparing or downloading a JPEG", () => {
    const handler = source.slice(
      source.indexOf("const prepareWhatsAppCard = async () =>"),
      source.indexOf("const share = async"),
    );
    expect(handler).toContain('openExternalShareTarget(buildCardShareTarget("whatsapp", content))');
    expect(handler).not.toContain("buildCardShareImageUrl");
    expect(handler).not.toContain("buildCardShareDownloadUrl");
    expect(handler).not.toContain("new File(");
  });

  it("binds the WhatsApp channel button to the direct Meta landing action", () => {
    const channelClick = source.slice(
      source.indexOf('if (channel.id === "whatsapp")'),
      source.indexOf("</button>", source.indexOf('if (channel.id === "whatsapp")')),
    );
    expect(channelClick).toContain("void prepareWhatsAppCard()");
  });

  it("removes the obsolete JPEG download modal from the active share component", () => {
    expect(source).not.toContain("whatsapp-share-prepared-backdrop");
    expect(source).not.toContain("downloadPreparedWhatsApp");
    expect(source).not.toContain("openPreparedWhatsApp");
  });
});
