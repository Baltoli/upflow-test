import {Database, open} from 'sqlite'
import sqlite3 from 'sqlite3';

let database: Database;

export const databasePath = 'upflow.db';

export interface Row {
  pdf: string
  thumb: string
  timestamp: number
}

export async function openDatabase() {
  database = await open({
    filename: databasePath,
    driver: sqlite3.Database,
  });

  return database;
}

export async function insertEntry(path: string) {
  await database.run(
      `INSERT INTO pdfs (pdf, thumb, timestamp) VALUES (?, ?, strftime('%s','now'))`,
      path, 'no-thumb');
}

export async function allEntries() {
  return await database.all<Row[]>('SELECT * FROM pdfs');
}
