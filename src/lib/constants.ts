// These are keys for translation, actual values are in JSON files
// The 'value' field is what might be sent to an API or used internally.
// The 'labelKey' is used to look up the translation. (This will be reverted to direct labels)
// The 'key' is for React list keys if needed, ensure uniqueness.

export const REGIONS_RAW = [
  { key: "rostov", value: "Ростовская область", label: "Ростовская область" },
  { key: "voronezh", value: "Воронежская область", label: "Воронежская область" },
  { key: "lipetsk", value: "Липецкая область", label: "Липецкая область" },
  { key: "tula", value: "Тульская область", label: "Тульская область" },
  { key: "oryol", value: "Орловская область", label: "Орловская область" },
  { key: "kaluga", value: "Калужская область", label: "Калужская область" },
  { key: "tver", value: "Тверская область", label: "Тверская область" },
  { key: "novgorod", value: "Новгородская область", label: "Новгородская область" },
  { key: "leningrad", value: "Ленинградская область", label: "Ленинградская область" },
  { key: "yaroslavl", value: "Ярославская область", label: "Ярославская область" },
  { key: "vologda", value: "Вологодская область", label: "Вологодская область" },
];

export const AI_AVATAR_OPTIONS_RAW = [
  { value: "human", label: "Человек" },
  { value: "robot", label: "Робот" },
  { value: "fairytale", label: "Сказочный герой" },
];

export const TRAVEL_STYLES_RAW = [
    { value: "budget", label: "Бюджетный" },
    { value: "luxury", label: "Люкс" },
    { value: "adventure", label: "Приключения" },
    { value: "family-friendly", label: "Семейный" },
    { value: "any", label: "Любой"},
];

// The following constants are kept from the previous state as they were used
// by the i18n setup. For a true rollback, they would be removed or the components
// using them would be updated to use direct strings or the _RAW versions above.
// For this rollback, I'll keep them but components will use hardcoded strings.
export const REGIONS_KEYS = [
  { key: "rostov", value: "Ростовская область", labelKey: "Regions.rostov" },
  { key: "voronezh", value: "Воронежская область", labelKey: "Regions.voronezh" },
  { key: "lipetsk", value: "Липецкая область", labelKey: "Regions.lipetsk" },
  { key: "tula", value: "Тульская область", labelKey: "Regions.tula" },
  { key: "oryol", value: "Орловская область", labelKey: "Regions.oryol" },
  { key: "kaluga", value: "Калужская область", labelKey: "Regions.kaluga" },
  { key: "tver", value: "Тверская область", labelKey: "Regions.tver" },
  { key: "novgorod", value: "Новгородская область", labelKey: "Regions.novgorod" },
  { key: "leningrad", value: "Ленинградская область", labelKey: "Regions.leningrad" },
  { key: "yaroslavl", value: "Ярославская область", labelKey: "Regions.yaroslavl" },
  { key: "vologda", value: "Вологодская область", labelKey: "Regions.vologda" },
];

export const AI_AVATAR_OPTIONS_KEYS = [
  { value: "human", labelKey: "AiAvatarOptions.human" },
  { value: "robot", labelKey: "AiAvatarOptions.robot" },
  { value: "fairytale", labelKey: "AiAvatarOptions.fairytale" },
];

export const TRAVEL_STYLES_KEYS = [
    { value: "budget", labelKey: "TravelStyles.budget" },
    { value: "luxury", labelKey: "TravelStyles.luxury" },
    { value: "adventure", labelKey: "TravelStyles.adventure" },
    { value: "family-friendly", labelKey: "TravelStyles.family-friendly" },
    { value: "any", labelKey: "TravelStyles.any"},
];
