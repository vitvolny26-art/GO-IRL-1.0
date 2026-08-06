import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { TelegramEventCardInput } from "./telegram-event-card.js";
import { readEnv } from "./env.js";
import { isShareLanguage, type ShareLanguage } from "./telegram-share-event.js";

const BEAUTY_SLUG_PATTERN = /^beauty-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const beautyShareCardBucket = "beauty-share-cards";

export const isBeautyShareSlug = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  const slug = value.trim().toLowerCase();
  return slug.length >= 10 && slug.length <= 48 && BEAUTY_SLUG_PATTERN.test(slug);
};

export { isShareLanguage };

const config = () => {
  const url = readEnv("SUPABASE_URL") || readEnv("VITE_SUPABASE_URL");
  const key = readEnv("SUPABASE_SERVICE_ROLE_KEY") || readEnv("VITE_SUPABASE_PUBLISHABLE_KEY");
  if (!url || !key) throw new Error("missing_beauty_share_database_config");
  return { url, key };
};

const db = () => {
  const { url, key } = config();
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
};

const localeByLanguage: Record<ShareLanguage, string> = {
  ru: "ru-RU",
  uk: "uk-UA",
  cs: "cs-CZ",
  en: "en-GB",
};

const manicureServiceName: Record<ShareLanguage, string> = {
  ru: "Маникюр с гель-лаком",
  uk: "Манікюр з гель-лаком",
  cs: "Manikúra s gel lakem",
  en: "Gel manicure",
};

export const localizeBeautyServiceName = (serviceName: string, language: ShareLanguage) => {
  const normalized = serviceName.trim();
  return /manicure|маникюр|манікюр|manik[uú]ra/i.test(normalized)
    ? manicureServiceName[language]
    : normalized;
};

const normalizeDate = (value: unknown, language: ShareLanguage) => {
  const date = typeof value === "string" ? value.trim() : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { raw: "", display: date.slice(0, 40) };
  const parsed = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return { raw: "", display: date };
  return {
    raw: date,
    display: new Intl.DateTimeFormat(localeByLanguage[language], { day: "numeric", month: "short", timeZone: "UTC" })
      .format(parsed)
      .replace(/\.$/, ""),
  };
};

