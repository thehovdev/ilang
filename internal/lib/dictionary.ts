const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "only",
  "that",
  "this",
  "is",
  "are",
  "be",
  "use",
  "no",
  "not",
  "do",
  "does",
  "did",
  "as",
  "at",
  "by",
  "from",
  "it",
  "its",
  "if",
  "into",
  "over",
  "under",
  "than",
  "then",
  "so",
  "such",
  "via",
  "per",
  "all",
  "any",
  "can",
  "may",
  "must",
  "will",
  "should",
  "write",
  "file",
  "files",
]);

const TOKEN_RE = /[a-zA-Z][a-zA-Z0-9_-]*/g;

export type DictPair = { alias: string; word: string; key: string };

export function tokenize(text: string): string[] {
  return text.match(TOKEN_RE) ?? [];
}

function nextAlias(used: Set<string>): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let n = 0;
  while (true) {
    let alias = "";
    let x = n;
    do {
      alias = alphabet[x % 26] + alias;
      x = Math.floor(x / 26) - 1;
    } while (x >= 0);

    if (!used.has(alias) && !STOP_WORDS.has(alias)) {
      used.add(alias);
      return alias;
    }
    n += 1;
  }
}

export function buildDictionary(texts: string[]): DictPair[] {
  const counts = new Map<string, { count: number; canonical: string }>();

  for (const text of texts) {
    for (const token of tokenize(text)) {
      const key = token.toLowerCase();
      if (STOP_WORDS.has(key) || key.length <= 1) continue;

      const existing = counts.get(key);
      if (existing) existing.count += 1;
      else counts.set(key, { count: 1, canonical: token });
    }
  }

  const occupied = new Set<string>([...counts.keys()]);

  const entries = [...counts.entries()]
    .filter(([, v]) => v.count >= 2)
    .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]));

  const pairs: DictPair[] = [];
  for (const [key, { canonical }] of entries) {
    const alias = nextAlias(occupied);
    pairs.push({ alias, word: canonical, key });
  }

  return pairs.sort((a, b) => a.alias.localeCompare(b.alias));
}

export function compressText(text: string, pairs: DictPair[]): string {
  const byKey = new Map(pairs.map((p) => [p.key, p.alias]));
  return text.replace(TOKEN_RE, (token) => {
    const key = token.toLowerCase();
    if (STOP_WORDS.has(key)) return token;
    return byKey.get(key) ?? token;
  });
}
