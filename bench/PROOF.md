# ILang V2 — Benchmark Proof (2026-07-15)

## Claim
Structured ILang prompts with `code_only` rules reduce **output tokens** (the expensive side) vs typical vibe-coding prompts, on a mid-size TypeScript task.

## Task
File-backed key-value store CLI in TypeScript:
`get` / `set` / `delete` / `list`, JSON persistence, 5 modules under `external/kv/`.

## Method
| Arm | Input |
|-----|--------|
| **A — Vibe** | Natural-language request + light “please explain / show each file” framing |
| **B — ILang** | Generated `prompt:` only (`rules` + `dict` + compressed `body`) |

- Same model: **composer-2.5-fast** (two independent agents)
- Token proxy: `chars / 4`
- Artifacts: `bench/input-*.txt`, `bench/output-*.txt`, `bench/results.json`

## Results

| Metric | Vibe (A) | ILang (B) | Delta |
|--------|----------:|----------:|------:|
| Input chars | 2,063 | 2,355 | **+14%** |
| Input ≈ tokens | 516 | 589 | **+14%** |
| Output chars | 7,122 | 3,768 | **−47%** |
| Output ≈ tokens | 1,781 | 942 | **−47%** (~839 tokens) |
| Markdown fences | 7 | 0 | — |
| Prose-ish lines | 28 | ~1 | — |
| Combined ≈ tokens (in+out) | 2,297 | 1,531 | **−33%** |

## Correctness
| Arm | Smoke test (`set` → `get` → `list` → `delete` → `list`) |
|-----|--------------------------------------------------------|
| **ILang** | Pass |
| **Vibe** | Fail (`__dirname` in ESM) — would need another repair turn (more output) |

## Verdict
**PASS on the primary goal (output cost).**

On this mid-size task, ILang cut assistant output by ~**47%** while producing a working implementation. Input was slightly larger (+14%) due to `rules` + `dict` overhead — dictionary compression is not the win here; **strict output rules** (`reply=code_only`, `no_prose`, `no_markdown`) are.

Hello-world-scale tasks are too small to show this effect. Mid-size multi-file tasks are.

## Reproduce
```bash
npm run prompt
# A: paste bench/input-vibe.txt into a fresh agent chat
# B: paste bench/input-ilang.txt into a fresh agent chat
# Compare reply sizes: wc -c bench/output-*.txt
```

*Proxy tokenizer only; not Cursor Usage / vendor billing meters. Directional evidence for output savings.*
