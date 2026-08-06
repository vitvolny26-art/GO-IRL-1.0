export const beautyShareCardTitleFonts = [
  "beauty-script",
  "elegant-serif",
  "modern-sans",
  "condensed-sans",
] as const;

export type BeautyShareCardTitleFont = (typeof beautyShareCardTitleFonts)[number];

export const defaultBeautyShareCardTitleFont: BeautyShareCardTitleFont = "beauty-script";

export const beautyShareCardTitleFontOptions: ReadonlyArray<{
  id: BeautyShareCardTitleFont;
  label: string;
  cssFontFamily: string;
  svgFontFamily: string;
}> = [
  {
    id: "beauty-script",
    label: "Beauty Script",
    cssFontFamily: '"Great Vibes", "Segoe Script", cursive',
    svgFontFamily: "GO IRL Beauty Script, Great Vibes, Segoe Script, cursive",
  },
  {
    id: "elegant-serif",
    label: "Elegant Serif",
    cssFontFamily: 'Georgia, "Times New Roman", serif',
    svgFontFamily: "DejaVu Serif, Georgia, Times New Roman, serif",
  },
  {
    id: "modern-sans",
    label: "Modern Sans",
    cssFontFamily: 'Inter, Arial, sans-serif',
    svgFontFamily: "DejaVu Sans, Arial, sans-serif",
  },
  {
    id: "condensed-sans",
    label: "Condensed Sans",
    cssFontFamily: '"Arial Narrow", Arial, sans-serif',
    svgFontFamily: "DejaVu Sans Condensed, Arial Narrow, Arial, sans-serif",
  },
];

const optionById = new Map(beautyShareCardTitleFontOptions.map((option) => [option.id, option]));

export const isBeautyShareCardTitleFont = (value: unknown): value is BeautyShareCardTitleFont =>
  typeof value === "string" && beautyShareCardTitleFonts.includes(value as BeautyShareCardTitleFont);

export const normalizeBeautyShareCardTitleFont = (value: unknown): BeautyShareCardTitleFont =>
  isBeautyShareCardTitleFont(value) ? value : defaultBeautyShareCardTitleFont;

export const resolveBeautyShareCardTitleFontOption = (value: unknown) =>
  optionById.get(normalizeBeautyShareCardTitleFont(value)) ?? beautyShareCardTitleFontOptions[0];

export const resolveBeautyShareCardTitleCssFontFamily = (value: unknown) =>
  resolveBeautyShareCardTitleFontOption(value).cssFontFamily;

export const resolveBeautyShareCardTitleSvgFontFamily = (value: unknown) =>
  resolveBeautyShareCardTitleFontOption(value).svgFontFamily;
