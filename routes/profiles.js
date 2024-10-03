require('dotenv').config();
const express = require('express');
//-----add

const multer = require('multer')
const path = require('path')


var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './uploads/')     // './uploads/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

var upload = multer({
    storage: storage
});
// FIN ADD------

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
    const {
        description,
        localisation,
        gender,
        selfie,
        sexual_preference,
        display_profil,
        premium,
        id_profil
    } = req.body;

    if (!req.file) {
        console.log("No file upload");
    } else {
        console.log(req.file.filename)
        var imgsrc = req.file.filename
        var insertData = "INSERT INTO test(pic)VALUES(?)"
        db.query(insertData, [imgsrc], (err, result) => {
            if (err) throw err
            console.log("file uploaded")
        })
        res.send('Image Has been uploaded, please check your directory and mysql database....');
    }

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