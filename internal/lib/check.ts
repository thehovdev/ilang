import { parseLangTarget } from "./lang.js";
import { REQUIRED_SECTIONS, type CheckIssue, type Sections } from "./types.js";

const HINTS: Record<string, string> = {
  lang: "Add:\n  lang:\n    target = typescript",
  context: "Add:\n  context:\n    <what project / domain this is>",
  goal: "Add:\n  goal:\n    <what the model should build>",
  output: "Add:\n  output:\n    <which files to write under external/>",
  variables: "Add keys like:\n  entry = external/main.ts\nor remove the section",
  constraints: "Add constraint lines or remove the section",
};

export function checkSections(
  sections: Sections,
  unknown: string[],
  duplicates: string[],
): CheckIssue[] {
  const issues: CheckIssue[] = [];

  for (const name of unknown) {
    issues.push({
      level: "error",
      message: `Unknown section: ${name}`,
      hint: `Known sections: lang, context, variables, goal, constraints, output, prompt`,
    });
  }

  for (const name of duplicates) {
    issues.push({
      level: "error",
      message: `Duplicate section: ${name}`,
      hint: "Keep only one block with that name",
    });
  }

  for (const name of REQUIRED_SECTIONS) {
    if (sections[name] === undefined) {
      issues.push({
        level: "error",
        message: `Missing required section: ${name}`,
        hint: HINTS[name],
      });
      continue;
    }
    if (sections[name].trim().length === 0) {
      issues.push({
        level: "error",
        message: `Empty required section: ${name}`,
        hint: HINTS[name],
      });
    }
  }

  if (sections.lang !== undefined && sections.lang.trim().length > 0) {
    if (parseLangTarget(sections.lang) === null) {
      issues.push({
        level: "error",
        message: "lang section is missing target",
        hint: "Use:\n  lang:\n    target = <language>\nExamples: typescript | rust | python | go",
      });
    }
  }

  for (const name of ["variables", "constraints"] as const) {
    if (sections[name] !== undefined && sections[name].trim().length === 0) {
      issues.push({
        level: "warning",
        message: `Empty optional section: ${name}`,
        hint: HINTS[name],
      });
    }
  }

  return issues;
}
