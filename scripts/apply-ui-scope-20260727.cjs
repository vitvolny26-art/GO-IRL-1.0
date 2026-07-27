const fs=require('node:fs');
const r=p=>fs.readFileSync(p,'utf8');
const w=(p,s)=>fs.writeFileSync(p,s,'utf8');
const once=(s,a,b,n)=>{const i=s.indexOf(a);if(i<0||s.indexOf(a,i+a.length)>=0)throw Error(`target:${n}`);return s.slice(0,i)+b+s.slice(i+a.length)};
const rx=(s,a,b,n)=>{const g=new RegExp(a.source,a.flags.includes('g')?a.flags:a.flags+'g');if([...s.matchAll(g)].length!==1)throw Error(`regex:${n}`);return s.replace(a,b)};
const edit=(p,f)=>{const a=r(p),b=f(a);if(a===b)throw Error(`unchanged:${p}`);w(p,b);console.log(p)};
const add=(s,m,b)=>{if(s.includes(m))throw Error(`exists:${m}`);return s.trimEnd()+`\n\n${b.trim()}\n`};

edit('src/verticals/SportVertical.tsx',s=>{
 s=once(s,'import { BellDot, CalendarDays, CalendarPlus, Check, ChevronRight, CircleUserRound, Clock3, Bug, Ellipsis, MapPin, Pencil, Share2, ShieldCheck, Sparkles, Ticket, Trash2, UsersRound, X } from "lucide-react";','import { CalendarDays, CalendarPlus, Check, ChevronRight, CircleUserRound, Clock3, Bug, Ellipsis, MapPin, Pencil, Share2, ShieldCheck, Sparkles, Thermometer, Ticket, Trash2, Umbrella, UsersRound, Wind, X } from "lucide-react";','imports');
 s=once(s,'const weatherSummaryLines = (weather: WeatherResult) => [\n  `🌡️ ${weather.temperature}°C`,\n  `☔ ${weather.rain}%`,\n  `💨 ${weather.wind} km/h`,\n];',`const weatherSummaryLines = (weather: WeatherResult) => [
  <span key="temperature"><Thermometer aria-hidden="true" /><span>{weather.temperature}°C</span></span>,
  <span key="rain"><Umbrella aria-hidden="true" /><span>{weather.rain}%</span></span>,
  <span key="wind"><Wind aria-hidden="true" /><span>{weather.wind} km/h</span></span>,
];
const weatherSummaryText = (weather: WeatherResult) =>
  [\`${weather.temperature}°C\`, \`${weather.rain}%\`, \`${weather.wind} km/h\`].join(" · ");`,'weather');
 s=once(s,'const buildGoogleMapsSearchUrl = (query: string) =>\n  query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null;',`const buildGoogleMapsSearchUrl = (query: string) =>
  query ? \`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}\` : null;
const escapeRegExp = (value: string) => value.replace(/[.*+?^$()|[\\]\\\\]/g, "\\\\$&");
const compactAddressLines = (address: string, cityName: string) => {
  const city = cityName.trim() ? new RegExp(escapeRegExp(cityName.trim()), "giu") : null;
  return address.split(/\\r?\\n|,\\s*/).map(part => city ? part.replace(city, "") : part)
    .map(part => part.replace(/^[\\s,·–—-]+|[\\s,·–—-]+$/g, "").trim()).filter(Boolean).slice(0, 2);
};`,'address-helper');
 s=once(s,'  const [membersPreviewOpen, setMembersPreviewOpen] = useState(false);\n','','preview-state');
 s=once(s,'  const joinedMembers = activity.members.filter(m => m.status === "joined");\n  const pendingRequestCount = isOrganizer\n    ? activity.members.filter((member) => member.status === "pending").length\n    : 0;\n','','badge-data');
 s=rx(s,/        \{pendingRequestCount > 0 \? \([\s\S]*?        \) : null\}\n/,'','badge');
 s=rx(s,/      <div className="sport-chip-row">[\s\S]*?      <EventWeatherStrip/,`      <div className="sport-chip-row" aria-label={\`${sportLevelLabel(meta.level, language)} | ${sportEnvironmentLabel(meta.environment, language)} | ${durationLabel}\`}>
        <span className="sport-card-chip sport-level-chip">{sportLevelLabel(meta.level, language)}</span>
        <span className="sport-card-chip sport-environment-chip">{sportEnvironmentLabel(meta.environment, language)}</span>
        {durationLabel ? <span className="sport-card-chip sport-duration-chip">{durationLabel}</span> : null}
      </div>
      <EventWeatherStrip`,'chips');
 s=once(s,'  const locationLabel = [cityName, activity.address].filter(Boolean).join(" · ");','  const addressLines = compactAddressLines(activity.address, cityName);','address-lines');
 s=once(s,'          <div><MapPin /><span>{t.address}</span><a className="sport-address-link" href={activity.locationUrl || sportMapSearchUrl || "#"} target="_blank" rel="noreferrer">{locationLabel || cityName}</a></div>',`          <div className="sport-location-row"><MapPin /><a className="sport-location-block" href={activity.locationUrl || sportMapSearchUrl || "#"} target="_blank" rel="noreferrer"><span className="sport-location-city">{cityName}</span>{addressLines.map((line, index) => <span className="sport-location-address" key={\`${line}-${index}\`}>{line}</span>)}</a></div>`,'address-markup');
 s=rx(s,/            <button className="weather-detail-toggle" onClick=\{\(\) => setWeatherDetailsOpen\(\(open\) => !open\)\} type="button">[\s\S]*?            <\/button>/,`            <button className="weather-detail-toggle weather-summary-toggle" onClick={() => setWeatherDetailsOpen((open) => !open)} type="button" aria-label={t.weatherHint}>
              <strong className="weather-summary-lines">{weather ? weatherSummaryLines(weather) : weatherText}</strong>
            </button>`,'weather-block');
 s=once(s,'              <strong>{weather ? weatherSummaryLines(weather).join(" · ") : weatherText}</strong>','              <strong>{weather ? weatherSummaryText(weather) : weatherText}</strong>','weather-head');
 s=once(s,'                  <span className="weather-hour-metric">🌡️ {hour.temperature}°C</span>\n                  <span className="weather-hour-metric">☔ {hour.rain}%</span>\n                  <span className="weather-hour-metric">💨 {hour.wind} km/h</span>','                  <span className="weather-hour-metric"><Thermometer aria-hidden="true" /><span>{hour.temperature}°C</span></span>\n                  <span className="weather-hour-metric"><Umbrella aria-hidden="true" /><span>{hour.rain}%</span></span>\n                  <span className="weather-hour-metric"><Wind aria-hidden="true" /><span>{hour.wind} km/h</span></span>','hour-weather');
 s=once(s,'        {interaction.showHelperAction ? <CoachRequestPanel activity={activity} userRole={userRole} /> : null}\n\n        <button className="detail-members-toggle"','        <section className="sport-community-block">\n        <button className="detail-members-toggle"','community-start');
 s=once(s,'        <ActivityChatPanel activity={activity} openRequest={chatOpenRequest} showHelperAction={false} />\n\n        <div className="sheet-actions compact-sheet-actions">','        <ActivityChatPanel activity={activity} openRequest={chatOpenRequest} showHelperAction={false} />\n        </section>\n\n        {interaction.showHelperAction ? <CoachRequestPanel activity={activity} userRole={userRole} /> : null}\n\n        <div className="sheet-actions compact-sheet-actions">','community-end');
 return s;
});

