const { execFileSync } = require('node:child_process');
const { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const sharp = require('sharp');

const root = process.cwd();
const tempRoot = path.join(os.tmpdir(), `go-irl-event-backgrounds-${process.pid}`);
const downloadsDir = path.join(tempRoot, 'downloads');
const extractedDir = path.join(tempRoot, 'extracted');
const outputDir = path.join(root, 'src/assets/event-backgrounds');

const archives = [
  { id: '1mMsrONuRrDJVuAZ9A7UvUnlXz_CVqEgB', name: 'backgrounds-01-20.zip' },
  { id: '1WHdWQZqx2PxaWRz2BECq16-oCtbYVSkE', name: 'backgrounds-21-30.zip' },
  { id: '140S7YtEPW8JV70900HTvEz-yC_PeD414', name: 'backgrounds-31-40.zip' },
];

const backgrounds = [
  ['VB', '01-volleyball.png'],
  ['FB', '02-football.png'],
  ['BB', '03-basketball.png'],
  ['TN', '04-tennis.png'],
  ['GY', '05-gym.png'],
  ['RN', '06-running.png'],
  ['CY', '07-cycling.png'],
  ['BD', '08-badminton.png'],
  ['TT', '09-table-tennis.png'],
  ['YG', '10-yoga.png'],
  ['CF', '11-coffee.png'],
  ['MV', '12-cinema.png'],
  ['BW', '13-bowling.png'],
  ['BG', '14-board-games.png'],
  ['CH', '15-chess.png'],
  ['KR', '16-karaoke.png'],
  ['SK', '17-roller-skating.png'],
  ['BR', '18-beer.png'],
  ['QZ', '19-pub-quiz.png'],
  ['WN', '20-wine-evening.png'],
  ['CN', '21-concert.jpg'],
  ['FS', '22-festival.jpg'],
  ['DN', '23-dancing.jpg'],
  ['HK', '24-hiking.jpg'],
  ['WK', '25-park-walk.jpg'],
  ['SW', '26-swimming.jpg'],
  ['PC', '27-picnic.jpg'],
  ['CP', '28-camping.jpg'],
  ['FI', '29-fishing.jpg'],
  ['KY', '30-kayaking.jpg'],
  ['CT', '31-city-walk.jpg'],
  ['DR', '32-dinner.jpg'],
  ['LX', '33-language-exchange.jpg'],
  ['CW', '34-coworking.jpg'],
  ['MT', '35-new-connections.jpg'],
  ['AR', '36-drawing.jpg'],
  ['PH', '37-photo-walk.jpg'],
  ['CR', '38-ceramics.jpg'],
  ['JM', '39-music-jam.jpg'],
  ['WS', '40-workshop.jpg'],
];

const replaceOnce = (filePath, before, after, label) => {
  const source = readFileSync(filePath, 'utf8');
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`Missing patch anchor: ${label}`);
  if (source.indexOf(before, first + before.length) >= 0) throw new Error(`Non-unique patch anchor: ${label}`);
  writeFileSync(filePath, source.replace(before, after));
};

const findInput = (fileName) => {
  const candidates = [
    path.join(extractedDir, fileName),
    path.join(extractedDir, 'go_irl_event_backgrounds_01_20', fileName),
  ];
  const found = candidates.find(existsSync);
  if (!found) throw new Error(`Missing extracted image: ${fileName}`);
  return found;
};

