import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { Clock3, Info, ShieldCheck, Star, UserRoundCheck, UsersRound } from "lucide-react";
import type { EventInteractionState, EventInteractionStatus } from "../eventInteractionState";
import { organizerInitials, resolveOrganizerIdentity, type OrganizerIdentity } from "../profile/organizerIdentityResolver";

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
export type OrganizerProfileDetail = OrganizerIdentity;

export const isOrganizerAvatarImage = (avatar: string) => /^(data:image\/|https?:\/\/)/i.test(avatar);
export const resolveOrganizerAvatar = (_organizerKey: string, organizerName: string) => organizerInitials(organizerName);

const fallbackOrganizerIdentity = (organizerKey: string, organizerName: string): OrganizerIdentity => ({
  organizerKey,
  displayName: organizerName,
  bio: "",
  cityId: "",
  avatar: organizerInitials(organizerName),
});

const dispatchOrganizerProfile = (identity: OrganizerIdentity) => {
  window.dispatchEvent(new CustomEvent<OrganizerProfileDetail>(organizerProfileEventName, { detail: identity }));
};

export function OrganizerAvatarAction({ organizerKey, organizerName }: { organizerKey: string; organizerName: string }) {
  const [identity, setIdentity] = useState<OrganizerIdentity>(() => fallbackOrganizerIdentity(organizerKey, organizerName));

  useEffect(() => {
    let active = true;
    void resolveOrganizerIdentity(organizerKey, organizerName).then((resolved) => {
      if (active) setIdentity(resolved);
    });
    return () => { active = false; };
  }, [organizerKey, organizerName]);

  const openProfile = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dispatchOrganizerProfile(identity);
  };

  return (
    <button className="glass-event-card-meta-item organizer-avatar-action" type="button" aria-label={identity.displayName} onClick={openProfile}>
      <span className="organizer-avatar-thumb">{isOrganizerAvatarImage(identity.avatar) ? <img src={identity.avatar} alt="" /> : <span>{identity.avatar}</span>}</span>
    </button>
  );
}

export function OrganizerDetailAction({ organizerKey, organizerName, label }: { organizerKey: string; organizerName: string; label: string }) {
  const [identity, setIdentity] = useState<OrganizerIdentity>(() => fallbackOrganizerIdentity(organizerKey, organizerName));

  useEffect(() => {
    let active = true;
    void resolveOrganizerIdentity(organizerKey, organizerName).then((resolved) => {
      if (active) setIdentity(resolved);
    });
    return () => { active = false; };
  }, [organizerKey, organizerName]);

  return (
    <button className="organizer-detail-action" type="button" aria-label={`${label}: ${identity.displayName}`} onClick={() => dispatchOrganizerProfile(identity)}>
      <span className="organizer-detail-avatar">{isOrganizerAvatarImage(identity.avatar) ? <img src={identity.avatar} alt="" /> : identity.avatar}</span>
      <span>{label}</span>
      <strong>{identity.displayName}</strong>
    </button>
  );
}
