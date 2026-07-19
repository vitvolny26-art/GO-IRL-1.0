const fs = require('node:fs');

const replace = (path, from, to) => {
  const source = fs.readFileSync(path, 'utf8');
  if (!source.includes(from)) throw new Error(`missing pattern in ${path}`);
  fs.writeFileSync(path, source.replace(from, to));
};

replace(
  'src/components/EventCardPrimitives.tsx',
  'import type { MouseEvent, ReactNode } from "react";',
  'import { useEffect, useState, type MouseEvent, type ReactNode } from "react";',
);
replace(
  'src/components/EventCardPrimitives.tsx',
  'import type { EventInteractionState, EventInteractionStatus } from "../eventInteractionState";',
  'import type { EventInteractionState, EventInteractionStatus } from "../eventInteractionState";\nimport { getCurrentAuthIdentity } from "../authSession";\nimport { createProfileRepository } from "../profile/profileRepository";\nimport { supabase } from "../supabase";',
);
replace(
  'src/components/EventCardPrimitives.tsx',
  `export function OrganizerAvatarAction({ organizerKey, organizerName }: { organizerKey: string; organizerName: string }) {
  const avatar = resolveOrganizerAvatar(organizerKey, organizerName);
  const openProfile = (event: MouseEvent<HTMLButtonElement>) => {`,
  `export function OrganizerAvatarAction({ organizerKey, organizerName }: { organizerKey: string; organizerName: string }) {
  const [avatar, setAvatar] = useState(() => resolveOrganizerAvatar(organizerKey, organizerName));

  useEffect(() => {
    let active = true;
    const identity = getCurrentAuthIdentity();
    if (identity?.source !== "trusted-telegram" || identity.user.userKey !== organizerKey) return undefined;

    const repository = createProfileRepository({
      identity,
      supabaseClient: supabase,
      storage: localStorage,
      fallbackDisplayName: organizerName,
      fallbackCityId: "olomouc",
    });

    void repository.loadOwnProfile()
      .then(async (profile) => {
        if (!profile) return;
        const resolved = profile.avatarPath
          ? await repository.resolveAvatarUrl(profile.avatarPath)
          : profile.avatarCode || initials(organizerName);
        if (active && resolved) setAvatar(resolved);
      })
      .catch(() => undefined);

    return () => { active = false; };
  }, [organizerKey, organizerName]);

  const openProfile = (event: MouseEvent<HTMLButtonElement>) => {`,
);

replace(
  'api/_shared/telegram-share-event.ts',
  `  if (countError) throw countError;

  const activity = localized(row, language, "activity");`,
  `  if (countError) throw countError;

  const profileResult = await db
    .from("user_profiles")
    .select("avatar_path")
    .eq("user_key", row.organizer_key)
    .maybeSingle();
  if (profileResult.error) throw profileResult.error;

  let organizerAvatarUrl: string | undefined;
  const avatarPath = typeof profileResult.data?.avatar_path === "string" ? profileResult.data.avatar_path.trim() : "";
  if (avatarPath) {
    const signed = await db.storage.from("avatars").createSignedUrl(avatarPath, 300);
    if (signed.error) throw signed.error;
    organizerAvatarUrl = signed.data.signedUrl;
  }

  const activity = localized(row, language, "activity");`,
);
replace(
  'api/_shared/telegram-share-event.ts',
  `    organizer: row.organizer,
    organizerKey: row.organizer_key,
    durationMinutes:`,
  `    organizer: row.organizer,
    organizerKey: row.organizer_key,
    organizerAvatarUrl,
    durationMinutes:`,
);

replace(
  'api/telegram/prepared-event-share.ts',
  '    if (card.organizerKey === telegramOrganizerKey && /^https:\\/\\//i.test(photoUrl)) {',
  '    if (!card.organizerAvatarUrl && card.organizerKey === telegramOrganizerKey && /^https:\\/\\//i.test(photoUrl)) {',
);

replace(
  'api/_shared/telegram-share-card-image.ts',
  'import { buildMetaInvitationCardSvg, buildTelegramShareCardSvg } from "./telegram-share-card-svg.js";',
  'import { buildMetaInvitationCardSvg, buildTelegramShareCardSvg } from "./telegram-share-card-svg.js";\nimport { readEnv } from "./env.js";',
);
replace(
  'api/_shared/telegram-share-card-image.ts',
  `const trustedAvatarHosts = ["t.me", "telegram.org", "telegram-cdn.org"];

const isTrustedTelegramAvatarUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && trustedAvatarHosts.some((host) => url.hostname === host || url.hostname.endsWith(\`.\${host}\`));
  } catch {
    return false;
  }
};`,
  `const trustedTelegramAvatarHosts = ["t.me", "telegram.org", "telegram-cdn.org"];

export const isTrustedOrganizerAvatarUrl = (value: string) => {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    if (trustedTelegramAvatarHosts.some((host) => url.hostname === host || url.hostname.endsWith(\`.\${host}\`))) return true;
    const supabaseUrl = readEnv("SUPABASE_URL");
    return Boolean(supabaseUrl && url.hostname === new URL(supabaseUrl).hostname);
  } catch {
    return false;
  }
};`,
);
replace(
  'api/_shared/telegram-share-card-image.ts',
  '  if (!value || !isTrustedTelegramAvatarUrl(value)) return null;',
  '  if (!value || !isTrustedOrganizerAvatarUrl(value)) return null;',
);

replace(
  'api/_shared/telegram-share-card-image.test.ts',
  'import { configureTelegramShareCardFonts, hasEventShareBackground, renderMetaInvitationCardJpeg, renderTelegramShareCardJpeg } from "./telegram-share-card-image";',
  'import { configureTelegramShareCardFonts, hasEventShareBackground, isTrustedOrganizerAvatarUrl, renderMetaInvitationCardJpeg, renderTelegramShareCardJpeg } from "./telegram-share-card-image";',
);
replace(
  'api/_shared/telegram-share-card-image.test.ts',
  `  it("resolves approved category artwork as the full-card JPEG background", () => {`,
  `  it("accepts only Telegram or configured Supabase organizer avatars", () => {
    const previous = process.env.SUPABASE_URL;
    process.env.SUPABASE_URL = "https://project-ref.supabase.co";
    expect(isTrustedOrganizerAvatarUrl("https://t.me/i/userpic/320/example.jpg")).toBe(true);
    expect(isTrustedOrganizerAvatarUrl("https://project-ref.supabase.co/storage/v1/object/sign/avatars/example.jpg?token=x")).toBe(true);
    expect(isTrustedOrganizerAvatarUrl("https://evil.example/avatar.jpg")).toBe(false);
    if (previous === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = previous;
  });

  it("resolves approved category artwork as the full-card JPEG background", () => {`,
);

console.log('PLAN1149 patch applied');
