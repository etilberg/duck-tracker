CREATE TABLE IF NOT EXISTS ducks (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sightings (
  id TEXT PRIMARY KEY,
  duck_id TEXT NOT NULL REFERENCES ducks(id) ON DELETE CASCADE,
  found_at TEXT NOT NULL DEFAULT (datetime('now')),
  lat REAL,
  lng REAL,
  location_label TEXT,
  finder_name TEXT,
  message TEXT,
  email TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
