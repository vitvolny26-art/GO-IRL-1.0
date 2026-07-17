const { execFileSync } = require('node:child_process');
const { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const sharp = require('sharp');

const root = process.cwd();
const temp = path.join(os.tmpdir(), `go-irl-backgrounds-${process.pid}`);
const downloads = path.join(temp, 'downloads');
const extracted = path.join(temp, 'extracted');
const output = path.join(root, 'src/assets/event-backgrounds');
const archives = [
  ['1mMsrONuRrDJVuAZ9A7UvUnlXz_CVqEgB', '01-20.zip'],
  ['1WHdWQZqx2PxaWRz2BECq16-oCtbYVSkE', '21-30.zip'],
  ['140S7YtEPW8JV70900HTvEz-yC_PeD414', '31-40.zip'],
];
const images = [
  ['VB','01-volleyball.png'],['FB','02-football.png'],['BB','03-basketball.png'],['TN','04-tennis.png'],['GY','05-gym.png'],['RN','06-running.png'],['CY','07-cycling.png'],['BD','08-badminton.png'],['TT','09-table-tennis.png'],['YG','10-yoga.png'],
  ['CF','11-coffee.png'],['MV','12-cinema.png'],['BW','13-bowling.png'],['BG','14-board-games.png'],['CH','15-chess.png'],['KR','16-karaoke.png'],['SK','17-roller-skating.png'],['BR','18-beer.png'],['QZ','19-pub-quiz.png'],['WN','20-wine-evening.png'],
  ['CN','21-concert.jpg'],['FS','22-festival.jpg'],['DN','23-dancing.jpg'],['HK','24-hiking.jpg'],['WK','25-park-walk.jpg'],['SW','26-swimming.jpg'],['PC','27-picnic.jpg'],['CP','28-camping.jpg'],['FI','29-fishing.jpg'],['KY','30-kayaking.jpg'],
  ['CT','31-city-walk.jpg'],['DR','32-dinner.jpg'],['LX','33-language-exchange.jpg'],['CW','34-coworking.jpg'],['MT','35-new-connections.jpg'],['AR','36-drawing.jpg'],['PH','37-photo-walk.jpg'],['CR','38-ceramics.jpg'],['JM','39-music-jam.jpg'],['WS','40-workshop.jpg'],
];
const replace = (file, from, to, label) => {
  const source = readFileSync(file, 'utf8');
  if (!source.includes(from)) throw new Error(`Missing patch anchor: ${label}`);
  writeFileSync(file, source.replace(from, to));
};
const append = (file, marker, text) => {
  const source = readFileSync(file, 'utf8');
  if (!source.includes(marker)) writeFileSync(file, `${source.trimEnd()}\n\n${text.trim()}\n`);
};
const findImage = (name) => {
  const options = [path.join(extracted, name), path.join(extracted, 'go_irl_event_backgrounds_01_20', name)];
  const found = options.find(existsSync);
  if (!found) throw new Error(`Missing image: ${name}`);
  return found;
};

const portal = `import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { getCity } from "../config/cities";
import { useAppStore } from "../store";
import type { Language } from "../types";
import { isOrganizerAvatarImage, organizerProfileEventName, resolveOrganizerAvatar, type OrganizerProfileDetail } from "./EventCardPrimitives";

const copy: Record<Language, { title: string; events: string; close: string }> = {
  ru: { title: "Профиль организатора", events: "События", close: "Закрыть" },
  uk: { title: "Профіль організатора", events: "Події", close: "Закрити" },
  cs: { title: "Profil organizátora", events: "Události", close: "Zavřít" },
  en: { title: "Organizer profile", events: "Events", close: "Close" },
};

export function OrganizerProfilePortal() {
  const { activities, language } = useAppStore();
  const [profile, setProfile] = useState<OrganizerProfileDetail | null>(null);
  const events = useMemo(() => profile ? activities.filter((item) => item.organizerKey === profile.organizerKey) : [], [activities, profile]);
  useEffect(() => {
    const open = (event: Event) => {
      const detail = (event as CustomEvent<OrganizerProfileDetail>).detail;
      if (detail?.organizerKey) setProfile(detail);
    };
    window.addEventListener(organizerProfileEventName, open);
    return () => window.removeEventListener(organizerProfileEventName, open);
  }, []);
  if (!profile || typeof document === "undefined") return null;
  const labels = copy[language];
  const avatar = profile.avatar || resolveOrganizerAvatar(profile.organizerKey, profile.organizerName);
  const city = events[0] ? getCity(events[0].cityId).name[language] : "";
  return createPortal(
    <div className="organizer-profile-backdrop" role="presentation" onClick={() => setProfile(null)}>
      <section className="organizer-profile-sheet" role="dialog" aria-modal="true" aria-label={labels.title} onClick={(event) => event.stopPropagation()}>
        <button className="organizer-profile-close" type="button" aria-label={labels.close} onClick={() => setProfile(null)}><X aria-hidden="true" /></button>
        <div className="organizer-profile-avatar-large">{isOrganizerAvatarImage(avatar) ? <img src={avatar} alt="" /> : <span>{avatar}</span>}</div>
        <small>{labels.title}</small><h2>{profile.organizerName}</h2>{city ? <p>{city}</p> : null}
        <div className="organizer-profile-count"><strong>{events.length}</strong><span>{labels.events}</span></div>
      </section>
    </div>, document.body,
  );
}
`;

const css = `/* event-card-visual-fix-v2 */
.glass-event-card-artwork-image { object-position: center !important; transform: none !important; image-rendering: auto !important; }
.glass-event-card .event-card-weather { margin: auto 0 0 !important; }
.glass-event-card .activity-card-details.sport-details-grid { margin: 8px 0 0 !important; }
.glass-event-card-meta-copy small { display: none !important; }
.glass-event-card .activity-card-details.sport-details-grid > .glass-event-card-meta-item { min-height: 72px !important; justify-content: center !important; }
.glass-event-card-meta-copy { gap: 0 !important; }
.glass-event-card-meta-copy strong { -webkit-line-clamp: 3 !important; }
.organizer-avatar-thumb, .organizer-profile-avatar-large { display:grid; overflow:hidden; place-items:center; border:1px solid rgba(201,255,61,.48); border-radius:999px; background:rgba(10,14,16,.72); color:var(--lime); font-weight:850; }
.organizer-avatar-thumb { width:44px; height:44px; font-size:13px; }
.organizer-avatar-thumb img, .organizer-profile-avatar-large img { width:100%; height:100%; object-fit:cover; }
.glass-event-card .compact-sport-actions > .card-join.card-leave { border-color:rgba(255,126,126,.62) !important; background:transparent !important; color:rgba(255,190,190,.98) !important; box-shadow:none !important; }
.organizer-profile-backdrop { position:fixed; inset:0; z-index:120; display:flex; align-items:flex-end; justify-content:center; padding:18px; background:rgba(0,0,0,.68); backdrop-filter:blur(10px); }
.organizer-profile-sheet { position:relative; width:min(100%,520px); padding:28px 22px calc(26px + env(safe-area-inset-bottom)); border:1px solid rgba(255,255,255,.16); border-radius:28px; background:rgba(12,17,20,.97); color:#fff; text-align:center; }
.organizer-profile-close { position:absolute; top:14px; right:14px; display:grid; width:42px; height:42px; padding:0; place-items:center; border:1px solid rgba(255,255,255,.16); border-radius:999px; background:rgba(255,255,255,.06); color:#fff; }
.organizer-profile-avatar-large { width:92px; height:92px; margin:0 auto 14px; font-size:24px; }
.organizer-profile-sheet > small { color:rgba(255,255,255,.56); font-size:12px; font-weight:750; text-transform:uppercase; }
.organizer-profile-sheet h2 { margin:6px 0 2px; font-size:28px; }
.organizer-profile-sheet > p { margin:0; color:rgba(255,255,255,.64); }
.organizer-profile-count { display:flex; margin:22px auto 0; width:120px; padding:12px; align-items:center; justify-content:center; gap:8px; border:1px solid rgba(255,255,255,.12); border-radius:16px; background:rgba(255,255,255,.05); }
`;

async function main() {
  rmSync(temp, { recursive: true, force: true });
  mkdirSync(downloads, { recursive: true }); mkdirSync(extracted, { recursive: true });
  rmSync(output, { recursive: true, force: true }); mkdirSync(output, { recursive: true });
  for (const [id, name] of archives) {
    const zip = path.join(downloads, name);
    execFileSync('curl', ['-fL','--retry','3','-o',zip,`https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`], { stdio:'inherit' });
    execFileSync('unzip', ['-q','-o',zip,'-d',extracted], { stdio:'inherit' });
  }
  for (const [code, name] of images) {
    const target = path.join(output, name.replace(/\.(png|jpe?g)$/i, '.webp'));
    await sharp(findImage(name)).rotate().webp({ quality:90, effort:5, smartSubsample:true }).toFile(target);
    const meta = await sharp(target).metadata();
    if (meta.format !== 'webp' || !meta.width || !meta.height || meta.width < 900 || meta.height < 1400) throw new Error(`Invalid output: ${code}`);
  }
  const resolver = path.join(root, 'api/_shared/event-artwork.ts');
  replace(resolver,
    '  { code: "WK", emoji: "🚶", aliases: ["park walk", "walk", "прогулка в парке", "прогулка", "prochazka v parku", "prochazka"] },',
    '  { code: "WK", emoji: "🚶", aliases: ["park walk", "прогулка в парке", "prochazka v parku"] },\n  { code: "CT", emoji: "🚶", aliases: ["city walk", "walk", "городская прогулка", "прогулка", "mestska prochazka", "prochazka"] },', 'city walk');
  const map = Object.fromEntries(images.map(([code,name]) => [code,name.replace(/\.(png|jpe?g)$/i,'.webp')]));
  writeFileSync(path.join(root,'src/eventBackgrounds.ts'), `const modules = import.meta.glob("./assets/event-backgrounds/*.webp", { eager:true, import:"default", query:"?url" }) as Record<string,string>;\nconst files: Readonly<Record<string,string>> = ${JSON.stringify(map,null,2)};\nexport const getEventBackground = (code:string) => files[code] ? modules[\`./assets/event-backgrounds/\${files[code]}\`] || null : null;\n`);
  writeFileSync(path.join(root,'src/components/EventCardArtwork.tsx'), `import { resolveEventArtworkCode } from "../../api/_shared/event-artwork.js";\nimport { getEventBackground } from "../eventBackgrounds";\ntype Props={icon:string;activity:string;title:string};\nexport function EventCardArtwork({icon,activity,title}:Props){const src=getEventBackground(resolveEventArtworkCode({icon,activity,title}));return <div className="glass-event-card-artwork" aria-hidden="true">{src?<img className="glass-event-card-artwork-image" src={src} alt="" decoding="async"/>:<span className="glass-event-card-artwork-fallback">{icon||"✨"}</span>}</div>}\n`);
  writeFileSync(path.join(root,'src/components/OrganizerProfilePortal.tsx'), portal);
  const main = path.join(root,'src/main.tsx');
  replace(main, 'import { enableParticipantJoinNotifications } from "./participantNotifications";', 'import { enableParticipantJoinNotifications } from "./participantNotifications";\nimport { OrganizerProfilePortal } from "./components/OrganizerProfilePortal";', 'portal import');
  replace(main, '        <App />\n      </Suspense>', '        <App />\n      </Suspense>\n      <OrganizerProfilePortal />', 'portal render');
  const app = path.join(root,'src/App.tsx');
  replace(app, 'import { EventCardMetaItem, EventDetailsAction } from "./components/EventCardPrimitives";', 'import { EventCardMetaItem, EventDetailsAction, OrganizerAvatarAction } from "./components/EventCardPrimitives";', 'generic import');
  replace(app,
`      <div className="activity-card-details sport-details-grid">\n        <EventCardMetaItem icon={<CalendarDays />} caption={t.date} value={shareDate} ariaLabel={t.addToGoogleCalendar} onClick={() => openActivityCalendar(activity, language)} />\n        <EventCardMetaItem icon={<Ticket />} caption={t.price.split(",")[0]} value={activity.price ? \`${'${activity.price}'} Kč\` : t.free} />\n        <EventCardMetaItem icon={<MapPin />} caption={t.address} value={mapLabel} ariaLabel={\`${'${t.address}'}: ${'${mapLabel}'}\`} onClick={() => openActivityMap(activity)} />\n        <EventCardMetaItem icon={<CircleUserRound />} caption={t.organizer} value={activity.organizer} />\n      </div>\n      <EventWeatherStrip activity={activity} language={language} enabled={isOutdoorGenericActivity(activity)} />`,
`      <EventWeatherStrip activity={activity} language={language} enabled={isOutdoorGenericActivity(activity)} />\n      <div className="activity-card-details sport-details-grid">\n        <EventCardMetaItem icon={<CalendarDays />} caption={t.date} value={shareDate} ariaLabel={t.addToGoogleCalendar} onClick={() => openActivityCalendar(activity, language)} />\n        <EventCardMetaItem icon={<Ticket />} caption={t.price.split(",")[0]} value={activity.price ? \`${'${activity.price}'} Kč\` : t.free} />\n        <EventCardMetaItem icon={<MapPin />} caption={t.address} value={mapLabel} ariaLabel={\`${'${t.address}'}: ${'${mapLabel}'}\`} onClick={() => openActivityMap(activity)} />\n        <OrganizerAvatarAction organizerKey={activity.organizerKey} organizerName={activity.organizer} />\n      </div>`, 'generic card');
  const sport = path.join(root,'src/verticals/SportVertical.tsx');
  replace(sport, 'import { EventCardMetaItem, EventDetailsAction } from "../components/EventCardPrimitives";', 'import { EventCardMetaItem, EventDetailsAction, OrganizerAvatarAction } from "../components/EventCardPrimitives";', 'sport import');
  replace(sport,
`      <div className="activity-card-details sport-details-grid">\n        <EventCardMetaItem icon={<CalendarDays />} caption={t.date} value={shareDate} ariaLabel={t.addToGoogleCalendar} onClick={() => openActivityCalendar(activity, language)} />\n        <EventCardMetaItem icon={<Ticket />} caption={t.price.split(",")[0]} value={activity.price ? \`${'${activity.price}'} Kč\` : t.free} />\n        <EventCardMetaItem icon={<MapPin />} caption={t.address} value={mapLabel} ariaLabel={\`${'${t.address}'}: ${'${mapLabel}'}\`} onClick={() => openActivityMap(activity)} />\n        <EventCardMetaItem icon={<CircleUserRound />} caption={t.organizer} value={activity.organizer} />\n      </div>\n      <EventWeatherStrip activity={activity} language={language} enabled={meta.environment === "outdoor"} durationMinutes={meta.durationMinutes || 90} />`,
`      <EventWeatherStrip activity={activity} language={language} enabled={meta.environment === "outdoor"} durationMinutes={meta.durationMinutes || 90} />\n      <div className="activity-card-details sport-details-grid">\n        <EventCardMetaItem icon={<CalendarDays />} caption={t.date} value={shareDate} ariaLabel={t.addToGoogleCalendar} onClick={() => openActivityCalendar(activity, language)} />\n        <EventCardMetaItem icon={<Ticket />} caption={t.price.split(",")[0]} value={activity.price ? \`${'${activity.price}'} Kč\` : t.free} />\n        <EventCardMetaItem icon={<MapPin />} caption={t.address} value={mapLabel} ariaLabel={\`${'${t.address}'}: ${'${mapLabel}'}\`} onClick={() => openActivityMap(activity)} />\n        <OrganizerAvatarAction organizerKey={activity.organizerKey} organizerName={activity.organizer} />\n      </div>`, 'sport card');
  replace(sport, '? <button className="sport-coach-action" onClick={handleCardLeftAction} type="button"><Dumbbell size={18} /><span>{cardLeftLabel}</span></button>', '? <button className="sport-coach-action" onClick={handleCardLeftAction} type="button"><span>{cardLeftLabel}</span></button>', 'chat icon');
  append(path.join(root,'src/glass-event-card.css'), '/* event-card-visual-fix-v2 */', css);
  writeFileSync(path.join(root,'docs/reports/2026-07-17-agent-report-event-backgrounds.md'), `---\ntitle: Agent Report\nowner: AI Fixer\nstatus: Draft\nsource_of_truth: false\nlast_review: 2026-07-17\nnext_review: 2026-07-24\n---\n# Agent Report\n## Task\nApply approved high-resolution backgrounds and card UI corrections.\n## Changes made\n- Added 40 source-resolution WebP backgrounds.\n- Moved weather above metadata.\n- Removed metadata captions and chat dumbbell.\n- Changed Leave to outline-only.\n- Added clickable organizer avatar and profile sheet.\n- Preserved card height and event handlers.\n## Checks\n- Test: PENDING\n- Typecheck: PENDING\n- Lint: PENDING\n- Build: PENDING\n## Next step\nVisual review in Vercel Preview.\n`);
  rmSync(path.join(root,'scripts/patches/apply-event-card-backgrounds.cjs'), { force:true });
  rmSync(path.join(root,'.github/workflows/apply-event-card-backgrounds.yml'), { force:true });
  rmSync(temp, { recursive:true, force:true });
}
main().catch((error)=>{console.error(error);process.exitCode=1});
