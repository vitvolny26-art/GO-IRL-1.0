---
title: Third-Party Notices
owner: Tech Lead
status: Active
source_of_truth: true
last_review: 2026-08-05
next_review: 2026-11-05
---

# Third-Party Notices

## Twemoji volleyball artwork

The volleyball artwork used by the server-rendered GO IRL invitation card is adapted from the Twemoji `U+1F3D0` asset.

- Source: https://github.com/twitter/twemoji/blob/master/assets/svg/1f3d0.svg
- Copyright: Twitter, Inc. and other contributors
- Graphics license: Creative Commons Attribution 4.0 International
- License: https://creativecommons.org/licenses/by/4.0/

The asset is scaled and embedded into the GO IRL SVG renderer without changing its original path geometry or colors.

## Great Vibes typeface

The server-rendered Beauty sharing card uses the Great Vibes typeface for the business name.

- Source: https://github.com/google/fonts/tree/main/ofl/greatvibes
- Designer: Robert E. Leuschke
- Font license: SIL Open Font License 1.1
- License: https://openfontlicense.org/

The unmodified font is downloaded from the official Google Fonts repository into temporary runtime storage and used only for image rendering. The renderer falls back to DejaVu Serif when the font cannot be loaded.