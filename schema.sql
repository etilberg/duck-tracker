-- Duck Tracker D1 Schema (SQLite)

CREATE TABLE IF NOT EXISTS ducks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sightings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  duck_id TEXT NOT NULL REFERENCES ducks(id) ON DELETE CASCADE,
  found_at TEXT DEFAULT (datetime('now')),
  lat REAL,
  lng REAL,
  location_label TEXT,
  finder_name TEXT,
  message TEXT,
  email TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sightings_duck_id ON sightings(duck_id);
CREATE INDEX IF NOT EXISTS idx_sightings_found_at ON sightings(found_at);
