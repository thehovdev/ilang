import * as path from 'path';
import type { CliCommand } from './types';
import { StoreError } from './errors';
import { get, set, deleteKey, list } from './store';

const DATA_FILE = path.join(__dirname, 'data.json');

function printUsage(): void {
  console.error('Usage:');
  console.error('  npx tsx external/kv/cli.ts set <key> <value>');
  console.error('  npx tsx external/kv/cli.ts get <key>');
  console.error('  npx tsx external/kv/cli.ts delete <key>');
  console.error('  npx tsx external/kv/cli.ts list');
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  const command = args[0] as CliCommand;

  try {
    switch (command) {
      case 'set': {
        if (args.length !== 3) {
          throw new StoreError('set requires a key and a value');
        }
        set(args[1], args[2], DATA_FILE);
        break;
      }

      case 'get': {
        if (args.length !== 2) {
          throw new StoreError('get requires a key');
        }
        console.log(get(args[1], DATA_FILE));
        break;
      }

      case 'delete': {
        if (args.length !== 2) {
          throw new StoreError('delete requires a key');
        }
        deleteKey(args[1], DATA_FILE);
        break;
      }

      case 'list': {
        if (args.length !== 1) {
          throw new StoreError('list takes no additional arguments');
        }
        const records = list(DATA_FILE);
        for (const record of records) {
          console.log(`${record.key}=${record.value}`);
        }
        break;
      }

      default:
        throw new StoreError(`Unknown command: ${command}`);
    }
  } catch (err) {
    if (err instanceof StoreError) {
      fail(err.message);
    }
    throw err;
  }
}

main();