async function main() {
  rmSync(tempRoot, { recursive: true, force: true });
  mkdirSync(downloadsDir, { recursive: true });
  mkdirSync(extractedDir, { recursive: true });
  mkdirSync(outputDir, { recursive: true });

  for (const archive of archives) {
    const destination = path.join(downloadsDir, archive.name);
    const url = `https://drive.usercontent.google.com/download?id=${archive.id}&export=download&confirm=t`;
    execFileSync('curl', ['-fL', '--retry', '3', '--retry-delay', '2', '-o', destination, url], { stdio: 'inherit' });
    execFileSync('unzip', ['-t', destination], { stdio: 'inherit' });
    execFileSync('unzip', ['-q', '-o', destination, '-d', extractedDir], { stdio: 'inherit' });
  }

  for (const [code, inputName] of backgrounds) {
    const input = findInput(inputName);
    const slug = inputName.replace(/\.(png|jpe?g)$/i, '');
    const output = path.join(outputDir, `${slug}.webp`);
    await sharp(input)
      .rotate()
      .resize(720, 1080, { fit: 'cover', position: sharp.strategy.attention })
      .webp({ quality: 74, effort: 5 })
      .toFile(output);
    const metadata = await sharp(output).metadata();
    if (metadata.width !== 720 || metadata.height !== 1080 || metadata.format !== 'webp') {
      throw new Error(`Invalid generated background for ${code}: ${output}`);
    }
  }

  const resolverFile = path.join(root, 'api/_shared/event-artwork.ts');
  replaceOnce(
    resolverFile,
    '  { code: "WK", emoji: "🚶", aliases: ["park walk", "walk", "прогулка в парке", "прогулка", "prochazka v parku", "prochazka"] },',
    '  { code: "WK", emoji: "🚶", aliases: ["park walk", "прогулка в парке", "prochazka v parku"] },\n  { code: "CT", emoji: "🚶", aliases: ["city walk", "walk", "городская прогулка", "прогулка", "mestska prochazka", "prochazka"] },',
    'city walk resolver',
  );

  const backgroundMap = Object.fromEntries(backgrounds.map(([code, inputName]) => [code, inputName.replace(/\.(png|jpe?g)$/i, '.webp')]));
  writeFileSync(
    path.join(root, 'src/eventBackgrounds.ts'),
    `const backgroundModules = import.meta.glob("./assets/event-backgrounds/*.webp", {\n  eager: true,\n  import: "default",\n  query: "?url",\n}) as Record<string, string>;\n\nconst fileByArtworkCode: Readonly<Record<string, string>> = ${JSON.stringify(backgroundMap, null, 2)};\n\nexport const getEventBackground = (code: string) => {\n  const fileName = fileByArtworkCode[code];\n  if (!fileName) return null;\n  return backgroundModules[\`./assets/event-backgrounds/\${fileName}\`] || null;\n};\n`,
  );

  writeFileSync(
    path.join(root, 'src/components/EventCardArtwork.tsx'),
    `import { resolveEventArtworkCode } from "../../api/_shared/event-artwork.js";\nimport { getEventBackground } from "../eventBackgrounds";\n\ntype EventCardArtworkProps = {\n  icon: string;\n  activity: string;\n  title: string;\n};\n\nexport function EventCardArtwork({ icon, activity, title }: EventCardArtworkProps) {\n  const code = resolveEventArtworkCode({ icon, activity, title });\n  const src = getEventBackground(code);\n\n  return (\n    <div className="glass-event-card-artwork" aria-hidden="true">\n      {src\n        ? <img className="glass-event-card-artwork-image" src={src} alt="" decoding="async" loading="lazy" />\n        : <span className="glass-event-card-artwork-fallback">{icon || "✨"}</span>}\n    </div>\n  );\n}\n`,
  );

  const appFile = path.join(root, 'src/App.tsx');
  replaceOnce(
    appFile,
    `      <div className="activity-card-details sport-details-grid">\n        <EventCardMetaItem icon={<CalendarDays />} caption={t.date} value={shareDate} ariaLabel={t.addToGoogleCalendar} onClick={() => openActivityCalendar(activity, language)} />\n        <EventCardMetaItem icon={<Ticket />} caption={t.price.split(",")[0]} value={activity.price ? \`${'${activity.price}'} Kč\` : t.free} />\n        <EventCardMetaItem icon={<MapPin />} caption={t.address} value={mapLabel} ariaLabel={\`${'${t.address}'}: ${'${mapLabel}'}\`} onClick={() => openActivityMap(activity)} />\n        <EventCardMetaItem icon={<CircleUserRound />} caption={t.organizer} value={activity.organizer} />\n      </div>\n      <EventWeatherStrip activity={activity} language={language} enabled={isOutdoorGenericActivity(activity)} />`,
    `      <EventWeatherStrip activity={activity} language={language} enabled={isOutdoorGenericActivity(activity)} />\n      <div className="activity-card-details sport-details-grid">\n        <EventCardMetaItem icon={<CalendarDays />} caption={t.date} value={shareDate} ariaLabel={t.addToGoogleCalendar} onClick={() => openActivityCalendar(activity, language)} />\n        <EventCardMetaItem icon={<Ticket />} caption={t.price.split(",")[0]} value={activity.price ? \`${'${activity.price}'} Kč\` : t.free} />\n        <EventCardMetaItem icon={<MapPin />} caption={t.address} value={mapLabel} ariaLabel={\`${'${t.address}'}: ${'${mapLabel}'}\`} onClick={() => openActivityMap(activity)} />\n        <EventCardMetaItem icon={<CircleUserRound />} caption={t.organizer} value={activity.organizer} />\n      </div>`,
    'generic weather position',
  );

  const sportFile = path.join(root, 'src/verticals/SportVertical.tsx');
  replaceOnce(
    sportFile,
    `      <div className="activity-card-details sport-details-grid">\n        <EventCardMetaItem icon={<CalendarDays />} caption={t.date} value={shareDate} ariaLabel={t.addToGoogleCalendar} onClick={() => openActivityCalendar(activity, language)} />\n        <EventCardMetaItem icon={<Ticket />} caption={t.price.split(",")[0]} value={activity.price ? \`${'${activity.price}'} Kč\` : t.free} />\n        <EventCardMetaItem icon={<MapPin />} caption={t.address} value={mapLabel} ariaLabel={\`${'${t.address}'}: ${'${mapLabel}'}\`} onClick={() => openActivityMap(activity)} />\n        <EventCardMetaItem icon={<CircleUserRound />} caption={t.organizer} value={activity.organizer} />\n      </div>\n      <EventWeatherStrip activity={activity} language={language} enabled={meta.environment === "outdoor"} durationMinutes={meta.durationMinutes || 90} />`,
    `      <EventWeatherStrip activity={activity} language={language} enabled={meta.environment === "outdoor"} durationMinutes={meta.durationMinutes || 90} />\n      <div className="activity-card-details sport-details-grid">\n        <EventCardMetaItem icon={<CalendarDays />} caption={t.date} value={shareDate} ariaLabel={t.addToGoogleCalendar} onClick={() => openActivityCalendar(activity, language)} />\n        <EventCardMetaItem icon={<Ticket />} caption={t.price.split(",")[0]} value={activity.price ? \`${'${activity.price}'} Kč\` : t.free} />\n        <EventCardMetaItem icon={<MapPin />} caption={t.address} value={mapLabel} ariaLabel={\`${'${t.address}'}: ${'${mapLabel}'}\`} onClick={() => openActivityMap(activity)} />\n        <EventCardMetaItem icon={<CircleUserRound />} caption={t.organizer} value={activity.organizer} />\n      </div>`,
    'sport weather position',
  );

  const reportPath = path.join(root, 'docs/reports/2026-07-17-agent-report-event-backgrounds.md');
  writeFileSync(reportPath, `---\ntitle: Agent Report\nowner: AI Fixer\nstatus: Draft\nsource_of_truth: false\nlast_review: 2026-07-17\nnext_review: 2026-07-24\n---\n\n# Agent Report\n\n## Task\n\nApply the approved Google Drive category backgrounds to the existing event-card artwork resolver and move the weather strip above the shared metadata block without changing card height.\n\n## Files inspected\n\n- \`api/_shared/event-artwork.ts\`\n- \`src/components/EventCardArtwork.tsx\`\n- \`src/App.tsx\`\n- \`src/verticals/SportVertical.tsx\`\n- \`src/glass-event-card.css\`\n- Google Drive background archives 01-20, 21-30, and 31-40\n\n## Findings\n\n- The card still used a low-resolution beta sprite instead of the approved category photography.\n- The existing artwork resolver is the correct single source for selecting event artwork.\n- Generic and sport cards rendered weather below the four-column metadata block.\n- Generic walk and park walk needed distinct resolver codes so both approved images could be used.\n\n## Changes made\n\n- Added 40 optimized WebP category backgrounds under \`src/assets/event-backgrounds/\`.\n- Added \`src/eventBackgrounds.ts\` to map existing artwork codes to bundled image URLs.\n- Updated \`EventCardArtwork\` to use the existing resolver and safe emoji fallback.\n- Added the \`CT\` resolver code for city walk while retaining \`WK\` for park walk.\n- Moved weather above the metadata block in generic and sport cards.\n- Card height, join/request/chat/open/share behavior, auth, RLS, migrations, and secrets were not changed.\n\n## Checks\n\n- Test: PENDING\n- Typecheck: PENDING\n- Lint: PENDING\n- Build: PENDING\n\n## Next step\n\nReview the deployed card visually, then continue spacing, typography, chips, metadata, and CTA polish as a separate task.\n`);

  rmSync(path.join(root, 'scripts/patches/apply-event-card-backgrounds.cjs'), { force: true });
  rmSync(path.join(root, '.github/workflows/apply-event-card-backgrounds.yml'), { force: true });
  rmSync(tempRoot, { recursive: true, force: true });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
