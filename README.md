# ILang V2
<img width="1590" height="1268" alt="Screenshot From 2026-07-15 15-30-18" src="https://github.com/user-attachments/assets/a1811b96-7af9-4a63-9a5a-93b01af3632b" />

ILang helps you give AI a **structured** task and get back **mostly code** (less chatter → fewer expensive output tokens).

You write plain text in a `.ilang` file → ILang builds a compressed `prompt:` → you paste that into Cursor (or any AI chat).

Full reference: [Documentation.md](./Documentation.md).

---

## Requirements

- Node.js (with `npm`)
- Cursor (or any AI chat)

---

## Getting started

### 1. Install dependencies

From the project root:

```bash
npm install
```

### 2. Create a task file

```bash
npm run init -- --lang typescript
```

This creates:

- `internal/index.ilang` — your task file
- `external/` — where the AI should write code

> Another language? Example for Rust:
>
> ```bash
> npm run init -- --lang rust --force
> ```

### 3. Edit the task in plain language

Open `internal/index.ilang` and fill in the sections.

You mainly need:

1. **`lang`** — target language  
   ```
   lang:
     target = typescript
   ```

2. **`context`** — what kind of project (1–3 lines)

3. **`goal`** — what to build

4. **`output`** — which files to create (paths like `external/...`)

`variables` and `constraints` are optional.

Simple example:

```
lang:
  target = typescript

context:
  Small TypeScript Node utility

variables:
  entry = external/hello.ts

goal:
  Create a file that prints Hello World to the console

constraints:
  No dependencies
  Use console.log only

output:
  Write only external/hello.ts
  No explanations
  No markdown
```

Do **not** write the `prompt:` section by hand — the next command generates it.

### 4. Validate the file

```bash
npm run check
```

If it is valid you will see `OK`.  
If not, the terminal prints a hint about what to add.

### 5. Build the prompt for the AI

**Option A (easiest):** print the prompt and copy it:

```bash
npm run prompt -- --stdout
```

Copy **all** of that output (the block starting with `{`).

**Option B:** write `prompt:` back into `internal/index.ilang`:

```bash
npm run run
```

Then open the file and copy only the `prompt:` section.

### 6. Paste into the AI

1. Open a **new** chat (no old history).
2. Paste **only** the compressed `prompt:` (from `--stdout`).
3. Do **not** paste the human `context` / `goal` sections together with `prompt:` — that is redundant.
4. Wait for the reply. Code should land under `external/`.

### 7. Iterate

1. Edit the plain-language parts of `internal/index.ilang`.
2. Run `npm run prompt -- --stdout` again.
3. New chat + paste again.

That is usually cleaner than long back-and-forth in chat.

---

## Project layout

```
ILangV2/
  internal/
    index.ilang     ← your task (+ generated prompt:)
  external/         ← AI output goes here
  README.md
```

---

## Commands

| Command | What it does |
|---------|----------------|
| `npm run init -- --lang typescript` | Create a starter `.ilang` file |
| `npm run check` | Validate sections |
| `npm run prompt -- --stdout` | Print prompt for copy-paste into chat |
| `npm run run` | Validate + write `prompt:` into the file |

Default path: `internal/index.ilang`.

Other file:

```bash
npm run check -- path/to/task.ilang
npm run prompt -- path/to/task.ilang --stdout
```

---

## FAQ

**Why not just type in chat?**  
Chat models often add explanations and markdown. ILang adds strict `code_only` rules and a clear task shape so replies stay shorter and closer to files under `external/`.

**What do I paste into chat?**  
Only the output of `npm run prompt -- --stdout` (or the `prompt:` block from the file). Not the whole `.ilang` file.

**Can I use Rust / Python / Go?**  
Yes. Set `target` under `lang:`, and use matching paths/extensions in `output:` (`.rs`, `.py`, …).

**Syntax highlighting**  
Cursor/VS Code may suggest the local `extensions/ilang` extension. Install it if prompted.

---

## How to be a contributor

ILang is early and open to help. If you want to contribute:

1. Open an issue describing the idea or bug (or start a PR for a small fix).
2. Keep changes focused: CLI, `.ilang` format, docs, syntax highlighting, or examples.
3. Match the existing style — small, clear TypeScript; no unnecessary deps.
4. Before a PR: `npm run check` and make sure docs (`README.md` / `Documentation.md`) stay accurate if behavior changes.

Not sure where to start, or want to discuss a bigger idea first? Reach out:

- Email: **khalilov.afgan@proton.me**
- Telegram: **[@thehovdev](https://t.me/thehovdev)**

---

## TL;DR

1. `npm install`
2. `npm run init`
3. Edit `internal/index.ilang`
4. `npm run prompt -- --stdout`
5. Paste into a new AI chat
6. Check `external/`
