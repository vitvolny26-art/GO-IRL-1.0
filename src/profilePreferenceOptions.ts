export type PreferenceOption = { value: string; label: string; disabled?: boolean };

export const visiblePreferenceOptions = (options: PreferenceOption[]) => options.filter((option) => !option.disabled);
