export type KvRecord = {
  key: string;
  value: string;
};

export type StoreData = {
  records: Record<string, string>;
};

export type CliCommand = "get" | "set" | "delete" | "list";
