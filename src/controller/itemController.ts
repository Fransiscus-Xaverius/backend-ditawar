import { Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import dotenv from 'dotenv';
dotenv.config();
const jwt = require("jsonwebtoken");
import client from "../database/database";
import { ObjectId } from "mongodb";
import path, { dirname } from "path";
import ENV from "../config/environments";
import { HTTP_STATUS_CODES, SERVER_RESPONSE_MESSAGES } from "../config/messages";

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
            cb(null, 'public/images');
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
              res.status(HTTP_STATUS_CODES.BAD_REQUEST).send('fail saving image');
            } else {
              console.log('The filename is ' + res?.req?.file?.filename);
              res.status(HTTP_STATUS_CODES.SUCCESS).json({filename:res?.req?.file?.filename});  
            }
        });
    } catch (error) {
        
    }
}

function getImage(req:Request, res:Response):any {
    try {
        const filename = req.query.filename!.toString();
        const imagePath = `C:/Users/Frans/Documents/GitHub/backend-ditawar/public/images/${filename}`;
        console.log("Image path: ", imagePath); // Log the image path
        if (fs.existsSync(imagePath)) {
            res.sendFile(imagePath);
        } else {
            console.log("Image not found at path: ", imagePath); // Log the path where the image was not found
            res.status(HTTP_STATUS_CODES.NOT_FOUND).json({msg: "Image not found"});
        }
   } catch (error) {
        console.error(error);
   }
};

async function addItem(req:Request, res:Response){
    const {token, nama, deskripsi, images} = req.query;
    const cert = ENV.PRIVATE_KEY;
    console.log('hello');
    let decoded:any;
    try {
        decoded = jwt.verify(token, cert);
    } catch (error) {
        return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({ msg: SERVER_RESPONSE_MESSAGES.UNAUTHORIZED });
    }
    const user = decoded.user;
    const newItem = {
        nama: nama,
        deskripsi: deskripsi,
        images: images,
        user_id: user._id,
    }
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("items").insertOne(newItem);
        return res.status(HTTP_STATUS_CODES.CREATED).json({msg: "Item added", result:result});
    } catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({msg: "Internal server error"});
    }
}

async function editItem(req:Request, res:Response){
    const {token, id_item, nama, deskripsi, images} = req.query;
    const cert = ENV.PRIVATE_KEY;
    console.log('hello');
    let decoded:any;
    try {
        decoded = jwt.verify(token, cert);
    } catch (error) {
        return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({ msg: SERVER_RESPONSE_MESSAGES.UNAUTHORIZED });
    }
    const user = decoded.user;
    const o_id = new ObjectId(id_item?.toString());
    try {
        await client.connect();
        const result = await client
            .db("dbDitawar")
            .collection("items")
            .updateOne(
                { _id: o_id },
                {
                $set: {
                    nama: nama,
                    deskripsi: deskripsi,
                    images: images,
                    user_id: user._id,
                },
                }
            );
        return res.status(HTTP_STATUS_CODES.CREATED).json({msg: "Item updated", result:result});
    } catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({msg: "Internal server error"});
    }
}

async function getItem(req:Request, res:Response){
    console.log('hello');
    const cert = ENV.PRIVATE_KEY;
    const {id} = req.query;
    console.log(id);
    try {
        await client.connect();
        const o_id = new ObjectId(id?.toString() ?? '');
        // console.log(o_id);
        const result = await client.db("dbDitawar").collection("items").findOne({_id: o_id});
        // console.log(result);
        result.images = result.images;
        return res.status(HTTP_STATUS_CODES.CREATED).json({msg: "Item Found", result:result});
    } catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({msg: "Internal server error"});
    }
}

export {uploadFile as uploadFile, editItem as editItem, addItem as addItem, getItem as getItem, getImage as getImage};

module.exports = {uploadFile, editItem, addItem, getItem, getImage}