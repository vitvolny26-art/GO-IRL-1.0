export const sportSheetVisibleMetadata = ["level", "location", "date", "price"] as const;

export const sportSheetHiddenDuplicates = ["eyebrow", "environment-chip", "format-row"] as const;

export const sportLocationPresentation = {
  visibleLabels: false,
  compact: true,
  underlinedAction: true,
  preservesProviderFlow: true,
} as const;

export const hasSingleCompactSportLevel = () => (
  sportSheetVisibleMetadata.filter((item) => item === "level").length === 1
  && !sportSheetVisibleMetadata.includes("format" as never)
);