const buildTelegramBeautyInviteUrl = (slug: string) => {
  const bot = (readEnv("GO_IRL_BOT_USERNAME") || readEnv("VITE_GO_IRL_BOT_USERNAME") || "GOirl_bot")
    .trim()
    .replace(/^@/, "");
  const appName = (readEnv("GO_IRL_APP_NAME") || readEnv("VITE_GO_IRL_APP_NAME") || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
  return `https://t.me/${bot}${appName ? `/${appName}` : ""}?startapp=${encodeURIComponent(slug)}`;
};

export type PublicBeautyRow = {
  profile_id: string;
  slug: string;
  display_name: string;
  city_id: string;
  public_location: string;
  description?: string;
  specialization?: string;
  service_name: string;
  duration_minutes: number;
  price_czk: number;
  currency: string;
};

type BeautyShareArtworkRow = {
  status: string;
  generated_object_path: string | null;
  source_fingerprint: string;
  generated_at: string | null;
  updated_at: string;
};

export type TrustedBeautyShareArtwork = {
  imageUrl: string;
  version: string;
  generatedAt: string;
};

type RpcError = { code?: string; message?: string } | null;

const isMissingRpc = (error: RpcError) => error?.code === "PGRST202"
  || Boolean(error?.message?.includes("Could not find the function"));

export async function loadPublicBeautyRows(
  client: SupabaseClient,
  language: ShareLanguage,
): Promise<PublicBeautyRow[]> {
  const expanded = await client.rpc("go_irl_list_public_beauty_professionals_v3", {
    p_requested_city_id: "olomouc",
    p_language: language,
  });
  let result = expanded;
  if (expanded.error && isMissingRpc(expanded.error)) {
    const localized = await client.rpc("go_irl_list_public_beauty_professionals_v2", {
      p_requested_city_id: "olomouc",
      p_language: language,
    });
    result = localized.error && isMissingRpc(localized.error)
      ? await client.rpc("go_irl_list_public_beauty_professionals", { p_requested_city_id: "olomouc" })
      : localized;
  }
  if (result.error) throw result.error;
  return (result.data || []) as PublicBeautyRow[];
}

export async function loadBeautyShareArtwork(
  client: SupabaseClient,
  profileId: string,
): Promise<TrustedBeautyShareArtwork | null> {
  const result = await client
    .from("beauty_share_cards")
    .select("status,generated_object_path,source_fingerprint,generated_at,updated_at")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (result.error) throw result.error;

  const row = result.data as BeautyShareArtworkRow | null;
  if (!row || row.status !== "ready" || !row.generated_object_path) return null;

  const publicUrl = client.storage.from(beautyShareCardBucket)
    .getPublicUrl(row.generated_object_path).data.publicUrl;
  if (!publicUrl) return null;

  const version = row.source_fingerprint || row.generated_at || row.updated_at;
  const image = new URL(publicUrl);
  if (version) image.searchParams.set("v", version);
  return {
    imageUrl: image.toString(),
    version,
    generatedAt: row.generated_at || row.updated_at,
  };
}

const beautyFallbackOrigin = "https://goirl.realitka.pp.ua";

const buildPublicBeautyProfileUrl = (origin: string, slug: string) => {
  try {
    return new URL(`/beauty/${encodeURIComponent(slug)}`, origin || beautyFallbackOrigin).toString();
  } catch {
    return new URL(`/beauty/${encodeURIComponent(slug)}`, beautyFallbackOrigin).toString();
  }
};

export function buildTrustedBeautyCardFromRows(
  rows: PublicBeautyRow[],
  slug: string,
  language: ShareLanguage,
  selectedDate: unknown,
  publicOrigin: string,
): TelegramEventCardInput | null {
  const profileRows = rows.filter((item) => item.slug === slug);
  const row = profileRows[0];
  if (!row) return null;

  const date = normalizeDate(selectedDate, language);
  const services = profileRows
    .slice(0, 3)
    .map((item) => ({
      name: localizeBeautyServiceName(item.service_name, language),
      priceCzk: item.price_czk,
    }));
  const primaryService = services[0] || {
    name: localizeBeautyServiceName(row.service_name, language),
    priceCzk: row.price_czk,
  };
  const city = row.city_id === "olomouc" ? "Olomouc" : row.city_id;
  const description = (row.specialization || row.description || primaryService.name).trim();

  return {
    eventId: row.profile_id,
    title: primaryService.name,
    activity: row.display_name,
    description,
    date: date.display,
    eventDate: date.raw,
    time: "",
    address: row.public_location,
    participants: 0,
    capacity: 0,
    icon: "✨",
    inviteUrl: buildTelegramBeautyInviteUrl(row.slug),
    publicProfileUrl: buildPublicBeautyProfileUrl(publicOrigin, row.slug),
    beautyServices: services,
    city,
    organizer: row.display_name,
    durationMinutes: row.duration_minutes,
    price: primaryService.priceCzk,
    level: language === "cs" ? "Beauty služba" : language === "en" ? "Beauty service" : language === "uk" ? "Бʼюті-послуга" : "Бьюти-услуга",
    format: `${row.duration_minutes} min`,
    environment: row.public_location,
    isSport: false,
    language,
  };
}

export async function loadTrustedTelegramBeautyCard(
  slug: string,
  language: ShareLanguage,
  selectedDate: unknown,
  _selectedTime: unknown,
  publicOrigin: string,
): Promise<TelegramEventCardInput | null> {
  void _selectedTime;
  const client = db();
  const rows = await loadPublicBeautyRows(client, language);
  return buildTrustedBeautyCardFromRows(rows, slug, language, selectedDate, publicOrigin);
}

export const loadTrustedBeautyShareArtwork = async (profileId: string) =>
  loadBeautyShareArtwork(db(), profileId);
