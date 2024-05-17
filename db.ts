import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const tracked = sqliteTable("tracked", {
    id: integer("id").primaryKey(),
    trackerId: text("trackerId"),
    timestamp: integer("timestamp"),
    type: text("type"),
    host: text("host"),
    pathname: text("pathname"),
    user_agent: text("user_agent"),
    ip: text("ip"),
    ip_info: text("ip_info"),
});


export async function getDatabase() {
    const sqlite = new Database('sqlite.db');

    // create table if not exists
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS tracked (
            id INTEGER PRIMARY KEY,
            trackerId TEXT,
            timestamp INTEGER,
            type TEXT,
            host TEXT,
            pathname TEXT,
            user_agent TEXT,
            ip TEXT,
            ip_info TEXT
        )
    `);

    const db = drizzle(sqlite, {
        schema: {
            tracked,
        },
    });

    return db;
}