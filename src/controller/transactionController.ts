import { Request, Response } from "express";
import dotenv from 'dotenv';
dotenv.config();
const jwt = require("jsonwebtoken");
import client from "../database/database";
import { ObjectId } from "mongodb";

async function getTransaction(req:Request, res:Response){;
    const {id,token} = req.query;
    if(!id){
        return res.status(400).json({msg: "Bad request (No id)"});
    }
    if(!token){
        return res.status(400).json({msg: "Bad request (No token)"});
    }
    try {
        //cek token
        const cert = process.env.PRIVATE_KEY;
        let decoded:any;
        try {
            decoded = jwt.verify(token!.toString(), cert);
        } catch (error) {
            return res.status(401).json({msg: "Unauthorized"});
        }

        try {
            await client.connect();
            const result = await client.db("dbDitawar").collection("transactions").findOne({_id: new ObjectId(id.toString())});
            if(!result){
                return res.status(404).json({msg: "Transaction not found"});
            }
            return res.status(201).json({msg: "Transaction Found", result: result});
        } catch (error) {
            console.error(error);
            return res.status(500).json({msg: "Internal server error"});
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({msg: "Internal server error"});
    }
}

const finalizeTransaction = async (id:string, user:string) => {
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("transactions").findOne({_id: new ObjectId(id)});
        if(!result){
            return null;
        }
        if(result.type == "auction"){
            
        }
        const update = await client.db("dbDitawar").collection("transactions").updateOne({_id: new ObjectId(id)}, {$set: {status: "FINALIZED"}});
        return update;
    } catch (error) {
        console.error(error);
        return null;
    }
}


export {getTransaction as getTransaction};
module.exports = {getTransaction};