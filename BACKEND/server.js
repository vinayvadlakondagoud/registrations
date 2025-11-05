// server.js
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Connect to MySQL (Railway Cloud DB)
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT || 3306
});

// Check connection
db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Connected to MySQL (Railway Cloud DB)');
    createTable();
  }
});

// ✅ Create table if not exists
function createTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS registrants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      team_name VARCHAR(100) NOT NULL,
      uid BIGINT NOT NULL,
      contact_number VARCHAR(20) NOT NULL
    )
  `;
  db.query(sql, (err) => {
    if (err) console.error('Table creation failed:', err);
    else console.log('✅ Table ready in cloud DB.');
  });
}

// ----------------------------------------------------
// ✅ FIX: ADD THE MISSING GET ROUTE FOR THE HOME PAGE (/)
// This resolves the "Cannot GET /" error when the server redirects.
// ----------------------------------------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static assets (like images, CSS, JS) from the root directory
// This is needed for your styles and images to load correctly.
app.use(express.static(path.join(__dirname))); 


// ✅ Handle form submission
app.post('/register', (req, res) => {
  const { userName, teamName, UID, contactNumber } = req.body;

  const sql = `
    INSERT INTO registrants (full_name, team_name, uid, contact_number)
    VALUES (?, ?, ?, ?)
  `;
  db.query(sql, [userName, teamName, UID, contactNumber], (err, result) => {
    if (err) {
      console.error('Insert failed:', err);
      // If database fails, send the user to the home page with an error flag
      res.redirect('/?error=db_insert_failed'); 
    } else {
      console.log('✅ Data inserted:', result.insertId);
      // Use HTTP redirect to go back to the home page (now handled by app.get('/'))
      res.redirect('/'); 
    }
  });
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
