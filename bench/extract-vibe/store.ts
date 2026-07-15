import * as fs from 'fs';
import * as path from 'path';
import type { KvRecord, StoreData } from './types';
import { StoreError } from './errors';

const DEFAULT_DATA_FILE = path.join(__dirname, 'data.json');

function assertNonEmptyKey(key: string): void {
  if (typeof key !== 'string' || key.trim() === '') {
    throw new StoreError('Key must be a non-empty string');
  }
}

function assertStringValue(value: string): void {
  if (typeof value !== 'string') {
    throw new StoreError('Value must be a string');
  }
}

function load(dataFile: string = DEFAULT_DATA_FILE): StoreData {
  if (!fs.existsSync(dataFile)) {
    return { records: {} };
  }

  const raw = fs.readFileSync(dataFile, 'utf-8');

  try {
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    if (!parsed.records || typeof parsed.records !== 'object' || Array.isArray(parsed.records)) {
      throw new StoreError('Invalid store file format');
    }
    return { records: parsed.records };
  } catch (err) {
    if (err instanceof StoreError) {
      throw err;
    }
    throw new StoreError('Invalid store file format');
  }
}

function save(data: StoreData, dataFile: string = DEFAULT_DATA_FILE): void {
  const dir = path.dirname(dataFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

export function get(key: string, dataFile: string = DEFAULT_DATA_FILE): string {
  assertNonEmptyKey(key);
  const data = load(dataFile);

  if (!(key in data.records)) {
    throw new StoreError(`Key not found: ${key}`);
  }

  return data.records[key];
}

export function set(key: string, value: string, dataFile: string = DEFAULT_DATA_FILE): void {
  assertNonEmptyKey(key);
  assertStringValue(value);

  const data = load(dataFile);
  data.records[key] = value;
  save(data, dataFile);
}

export function deleteKey(key: string, dataFile: string = DEFAULT_DATA_FILE): void {
  assertNonEmptyKey(key);
  const data = load(dataFile);

  if (!(key in data.records)) {
    throw new StoreError(`Key not found: ${key}`);
  }

  delete data.records[key];
  save(data, dataFile);
}

export function list(dataFile: string = DEFAULT_DATA_FILE): KvRecord[] {
  const data = load(dataFile);

  return Object.entries(data.records)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({ key, value }));
}
