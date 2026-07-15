const TARGET_RE = /^\s*target\s*=\s*(.+?)\s*$/im;

export function parseLangTarget(langBody: string | undefined): string | null {
  if (langBody === undefined) return null;
  const match = langBody.match(TARGET_RE);
  if (!match) return null;
  const value = match[1].trim();
  return value.length > 0 ? value : null;
}