edit('src/components/ActivityChatPanel.tsx',s=>{
 s=once(s,'export function ActivityChatPanel({ activity, openRequest = 0 }: ActivityChatPanelProps) {','export function ActivityChatPanel({ activity, openRequest = 0, showHelperAction = true }: ActivityChatPanelProps) {','chat-prop');
 s=once(s,'      {showOutdoorWeather ? <OutdoorWeatherPanel activity={activity} /> : null}\n      {confirmedCoach ? <ConfirmedCoachBesideChat presentation={confirmedCoach} /> : null}\n      <ExternalTelegramChatPanel activity={activity} />\n\n      <section className="activity-chat-panel" ref={panelRef}>','      {showOutdoorWeather ? <OutdoorWeatherPanel activity={activity} /> : null}\n      <section className="activity-chat-panel" ref={panelRef}>','chat-order-start');
 s=once(s,'      </section>\n    </>\n  );\n}','      </section>\n      <ExternalTelegramChatPanel activity={activity} />\n      {showHelperAction && confirmedCoach ? <ConfirmedCoachBesideChat presentation={confirmedCoach} /> : null}\n    </>\n  );\n}','chat-order-end');
 return s;
});

edit('src/compact-sport-card.css',s=>add(s,'/* ui-scope-20260727-card */',`
/* ui-scope-20260727-card */
.compact-sport-card .sport-chip-row{position:relative!important;top:auto!important;right:auto!important;display:flex!important;flex-wrap:wrap!important;gap:6px!important;width:100%!important;margin:12px 0 0!important}
.compact-sport-card .sport-chip-row .sport-card-chip{display:inline-flex!important;width:auto!important;min-width:0!important;min-height:30px!important;padding:5px 10px!important;align-items:center!important;border:1px solid rgba(255,255,255,.16)!important;border-radius:12px!important;background:rgba(10,14,16,.42)!important;color:rgba(255,255,255,.9)!important;font-size:12px!important;font-weight:850!important;white-space:nowrap!important}
.compact-sport-card .sport-chip-row .sport-card-chip:first-child{display:inline-flex!important}
.compact-sport-card .event-chat-unread-alert span{top:4px!important;right:11px!important}
.compact-sport-card .activity-card-details.sport-details-grid>.organizer-avatar-action{display:flex!important;grid-template-columns:none!important;grid-template-rows:none!important;align-items:center!important;justify-content:center!important}
.compact-sport-card .activity-card-details.sport-details-grid>.organizer-avatar-action::after,.compact-sport-card .organizer-avatar-thumb::before{content:none!important;display:none!important}
.compact-sport-card .organizer-avatar-thumb{display:grid!important;width:44px!important;height:44px!important;grid-column:auto!important;grid-row:auto!important;place-items:center!important;border-radius:12px!important;font-size:13px!important;line-height:1!important}
`));
edit('src/sport-metadata-compact-location.css',s=>add(s,'/* ui-scope-20260727-location */',`
/* ui-scope-20260727-location */
.sport-sheet .sport-sheet-chips>span:nth-child(2),.sport-sheet .sport-sheet-chips>span:nth-child(3),.sport-sheet .sport-sheet-chips>span:nth-child(4){display:inline-flex;align-items:center;min-height:28px;padding:4px 12px;border:1px solid rgba(217,255,99,.38);border-radius:999px;background:rgba(217,255,99,.1);color:#e8ff9f;font-size:.82rem;font-weight:700}
.sport-sheet .sport-detail-list>.sport-location-row{display:grid;grid-template-columns:24px minmax(0,1fr);align-items:start;gap:2px 10px;padding:14px 0;background:transparent}
.sport-sheet .sport-location-row>svg{margin-top:2px}.sport-sheet .sport-location-block{display:grid;gap:2px;width:100%;min-width:0;color:inherit;font:inherit;line-height:1.35;text-decoration:none}
.sport-sheet .sport-location-city,.sport-sheet .sport-location-address{display:block;min-width:0;overflow-wrap:anywhere}.sport-sheet .sport-location-city{color:rgba(255,255,255,.92);font-weight:800}.sport-sheet .sport-location-address{color:rgba(255,255,255,.74);font-weight:650}
.sport-sheet .sport-location-block:hover,.sport-sheet .sport-location-block:focus-visible{color:inherit;text-decoration:none}
`));
edit('src/weather-ui-fixes.css',s=>add(s,'/* ui-scope-20260727-weather */',`
/* ui-scope-20260727-weather */
.weather-summary-toggle{display:block!important;width:100%!important;padding:12px 14px!important;text-align:left!important}.weather-summary-toggle .weather-summary-lines,.weather-summary-lines{display:grid!important;width:100%!important;gap:5px!important;justify-items:start!important;white-space:normal!important}
.weather-summary-lines>span,.weather-hour-metric{display:inline-flex!important;min-width:0;align-items:center;gap:7px;white-space:nowrap!important}.weather-summary-lines svg,.weather-hour-metric svg{width:17px;height:17px;flex:0 0 auto;color:var(--lime)}.weather-summary-lines>span>span,.weather-hour-metric>span{white-space:nowrap!important}
`));
edit('src/organizer-event-details.css',s=>once(s,'  border-radius: 50% !important;','  border-radius: 12px !important;','sheet-avatar'));
edit('src/glass-event-card.css',s=>once(s,'.organizer-avatar-thumb, .organizer-profile-avatar-large { display:grid; overflow:hidden; place-items:center; border:1px solid rgba(201,255,61,.48); border-radius:999px; background:rgba(10,14,16,.72); color:var(--lime); font-weight:850; }','.organizer-avatar-thumb, .organizer-profile-avatar-large { display:grid; overflow:hidden; place-items:center; border:1px solid rgba(201,255,61,.48); border-radius:16px; background:rgba(10,14,16,.72); color:var(--lime); font-weight:850; }','profile-avatar'));
edit('src/profile-hub.css',s=>add(s,'/* ui-scope-20260727-profile */',`
/* ui-scope-20260727-profile */
.profile-page.profile-hub-enabled>.profile-hub-navigation{display:contents}.profile-page.profile-hub-enabled .profile-hub-navigation>header{order:-30;margin-bottom:14px}.profile-page.profile-hub-enabled:not(.is-editing)>.profile-hero{position:relative;order:-20;display:flex!important;width:100%;margin-bottom:14px;padding-bottom:66px}.profile-page.profile-hub-enabled .profile-hub-grid{order:-10;width:100%;margin-bottom:18px}
.profile-page.profile-hub-enabled .profile-edit-button{position:absolute;right:14px;bottom:14px;display:inline-flex!important;width:auto!important;min-width:0!important;max-width:calc(100% - 28px);min-height:38px;padding:8px 12px!important;align-items:center;justify-content:center;gap:6px;white-space:nowrap!important}.profile-page.profile-hub-enabled .profile-main{min-width:0;padding-right:0}
`));
edit('src/event-main-block.css',s=>add(s,'/* ui-scope-20260727-community */',`
/* ui-scope-20260727-community */
.activity-sheet .sport-community-block{margin-top:14px;overflow:hidden;border:1px solid rgba(255,255,255,.1);border-radius:18px;background:rgba(255,255,255,.025)}
.activity-sheet .sport-community-block>.detail-members-toggle,.activity-sheet .sport-community-block>.members-section,.activity-sheet .sport-community-block>.activity-chat-panel,.activity-sheet .sport-community-block>.external-telegram-chat-panel{width:100%;margin:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}.activity-sheet .sport-community-block>.members-section,.activity-sheet .sport-community-block>.activity-chat-panel,.activity-sheet .sport-community-block>.external-telegram-chat-panel{border-top:1px solid rgba(255,255,255,.08)!important}.activity-sheet .sport-community-block .activity-chat-toggle,.activity-sheet .sport-community-block .activity-chat-box{border-radius:0!important}
`));
edit('api/_shared/telegram-share-card-svg.ts',s=>{
 s=rx(s,/\nconst weatherConditionIcon = \(icon: string, x: number, y: number\) => \{[\s\S]*?\n\};\n/,'\n','condition-icon');
 s=once(s,'  return `<g font-family="DejaVu Sans, sans-serif" font-size="30" font-weight="800" fill="#f5f7f8">\n    ${weatherConditionIcon(weather.icon || "", 76, 462)}\n    ${weatherMetricIcon("temperature", 76, 520)}\n    <text x="132" y="551">${Math.round(weather.temperature)}°C</text>\n    ${weatherMetricIcon("rain", 76, 575)}\n    <text x="132" y="607">${Math.round(weather.rain)}%</text>\n    ${weatherMetricIcon("wind", 76, 630)}\n    <text x="132" y="662">${Math.round(weather.wind)} km/h</text>\n  </g>`;','  return `<g data-weather-lines="three" font-family="DejaVu Sans, sans-serif" font-size="30" font-weight="800" fill="#f5f7f8">\n    ${weatherMetricIcon("temperature", 76, 470)}\n    <text x="132" y="502">${Math.round(weather.temperature)}°C</text>\n    ${weatherMetricIcon("rain", 76, 525)}\n    <text x="132" y="557">${Math.round(weather.rain)}%</text>\n    ${weatherMetricIcon("wind", 76, 580)}\n    <text x="132" y="612">${Math.round(weather.wind)} km/h</text>\n  </g>`;','share-weather');return s;
});
edit('api/_shared/telegram-share-card-svg.test.ts',s=>{
 s=once(s,'    expect(withWeather).toContain("6 km/h");','    expect(withWeather).toContain("6 km/h");\n    expect(withWeather).toContain(\'data-weather-lines="three"\');\n    expect(withWeather).not.toContain("data-weather-condition");\n    expect(withWeather.match(/data-weather-icon=/g)).toHaveLength(3);','share-test');
 s=once(s,'    expect(svg).toContain("19 km/h");\n    expect(svg).not.toContain("data-event-artwork");','    expect(svg).toContain("19 km/h");\n    expect(svg).toContain(\'data-weather-lines="three"\');\n    expect(svg).not.toContain("data-weather-condition");\n    expect(svg).not.toContain("data-event-artwork");','meta-test');return s;
});
edit('api/meta/event-preview.ts',s=>once(s,'&v=6`','&v=7`','cache'));
