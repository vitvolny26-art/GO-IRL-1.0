import type { Language } from "../types";
import { getCurrentAuthIdentity, getCurrentUserRole, isBrowserMockMode } from "../authSession";
import { supabase } from "../supabase";
import {
  resolveBeautyLocalizedText,
  type BeautyLocalizedText,
  type BeautyWorkspace,
} from "./beautySetupModel";
import { buildBeautyPublicLink, isValidBeautyPublicSlug, normalizeBeautyPublicSlug } from "./beautyPublicSlug";
import {
  loadLocalBeautyWorkspace,
  resetLocalBeautyWorkspace,
  saveLocalBeautyWorkspace,
} from "./beautyWorkspaceLocalStorage";

type BeautyProfileRow = {
  profile_id: string;
  slug: string;
  city_id: string;
  display_name: string;
  public_location: string;
  contact: string;
  exact_address: string;
  publication_state: "draft" | "published" | "hidden";
  service_name: string;
  duration_minutes: number;
  price_czk: number;
  currency: "CZK";
  updated_at: string;
  description_i18n?: Partial<BeautyLocalizedText> | null;
  service_name_i18n?: Partial<BeautyLocalizedText> | null;
};

type BeautyProfileSaveRow = {
  status: "saved" | "conflict";
  profile_id: string;
  slug: string;
  publication_state: "draft" | "published" | "hidden";
  updated_at: string;
};

type BeautySlugUpdateRow = {
  status: "saved" | "slug_taken" | "profile_missing" | "invalid_slug";
  public_slug: string;
  updated_at: string | null;
};

type RpcError = { code?: string; message?: string } | null;

let expectedServerUpdatedAt: string | null = null;

const usesTrustedBeautyStorage = () => {
  const identity = getCurrentAuthIdentity();
  return !isBrowserMockMode()
    && identity?.source === "trusted-telegram"
    && getCurrentUserRole() === "professional";
};

const isMissingRpc = (error: RpcError) => error?.code === "PGRST202"
  || Boolean(error?.message?.includes("Could not find the function"));

const normalizeTranslations = (
  value: Partial<BeautyLocalizedText> | null | undefined,
  fallback: BeautyLocalizedText,
): BeautyLocalizedText => ({
  ru: value?.ru?.trim() || fallback.ru,
  uk: value?.uk?.trim() || fallback.uk,
  cs: value?.cs?.trim() || fallback.cs,
  en: value?.en?.trim() || fallback.en,
});

const mapServerProfile = (base: BeautyWorkspace, row: BeautyProfileRow, language: Language): BeautyWorkspace => {
  const descriptionByLanguage = normalizeTranslations(row.description_i18n, base.profile.descriptionByLanguage);
  const nameByLanguage = normalizeTranslations(row.service_name_i18n, {
    ...base.service.nameByLanguage,
    [language]: row.service_name,
  });
  return {
    ...base,
    published: row.publication_state === "published",
    currentStep: row.publication_state === "published" ? "pro_setup_published" : base.currentStep,
    updatedAt: row.updated_at,
    publicLink: `/beauty/${row.slug}`,
    profile: {
      ...base.profile,
      displayName: row.display_name,
      city: "Olomouc",
      publicLocation: row.public_location,
      contact: row.contact,
      exactAddress: row.exact_address,
      description: resolveBeautyLocalizedText(descriptionByLanguage, language, base.profile.description),
      descriptionByLanguage,
    },
    service: {
      ...base.service,
      name: resolveBeautyLocalizedText(nameByLanguage, language, row.service_name),
      nameByLanguage,
      durationMinutes: row.duration_minutes,
      priceCzk: row.price_czk,
    },
  };
};

const getMyBeautyProfile = async () => {
  const localized = await supabase.rpc("get_my_beauty_profile_v2");
  if (!localized.error) return localized;
  if (!isMissingRpc(localized.error)) return localized;
  return supabase.rpc("get_my_beauty_profile");
};

