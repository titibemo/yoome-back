require('dotenv').config();
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const date = require('./../services/frenchDate');
const dateLikes = require('./../services/checkLikeAvailable');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    token: process.env.TOKEN_SECRET
})

//--------------------- CRUD profils (create, read, update, delete)

//create
router.post('/addLikes', async (req,res) => {
    
    const addDate = await date();
    const {
       id_user_liker,
       id_user_liked
    } = req.body;

    const checkIfLiked = await checkAlreadyLiked();
    const canLike = await checkCanLike(id_user_liker);

    if(checkIfLiked == 0){
        return res.status(201).send({message: "impossible de liker de nouveau cette personne"})
    }
    
    if(!canLike){
        return res.status(201).send({message: "Vous ne pouvez plus liker, pensez à devenir premium pour bénéficier de tous les avantages"})
    }

    //console.log(canLike);
    //console.log("if", ifLikes);


    const sql =' INSERT INTO likes id_user_liker, id_user_liked, created_at) VALUE (?,?,?)';
    db.query(sql,[id_user_liker, id_user_liked, addDate], (err,result) =>{
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send({message: 'like envoyé', nombre: ifLikes})
    })
    res.status(201).send({nombre: ifLikes})
})

function checkAlreadyLiked(){
    let AlreadyLiked;
    const sql = 'SELECT id_like FROM `likes` WHERE id_user_liker = ? AND id_user_liked = ?;';
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
           
            if (err) {
                return reject('err', err);
            }
            else{
                if (!isNaN(result)) {
                    AlreadyLiked = 0
                    resolve(AlreadyLiked);
                }
                else{
                    AlreadyLiked = result[0].id_like
                    resolve(AlreadyLiked);
                }
            }
        });
    });
}

function checkCanLike(idUser){

    const dateLikeOfDay = dateLikes()

    const sql = 'SELECT COUNT(created_at) AS count FROM likes WHERE DATE(created_at) = ? AND id_user_liker = ?;';
    return new Promise((resolve, reject) => {
        db.query(sql, [dateLikeOfDay, idUser], (err, result) => {
           
            if (err) {
                return reject('err', err);
            }
            else{
                const numberLike = result[0].count;
                console.log(numberLike);
                
                if (numberLike < 11) {
                    
                    resolve(true);
                }
                else{
                 
                    resolve(false);
                }
            }
        });
    });

    return dateLikeOfDay

    //const sql = 'SELECT COUNT(created_at) AS count FROM likes WHERE DATE(created_at) = "2024-10-01";'
}


module.exports = router;