#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { checkSections } from "../lib/check.js";
import { buildInitTemplate } from "../lib/init.js";
import { parseIlang, serializeIlang } from "../lib/parse.js";
import { buildPromptSection } from "../lib/prompt.js";
import type { Sections } from "../lib/types.js";

const DEFAULT_PATH = "internal/index.ilang";

function usage(code = 1): never {
  console.error(`ilang — compress structured specs into code-only AI prompts

Usage:
  ilang init   [path] [--lang <target>] [--force]
  ilang check  [path]
  ilang prompt [path] [--stdout] [--quiet]
  ilang run    [path] [--stdout] [--quiet]

Defaults:
  path = ${DEFAULT_PATH}

Examples:
  ilang init --lang rust
  ilang prompt --stdout          # print only prompt: payload (paste into chat)
  ilang run                      # check + write prompt: in the .ilang file`);
  process.exit(code);
}

type Flags = {
  lang: string;
  force: boolean;
  stdout: boolean;
  quiet: boolean;
  help: boolean;
};

function parseArgs(argv: string[]): { cmd: string; path?: string; flags: Flags } {
  const flags: Flags = {
    lang: "typescript",
    force: false,
    stdout: false,
    quiet: false,
    help: false,
  };
  const positional: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") flags.help = true;
    else if (a === "--force") flags.force = true;
    else if (a === "--stdout") flags.stdout = true;
    else if (a === "--quiet" || a === "-q") flags.quiet = true;
    else if (a === "--lang") {
      const v = argv[++i];
      if (!v) {
        console.error("Missing value for --lang");
        process.exit(1);
      }
      flags.lang = v;
    } else if (a.startsWith("--lang=")) {
      flags.lang = a.slice("--lang=".length);
    } else if (a.startsWith("-")) {
      console.error(`Unknown flag: ${a}`);
      usage();
    } else {
      positional.push(a);
    }
  }

  const [cmd, path] = positional;
  return { cmd: cmd ?? "", path, flags };
}

function load(path: string) {
  if (!existsSync(path)) {
    console.error(`File not found: ${path}`);
    console.error(`Hint: run  ilang init ${path}  to create a starter file`);
    process.exit(1);
  }
  if (!path.endsWith(".ilang")) {
    console.error(`Expected a .ilang file, got: ${path}`);
    process.exit(1);
  }
  const source = readFileSync(path, "utf8");
  return { source, ...parseIlang(source) };
}

function printIssues(
  sections: Sections,
  unknown: string[],
  duplicates: string[],
): boolean {
  const issues = checkSections(sections, unknown, duplicates);
  for (const issue of issues) {
    const tag = issue.level === "error" ? "error" : "warn";
    const log = issue.level === "error" ? console.error : console.warn;
    log(`[${tag}] ${issue.message}`);
    if (issue.hint) {
      for (const line of issue.hint.split("\n")) {
        log(`       ${line}`);
      }
    }
  }
  return !issues.some((i) => i.level === "error");
}

function runInit(path: string, flags: Flags): void {
  if (existsSync(path) && !flags.force) {
    console.error(`Refusing to overwrite existing file: ${path}`);
    console.error("Pass --force to replace it");
    process.exit(1);
  }
  mkdirSync(dirname(path), { recursive: true });
  mkdirSync(resolve(process.cwd(), "external"), { recursive: true });
  writeFileSync(path, buildInitTemplate(flags.lang), "utf8");
  console.log(`Created ${path}`);
  console.log(`Lang target: ${flags.lang}`);
  console.log("Next:");
  console.log("  1. Edit sections (context / goal / output)");
  console.log(`  2. ilang prompt ${path === DEFAULT_PATH ? "" : path}`.trimEnd());
  console.log("  3. Paste only the prompt: block into a fresh AI chat");
}

function runPrompt(
  path: string,
  sections: Sections,
  order: import("../lib/types.js").SectionName[],
  flags: Flags,
): void {
  const prompt = buildPromptSection(sections);
  if (flags.stdout) {
    process.stdout.write(prompt.endsWith("\n") ? prompt : `${prompt}\n`);
    return;
  }
  const next: Sections = { ...sections, prompt };
  const out = serializeIlang(next, [...order, "prompt"]);
  writeFileSync(path, out, "utf8");
  if (!flags.quiet) {
    console.log(`Wrote prompt: → ${path}`);
    console.log("Tip: ilang prompt --stdout | pbcopy   # or xclip / wl-copy");
  }
}

function main(): void {
  const { cmd, path: pathArg, flags } = parseArgs(process.argv.slice(2));
  if (flags.help || !cmd) usage(flags.help ? 0 : 1);
  if (!["init", "check", "prompt", "run"].includes(cmd)) usage();

  const path = resolve(process.cwd(), pathArg ?? DEFAULT_PATH);

  if (cmd === "init") {
    runInit(path, flags);
    return;
  }

  const { sections, order, unknown, duplicates } = load(path);
  const ok = printIssues(sections, unknown, duplicates);

  if (cmd === "check") {
    if (ok && !flags.quiet) console.log("OK");
    process.exit(ok ? 0 : 1);
  }

  if (!ok) process.exit(1);

  if (cmd === "prompt" || cmd === "run") {
    runPrompt(path, sections, order, flags);
  }
}

main();
