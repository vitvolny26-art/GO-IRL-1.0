import { describe, expect, it, vi } from "vitest";
import { buildProfileAvatarPath, isDataImageAvatar, profileAvatarExtension } from "./profileAvatar";

const fileLike = (name: string, type: string) => ({ name, type }) as File;

describe("profileAvatar", () => {
  it("detects data image avatars", () => {
    expect(isDataImageAvatar("data:image/png;base64,abc")).toBe(true);
    expect(isDataImageAvatar("GI")).toBe(false);
    expect(isDataImageAvatar("https://example.com/avatar.png")).toBe(false);
  });

  it("prefers safe mime extensions", () => {
    expect(profileAvatarExtension(fileLike("avatar.jpeg", "image/jpeg"))).toBe("jpg");
    expect(profileAvatarExtension(fileLike("avatar.png", "image/png"))).toBe("png");
    expect(profileAvatarExtension(fileLike("avatar.webp", "image/webp"))).toBe("webp");
  });

  it("falls back to sanitized file extension", () => {
    expect(profileAvatarExtension(fileLike("avatar.custom", "application/octet-stream"))).toBe("custom");
    expect(profileAvatarExtension(fileLike("avatar", "application/octet-stream"))).toBe("jpg");
  });

  it("builds a stable bucket path scoped by safe user key", () => {
    vi.stubGlobal("crypto", { randomUUID: () => "uuid-test" });

    expect(buildProfileAvatarPath("telegram:999999", fileLike("avatar.png", "image/png"))).toBe("telegram:999999/uuid-test.png");
    expect(buildProfileAvatarPath("bad/user key", fileLike("photo", "image/jpeg"), "manual-id")).toBe("bad_user_key/manual-id.jpg");

    vi.unstubAllGlobals();
  });
});
