import Database from "better-sqlite3"
import { app } from "electron"
import { join } from "path"
import { readFileSync, readdirSync, existsSync } from "fs"
import { drizzle } from "drizzle-orm/better-sqlite3"
import * as schema from "./schema"

let db: Database.Database | null = null
let drizzleDb: ReturnType<typeof drizzle> | null = null

/** Get the database file path */
function getDbPath(): string {
  const userDataPath = app.getPath("userData")
  return join(userDataPath, "openclaude.db")
}

/** Run pending migrations from the migrations directory */
function runMigrations(database: Database.Database): void {
  // Create migrations tracking table
  database.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `)

  const migrationsDir = join(__dirname, "migrations")

  if (!existsSync(migrationsDir)) {
    return
  }

  // Read and sort migration files
  const migrationFiles = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort()

  const applied = new Set(
    database.prepare("SELECT name FROM _migrations").all().map((r: any) => r.name)
  )

  for (const file of migrationFiles) {
    if (applied.has(file)) continue

    const sql = readFileSync(join(migrationsDir, file), "utf-8")
    console.log(`[DB] Running migration: ${file}`)

    // Run in transaction - rollback on failure
    database.exec("BEGIN TRANSACTION")
    try {
      database.exec(sql)
      database.prepare("INSERT INTO _migrations (name) VALUES (?)").run(file)
      database.exec("COMMIT")
      console.log(`[DB] Migration applied: ${file}`)
    } catch (err) {
      database.exec("ROLLBACK")
      console.error(`[DB] Migration failed: ${file}`, err)
      throw new Error(`Migration ${file} failed: ${err}`)
    }
  }
}

/** Seed default settings for fresh installation */
function seedDefaults(database: Database.Database): void {
  const count = database.prepare("SELECT COUNT(*) as count FROM settings").get() as { count: number }
  if (count.count === 0) {
    console.log("[DB] Seeding default settings")
    const stmt = database.prepare("INSERT INTO settings (key, value) VALUES (?, ?)")
    stmt.run("theme", JSON.stringify("light"))
    stmt.run("permission_mode", JSON.stringify("ask"))
    console.log("[DB] Default settings seeded")
  }
}

/** Initialize the database connection */
export function initDb(): Database.Database {
  if (db) return db

  const dbPath = getDbPath()
  console.log(`[DB] Opening database at: ${dbPath}`)

  db = new Database(dbPath)

  // Enable WAL mode for concurrent reads
  db.pragma("journal_mode = WAL")
  // Enable foreign keys
  db.pragma("foreign_keys = ON")
  // Better write performance with acceptable durability
  db.pragma("synchronous = NORMAL")
  // Wait up to 5s for locked DB instead of immediate error - critical for concurrent access
  db.pragma("busy_timeout = 5000")
  // 64MB page cache for better read performance
  db.pragma("cache_size = -64000")

  runMigrations(db)
  seedDefaults(db)

  // Initialize Drizzle ORM instance
  drizzleDb = drizzle(db, { schema })

  console.log("[DB] Database initialized")
  return db
}

/** Get the database instance (throws if not initialized) */
export function getDb(): Database.Database {
  if (!db) {
    throw new Error("Database not initialized. Call initDb() first.")
  }
  return db
}

/** Get the Drizzle ORM instance (throws if not initialized) */
export function getDrizzle(): ReturnType<typeof drizzle> {
  if (!drizzleDb) {
    throw new Error("Drizzle ORM not initialized. Call initDb() first.")
  }
  return drizzleDb
}

/** Close the database connection */
export function closeDb(): void {
  if (db) {
    db.close()
    db = null
    drizzleDb = null
    console.log("[DB] Database closed")
  }
}

/**
 * Migration Rollback Limitation
 *
 * This migration system supports forward migrations only (no rollback capability).
 * If a migration introduces a bug or needs to be reverted, the fallback is:
 *   1. Manually delete the database file at: %APPDATA%/openclaude/openclaude.db (Windows)
 *      or ~/Library/Application Support/openclaude/openclaude.db (macOS)
 *   2. Restart the app - migrations will re-run from scratch
 *
 * This is acceptable for MVP since:
 *   - SQLite is local-only (no server-side data)
 *   - App is in early development phase
 *   - Users can re-import projects from directories
 *
 * For production releases, consider implementing:
 *   - Drizzle Kit down migrations (.down.sql files)
 *   - Rollback command in app settings
 */
