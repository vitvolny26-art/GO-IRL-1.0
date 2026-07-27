const fs = require('node:fs');

const read = (path) => fs.readFileSync(path, 'utf8');
const write = (path, content) => fs.writeFileSync(path, content, 'utf8');
const replaceOnce = (source, before, after, label) => {
  const first = source.indexOf(before);
  if (first < 0 || source.indexOf(before, first + before.length) >= 0) throw new Error(`replace failed: ${label}`);
  return source.slice(0, first) + after + source.slice(first + before.length);
};
const edit = (path, mutate) => {
  const before = read(path);
  const after = mutate(before);
  if (after === before) throw new Error(`unchanged: ${path}`);
  write(path, after);
  console.log(`updated ${path}`);
};

edit('src/verticals/SportVertical.tsx', (source) => {
  source = replaceOnce(
    source,
    'import { BellDot, CalendarDays, CalendarPlus, Check, ChevronRight, CircleUserRound, Clock3, Bug, Ellipsis, MapPin, Pencil, Share2, ShieldCheck, Sparkles, Ticket, Trash2, UsersRound, X } from "lucide-react";',
    'import { CalendarDays, CalendarPlus, Check, ChevronRight, CircleUserRound, Clock3, Bug, Ellipsis, MapPin, Pencil, Share2, ShieldCheck, Sparkles, Thermometer, Ticket, Trash2, Umbrella, UsersRound, Wind, X } from "lucide-react";',
    'sport imports',
  );
  source = replaceOnce(
    source,
    'const buildGoogleMapsSearchUrl = (query: string) =>\n  query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null;\n\nconst weatherSummaryLines = (weather: WeatherResult) => [\n  `🌡️ ${weather.temperature}°C`,\n  `☔ ${weather.rain}%`,\n  `💨 ${weather.wind} km/h`,\n];',
    `const buildGoogleMapsSearchUrl = (query: string) =>\n  query ? \`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(query)}\` : null;\n\nconst compactAddressLines = (address: string, cityName: string) => {\n  const city = cityName.trim().toLocaleLowerCase();\n  return address\n    .split(/\\r?\\n|,\\s*/)\n    .map((part) => part.trim())\n    .filter((part) => part && part.toLocaleLowerCase() !== city)\n    .slice(0, 2);\n};\n\nconst weatherSummaryLines = (weather: WeatherResult) => [\n  <span key="temperature"><Thermometer aria-hidden="true" /><span>{weather.temperature}°C</span></span>,\n  <span key="rain"><Umbrella aria-hidden="true" /><span>{weather.rain}%</span></span>,\n  <span key="wind"><Wind aria-hidden="true" /><span>{weather.wind} km/h</span></span>,\n];\n\nconst weatherSummaryText = (weather: WeatherResult) =>\n  [\`\${weather.temperature}°C\`, \`\${weather.rain}%\`, \`\${weather.wind} km/h\`].join(" · ");`,
    'weather helpers',
  );
  source = replaceOnce(source, '  const [membersPreviewOpen, setMembersPreviewOpen] = useState(false);\n', '', 'members preview state');
  source = replaceOnce(
    source,
    '  const joinedMembers = activity.members.filter(m => m.status === "joined");\n  const pendingRequestCount = isOrganizer\n    ? activity.members.filter((member) => member.status === "pending").length\n    : 0;\n',
    '',
    'card preview data',
  );
  source = replaceOnce(
    source,
    `        {pendingRequestCount > 0 ? (\n          <button\n            className="event-request-alert"\n            type="button"\n            aria-label={\`\${t.requests}: \${pendingRequestCount}\`}\n            onClick={() => onOpen(activity, { focusRequests: true })}\n          >\n            <BellDot aria-hidden="true" />\n            <span>{pendingRequestCount}</span>\n          </button>\n        ) : null}\n`,
    '',
    'duplicate request badge',
  );
  const oldCardChips = `      <div className="sport-chip-row">\n        {coachState === "confirmed" ? <span className="sport-card-chip"><Sparkles size={16} aria-hidden="true" /><span>{coachCardCopy[language].confirmed}</span></span> : null}\n        <button\n          className="sport-card-participants-chip"\n          type="button"\n          aria-label={\`\${t.participants}: \${activity.participants} / \${activity.capacity}\`}\n          aria-expanded={membersPreviewOpen}\n          onClick={(event) => {\n            event.preventDefault();\n            event.stopPropagation();\n            setMembersPreviewOpen(prev => !prev);\n          }}\n        >\n          <UsersRound size={16} aria-hidden="true" />\n          <span>{activity.participants} / {activity.capacity}</span>\n        </button>\n        {durationLabel ? <span className="sport-card-chip sport-duration-chip" aria-label={\`\${t.sportDuration}: \${durationLabel}\`}><CalendarPlus size={16} aria-hidden="true" /><span>{durationLabel}</span></span> : null}\n      </div>\n      {membersPreviewOpen && (\n        <div className="sport-card-members-preview">\n          {joinedMembers.length > 0 ? (\n            joinedMembers.map((member) => (\n              <div key={member.userKey} className="sport-card-member-preview-row">\n                <span className="sport-card-member-avatar">\n                  {member.name?.slice(0, 2).toUpperCase() || "GO"}\n                </span>\n                <span className="sport-card-member-name">\n                  {member.name || "GO IRL User"}\n                </span>\n              </div>\n            ))\n          ) : (\n            <div className="sport-card-members-empty">\n              {t.noParticipants || "Пока никого нет"}\n            </div>\n          )}\n        </div>\n      )}\n`;
  const newCardChips = `      <div className="sport-chip-row sport-card-taxonomy-chips">\n        <span className="sport-card-chip sport-level-chip">{sportLevelLabel(meta.level, language)}</span>\n        <span className="sport-card-chip sport-environment-chip">{sportEnvironmentLabel(meta.environment, language)}</span>\n        {durationLabel ? <span className="sport-card-chip sport-duration-chip">{durationLabel}</span> : null}\n      </div>\n`;
  source = replaceOnce(source, oldCardChips, newCardChips, 'card taxonomy chips');
  source = replaceOnce(
    source,
    '  const locationLabel = [cityName, activity.address].filter(Boolean).join(" · ");',
    '  const addressLines = compactAddressLines(activity.address, cityName);',
    'address lines',
  );
  source = replaceOnce(
    source,
    '          <div><MapPin /><span>{t.address}</span><a className="sport-address-link" href={activity.locationUrl || sportMapSearchUrl || "#"} target="_blank" rel="noreferrer">{locationLabel || cityName}</a></div>',
    '          <div className="sport-location-row"><MapPin /><a className="sport-location-block" href={activity.locationUrl || sportMapSearchUrl || "#"} target="_blank" rel="noreferrer"><span className="sport-location-city">{cityName}</span>{addressLines.map((line, index) => <span className="sport-location-address" key={`${line}-${index}`}>{line}</span>)}</a></div>',
    'address markup',
  );
  source = replaceOnce(
    source,
    `            <button className="weather-detail-toggle" onClick={() => setWeatherDetailsOpen((open) => !open)} type="button">\n              <span className="weather-condition-icon" aria-hidden="true">{weather?.icon || "🌤️"}</span>\n              <span>{t.weatherHint}</span>\n              <strong className="weather-summary-lines">\n                {weather ? weatherSummaryLines(weather).map((line) => <span key={line}>{line}</span>) : weatherText}\n              </strong>\n            </button>`,
    `            <button className="weather-detail-toggle weather-summary-toggle" onClick={() => setWeatherDetailsOpen((open) => !open)} type="button" aria-label={t.weatherHint}>\n              <strong className="weather-summary-lines">{weather ? weatherSummaryLines(weather) : weatherText}</strong>\n            </button>`,
    'weather summary',
  );
  source = replaceOnce(
    source,
    '              <strong>{weather ? weatherSummaryLines(weather).join(" · ") : weatherText}</strong>',
    '              <strong>{weather ? weatherSummaryText(weather) : weatherText}</strong>',
    'weather details heading',
  );
  source = replaceOnce(
    source,
    '                  <span className="weather-hour-metric">🌡️ {hour.temperature}°C</span>\n                  <span className="weather-hour-metric">☔ {hour.rain}%</span>\n                  <span className="weather-hour-metric">💨 {hour.wind} km/h</span>',
    '                  <span className="weather-hour-metric"><Thermometer aria-hidden="true" /><span>{hour.temperature}°C</span></span>\n                  <span className="weather-hour-metric"><Umbrella aria-hidden="true" /><span>{hour.rain}%</span></span>\n                  <span className="weather-hour-metric"><Wind aria-hidden="true" /><span>{hour.wind} km/h</span></span>',
    'hourly weather icons',
  );
  source = replaceOnce(
    source,
    '        {interaction.showHelperAction ? <CoachRequestPanel activity={activity} userRole={userRole} /> : null}\n\n        <button className="detail-members-toggle"',
    '        <section className="sport-community-block">\n        <button className="detail-members-toggle"',
    'community block start',
  );
  source = replaceOnce(
    source,
    '        <ActivityChatPanel activity={activity} openRequest={chatOpenRequest} showHelperAction={false} />\n\n        <div className="sheet-actions compact-sheet-actions">',
    '        <ActivityChatPanel activity={activity} openRequest={chatOpenRequest} showHelperAction={false} />\n        </section>\n\n        {interaction.showHelperAction ? <CoachRequestPanel activity={activity} userRole={userRole} /> : null}\n\n        <div className="sheet-actions compact-sheet-actions">',
    'community block end',
  );
  return source;
});

