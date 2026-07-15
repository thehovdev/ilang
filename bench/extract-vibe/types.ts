export interface KvRecord {
  key: string;
  value: string;
}

export interface StoreData {
  records: Record<string, string>;
}

export type CliCommand = 'get' | 'set' | 'delete' | 'list';
