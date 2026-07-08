const fs = require("fs");

const path = "src/verticals/SportVertical.tsx";
let code = fs.readFileSync(path, "utf8");

code = code.replace(
  `<span className="sport-card-chip"><Clock3 size={16} aria-hidden="true" /><span>{meta.durationMinutes || 90} {t.minutesShort}</span></span>`,
  `<span className="sport-card-chip"><CalendarPlus size={16} aria-hidden="true" /><span>{meta.durationMinutes || 90} {t.minutesShort}</span></span>`
);

code = code.replace(
  `<div><CalendarDays /><span>{compactDateLabel(activity.date, language)}</span></div>`,
  `<div><CalendarDays /><span>{compactDateLabel(activity.date, language)}{formatEventTime(activity.time) ? " · " + formatEventTime(activity.time) : ""}</span></div>`
);

fs.writeFileSync(path, code);
