import * as migration_20260206_170840 from './20260206_170840';

export const migrations = [
  {
    up: migration_20260206_170840.up,
    down: migration_20260206_170840.down,
    name: '20260206_170840'
  },
];
