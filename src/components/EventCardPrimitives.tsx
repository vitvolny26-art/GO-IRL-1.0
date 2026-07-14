import type { ReactNode } from "react";
import { Clock3, Info, ShieldCheck, Star, UserRoundCheck, UsersRound } from "lucide-react";
import type { EventInteractionState, EventInteractionStatus } from "../eventInteractionState";

type EventMetaChipProps = {
  icon: ReactNode;
  label: string;
  ariaLabel?: string;
  onClick?: () => void;
};

export function EventMetaChip({ icon, label, ariaLabel, onClick }: EventMetaChipProps) {
  if (onClick) {
    return <button type="button" aria-label={ariaLabel} onClick={onClick}>{icon}<span>{label}</span></button>;
  }
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
