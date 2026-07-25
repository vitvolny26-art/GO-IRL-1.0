import { afterEach, describe, expect, it, vi } from "vitest";
import type { ProfileRepository } from "./profileRepository";
import {
  organizerInitials,
  resolveOrganizerIdentity,
  setOrganizerIdentityRepositoryForTests,
} from "./organizerIdentityResolver";

const createRepository = (overrides: Partial<ProfileRepository> = {}): ProfileRepository => ({
  loadOwnProfile: vi.fn(async () => null),
  loadPublicProfile: vi.fn(async () => null),
  loadPublicProfiles: vi.fn(async () => new Map()),
  saveOwnProfile: vi.fn(async () => { throw new Error("not used"); }),
  uploadAvatar: vi.fn(async () => ""),
  resolveAvatarUrl: vi.fn(async () => ""),
  ...overrides,
});

afterEach(() => {
  setOrganizerIdentityRepositoryForTests(null);
});

describe("organizer identity resolver", () => {
  it("batches card requests and prefers public profile identity", async () => {
    const loadPublicProfiles = vi.fn(async () => new Map([
      ["telegram:1", {
        userKey: "telegram:1",
        displayName: "Public One",
        bio: "Coffee organizer",
        cityId: "olomouc",
        avatarPath: null,
        avatarCode: "P1",
        favoriteActivityIds: [],
        updatedAt: "2026-07-19T00:00:00.000Z",
      }],
      ["telegram:2", null],
    ]));
    setOrganizerIdentityRepositoryForTests(createRepository({ loadPublicProfiles }));

    const [one, two] = await Promise.all([
      resolveOrganizerIdentity("telegram:1", "Old One"),
      resolveOrganizerIdentity("telegram:2", "Snapshot Two"),
    ]);

    expect(loadPublicProfiles).toHaveBeenCalledTimes(1);
    expect(loadPublicProfiles).toHaveBeenCalledWith(["telegram:1", "telegram:2"]);
    expect(one).toMatchObject({ displayName: "Public One", bio: "Coffee organizer", cityId: "olomouc", avatar: "P1" });
    expect(two).toMatchObject({ displayName: "Snapshot Two", bio: "", cityId: "", avatar: "ST" });
  });

  it("falls back to initials when signed avatar resolution fails", async () => {
    const repository = createRepository({
      loadPublicProfiles: vi.fn(async () => new Map([["telegram:1", {
        userKey: "telegram:1",
        displayName: "Avatar User",
        bio: "",
        cityId: "olomouc",
        avatarPath: "telegram:1/avatar.jpg",
        avatarCode: null,
        favoriteActivityIds: [],
        updatedAt: "2026-07-19T00:00:00.000Z",
      }]])),
      resolveAvatarUrl: vi.fn(async () => { throw new Error("expired"); }),
    });
    setOrganizerIdentityRepositoryForTests(repository);

    const identity = await resolveOrganizerIdentity("telegram:1", "Snapshot");

    expect(identity.avatar).toBe("AU");
  });

  it("creates stable initials", () => {
    expect(organizerInitials("Vitalii Pashyn")).toBe("VP");
    expect(organizerInitials(" ")).toBe("GO");
  });
});
