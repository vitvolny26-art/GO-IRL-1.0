import { afterEach, describe, expect, it } from "vitest";
import { isTrustedOrganizerAvatarUrl } from "./telegram-share-card-image";

const previousSupabaseUrl = process.env.SUPABASE_URL;

afterEach(() => {
  if (previousSupabaseUrl === undefined) delete process.env.SUPABASE_URL;
  else process.env.SUPABASE_URL = previousSupabaseUrl;
});

describe("organizer avatar URL trust", () => {
  it("accepts Telegram and the configured Supabase host only", () => {
    process.env.SUPABASE_URL = "https://project-ref.supabase.co";
    expect(isTrustedOrganizerAvatarUrl("https://t.me/i/userpic/320/example.jpg")).toBe(true);
    expect(isTrustedOrganizerAvatarUrl("https://project-ref.supabase.co/storage/v1/object/sign/avatars/example.jpg?token=x")).toBe(true);
    expect(isTrustedOrganizerAvatarUrl("https://evil.example/avatar.jpg")).toBe(false);
  });
});
