# app/database.py
import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_NAME = os.path.join(BASE_DIR, "..", "medixai.db")

def get_db():
    conn = sqlite3.connect(DB_NAME, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        phone TEXT UNIQUE,
        password TEXT,
        age INTEGER,
        gender TEXT,
        blood_group TEXT,
        weight REAL,
        height REAL,
        allergies TEXT,
        medical_conditions TEXT,
        emergency_contact_name TEXT,
        emergency_contact_phone TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        drug1 TEXT,
        drug2 TEXT,
        level TEXT,
        confidence REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        medicine_name TEXT,
        dosage TEXT,
        time TEXT,
        days TEXT,
        is_active INTEGER DEFAULT 1
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS family (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT,
        relation TEXT,
        phone TEXT,
        notifications INTEGER DEFAULT 1,
        location_access INTEGER DEFAULT 0
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS passports (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        data TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS otps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT,
        phone TEXT,
        code TEXT,
        expires_at DATETIME
    )
    """)

    # Community & Social Network Tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS community_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        medication_profile TEXT, -- comma separated drugs
        experience TEXT,
        side_effects TEXT,
        is_doctor_reviewed INTEGER DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS medication_buddies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user1_id INTEGER,
        user2_id INTEGER,
        status TEXT DEFAULT 'pending', -- pending, accepted, rejected
        shared_meds TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user1_id) REFERENCES users (id),
        FOREIGN KEY (user2_id) REFERENCES users (id)
    )
    """)

    # News & Alerts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS health_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT, -- outbreak, statistic, event
        title TEXT,
        description TEXT,
        region TEXT,
        cases_reported INTEGER DEFAULT 0,
        severity TEXT, -- low, medium, high
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Check for missing columns in existing tables
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN name TEXT")
    except sqlite3.OperationalError:
        pass  # Column already exists

    try:
        cursor.execute("ALTER TABLE users ADD COLUMN phone TEXT UNIQUE")
    except sqlite3.OperationalError:
        pass

    # Add profile columns if they don't exist
    profile_columns = [
        ("age", "INTEGER"),
        ("gender", "TEXT"),
        ("blood_group", "TEXT"),
        ("weight", "REAL"),
        ("height", "REAL"),
        ("allergies", "TEXT"),
        ("medical_conditions", "TEXT"),
        ("emergency_contact_name", "TEXT"),
        ("emergency_contact_phone", "TEXT")
    ]
    for col_name, col_type in profile_columns:
        try:
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
        except sqlite3.OperationalError:
            pass

    try:
        cursor.execute("ALTER TABLE otps ADD COLUMN phone TEXT")
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute("ALTER TABLE history ADD COLUMN timestamp DATETIME DEFAULT CURRENT_TIMESTAMP")
    except sqlite3.OperationalError:
        pass  # Column already exists

    # Seed demo user
    cursor.execute("SELECT id FROM users WHERE email = ?", ("harshitarora1065@gmail.com",))
    if not cursor.fetchone():
        cursor.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            ("Harshit Arora", "harshitarora1065@gmail.com", "harshit123")
        )
    else:
        # Update existing demo user password to ensure it matches user request
        cursor.execute(
            "UPDATE users SET password = ?, name = ? WHERE email = ?",
            ("harshit123", "Harshit Arora", "harshitarora1065@gmail.com")
        )

    conn.commit()
    conn.close()

# app/database.py
print("📁 USING DATABASE AT:", DB_NAME)
