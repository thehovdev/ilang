import {
  KNOWN_SECTIONS,
  type SectionName,
  type Sections,
} from "./types.js";

const SECTION_HEADER = /^([a-z][a-z0-9_]*)\s*:\s*$/i;

function isKnownSection(name: string): name is SectionName {
  return (KNOWN_SECTIONS as readonly string[]).includes(name);
}

export function parseIlang(source: string): {
  sections: Sections;
  order: SectionName[];
  unknown: string[];
  duplicates: string[];
} {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const sections: Sections = {};
  const order: SectionName[] = [];
  const unknown: string[] = [];
  const duplicates: string[] = [];

  let current: SectionName | null = null;
  let body: string[] = [];

  const flush = () => {
    if (!current) return;
    sections[current] = body.join("\n").replace(/^\n+|\n+$/g, "");
    body = [];
  };

  for (const line of lines) {
    // prompt: swallows remainder of file (generated payload may contain nested labels)
    if (current === "prompt") {
      body.push(line);
      continue;
    }

    const match = line.match(SECTION_HEADER);
    if (match) {
      const name = match[1].toLowerCase();
      flush();
      current = null;

      if (!isKnownSection(name)) {
        unknown.push(name);
        continue;
      }

      if (sections[name] !== undefined || order.includes(name)) {
        duplicates.push(name);
      }

      current = name;
      if (!order.includes(name)) order.push(name);
      sections[name] = "";
      continue;
    }

    if (current) body.push(line);
  }

  flush();
  return { sections, order, unknown, duplicates };
}

export function serializeIlang(sections: Sections, order: SectionName[]): string {
  const knownOrder = [
    "lang",
    "context",
    "variables",
    "goal",
    "constraints",
    "output",
    "prompt",
  ] as const;

  const finalOrder = [
    ...knownOrder.filter((name) => sections[name] !== undefined),
    ...order.filter(
      (name) =>
        sections[name] !== undefined &&
        !(knownOrder as readonly string[]).includes(name),
    ),
  ];

  const unique = [...new Set(finalOrder)];

  return (
    unique
      .map((name) => {
        const body = sections[name] ?? "";
        return body.length > 0 ? `${name}:\n${body}` : `${name}:`;
      })
      .join("\n\n") + "\n"
  );
}
