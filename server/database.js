const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./weatherapi.db');

// Create tables if they do not exist
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)');
    db.run('CREATE TABLE IF NOT EXISTS searches (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, search_query TEXT, FOREIGN KEY(user_id) REFERENCES users(id))');
});

// Function to get a user by username
const getUserByUsername = (username) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

// Function to create a new user
const createUser = (username, password) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
};

// Function to add a search query
const addSearchQuery = (user_id, search_query) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO searches (user_id, search_query) VALUES (?, ?)', [user_id, search_query], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
};

module.exports = { getUserByUsername, createUser, addSearchQuery };

