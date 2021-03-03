import fs from 'fs/promises';

import {databasePath, openDatabase} from '../src/database';

async function removeDatabase() {
  return await fs.rm(databasePath, {force: true});
}

async function createDatabase() {
  const remove = process.argv.length > 2 && process.argv[2] == '-f';
  if (remove) {
    await removeDatabase();
  }

  const db = await openDatabase();
  await db.exec(`CREATE TABLE pdfs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      pdf         TEXT NOT NULL,
      thumb       TEXT NOT NULL,
      timestamp   INTEGER NOT NULL
    )`);
}

createDatabase();
