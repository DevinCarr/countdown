import { Database } from '@cloudflare/d1';

export interface User {
    sub: string,
    email: string,
}

export interface Timer {
    id: number,
    datetime: Date,
    createdDate: Date,
    createdBy: string,
}

export const tables = [
    'users',
    'timers',
];

const createTables = [
    `CREATE TABLE IF NOT EXISTS users (sub TEXT NOT NULL PRIMARY KEY, email TEXT)`,
    `CREATE TABLE IF NOT EXISTS timers (
        id INTEGER NOT NULL PRIMARY KEY,
        description TEXT,
        datetime TEXT NOT NULL,
        created_date TEXT NOT NULL,
        created_by TEXT NOT NULL,
        FOREIGN KEY(created_by) REFERENCES users(sub)
    )`,
];

const migrations = [
    [
        // up
        `ALTER TABLE timers ADD COLUMN description TEXT`,
        // down
        `ALTER TABLE timers DROP COLUMN description`
    ]
];

export const init = async (db: Database) => {
    return await db.batch(createTables.map(txt => db.prepare(txt)));
}

export const clean = async (db: Database) => {
    return await db.batch(tables.map(txt => db.prepare(txt)));
}

