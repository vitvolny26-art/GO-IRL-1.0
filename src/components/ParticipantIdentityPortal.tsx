import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { stripLeadingEmoji } from "../cardText";
import { useAppStore } from "../store";
import type { Activity, ActivityMember } from "../types";
import { ParticipantIdentityLabel } from "./ParticipantIdentityLabel";

type PortalRow = {
  key: string;
  target: HTMLElement;
  avatar: HTMLElement;
  name: HTMLElement;
  member: ActivityMember;
  avatarClassName: string;
  nameClassName?: string;
  nameTag: "span" | "strong";
};

const normalize = (value: string | null | undefined) => stripLeadingEmoji(String(value || "")).trim();

const findActivityForCard = (row: HTMLElement, activities: Activity[]) => {
  const card = row.closest<HTMLElement>(".activity-card");
  const title = normalize(card?.querySelector("h3")?.textContent);
  if (!title) return null;
  return activities.find((activity) => Object.values(activity.activity).some((value) => normalize(value) === title)) || null;
};

const findActivityForSheet = (row: HTMLElement, activities: Activity[]) => {
  const sheet = row.closest<HTMLElement>(".activity-sheet");
  const title = normalize(sheet?.querySelector("h2")?.textContent);
  if (!title) return null;
  return activities.find((activity) => Object.values(activity.title).some((value) => normalize(value) === title)) || null;
};

const findMember = (row: HTMLElement, activities: Activity[]) => {
  const activity = row.closest(".activity-sheet")
    ? findActivityForSheet(row, activities)
    : findActivityForCard(row, activities);
  const snapshotName = row.querySelector<HTMLElement>(".sport-card-member-name, strong")?.textContent?.trim() || "";
  return activity?.members.find((member) => member.name.trim() === snapshotName) || null;
};

export function ParticipantIdentityPortal() {
  const activities = useAppStore((state) => state.activities);
  const [rows, setRows] = useState<PortalRow[]>([]);
  const activityVersion = useMemo(() => activities.map((activity) => `${activity.id}:${activity.members.length}`).join("|"), [activities]);

  useEffect(() => {
    const refresh = () => {
      const candidates = Array.from(document.querySelectorAll<HTMLElement>(
        ".sport-card-member-preview-row, .members-list .member-row",
      ));
      const next: PortalRow[] = [];

      candidates.forEach((row, index) => {
        if (row.dataset.profileIdentityPortal === "1") return;
        const avatar = row.querySelector<HTMLElement>(".sport-card-member-avatar, .member-avatar");
        const name = row.querySelector<HTMLElement>(".sport-card-member-name, :scope > strong");
        const member = findMember(row, activities);
        if (!avatar || !name || !member) return;

        const target = document.createElement("span");
        target.className = "participant-identity-portal-slot";
        row.insertBefore(target, avatar);
        avatar.classList.add("participant-identity-legacy-hidden");
        name.classList.add("participant-identity-legacy-hidden");
        row.dataset.profileIdentityPortal = "1";
        next.push({
          key: `${member.userKey}:${index}:${member.status}`,
          target,
          avatar,
          name,
          member,
          avatarClassName: avatar.className.replace("participant-identity-legacy-hidden", "").trim(),
          nameClassName: name.className.replace("participant-identity-legacy-hidden", "").trim() || undefined,
          nameTag: name.tagName.toLowerCase() === "strong" ? "strong" : "span",
        });
      });

      if (next.length) setRows((current) => [...current.filter((item) => item.target.isConnected), ...next]);
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      setRows((current) => {
        current.forEach((item) => {
          item.target.remove();
          item.avatar.classList.remove("participant-identity-legacy-hidden");
          item.name.classList.remove("participant-identity-legacy-hidden");
          item.avatar.closest<HTMLElement>("[data-profile-identity-portal]")?.removeAttribute("data-profile-identity-portal");
        });
        return [];
      });
    };
  }, [activities, activityVersion]);

  return rows.map((row) => createPortal(
    <ParticipantIdentityLabel
      userKey={row.member.userKey}
      snapshotName={row.member.name}
      avatarClassName={row.avatarClassName}
      nameClassName={row.nameClassName}
      nameTag={row.nameTag}
    />,
    row.target,
    row.key,
  ));
}
