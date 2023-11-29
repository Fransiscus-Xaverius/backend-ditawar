import { Request, Response } from "express";
import dotenv from 'dotenv';
dotenv.config();
import client from "../database/database";
const jwt = require("jsonwebtoken");
import { ObjectId } from "mongodb";

async function addBid(req:Request, res:Response){
    try {
        const {token, idAuction, bid} = req.query;
        const cert = process.env.PRIVATE_KEY;
        let decoded:any;
        try {
            decoded = jwt.verify(token, cert);
        } catch (error) {
            return res.status(401).json({msg: "Unauthorized"});
        }
        try {
            const user = decoded.user;
            await client.connect();
            const o_id = new ObjectId(idAuction?.toString() ?? '');
            const result = await client.db("dbDitawar").collection("auctions").findOne({_id: o_id});
            if(result){
                if(result.highest_bidder == 0 || result.highest_bidder == undefined){
                    const result = await client.db("dbDitawar").collection("bids").insertOne({id_auction: o_id, id_user: user._id, bid: bid});
                    
                    return res.status(201).json({msg: "Bid added", result:result});
                }
                else if(result.highest_bid < bid!){
                    const update = await client.db("dbDitawar").collection("auctions").updateOne({_id: o_id}, {$set: {highest_bid: bid, highest_bidder: user._id}});
                    return res.status(201).json({msg: "Bid added", result:result}); 
                }
                return res.status(400).json({msg: "Bid is lower than current bid"});
            }
        } catch (error) {
            return res.status(500).json({msg: "Internal server error"});
        }
    } catch (error) {
        return res.status(500).json({msg: "Internal server error"});
    }
}

async function getBid(req:Request, res:Response){
    const {id} = req.query;
    console.log(id);
    try {
        await client.connect();
        const o_id = new ObjectId(id?.toString() ?? '');
        const result = await client.db("dbDitawar").collection("bids").findOne({_id: o_id});
        return res.status(201).json({msg: "Item Found", result:result});
    } catch (error) {
        console.error(error);
        return res.status(500).json({msg: "Internal server error"});
    }

}

export {addBid as addBid, getBid as getBid}

module.exports = { addBid, getBid };