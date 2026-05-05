import Database from "better-sqlite3"
import { app } from "electron"
import { join } from "path"
import { readFileSync, readdirSync, existsSync } from "fs"

let db: Database.Database | null = null

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

    database.exec(sql)
    database.prepare("INSERT INTO _migrations (name) VALUES (?)").run(file)

    console.log(`[DB] Migration applied: ${file}`)
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

  runMigrations(db)

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

/** Close the database connection */
export function closeDb(): void {
  if (db) {
    db.close()
    db = null
    console.log("[DB] Database closed")
  }
}