edit('api/_shared/telegram-share-card-svg.ts', (source) => {
  const start = source.indexOf('const weatherConditionIcon =');
  const end = source.indexOf('\nconst weatherBlock =', start);
  if (start < 0 || end < 0) throw new Error('weather condition helper');
  source = source.slice(0, start) + source.slice(end + 1);
  source = replaceOnce(
    source,
    '  return `<g font-family="DejaVu Sans, sans-serif" font-size="30" font-weight="800" fill="#f5f7f8">\n    ${weatherConditionIcon(weather.icon || "", 76, 462)}\n    ${weatherMetricIcon("temperature", 76, 520)}\n    <text x="132" y="551">${Math.round(weather.temperature)}°C</text>\n    ${weatherMetricIcon("rain", 76, 575)}\n    <text x="132" y="607">${Math.round(weather.rain)}%</text>\n    ${weatherMetricIcon("wind", 76, 630)}\n    <text x="132" y="662">${Math.round(weather.wind)} km/h</text>\n  </g>`;',
    '  return `<g data-weather-lines="three" font-family="DejaVu Sans, sans-serif" font-size="30" font-weight="800" fill="#f5f7f8">\n    ${weatherMetricIcon("temperature", 76, 470)}\n    <text x="132" y="502">${Math.round(weather.temperature)}°C</text>\n    ${weatherMetricIcon("rain", 76, 525)}\n    <text x="132" y="557">${Math.round(weather.rain)}%</text>\n    ${weatherMetricIcon("wind", 76, 580)}\n    <text x="132" y="612">${Math.round(weather.wind)} km/h</text>\n  </g>`;',
    'share weather block',
  );
  return source;
});

