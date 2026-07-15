export function buildInitTemplate(target: string): string {
  const lang = target.trim() || "typescript";
  const ext =
    lang === "typescript" || lang === "ts"
      ? "ts"
      : lang === "javascript" || lang === "js"
        ? "js"
        : lang === "python" || lang === "py"
          ? "py"
          : lang === "rust" || lang === "rs"
            ? "rs"
            : lang === "go"
              ? "go"
              : "txt";

  const entry = `external/main.${ext}`;

  return `lang:
  target = ${lang}

context:
  ${lang} project — describe domain and stack here

variables:
  entry = ${entry}

goal:
  Describe what to build in clear sentences
  Prefer concrete behavior over vague wishes

constraints:
  No unnecessary dependencies
  Keep the solution small and explicit
  Emit code only under external/

output:
  Write only the needed files under external/
  Start with ${entry}
  No explanations
  No markdown
  No preamble
  No postamble
`;
}
