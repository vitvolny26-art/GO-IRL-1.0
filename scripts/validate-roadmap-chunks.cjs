const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const root = path.resolve(__dirname, '..')
const groups = [
  {
    index: 'ROADMAP.md',
    parts: [
      'docs/roadmap/ROADMAP_PART_01_FOUNDATION_MVP.md',
      'docs/roadmap/ROADMAP_PART_02_RELEASE_PREPARATION.md',
      'docs/roadmap/ROADMAP_PART_03_TELEGRAM_NOTIFICATIONS.md',
      'docs/roadmap/ROADMAP_PART_04_TRUST_MODULES.md',
      'docs/roadmap/ROADMAP_PART_05_GROWTH_DECISION_GATES.md',
    ],
  },
  {
    index: 'docs/product-roadmap/PRODUCT_ROADMAP.md',
    parts: [
      'docs/product-roadmap/PRODUCT_ROADMAP_PART_01_AUTHORITY_FOUNDATION.md',
      'docs/product-roadmap/PRODUCT_ROADMAP_PART_02_RELEASE_PREPARATION.md',
      'docs/product-roadmap/PRODUCT_ROADMAP_PART_03_FUTURE_PHASES_GATES.md',
      'docs/product-roadmap/PRODUCT_ROADMAP_PART_04_REGISTERS_EVIDENCE.md',
      'docs/product-roadmap/PRODUCT_ROADMAP_PART_05_RMAP_MAINTENANCE.md',
    ],
  },
]

const inspect = file => {
  const absolute = path.join(root, file)
  if (!fs.existsSync(absolute)) {
    throw new Error(`ROADMAP_FILE_MISSING:${file}`)
  }
  const content = fs.readFileSync(absolute, 'utf8')
  const lastReview = (content.match(/^last_review:\s*(\d{4}-\d{2}-\d{2})$/m) || [])[1] || ''
  if (!lastReview) {
    throw new Error(`ROADMAP_LAST_REVIEW_MISSING:${file}`)
  }
  const blobSha = execFileSync('git', ['hash-object', file], {
    cwd: root,
    encoding: 'utf8',
  }).trim()
  return {
    file,
    characters: content.length,
    blob_sha: blobSha,
    last_review: lastReview,
    content,
  }
}

const manifest = []
for (const group of groups) {
  const index = inspect(group.index)
  if (index.characters > 8000) {
    throw new Error(`ROADMAP_INDEX_TOO_LARGE:${group.index}:${index.characters}`)
  }
  for (const part of group.parts) {
    const metadata = inspect(part)
    if (metadata.characters > 20000) {
      throw new Error(`ROADMAP_CHUNK_TOO_LARGE:${part}:${metadata.characters}`)
    }
    const relativeLink = path.relative(path.dirname(group.index), part)
    if (!index.content.includes(relativeLink)) {
      throw new Error(`ROADMAP_INDEX_LINK_MISSING:${group.index}:${relativeLink}`)
    }
    manifest.push({
      family_index: group.index,
      file: metadata.file,
      characters: metadata.characters,
      blob_sha: metadata.blob_sha,
      last_review: metadata.last_review,
    })
  }
}

console.log(JSON.stringify({
  valid: true,
  chunk_limit: 20000,
  index_limit: 8000,
  groups: groups.length,
  chunks: manifest,
}, null, 2))
