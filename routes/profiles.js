require('dotenv').config();
const express = require('express');

//-----Upload
const multer = require('multer')
const path = require('path')

let storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './uploads/')     // './uploads/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

let upload = multer({
    storage: storage
});
// FIN Upload--------------------

const router = express.Router();
const mysql = require('mysql2');
const date = require('./../services/frenchDate')

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    token: process.env.TOKEN_SECRET
})

//--------------------- CRUD profils (create, read, update, delete)

//create
router.post('/createProfil', upload.single('image'), async (req,res) => {

    const addDate = await date();
    let imgsrc;

    if (!req.file) {
        imgsrc = ""
    } else {
        console.log(req.file.filename)
        imgsrc = req.file.filename
    }
    
    const {
        description,
        localisation,
        gender,
        sexual_preference,
        display_profil,
        premium,
        id_user
    } = req.body;

    const sql =' INSERT INTO profiles (description, localisation, gender, selfie, sexual_preference, display_profil, created_at, premium, id_user) VALUE (?,?,?,?,?,?,?,?,?)';
    db.query(sql,[description, localisation, gender, imgsrc, sexual_preference, display_profil, addDate, premium, id_user], (err,result) =>{
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send({message: 'profil créé'})
    })
})

//delete profil (Must delete only profil, not profil + users)
router.post('/eraseProfil/:id', (req, res) => {

    const idUser = req.params.id
    
    const sql = 'DELETE FROM profiles WHERE id_user = ?';

    db.query(sql, [idUser], (err,result) =>{
        if(err){
            return res.status(500).send(err)
        }
        else{
            res.status(201).json({
                message: 'Utilisateur effacé'
            })
        }

    })
})

// read Profil
router.get('/showProfil/:id', (req, res) => {

    const idUser = req.params.id
    
    const sql = 'SELECT * FROM profiles WHERE id_user = ?';

    db.query(sql, [idUser], (err,results) =>{
        if(err){
            return res.status(500).send(err)
        }
        else{
            res.status(200).json(results);
        }
    })
})





module.exports = router;