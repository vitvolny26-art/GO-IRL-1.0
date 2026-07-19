const fs = require('node:fs');

const replaceOnce = (path, pattern, replacement, label) => {
  const source = fs.readFileSync(path, 'utf8');
  const next = source.replace(pattern, replacement);
  if (next === source) throw new Error(`missing pattern: ${label} in ${path}`);
  fs.writeFileSync(path, next);
};

replaceOnce('src/App.tsx', /^\s*UploadCloud,\r?\n/m, '', 'UploadCloud import');

replaceOnce(
  'src/App.tsx',
  /\s{12}<div className="profile-edit-avatar">[\s\S]*?<i aria-hidden="true"><Camera size=\{16\} \/><\/i>\r?\n\s{12}<\/div>/,
  `            <label className={\`profile-edit-avatar${avatarBusy ? " is-busy" : ""}\`}>
              <input type="file" accept="image/jpeg,image/png" disabled={avatarBusy} aria-label={t.avatar} onChange={(event) => {
                const input = event.currentTarget;
                void processAvatarFile(input.files?.[0]).finally(() => { input.value = ""; });
              }} />
              {isProfileAvatarImage(avatarDraft) ? <img src={avatarDraft} alt={t.avatar} /> : <span>{avatarDraft}</span>}
              <i aria-hidden="true"><Camera size={20} /></i>
            </label>`,
  'profile avatar control',
);

replaceOnce(
  'src/App.tsx',
  /\s{10}<label\r?\n\s{12}className=\{`profile-avatar-upload[\s\S]*?\s{10}<\/label>\r?\n/,
  '\n',
  'large avatar upload block',
);

replaceOnce(
  'src/styles.css',
  /\.profile-edit-avatar \{[^}]*\}/,
  '.profile-edit-avatar { position: relative; display: grid; place-items: center; width: 152px; height: 152px; margin-top: 8px; overflow: visible; border: 1px solid rgba(201,255,61,.34); border-radius: 28px; background: linear-gradient(135deg, rgba(201,255,61,.26), rgba(87,217,232,.12)); color: var(--text); font-size: 30px; font-weight: 950; box-shadow: 0 18px 42px rgba(0,0,0,.34); cursor: pointer; }',
  'profile avatar size',
);
replaceOnce(
  'src/styles.css',
  /\.profile-edit-avatar img \{[^}]*\}/,
  '.profile-edit-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: inherit; }',
  'profile avatar image',
);
replaceOnce(
  'src/styles.css',
  /\.profile-edit-avatar i \{[^}]*\}/,
  '.profile-edit-avatar i { position: absolute; right: -10px; bottom: -10px; display: grid; place-items: center; width: 46px; height: 46px; border: 3px solid #12151a; border-radius: 15px; background: var(--lime); color: var(--lime-text); box-shadow: 0 9px 24px rgba(0,0,0,.38); }',
  'profile camera button',
);
replaceOnce(
  'src/styles.css',
  /\.profile-edit-avatar img \{ width: 100%; height: 100%; object-fit: cover; border-radius: inherit; \}/,
  `.profile-edit-avatar input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.profile-edit-avatar.is-busy { pointer-events: none; opacity: .7; }
.profile-edit-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: inherit; }`,
  'profile hidden input',
);

replaceOnce(
  'api/_shared/telegram-share-card-image.ts',
  /const mask = Buffer\.from\('<svg width="128" height="128"><rect width="128" height="128" rx="26" fill="white"\/><\/svg>'\);/,
  'const mask = Buffer.from(\'<svg width="128" height="128"><rect width="128" height="128" rx="8" fill="white"/></svg>\');',
  'share avatar mask',
);
replaceOnce(
  'api/_shared/telegram-share-card-svg.ts',
  /data-organizer-avatar-slot="rounded-square" x="78" y="716" width="128" height="128" rx="26"/,
  'data-organizer-avatar-slot="soft-square" x="78" y="716" width="128" height="128" rx="8"',
  'share avatar slot',
);
replaceOnce(
  'api/_shared/telegram-share-card-image.test.ts',
  /data-organizer-avatar-slot="rounded-square"/g,
  'data-organizer-avatar-slot="soft-square"',
  'share avatar test marker',
);

console.log('PLAN1152 patch applied');
