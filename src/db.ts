import { query } from '@xtuc/d1';

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

export const init = async (d1: any) => {
    return await query(d1, createTables);
}

export const migrate = async (d1: any) => {
    let results = [];
    for (const [up, down] of migrations) {
        const data = await query(d1, up);
        results.push(data);
    }
    return results;
}

export const clean = async (d1: any) => {
    let results = [];
    for (const table of tables) {
        const data = await query(d1, [
            `DROP TABLE IF EXISTS users`,
            `DROP TABLE IF EXISTS timers`,
        ]);
        results.push(data);
    }
    return results;
}

