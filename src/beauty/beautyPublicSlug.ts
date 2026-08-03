const beautySlugPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

export const normalizeBeautyPublicSlug = (value: string) => value
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .slice(0, 48);

export const isValidBeautyPublicSlug = (value: string) => {
  const normalized = normalizeBeautyPublicSlug(value);
  return normalized.length >= 3 && normalized.length <= 48 && beautySlugPattern.test(normalized);
};

export const beautySlugFromPublicLink = (value: string) => {
  try {
    const pathname = new URL(value, "https://goirl.local").pathname;
    const match = pathname.match(/^\/beauty\/([^/?#]+)\/?$/);
    const slug = normalizeBeautyPublicSlug(decodeURIComponent(match?.[1] || ""));
    return isValidBeautyPublicSlug(slug) ? slug : "";
  } catch {
    return "";
  }
};

export const parseBeautyStartParam = (value: string | null | undefined) => {
  const slug = normalizeBeautyPublicSlug(String(value || ""));
  return isValidBeautyPublicSlug(slug) ? slug : "";
};

export const buildBeautyPublicLink = (slug: string) => {
  const normalized = normalizeBeautyPublicSlug(slug);
  return isValidBeautyPublicSlug(normalized) ? `/beauty/${encodeURIComponent(normalized)}` : "/beauty";
};

export const buildTelegramBeautyInviteUrl = (
  slug: string,
  botUsername: string,
  appName = "",
) => {
  const normalized = parseBeautyStartParam(slug);
  const bot = botUsername.trim().replace(/^@/, "");
  if (!normalized || !bot) return null;
  const appPath = appName.trim().replace(/^\/+|\/+$/g, "");
  return `https://t.me/${bot}${appPath ? `/${appPath}` : ""}?startapp=${normalized}`;
};
