import { Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import dotenv from 'dotenv';
dotenv.config();
const jwt = require("jsonwebtoken");
import client from "../database/database";

function makeid(length:number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './uploads');
        },
        filename: function (req, file, cb) {
            var id =  makeid(10)+Date.now() + '-' + file.originalname;
            cb(null, id);
        }
});
var upload = multer({ storage: storage }).single('image');
async function uploadFile(req: Request, res: Response) {
    try {
        upload(req, res, function (err) {
            if (err){
              console.log(JSON.stringify(err));
              res.status(400).send('fail saving image');
            } else {
              console.log('The filename is ' + res?.req?.file?.filename);
              res.status(200).json({filename:res?.req?.file?.filename});  
            }
        });
    } catch (error) {
        
    }
}

async function addItem(req:Request, res:Response){
    const {token, nama, deskripsi, images} = req.query;
    const cert = process.env.PRIVATE_KEY;
    let decoded:any;
    try {
        decoded = jwt.verify(token, cert);
    } catch (error) {
        return res.status(401).json({msg: "Unauthorized"});
    }
    const user = decoded.user;
    const newItem = {
        nama: nama,
        deskripsi: deskripsi,
        images: images,
        user_id: user._id
    }
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("items").insertOne(newItem);
        return res.status(201).json({msg: "Item added", result:result});
    } catch (error) {
        console.error(error);
        return res.status(500).json({msg: "Internal server error"});
    }
}

export {uploadFile as uploadFile, addItem as addItem};

module.exports = {uploadFile, addItem}