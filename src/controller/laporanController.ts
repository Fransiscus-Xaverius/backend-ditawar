import { Request, Response } from "express";
import client from "../database/database";
import { ObjectId } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

async function newLaporan(req:Request, res:Response){
    const {user_id, auction_id, reason} = req.query;
    if(!user_id || !auction_id || !reason){
        res.status(400).send("Missing parameters");
        return;
    }
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("laporan").insertOne({user_id: new ObjectId(user_id.toString() ?? ''),seller_id: new ObjectId(user_id.toString() ?? ''),auction_id: new ObjectId(auction_id.toString() ?? '') , reason: reason});
        res.status(200).send(result);   
    } catch (error) {
        return res.status(500).send(error);
    }
}

async function getLaporan(req:Request, res:Response){
    const {id} = req.query;
    if(!id){
        res.status(400).send("Missing parameters");
        return;
    }
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("laporan").find({_id: new ObjectId(id?.toString() ?? "") }).toArray();
        if(result){
            res.status(200).send(result); 
        }  
        else{
            res.status(404).send("Laporan not found");
        }
    } catch (error) {
        return res.status(500).send(error);
    }
}

async function getLaporanByAuction(req:Request, res:Response){
    const {id} = req.query;
    if(!id){
        res.status(400).send("Missing parameters");
        return;
    }
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("laporan").findOne({auction_id: new ObjectId(id?.toString() ?? "") });
        return res.status(200).json({ message: "success", result: result });   
    } catch (error) {
        return res.status(500).send(error);
    }
}

async function getAllLaporan(req:Request, res:Response){
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("laporan").find({}).toArray();
        res.status(200).send(result);   
    } catch (error) {
        return res.status(500).send(error);
    }
}

export {
    newLaporan,
    getLaporan,
    getAllLaporan,
    getLaporanByAuction

}

module.exports = {
    newLaporan,
    getLaporan,
    getAllLaporan,
    getLaporanByAuction
}

