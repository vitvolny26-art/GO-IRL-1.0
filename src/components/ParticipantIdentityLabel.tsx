import { useEffect, useState } from "react";
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

const isImageAvatar = (value: string) => value.startsWith("data:image/") || /^https?:\/\//.test(value);

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
  const NameTag = nameTag;

  return (
    <>
      <span className={avatarClassName} aria-hidden="true">{avatar}</span>
      <NameTag className={nameClassName}>{displayName}</NameTag>
    </>
  );
}
