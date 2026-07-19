const fs = require('node:fs');

const replace = (path, from, to) => {
  const source = fs.readFileSync(path, 'utf8');
  if (!source.includes(from)) throw new Error(`missing pattern in ${path}`);
  fs.writeFileSync(path, source.replace(from, to));
};

replace('src/App.tsx', '  UploadCloud,\n', '');

replace(
  'src/App.tsx',
  `            <div className="profile-edit-avatar">\n              {isProfileAvatarImage(avatarDraft) ? <img src={avatarDraft} alt={t.avatar} /> : <span>{avatarDraft}</span>}\n              <i aria-hidden="true"><Camera size={16} /></i>\n            </div>`,
  `            <label className={\`profile-edit-avatar${avatarBusy ? " is-busy" : ""}\`}>\n              <input type="file" accept="image/jpeg,image/png" disabled={avatarBusy} aria-label={t.avatar} onChange={(event) => {\n                const input = event.currentTarget;\n                void processAvatarFile(input.files?.[0]).finally(() => { input.value = ""; });\n              }} />\n              {isProfileAvatarImage(avatarDraft) ? <img src={avatarDraft} alt={t.avatar} /> : <span>{avatarDraft}</span>}\n              <i aria-hidden="true"><Camera size={20} /></i>\n            </label>`,
);

replace(
  'src/App.tsx',
  `          <label\n            className={\`profile-avatar-upload${avatarBusy ? " is-busy" : ""}\`}\n            onDragOver={(event) => event.preventDefault()}\n            onDrop={(event) => {\n              event.preventDefault();\n              void processAvatarFile(event.dataTransfer.files?.[0]);\n            }}\n          >\n            <input type="file" accept="image/jpeg,image