export const loadBeautyWorkspace = async (language: Language = "en"): Promise<BeautyWorkspace> => {
  const local = await loadLocalBeautyWorkspace(language);
  if (!usesTrustedBeautyStorage()) return local;

  const result = await getMyBeautyProfile();
  if (result.error) throw result.error;
  const row = (Array.isArray(result.data) ? result.data[0] : result.data) as BeautyProfileRow | undefined;
  if (!row) {
    expectedServerUpdatedAt = null;
    return { ...local, published: false };
  }

  expectedServerUpdatedAt = row.updated_at;
  const workspace = mapServerProfile(local, row, language);
  await saveLocalBeautyWorkspace(workspace);
  return workspace;
};

const saveLegacyBeautyWorkspace = (workspace: BeautyWorkspace) => supabase.rpc("save_my_beauty_profile", {
  p_display_name: workspace.profile.displayName,
  p_public_location: workspace.profile.publicLocation,
  p_contact: workspace.profile.contact,
  p_exact_address: workspace.profile.exactAddress,
  p_service_name: workspace.service.name,
  p_duration_minutes: workspace.service.durationMinutes,
  p_price_czk: workspace.service.priceCzk,
  p_publication_state: workspace.published ? "published" : "draft",
  p_expected_updated_at: expectedServerUpdatedAt,
});

export const saveBeautyWorkspace = async (workspace: BeautyWorkspace) => {
  await saveLocalBeautyWorkspace(workspace);
  if (!usesTrustedBeautyStorage()) return;

  const localizedResult = await supabase.rpc("save_my_beauty_profile_v2", {
    p_display_name: workspace.profile.displayName,
    p_public_location: workspace.profile.publicLocation,
    p_contact: workspace.profile.contact,
    p_exact_address: workspace.profile.exactAddress,
    p_description_i18n: workspace.profile.descriptionByLanguage,
    p_service_name_i18n: workspace.service.nameByLanguage,
    p_duration_minutes: workspace.service.durationMinutes,
    p_price_czk: workspace.service.priceCzk,
    p_publication_state: workspace.published ? "published" : "draft",
    p_expected_updated_at: expectedServerUpdatedAt,
  });
  const result = localizedResult.error && isMissingRpc(localizedResult.error)
    ? await saveLegacyBeautyWorkspace(workspace)
    : localizedResult;
  if (result.error) throw result.error;

  const row = (Array.isArray(result.data) ? result.data[0] : result.data) as BeautyProfileSaveRow | undefined;
  if (!row) throw new Error("beauty_profile_save_empty_response");
  if (row.status === "conflict") throw new Error("beauty_profile_conflict");
  expectedServerUpdatedAt = row.updated_at;
};

export const updateBeautyPublicSlug = async (workspace: BeautyWorkspace, requestedSlug: string) => {
  const slug = normalizeBeautyPublicSlug(requestedSlug);
  if (!isValidBeautyPublicSlug(slug)) throw new Error("beauty_slug_invalid");

  if (!usesTrustedBeautyStorage()) {
    const localWorkspace = { ...workspace, publicLink: buildBeautyPublicLink(slug) };
    await saveLocalBeautyWorkspace(localWorkspace);
    return localWorkspace;
  }

  const result = await supabase.rpc("update_my_beauty_slug", { p_slug: slug });
  if (result.error) throw result.error;
  const row = (Array.isArray(result.data) ? result.data[0] : result.data) as BeautySlugUpdateRow | undefined;
  if (!row) throw new Error("beauty_slug_update_empty_response");
  if (row.status === "slug_taken") throw new Error("beauty_slug_taken");
  if (row.status === "invalid_slug") throw new Error("beauty_slug_invalid");
  if (row.status === "profile_missing") throw new Error("beauty_profile_missing");

  expectedServerUpdatedAt = row.updated_at;
  const updatedWorkspace = {
    ...workspace,
    publicLink: buildBeautyPublicLink(row.public_slug),
    updatedAt: row.updated_at || workspace.updatedAt,
  };
  await saveLocalBeautyWorkspace(updatedWorkspace);
  return updatedWorkspace;
};

export const resetBeautyWorkspace = async () => {
  await resetLocalBeautyWorkspace();
};