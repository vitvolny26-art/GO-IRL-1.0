const fs = require('node:fs');

const replace = (path, from, to) => {
  const source = fs.readFileSync(path, 'utf8');
  if (!source.includes(from)) throw new Error(`missing pattern in ${path}`);
  fs.writeFileSync(path, source.replace(from, to));
};

replace(
  'src/components/EventCardPrimitives.tsx',
  'import type { MouseEvent, ReactNode } from "react";',
  'import { useEffect, useState, type MouseEvent, type ReactNode } from "react";',
);
replace(
  'src/components/EventCardPrimitives.tsx',
  'import type { EventInteractionState, EventInteractionStatus } from "../eventInteractionState";',
  'import type { EventInteractionState, EventInteractionStatus } from "../eventInteractionState";\nimport { getCurrentAuthIdentity } from "../authSession";\nimport { createProfileRepository } from "../profile/profileRepository