const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

async function buildDatabase() {
    const SQL = await initSqlJs();
    const db = new SQL.Database();

    const sqlScriptPath = path.join(__dirname, '..', 'data', 'almesiri_database.sql');
    const sqlContent = fs.readFileSync(sqlScriptPath, 'utf8');

    // Remove MySQL-specific directives for SQLite engine
    const cleanSql = sqlContent
        .replace(/SET NAMES utf8mb4;/g, '')
        .replace(/SET FOREIGN_KEY_CHECKS = \d;/g, '')
        .replace(/ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;/g, ';')
        .replace(/ON DUPLICATE KEY UPDATE[^;]+;/g, ';')
        .replace(/`id` INT AUTO_INCREMENT PRIMARY KEY/g, '`id` INTEGER PRIMARY KEY AUTOINCREMENT')
        .replace(/INT AUTO_INCREMENT PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT')
        .replace(/INSERT INTO/g, 'INSERT OR REPLACE INTO');

    // Execute SQLite statements
    db.run(cleanSql);

    const data = db.export();
    const buffer = Buffer.from(data);
    const dbFilePath = path.join(__dirname, '..', 'data', 'almesiri_database.db');
    fs.writeFileSync(dbFilePath, buffer);

    console.log('✅ Successfully created SQLite binary database at:', dbFilePath, 'Size:', buffer.length, 'bytes');
}

buildDatabase().catch(console.error);
