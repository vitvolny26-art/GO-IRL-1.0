import type { MouseEvent, ReactNode } from "react";
import { Clock3, Info, ShieldCheck, Star, UserRoundCheck, UsersRound } from "lucide-react";
import type { EventInteractionState, EventInteractionStatus } from "../eventInteractionState";

type EventMetaChipProps = {
  icon: ReactNode;
  label: string;
  ariaLabel?: string;
  onClick?: () => void;
};

export function EventMetaChip({ icon, label, ariaLabel, onClick }: EventMetaChipProps) {