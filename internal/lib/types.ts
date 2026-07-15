export const REQUIRED_SECTIONS = ["lang", "context", "goal", "output"] as const;
export const OPTIONAL_SECTIONS = ["variables", "constraints"] as const;
export const GENERATED_SECTIONS = ["prompt"] as const;

export const KNOWN_SECTIONS = [
  ...REQUIRED_SECTIONS,
  ...OPTIONAL_SECTIONS,
  ...GENERATED_SECTIONS,
] as const;

export type SectionName = (typeof KNOWN_SECTIONS)[number];

export type Sections = Partial<Record<SectionName, string>>;

export type CheckIssue = {
  level: "error" | "warning";
  message: string;
  hint?: string;
};
