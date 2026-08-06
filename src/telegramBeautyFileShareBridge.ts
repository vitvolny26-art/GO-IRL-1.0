import { getTelegramWebApp } from "./telegram";

const shareApiOrigin = "https://go-irl-1-1.vercel.app";
const publicAppOrigin = "https://goirl.realitka.pp.ua";
const beautyLandingPattern = /^\/s\/(beauty-[a-z0-9]+(?:-[a-z0-9]+)*)\/?$/i;
let installed = false;

const findBeautyLandingUrl = (text: string) => {
  for (const candidate of text.match(/https?:\/\/[^\s]+/g) || []) {
    try {
      const url = new URL(candidate);
      if (beautyLandingPattern.test(url.pathname)) return url;
    } catch {
      // Ignore malformed text fragments.
    }
  }
  return null;
};

export const buildBeautyFileShareBridgeTarget = (
  text: string,
  title: string,
  nonce = Date.now().toString(36),
) => {
  const landing = findBeautyLandingUrl(text);
  const match = landing?.pathname.match(beautyLandingPattern);
  const slug = match?.[1]?.toLowerCase() || "";
  if (!landing || !slug) return "";

  const language = landing.searchParams.get("language") || "ru";
  const date = landing.searchParams.get("date") || "";
  const image = new URL("/api/meta/event-preview", shareApiOrigin);
  image.searchParams.set("slug", slug);
  image.searchParams.set("language", language);
  if (date) image.searchParams.set("date", date);
  image.searchParams.set("format", "image");
  image.searchParams.set("v", "13");
  image.searchParams.set("share", nonce);

  const bridge = new URL("/beauty-share-bridge.html", publicAppOrigin);
  bridge.searchParams.set("image", image.toString());
  bridge.searchParams.set("text", text);
  bridge.searchParams.set("title", title || "GO IRL Beauty");
  bridge.searchParams.set("language", language);
  return bridge.toString();
};

const hasJpegFile = (data?: ShareData) => Array.from(data?.files || [])
  .some((file) => file.type === "image/jpeg");

export const installTelegramBeautyFileShareBridge = () => {
  if (installed || typeof navigator === "undefined") return;
  const webApp = getTelegramWebApp();
  if (!webApp?.openLink) return;

  const nativeShare = typeof navigator.share === "function" ? navigator.share.bind(navigator) : null;
  const nativeCanShare = typeof navigator.canShare === "function" ? navigator.canShare.bind(navigator) : null;

  const canShare = (data?: ShareData) => {
    if (hasJpegFile(data)) {
      try {
        if (nativeShare && (!nativeCanShare || nativeCanShare(data))) return true;
      } catch {
        // Use the external bridge when the WebView rejects file sharing.
      }
      return true;
    }
    if (!nativeCanShare) return false;
    try {
      return nativeCanShare(data);
    } catch {
      return false;
    }
  };

  const share = async (data: ShareData) => {
    if (hasJpegFile(data)) {
      try {
        if (nativeShare && (!nativeCanShare || nativeCanShare(data))) {
          await nativeShare(data);
          return;
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") throw error;
      }

      const bridgeTarget = buildBeautyFileShareBridgeTarget(data.text || "", data.title || "");
      if (bridgeTarget) {
        webApp.openLink(bridgeTarget);
        return;
      }
    }

    if (nativeShare) return nativeShare(data);
    throw new DOMException("Native sharing is unavailable", "NotSupportedError");
  };

  try {
    Object.defineProperty(navigator, "canShare", { configurable: true, value: canShare });
    Object.defineProperty(navigator, "share", { configurable: true, value: share });
    installed = true;
  } catch {
    // Keep the existing manual download fallback when Navigator cannot be extended.
  }
};
