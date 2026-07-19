import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { Clock3, Info, ShieldCheck, Star, UserRoundCheck, UsersRound } from "lucide-react";
import type { EventInteractionState, EventInteractionStatus } from "../eventInteractionState";
import { getCurrentAuthIdentity } from "../authSession";
import { createProfileRepository } from "../profile/profileRepository";

type EventMetaChipProps = { icon: ReactNode; label: string; ariaLabel?: string; onClick?: () => void };

export function EventMetaChip({ icon, label, ariaLabel, onClick }: EventMetaChipProps) {
  if (onClick) return <button type="button" aria-label={ariaLabel} onClick={onClick}>{icon}<span>{label}</span></button>;
  return <div>{icon}<span>{label}</span></div>;
}

export const eventStatusTone = (state: EventInteractionState) => {
  if (state.status === "full" || state.status === "pending" || state.status === "waiting") return "warning";
  if (state.status === "finished" || state.status === "private") return "neutral";
  return "positive";
};

const statusIcon = (status: EventInteractionStatus) => {
  if (status === "joined") return <UserRoundCheck aria-hidden="true" />;
  if (status === "pending" || status === "waiting" || status === "finished") return <Clock3 aria-hidden="true" />;
  if (status === "full") return <UsersRound aria-hidden="true" />;
  if (status === "organizer" || status === "private") return <ShieldCheck aria-hidden="true" />;
  return <Star aria-hidden="true" />;
};

export function EventStatusBadge({ state, label }: { state: EventInteractionState; label: string }) {
  return <div className={`unified-status-cell event-status-badge tone-${eventStatusTone(state)}`}>{statusIcon(state.status)}<span>{label}</span></div>;
}

export function EventDetailsAction({ label, onClick }: { label: string; onClick: () => void }) {
  return <button className="sport-coach-action event-details-action" onClick={onClick} type="button"><Info aria-hidden="true" /> <span>{label}</span></button>;
}

type EventCardMetaItemProps = { icon: ReactNode; caption: string; value: string; ariaLabel?: string; onClick?: () => void };

export function EventCardMetaItem({ icon, caption, value, ariaLabel, onClick }: EventCardMetaItemProps) {
  const content = <>{icon}<span className="glass-event-card-meta-copy"><small>{caption}</small><strong>{value}</strong></span></>;
  if (onClick) return <button className="glass-event-card-meta-item" type="button" aria-label={ariaLabel} onClick={onClick}>{content}</button>;
  return <div className="glass-event-card-meta-item">{content}</div>;
}

export const organizerProfileEventName = "go-irl-open-organizer-profile";
export type OrganizerProfileDetail = { organizerKey: string; organizerName: string; avatar: string };

const initials = (name: string) => name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "GO";
export const isOrganizerAvatarImage = (avatar: string) => /^(data:image\/|https?:\/\/)/i.test(avatar);

export const resolveOrganizerAvatar = (_organizerKey: string, organizerName: string) => {
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem("go-irl-profile");
      const parsed = stored ? JSON.parse(stored) as { name?: unknown; avatar?: unknown } : null;
      const name = String(parsed?.name || "").trim();
      const avatar = String(parsed?.avatar || "").trim();
      if (name && name === organizerName.trim() && avatar) return avatar;
    } catch {
      // Use initials when profile storage is unavailable.
    }
  }
  return initials(organizerName);
};

export function OrganizerAvatarAction({ organizerKey, organizerName }: { organizerKey: string; organizerName: string }) {
  const [avatar, setAvatar] = useState(() => resolveOrganizerAvatar(organizerKey, organizerName));

  useEffect(() => {
    let active = true;
    const identity = getCurrentAuthIdentity();
    if (identity?.source !== "trusted-telegram" || identity.user.userKey !== organizerKey) return undefined;

    void (async () => {
      const { supabase } = await import("../supabase");
      const repository = createProfileRepository({
        identity,
        supabaseClient: supabase,
        storage: localStorage,
        fallbackDisplayName: organizerName,
        fallbackCityId: "olomouc",
      });
      const profile = await repository.loadOwnProfile();
      if (!profile) return;
      const resolved = profile.avatarPath
        ? await repository.resolveAvatarUrl(profile.avatarPath)
        : profile.avatarCode || initials(organizerName);
      if (active && resolved) setAvatar(resolved);
    })().catch(() => undefined);

    return () => { active = false; };
  }, [organizerKey, organizerName]);

  const openProfile = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    window.dispatchEvent(new CustomEvent<OrganizerProfileDetail>(organizerProfileEventName, { detail: { organizerKey, organizerName, avatar } }));
  };
  return (
    <button className="glass-event-card-meta-item organizer-avatar-action" type="button" aria-label={organizerName} onClick={openProfile}>
      <span className="organizer-avatar-thumb">{isOrganizerAvatarImage(avatar) ? <img src={avatar} alt="" /> : <span>{avatar}</span>}</span>
    </button>
  );
}
