const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const write = (relativePath, content) => fs.writeFileSync(path.join(root, relativePath), content, "utf8");

const countOccurrences = (content, value) => content.split(value).length - 1;

const replaceExact = (content, before, after, expected, label) => {
  if (!content.includes(before) && content.includes(after)) return content;
  const count = countOccurrences(content, before);
  if (count !== expected) {
    throw new Error(`${label}: expected ${expected} target(s), found ${count}`);
  }
  return content.split(before).join(after);
};

const appendOnce = (content, marker, block) => content.includes(marker)
  ? content
  : `${content.trimEnd()}\n\n${block.trim()}\n`;

const componentPath = "src/components/ParticipantIdentityLabel.tsx";
const componentContent = `import { useEffect, useState } from "react";
import {
  organizerInitials,
  resolveOrganizerIdentity,
  type OrganizerIdentity,
} from "../profile/organizerIdentityResolver";

type ParticipantIdentityLabelProps = {
  userKey: string;
  snapshotName?: string | null;
  avatarClassName: string;
  nameClassName?: string;
  nameTag?: "span" | "strong";
};

const isImageAvatar = (value: string) => value.startsWith("data:image/") || /^https?:\\/\\//.test(value);

const fallbackIdentity = (userKey: string, snapshotName?: string | null): OrganizerIdentity => {
  const displayName = snapshotName?.trim() || "GO IRL User";
  return {
    organizerKey: userKey,
    displayName,
    bio: "",
    cityId: "",
    avatar: organizerInitials(displayName),
  };
};

export function ParticipantIdentityLabel({
  userKey,
  snapshotName,
  avatarClassName,
  nameClassName,
  nameTag = "span",
}: ParticipantIdentityLabelProps) {
  const [identity, setIdentity] = useState<OrganizerIdentity>(() => fallbackIdentity(userKey, snapshotName));
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const fallback = fallbackIdentity(userKey, snapshotName);
    setIdentity(fallback);
    setAvatarFailed(false);

    void resolveOrganizerIdentity(userKey, fallback.displayName).then((nextIdentity) => {
      if (!active) return;
      setIdentity(nextIdentity);
      setAvatarFailed(false);
    });

    return () => {
      active = false;
    };
  }, [snapshotName, userKey]);

  const displayName = identity.displayName.trim() || snapshotName?.trim() || "GO IRL User";
  const initials = organizerInitials(displayName);
  const avatarIsImage = isImageAvatar(identity.avatar);
  const avatar = avatarIsImage && !avatarFailed
    ? <img src={identity.avatar} alt="" onError={() => setAvatarFailed(true)} />
    : avatarIsImage
      ? initials
      : identity.avatar || initials;
  const name = nameTag === "strong"
    ? <strong className={nameClassName}>{displayName}</strong>
    : <span className={nameClassName}>{displayName}</span>;

  return (
    <>
      <span className={avatarClassName} aria-hidden="true">{avatar}</span>
      {name}
    </>
  );
}
`;
write(componentPath, componentContent);

const resolverPath = "src/profile/organizerIdentityResolver.ts";
let resolver = read(resolverPath);
resolver = replaceExact(
  resolver,
  "  const keys = requests.map((request) => request.organizerKey);",
  "  const keys = [...new Set(requests.map((request) => request.organizerKey).filter(Boolean))];",
  1,
  resolverPath,
);
write(resolverPath, resolver);

const appPath = "src/App.tsx";
let app = read(appPath);
app = replaceExact(
  app,
  'import { ActivityChatPanel } from "./components/ActivityChatPanel";',
  'import { ActivityChatPanel } from "./components/ActivityChatPanel";\nimport { ParticipantIdentityLabel } from "./components/ParticipantIdentityLabel";',
  1,
  `${appPath} import`,
);
app = replaceExact(
  app,
  '<span className="sport-card-member-avatar">{member.name?.slice(0, 2).toUpperCase() || "GO"}</span>\n              <span className="sport-card-member-name">{member.name || "GO IRL User"}</span>',
  '<ParticipantIdentityLabel\n                userKey={member.userKey}\n                snapshotName={member.name}\n                avatarClassName="sport-card-member-avatar"\n                nameClassName="sport-card-member-name"\n              />',
  1,
  `${appPath} card preview`,
);
app = replaceExact(
  app,
  '<span className="member-avatar">{member.name.slice(0, 2).toUpperCase()}</span>\n                  <strong>{member.name}</strong>',
  '<ParticipantIdentityLabel\n                    userKey={member.userKey}\n                    snapshotName={member.name}\n                    avatarClassName="member-avatar"\n                    nameTag="strong"\n                  />',
  3,
  `${appPath} member rows`,
);
write(appPath, app);

