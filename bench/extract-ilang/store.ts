import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { StoreError } from "./errors.js";
import type { StoreData } from "./types.js";

const DATA_FILE = join(dirname(fileURLToPath(import.meta.url)), "data.json");

function emptyData(): StoreData {
  return { records: {} };
}

function load(): StoreData {
  if (!existsSync(DATA_FILE)) {
    const dir = dirname(DATA_FILE);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const data = emptyData();
    save(data);
    return data;
  }
  const raw = readFileSync(DATA_FILE, "utf8");
  if (raw.trim().length === 0) {
    return emptyData();
  }
  const parsed = JSON.parse(raw) as StoreData;
  if (!parsed.records || typeof parsed.records !== "object") {
    return emptyData();
  }
  return parsed;
}

function save(data: StoreData): void {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function assertKey(key: string): void {
  if (key.length === 0) {
    throw new StoreError("Key must be non-empty");
  }
}

export function get(key: string): string {
  assertKey(key);
  const data = load();
  if (!(key in data.records)) {
    throw new StoreError(`Missing key: ${key}`);
  }
  return data.records[key];
}

export function set(key: string, value: string): void {
  assertKey(key);
  const data = load();
  data.records[key] = value;
  save(data);
}

export function deleteKey(key: string): void {
  assertKey(key);
  const data = load();
  if (!(key in data.records)) {
    throw new StoreError(`Missing key: ${key}`);
  }
  delete data.records[key];
  save(data);
}

export function list(): string[] {
  const data = load();
  return Object.keys(data.records).sort();
}
