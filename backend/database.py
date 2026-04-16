import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "prodi.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # History table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL,
        recommendation TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Favorites table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name TEXT NOT NULL,
        price TEXT,
        rating TEXT,
        link TEXT,
        source TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    conn.commit()
    conn.close()

def save_history(query, recommendation):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO history (query, recommendation) VALUES (?, ?)', (query, recommendation))
    conn.commit()
    conn.close()

def get_history(search_query=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if search_query:
        cursor.execute('SELECT * FROM history WHERE query LIKE ? OR recommendation LIKE ? ORDER BY timestamp DESC', 
                       (f'%{search_query}%', f'%{search_query}%'))
    else:
        cursor.execute('SELECT * FROM history ORDER BY timestamp DESC')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def save_favorite(product_name, price, rating, link, source):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO favorites (product_name, price, rating, link, source) VALUES (?, ?, ?, ?, ?)', 
                   (product_name, price, rating, link, source))
    conn.commit()
    conn.close()

def get_favorites():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM favorites ORDER BY timestamp DESC')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def delete_favorite(favorite_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM favorites WHERE id = ?', (favorite_id,))
    conn.commit()
    conn.close()
