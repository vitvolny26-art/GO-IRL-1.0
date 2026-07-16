const fs = require('node:fs');

const files = ['src/App.tsx', 'src/verticals/SportVertical.tsx'];

const actionLine = '  const action = t[eventActionTranslationKey(interaction.primaryAction, "card")];';
const actionReplacement = `${actionLine}\n  const cardRightLabel = joined ? t.joined : pending ? t.requested : action;\n  const cardRightDisabled = joined || pending || interaction.disabled;\n  const cardLeftLabel = joined ? t.leave : pending ? t.cancelRequest : waiting ? t.leave : t.details;\n  const handleCardLeftAction = () => {\n    if (joined || pending || waiting) {\n      onJoin(activity);\n      return;\n    }\n    onOpen(activity);\n  };`;

const footers = [
  {
    file: 'src/App.tsx',
    before: `      <div className="activity-card-footer compact-sport-actions">\n        {showHelperAction\n          ? <button className="sport-coach-action" onClick={() => onOpen(activity)} type="button"><UsersRound size={18} /><span>{helperAction}</span></button>\n          : <EventDetailsAction label={t.details} onClick={() => onOpen(activity)} />}\n        <button className={interaction.canJoin ? "card-join" : "card-join secondary"} onClick={handlePrimaryAction} type="button" disabled={interaction.disabled}>\n          {action}\n        </button>\n      </div>`,
    after: `      <div className="activity-card-footer compact-sport-actions">\n        {joined || pending || waiting\n          ? <button className="sport-coach-action" onClick={handleCardLeftAction} type="button"><UsersRound size={18} /><span>{cardLeftLabel}</span></button>\n          : showHelperAction\n            ? <button className="sport-coach-action" onClick={() => onOpen(activity)} type="button"><UsersRound size={18} /><span>{helperAction}</span></button>\n            : <EventDetailsAction label={t.details} onClick={() => onOpen(activity)} />}\n        <button className={interaction.canJoin && !pending ? "card-join" : "card-join secondary"} onClick={handlePrimaryAction} type="button" disabled={cardRightDisabled}>\n          {cardRightLabel}\n        </button>\n      </div>`,
  },
  {
    file: 'src/verticals/SportVertical.tsx',
    before: `      <div className="activity-card-footer compact-sport-actions">\n        {showCoachAction\n          ? <button className="sport-coach-action" onClick={() => onOpen(activity)} type="button"><Dumbbell size={18} /><span>{coachAction}</span></button>\n          : <EventDetailsAction label={t.details} onClick={() => onOpen(activity)} />}\n        <button className={interaction.canJoin ? "card-join" : "card-join secondary"} onClick={handlePrimaryAction} type="button" disabled={interaction.disabled}>{action}</button>\n      </div>`,
    after: `      <div className="activity-card-footer compact-sport-actions">\n        {joined || pending || waiting\n          ? <button className="sport-coach-action" onClick={handleCardLeftAction} type="button"><Dumbbell size={18} /><span>{cardLeftLabel}</span></button>\n          : showCoachAction\n            ? <button className="sport-coach-action" onClick={() => onOpen(activity)} type="button"><Dumbbell size={18} /><span>{coachAction}</span></button>\n            : <EventDetailsAction label={t.details} onClick={() => onOpen(activity)} />}\n        <button className={interaction.canJoin && !pending ? "card-join" : "card-join secondary"} onClick={handlePrimaryAction} type="button" disabled={cardRightDisabled}>{cardRightLabel}</button>\n      </div>`,
  },
];

for (const file of files) {
  let source = fs.readFileSync(file, 'utf8');
  if (!source.includes(actionLine)) throw new Error(`Missing action line in ${file}`);
  source = source.replace(actionLine, actionReplacement);
  const footer = footers.find((item) => item.file === file);
  if (!footer || !source.includes(footer.before)) throw new Error(`Missing footer block in ${file}`);
  source = source.replace(footer.before, footer.after);
  fs.writeFileSync(file, source);
  console.log(`updated ${file}`);
}