edit('api/_shared/telegram-share-card-svg.test.ts', (source) => {
  source = replaceOnce(
    source,
    '    expect(withWeather).toContain("6 km/h");',
    '    expect(withWeather).toContain("6 km/h");\n    expect(withWeather).toContain(\'data-weather-lines="three"\');\n    expect(withWeather).not.toContain("data-weather-condition");\n    expect(withWeather.match(/data-weather-icon=/g)).toHaveLength(3);',
    'telegram weather assertions',
  );
  source = replaceOnce(
    source,
    '    expect(svg).toContain("19 km/h");\n    expect(svg).not.toContain("data-event-artwork");',
    '    expect(svg).toContain("19 km/h");\n    expect(svg).toContain(\'data-weather-lines="three"\');\n    expect(svg).not.toContain("data-weather-condition");\n    expect(svg).not.toContain("data-event-artwork");',
    'meta weather assertions',
  );
  return source;
});

edit('api/meta/event-preview.ts', (source) => replaceOnce(source, '&v=6`', '&v=7`', 'preview cache version'));

edit('src/main.tsx', (source) => replaceOnce(
  source,
  'import "./sport-metadata-compact-location.css";',
  'import "./sport-metadata-compact-location.css";\nimport "./ui-scope-20260727.css";',
  'override import',
));

