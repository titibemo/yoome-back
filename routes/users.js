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

router.post('/register',async (req,res) => {
    const {email,password,firstname,lastname,birthdate } = req.body;
    const hashedPassword = await bcrypt.hash(password,10);

    const sql =' INSERT INTO users (email,password,firstname,lastname,birthdate) VALUE (?,?,?,?,?) ';
    db.query(sql,[email,hashedPassword,firstname,lastname,birthdate], (err,result) =>{
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send({message: 'Utilisateur créé'})
    })
})

router.post('/login', async (req,res) => {
    const {email,password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?'
   
    db.query(sql,[email,password], async (err,results) =>{
        const user = results[0];


        if (results.length === 0 || !(await bcrypt.compare(password, user.password))) {

            return res.status(500).send({ message: 'mdp incorrect', user: await bcrypt.compare(password, user.password), password :password, passs: user.password });

        }
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                lastname: user.lastname,
                firstname: user.firstname,
                birthdate: user.birthdate

            },
            process.env.TOKEN_SECRET, 
            { expiresIn: '1h' }
        );
        res.status(200).json({

            message: 'Utilisateur connecté', token: token
        });
    })
})




module.exports = router;