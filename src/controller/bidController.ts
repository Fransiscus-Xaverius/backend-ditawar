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
            const wallet = await client.db("dbDitawar").collection("wallets").findOne({id_user: new ObjectId(user._id)});
            // console.log(user._id)
            // console.log(wallet);
            const saldo = wallet!.saldo;
            
            if(saldo < bid){
                return res.status(400).json({msg: "Not enough balance"});
            }
            const o_id = new ObjectId(idAuction?.toString() ?? '');
            const result = await client.db("dbDitawar").collection("auctions").findOne({_id: o_id});
            if(result){
                if(result.starting_price > bid){
                    return res.status(400).json({msg: "Bid is lower than starting price"});
                }
                if(result.highest_bidder == 0 || result.highest_bidder == undefined){
                    const resultt = await client.db("dbDitawar").collection("bids").insertOne({id_auction: o_id, id_user: user._id, bid: bid, highest: true, returned: false});
                    // console.log(resultt.insertedId);
                    const update = await client.db("dbDitawar").collection("auctions").updateOne({_id: o_id}, {$set: {highest_bid: resultt.insertedId, highest_bidder: user._id}});
                    const newHistory = {
                        wallet_id: wallet!._id,
                        type: "bid",
                        invoice: {
                            auction_id: o_id,
                            bid_id: resultt.insertedId,
                            amount: bid,
                            date: new Date(),
                        }
                    }
                    const newSaldo = parseInt(saldo) - parseInt(bid);
                    const newSaldoTertahan = parseInt(wallet!.saldo_tertahan) + parseInt(bid);
                    const updateHistory = await client.db("dbDitawar").collection("wallets").updateOne({id_user: new ObjectId(user._id)}, {$push: {history: newHistory}});
                    const updateSaldo = await client.db("dbDitawar").collection("wallets").updateOne({id_user: new ObjectId(user._id)}, {$set: {saldo: newSaldo, saldo_tertahan: newSaldoTertahan}});
                    console.log("----------")
                    console.log("user:",user._id)
                    console.log("new saldo:",newSaldo);
                    console.log("saldo tertahan:",newSaldoTertahan);
                    console.log("saldo update:",updateSaldo);
                    return res.status(201).json({msg: "Bid added", result:resultt});
                }
                else{
                    // console.log(result.highest_bid)
                    const highestBid = await client.db("dbDitawar").collection("bids").findOne({_id: new ObjectId(result.highest_bid)});
                    // console.log("highest:", highestBid);
                    if(highestBid && parseInt(highestBid.bid) < parseInt(bid)){
                        console.log('NEW HIGHEST')
                        const resultt= await client.db("dbDitawar").collection("bids").insertOne({id_auction: o_id, id_user: user._id, bid: bid, highest: true, returned: false});
                        const updatePrevBid = await client.db("dbDitawar").collection("bids").updateOne({_id: new ObjectId(highestBid._id)}, {$set: {highest: false}});
                        const update = await client.db("dbDitawar").collection("auctions").updateOne({_id: o_id}, {$set: {highest_bid: resultt.insertedId, highest_bidder: user._id}});
                        const newHistory = {
                            wallet_id: wallet!._id,
                            type: "bid",
                            invoice: {
                                auction_id: o_id,
                                bid_id: resultt.insertedId,
                                amount: bid,
                                date: new Date(),
                            }
                        }
                        const newSaldo = parseInt(saldo) - parseInt(bid);
                        const newSaldoTertahan = parseInt(wallet!.saldo_tertahan) + parseInt(bid);
                        const updateHistory = await client.db("dbDitawar").collection("wallets").updateOne({id_user: new ObjectId(user._id)}, {$push: {history: newHistory}});
                        const updateSaldo = await client.db("dbDitawar").collection("wallets").updateOne({id_user: new ObjectId(user._id)}, {$set: {saldo: newSaldo, saldo_tertahan: newSaldoTertahan}});
                        console.log("----------")
                        console.log("user:",user._id)
                        console.log("new saldo:",newSaldo);
                        console.log("saldo tertahan:",newSaldoTertahan);
                        console.log("saldo update:",updateSaldo);
                        return res.status(201).json({msg: "Bid added", result:resultt}); 
                    }
                    console.log(bid, highestBid?.bid)
                }
                console.log("bid is lower");
                return res.status(400).json({msg: "Bid is lower than current highest bid"});
            }
        } catch (error) {
            console.log("error in db insert/update")
            console.log(error)
            return res.status(500).json({msg: "Internal DB server error"});
        }
    } catch (error) {
        console.log("error in initial req")
        return res.status(500).json({msg: "Request Error"});
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

async function HighBid(req:Request, res:Response){
    const {id} = req.query;
    console.log(id);
    try {
        await client.connect();
        const o_id = new ObjectId(id?.toString() ?? '');
        const result = await client.db("dbDitawar").collection("bids").findOne({id_auction : o_id, highest: true})
        return res.status(201).json({msg: "Item Found", result:result});
    } catch (error) {
        console.error(error);
        return res.status(500).json({msg: "Internal server error"});
    }
    
}


async function BidUpdate(){
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("bids").find({$and:[{highest:false}, {returned:false}]}).toArray();
        for (let i = 0; i < result.length; i++) {
            const bid = result[i];
            const wallet = await client.db("dbDitawar").collection("wallets").findOne({id_user: new ObjectId(bid.id_user)});
            const saldo = wallet!.saldo;
            const saldo_tertahan = wallet!.saldo_tertahan;
            const history = wallet!.history;
            const newSaldo = parseInt(saldo) + parseInt(bid.bid);
            const newSaldoTertahan = parseInt(saldo_tertahan) - parseInt(bid.bid);
            const update = await client.db("dbDitawar").collection("wallets").updateOne({id_user: new ObjectId(bid.id_user)}, {$set: {saldo: newSaldo, saldo_tertahan: newSaldoTertahan}});
            const newHistory = {
                wallet_id: wallet!._id,
                type: "return",
                invoice: {
                    auction_id: bid.id_auction,
                    bid_id: bid._id,
                    amount: bid.bid,
                    date: new Date(),
                }
            }
            const updateHistory = await client.db("dbDitawar").collection("wallets").updateOne({id_user: new ObjectId(bid.id_user)}, {$push: {history: newHistory}});
            const updateStatus = await client.db("dbDitawar").collection("bids").updateOne({_id: new ObjectId(bid._id)}, {$set: {returned: true}});
        }
    } catch (error) {
        console.log(error)
    }
}

export {addBid as addBid, getBid as getBid,  BidUpdate as BidUpdate, HighBid as HighBid}

module.exports = { addBid, getBid, BidUpdate, HighBid };