write('src/ui-scope-20260727.css', `
/* Event card: taxonomy chips and single chat badge. */
.compact-sport-card .sport-card-top-actions > .event-request-alert:not(.event-chat-unread-alert) { display: none !important; }
.compact-sport-card .sport-card-taxonomy-chips { position: relative !important; inset: auto !important; display: flex !important; flex-wrap: wrap !important; gap: 6px !important; width: 100% !important; margin: 12px 0 0 !important; }
.compact-sport-card .sport-card-taxonomy-chips .sport-card-chip { display: inline-flex !important; width: auto !important; min-width: 0 !important; min-height: 30px !important; padding: 5px 10px !important; align-items: center !important; border: 1px solid rgba(255,255,255,.16) !important; border-radius: 12px !important; background: rgba(10,14,16,.42) !important; color: rgba(255,255,255,.9) !important; font-size: 12px !important; font-weight: 850 !important; white-space: nowrap !important; }
.compact-sport-card .sport-card-taxonomy-chips .sport-card-chip:first-child { display: inline-flex !important; }
.compact-sport-card .event-chat-unread-alert span { top: 4px !important; right: 11px !important; }

/* Address: city + at most two address lines, plain visual treatment. */
.sport-sheet .sport-sheet-chips > span:nth-child(2), .sport-sheet .sport-sheet-chips > span:nth-child(3), .sport-sheet .sport-sheet-chips > span:nth-child(4) { display: inline-flex; align-items: center; min-height: 28px; padding: 4px 12px; border: 1px solid rgba(217,255,99,.38); border-radius: 999px; background: rgba(217,255,99,.1); color: #e8ff9f; font-size: .82rem; font-weight: 700; }
.sport-sheet .sport-detail-list > .sport-location-row { display: grid; grid-template-columns: 24px minmax(0,1fr); align-items: start; gap: 2px 10px; padding: 14px 0; background: transparent; }
.sport-sheet .sport-location-row > svg { margin-top: 2px; }
.sport-sheet .sport-location-block { display: grid; gap: 2px; width: 100%; min-width: 0; color: inherit; font: inherit; line-height: 1.35; text-decoration: none; }
.sport-sheet .sport-location-city, .sport-sheet .sport-location-address { display: block; min-width: 0; overflow-wrap: anywhere; }
.sport-sheet .sport-location-city { color: rgba(255,255,255,.92); font-weight: 800; }
.sport-sheet .sport-location-address { color: rgba(255,255,255,.74); font-weight: 650; }
.sport-sheet .sport-location-block:hover, .sport-sheet .sport-location-block:focus-visible { color: inherit; text-decoration: none; }

/* Weather: exactly three SVG metric rows. */
.weather-summary-toggle { display: block !important; width: 100% !important; padding: 12px 14px !important; text-align: left !important; }
.weather-summary-toggle .weather-summary-lines, .weather-summary-lines { display: grid !important; width: 100% !important; gap: 5px !important; justify-items: start !important; white-space: normal !important; }
.weather-summary-lines > span, .weather-hour-metric { display: inline-flex !important; min-width: 0; align-items: center; gap: 7px; white-space: nowrap !important; }
.weather-summary-lines svg, .weather-hour-metric svg { width: 17px; height: 17px; flex: 0 0 auto; color: var(--lime); }
.weather-summary-lines > span > span, .weather-hour-metric > span { white-space: nowrap !important; }

/* Organizer avatars: rounded rectangles everywhere. */
.organizer-avatar-thumb, .organizer-detail-avatar, .organizer-profile-avatar-large { border-radius: 16px !important; }

/* Event sheet community block and ordering. */
.activity-sheet .sport-community-block { display: flex; flex-direction: column; margin-top: 14px; overflow: hidden; border: 1px solid rgba(255,255,255,.1); border-radius: 18px; background: rgba(255,255,255,.025); }
.activity-sheet .sport-community-block > .detail-members-toggle { order: 1; }
.activity-sheet .sport-community-block > .members-section { order: 2; }
.activity-sheet .sport-community-block > .activity-chat-panel { order: 3; }
.activity-sheet .sport-community-block > .external-telegram-chat-panel { order: 4; }
.activity-sheet .sport-community-block > .confirmed-coach-chat-card, .activity-sheet .sport-community-block > .generic-weather-card { order: 5; }
.activity-sheet .sport-community-block > .detail-members-toggle, .activity-sheet .sport-community-block > .members-section, .activity-sheet .sport-community-block > .activity-chat-panel, .activity-sheet .sport-community-block > .external-telegram-chat-panel { width: 100%; margin: 0 !important; border: 0 !important; border-radius: 0 !important; background: transparent !important; box-shadow: none !important; }
.activity-sheet .sport-community-block > .members-section, .activity-sheet .sport-community-block > .activity-chat-panel, .activity-sheet .sport-community-block > .external-telegram-chat-panel { border-top: 1px solid rgba(255,255,255,.08) !important; }

/* Profile: title, user card, then navigation. */
.profile-page.profile-hub-enabled > .profile-hub-navigation { display: contents; }
.profile-page.profile-hub-enabled .profile-hub-navigation > header { order: -30; margin-bottom: 14px; }
.profile-page.profile-hub-enabled:not(.is-editing) > .profile-hero { position: relative; order: -20; display: flex !important; width: 100%; margin-bottom: 14px; padding-bottom: 66px; }
.profile-page.profile-hub-enabled .profile-hub-grid { order: -10; width: 100%; margin-bottom: 18px; }
.profile-page.profile-hub-enabled .profile-edit-button { position: absolute; right: 14px; bottom: 14px; display: inline-flex !important; width: auto !important; min-width: 0 !important; max-width: calc(100% - 28px); min-height: 38px; padding: 8px 12px !important; align-items: center; justify-content: center; gap: 6px; white-space: nowrap !important; }
.profile-page.profile-hub-enabled .profile-main { min-width: 0; padding-right: 0; }
`);
console.log('UI scope patch applied');
