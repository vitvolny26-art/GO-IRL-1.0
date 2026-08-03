import { createClient } from "@supabase/supabase-js";
import type { TelegramEventCardInput } from "./telegram-event-card.js";
import { readEnv } from "./env.js";
import { isShareLanguage, type ShareLanguage } from "./telegram-share-event.js";

const BEAUTY_SLUG_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

export const isBeautyShareSlug = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  const slug = value.trim().toLowerCase();
  return slug.length >= 3 && slug.length <= 48 && BEAUTY_SLUG_PATTERN.test(slug);
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

type PublicBeautyRow = {
  profile_id: string;
  slug: string;
  display_name: string;
  city_id: string;
  public_location: string;
  service_name: string;
  duration_minutes: number;
  price_czk: number;
  currency: string;
};

export async function loadTrustedTelegramBeautyCard(
  slug: string,
  language: ShareLanguage,
  selectedDate: unknown,
  _selectedTime: unknown,
  _publicOrigin: string,
): Promise<TelegramEventCardInput | null> {
  const client = db();
  const result = await client.rpc("go_irl_list_public_beauty_professionals", { p_requested_city_id: "olomouc" });
  if (result.error) throw result.error;
  const row = ((result.data || []) as PublicBeautyRow[]).find((item) => item.slug === slug);
  if (!row) return null;

  const date = normalizeDate(selectedDate, language);
  const serviceName = localizeBeautyServiceName(row.service_name, language);
  const city = row.city_id === "olomouc" ? "Olomouc" : row.city_id;

  return {
    eventId: row.profile_id,
    title: serviceName,
    activity: row.display_name,
    date: date.display,
    eventDate: date.raw,
    time: "",
    address: row.public_location,
    participants: 0,
    capacity: 0,
    icon: "✨",
    inviteUrl: buildTelegramBeautyInviteUrl(row.slug),
    city,
    organizer: row.display_name,
    durationMinutes: row.duration_minutes,
    price: row.price_czk,
    level: language === "cs" ? "Beauty služba" : language === "en" ? "Beauty service" : language === "uk" ? "Бʼюті-послуга" : "Бьюти-услуга",
    format: `${row.duration_minutes} min`,
    environment: row.public_location,
    isSport: false,
    language,
  };
}
