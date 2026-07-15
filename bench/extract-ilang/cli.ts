import { get, set, deleteKey, list } from "./store.js";
import { StoreError } from "./errors.js";
import type { CliCommand } from "./types.js";

const COMMANDS: CliCommand[] = ["get", "set", "delete", "list"];

function run(): void {
  const [cmd, ...rest] = process.argv.slice(2);
  if (!cmd || !COMMANDS.includes(cmd as CliCommand)) {
    throw new StoreError("Invalid command");
  }
  let output = "";
  switch (cmd as CliCommand) {
    case "get": {
      if (rest.length !== 1) {
        throw new StoreError("get requires a key");
      }
      output = get(rest[0]);
      break;
    }
    case "set": {
      if (rest.length < 2) {
        throw new StoreError("set requires a key and value");
      }
      const [key, ...valueParts] = rest;
      set(key, valueParts.join(" "));
      break;
    }
    case "delete": {
      if (rest.length !== 1) {
        throw new StoreError("delete requires a key");
      }
      deleteKey(rest[0]);
      break;
    }
    case "list": {
      if (rest.length !== 0) {
        throw new StoreError("list takes no arguments");
      }
      output = list().join("\n");
      break;
    }
  }
  if (output.length > 0) {
    process.stdout.write(output + "\n");
  }
}

try {
  run();
} catch (err) {
  const message = err instanceof StoreError ? err.message : "Error";
  process.stderr.write(message + "\n");
  process.exit(1);
}
