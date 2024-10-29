const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use /tmp directory for writable access on Vercel
const dbPath = process.env.NODE_ENV === 'production' 
  ? path.join('/tmp', 'database.sqlite') 
  : path.join(process.cwd(), 'database.sqlite');

const db = new sqlite3.Database(
  dbPath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error('Error opening database:', err);
    } else {
      console.log('Database connected');
      createTables();
    }
  }
);

function createTables() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        bio TEXT,
        studyInterests TEXT,
        profileImage TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating users table:', err);
      } else {
        console.log('Users table ready');
      }
    });

    // Messages table with reactions
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        seen INTEGER DEFAULT 0,
        reaction TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users (id),
        FOREIGN KEY (receiver_id) REFERENCES users (id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating messages table:', err);
      } else {
        console.log('Messages table ready');
      }
    });
  });
}

module.exports = db;