const sportPath = "src/verticals/SportVertical.tsx";
let sport = read(sportPath);
sport = replaceExact(
  sport,
  'import { ActivityChatPanel } from "../components/ActivityChatPanel";',
  'import { ActivityChatPanel } from "../components/ActivityChatPanel";\nimport { ParticipantIdentityLabel } from "../components/ParticipantIdentityLabel";',
  1,
  `${sportPath} import`,
);
sport = replaceExact(
  sport,
  '<span className="sport-card-member-avatar">\n                  {member.name?.slice(0, 2).toUpperCase() || "GO"}\n                </span>\n                <span className="sport-card-member-name">\n                  {member.name || "GO IRL User"}\n                </span>',
  '<ParticipantIdentityLabel\n                  userKey={member.userKey}\n                  snapshotName={member.name}\n                  avatarClassName="sport-card-member-avatar"\n                  nameClassName="sport-card-member-name"\n                />',
  1,
  `${sportPath} card preview`,
);
sport = replaceExact(
  sport,
  '<span className="member-avatar">{member.name.slice(0, 2).toUpperCase()}</span>\n                  <strong>{member.name}</strong>',
  '<ParticipantIdentityLabel\n                    userKey={member.userKey}\n                    snapshotName={member.name}\n                    avatarClassName="member-avatar"\n                    nameTag="strong"\n                  />',
  3,
  `${sportPath} member rows`,
);
write(sportPath, sport);

const chatPath = "src/components/ActivityChatPanel.tsx";
let chat = read(chatPath);
chat = replaceExact(
  chat,
  'import { isOutdoorGenericActivity } from "../eventWeather";',
  'import { isOutdoorGenericActivity } from "../eventWeather";\nimport { ParticipantIdentityLabel } from "./ParticipantIdentityLabel";',
  1,
  `${chatPath} import`,
);
chat = replaceExact(
  chat,
  '<div className="activity-chat-message-meta">\n                        <strong>{message.senderDisplayName || "GO IRL User"}</strong>\n                        <span>{formatCloseTime(message.createdAt)}</span>\n                      </div>',
  '<div className="activity-chat-message-meta">\n                        <div className="activity-chat-message-sender">\n                          <ParticipantIdentityLabel\n                            userKey={message.senderUserKey}\n                            snapshotName={message.senderDisplayName || "GO IRL User"}\n                            avatarClassName="activity-chat-message-avatar"\n                            nameTag="strong"\n                          />\n                        </div>\n                        <span>{formatCloseTime(message.createdAt)}</span>\n                      </div>',
  1,
  `${chatPath} sender identity`,
);
write(chatPath, chat);

const stylesPath = "src/styles.css";
let styles = read(stylesPath);
styles = appendOnce(styles, "/* PROFILE-005 participant and chat identity */", `
/* PROFILE-005 participant and chat identity */
.member-avatar,
.sport-card-member-avatar,
.activity-chat-message-avatar {
  flex: 0 0 auto;
  overflow: hidden;
}

.member-avatar img,
.sport-card-member-avatar img,
.activity-chat-message-avatar img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
}

.activity-chat-message-sender {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.activity-chat-message-avatar {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 8px;
  background: rgba(190, 255, 46, 0.1);
  color: var(--accent, #bfff2e);
  font-size: 10px;
  font-weight: 900;
}

.activity-chat-message-sender strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
`);
write(stylesPath, styles);

const testPath = "src/profile/organizerIdentityResolver.test.ts";
let test = read(testPath);
const testMarker = '  it("deduplicates participant and chat keys before batch profile read"';
if (!test.includes(testMarker)) {
  const insertionPoint = '  it("creates stable initials", () => {';
  if (!test.includes(insertionPoint)) {
    throw new Error(`${testPath}: insertion point not found`);
  }
  const testBlock = `  it("deduplicates participant and chat keys before batch profile read", async () => {
    const loadPublicProfiles = vi.fn(async () => new Map([["telegram:1", null]]));
    setOrganizerIdentityRepositoryForTests(createRepository({ loadPublicProfiles }));

    const [participant, message] = await Promise.all([
      resolveOrganizerIdentity("telegram:1", "Member Snapshot"),
      resolveOrganizerIdentity("telegram:1", "Chat Snapshot"),
    ]);

    expect(loadPublicProfiles).toHaveBeenCalledTimes(1);
    expect(loadPublicProfiles).toHaveBeenCalledWith(["telegram:1"]);
    expect(participant.displayName).toBe("Member Snapshot");
    expect(message.displayName).toBe("Chat Snapshot");
  });

`;
  test = test.replace(insertionPoint, `${testBlock}${insertionPoint}`);
}
write(testPath, test);

console.log("PROFILE-005 participant/chat identity patch applied.");
