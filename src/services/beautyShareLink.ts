export const buildBeautyPublicLink = (slug: string) => {
  const normalizedSlug = slug.trim();
  return normalizedSlug ? `/beauty/${encodeURIComponent(normalizedSlug)}` : "/beauty";
};

export const buildBeautyPublicUrl = (slug: string, origin: string) =>
  new URL(buildBeautyPublicLink(slug), origin).toString();
