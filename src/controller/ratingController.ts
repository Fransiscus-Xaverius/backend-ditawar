import client from "../database/database";
import { ObjectId } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from "express";

async function newRating(req: Request, res:Response){
    const {buyer, seller, rating, comment} = req.query;
    if(!buyer || !seller || !rating || !comment){
        res.status(400).send("Missing parameters");
        return;
    }
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("ratings").insertOne({buyer: buyer, seller: seller, rating: rating, comment: comment});
        res.status(200).send(result);   
    } catch (error) {
        return null;
    }
}

async function getUserRating(req: Request, res:Response){
    const {id} = req.query;
    if(!id){
        res.status(400).send("Missing parameters");
        return;
    }
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("ratings").find({seller: new ObjectId(id?.toString() ?? "") }).toArray();
        res.status(200).send(result);   
    } catch (error) {
        return null;
    }
}

async function getAllRating(req:Request, res:Response){
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("ratings").find({}).toArray();
        res.status(200).send(result);   
    } catch (error) {
        return res.status(500).send(error);
    }
}

export {
    newRating,
    getUserRating,
    getAllRating
}

module.exports = {
    newRating,
    getUserRating,
    getAllRating
}