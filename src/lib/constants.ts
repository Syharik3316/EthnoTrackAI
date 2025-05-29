// These are keys for translation, actual values are in JSON files
// The 'value' field is what might be sent to an API or used internally.
// The 'labelKey' is used to look up the translation.
// The 'key' is for React list keys if needed, ensure uniqueness.

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
