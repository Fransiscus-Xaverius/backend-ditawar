import { Request, Response } from "express";
import dotenv from 'dotenv';
dotenv.config();
import client from "../database/database";
const jwt = require("jsonwebtoken");
import { ObjectId } from "mongodb";

async function addBid(req:Request, res:Response){
    try {
        const {token, idAuction, bid} = req.body;
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
                    const resultt = await client.db("dbDitawar").collection("bids").insertOne({id_auction: o_id, id_user: user._id, bid: bid});
                    console.log(resultt.insertedId);
                    const update = await client.db("dbDitawar").collection("auctions").updateOne({_id: o_id}, {$set: {highest_bid: resultt.insertedId, highest_bidder: user._id}});
                    return res.status(201).json({msg: "Bid added", result:resultt});
                }
                else{
                    console.log(result.highest_bid)
                    const highestBid = await client.db("dbDitawar").collection("bids").findOne({_id: new ObjectId(result.highest_bid)});
                    console.log("highest:", highestBid);
                    if(highestBid && parseInt(highestBid.bid) < parseInt(bid)){
                        const resultt= await client.db("dbDitawar").collection("bids").insertOne({id_auction: o_id, id_user: user._id, bid: bid});
                        const update = await client.db("dbDitawar").collection("auctions").updateOne({_id: o_id}, {$set: {highest_bid: resultt.insertedId, highest_bidder: user._id}});
                        return res.status(201).json({msg: "Bid added", result:resultt}); 
                    }
                    console.log(bid, highestBid?.bid)
                }
                console.log("bid is lower");
                return res.status(400).json({msg: "Bid is lower than current bid"});
            }
        } catch (error) {
            console.log("error in db insert/update")
            console.log(error)
            return res.status(500).json({msg: "Internal server error"});
        }
    } catch (error) {
        console.log("error in initial req")
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