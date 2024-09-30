const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
require('dotenv').config();

const jwt = require('jsonwebtoken')

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    token: process.env.TOKEN_SECRET

})

router.post('register',async (req,res) => {
    const {email,password,firstname,lastname,birthdate } = req.body;
    const hashedPassword = await bcrypt.hash(password,10);

    const sql =' INSERT INTO users (email,password,fistname,lastname,birthdate) VALUE (?,?,?,?,?) ';
    db.query(sql,[email,hashedPassword,firstname,lastname,birthdate], (err,result) =>{
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send({message: 'Utilisateur créé'})
    })
})



module.exports = router;