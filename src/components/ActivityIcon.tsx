import { getActivityIconAsset, getCategoryIconAsset } from "../activityIconAssets";

type Props = {
  emoji?: string;
  categoryId?: string;
  label?: string;
  className?: string;
};

export function ActivityIcon({ emoji = "", categoryId, label = "", className = "" }: Props) {
  const src = categoryId ? getCategoryIconAsset(categoryId) : getActivityIconAsset(emoji, label);
  const classes = ["activity-3d-icon", className].filter(Boolean).join(" ");

  if (!src) {
    return <span className={`${classes} activity-3d-icon-fallback`} aria-hidden="true">{emoji || "✨"}</span>;
  }

  return <img className={classes} src={src} alt={label} decoding="async" loading="lazy" />;
}
