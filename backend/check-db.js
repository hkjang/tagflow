const fs = require('fs');
const initSqlJs = require('sql.js');
const path = require('path');

async function checkDatabase() {
    try {
        const SQL = await initSqlJs();
        const dbPath = path.join(__dirname, '..', 'data', 'tagflow.db');

        if (!fs.existsSync(dbPath)) {
            console.log('Database file does not exist at:', dbPath);
            return;
        }

        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        // Check for settings table
        const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
        console.log('Tables in database:');
        if (tables.length > 0 && tables[0].values) {
            tables[0].values.forEach(row => console.log('  -', row[0]));
        } else {
            console.log('  (no tables found)');
        }

        // Check if settings table exists
        const settingsCheck = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'");
        if (settingsCheck.length > 0) {
            console.log('\n✓ Settings table exists');

            // Check settings content
            const settingsData = db.exec("SELECT * FROM settings");
            console.log('\nSettings table content:');
            if (settingsData.length > 0 && settingsData[0].values) {
                console.log('  Columns:', settingsData[0].columns);
                settingsData[0].values.forEach(row => console.log('  -', row));
            } else {
                console.log('  (empty)');
            }
        } else {
            console.log('\n✗ Settings table does NOT exist');
        }

        db.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkDatabase();
