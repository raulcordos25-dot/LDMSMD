const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors()); // Permite comunicarea cu frontend-ul
app.use(express.json()); // Permite citirea datelor in format JSON
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Site.html'));
});
// Conectarea la baza de date MySQL
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false             // Obligatoriu la Aiven
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
// 1. GET - Preia toate firmele
app.get('/api/firme', (req, res) => {
    db.query('SELECT * FROM firme', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// 2. POST - Adaugă o firmă nouă
app.post('/api/firme', (req, res) => {
    const { id, nume, telefon, email, tag, status } = req.body;
    const sql = 'INSERT INTO firme (id, nume, telefon, email, tag, status) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [id, nume, telefon, email, tag, status], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).send('Firma adăugată');
    });
});

// 3. PUT - Actualizează statusul (coloana)
app.put('/api/firme/:id', (req, res) => {
    const { status } = req.body;
    const sql = 'UPDATE firme SET status = ? WHERE id = ?';
    db.query(sql, [status, req.params.id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send('Status actualizat');
    });
});

// 4. DELETE - Șterge o firmă
app.delete('/api/firme/:id', (req, res) => {
    const sql = 'DELETE FROM firme WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send('Firma ștearsă');
    });
});

// Pornim serverul
module.exports = app;