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
        if(result.buyer != user){
            return null;
        }
        if(result.type != "auction"){
            return null;
        }
        if(result.invoice.status != "pending"){
            return null;
        }
        const receive = await client.db("dbDitawar").collection("wallets").findOne({id_user: new ObjectId(result.seller)});
        const give = await client.db("dbDitawar").collection("wallets").findOne({id_user: new ObjectId(result.buyer)});
        if(!receive || !give){
            return null;
        }
        const receiveSaldo = parseInt(receive.saldo);
        const giveSaldo = parseInt(give.saldo);
        const receiveSaldoTertahan = parseInt(receive.saldo_tertahan);
        const giveSaldoTertahan = parseInt(give.saldo_tertahan);
        const newReceiveSaldo = receiveSaldo + parseInt(result.invoice.amount);
        const newReceiveSaldoTertahan = receiveSaldoTertahan - parseInt(result.invoice.amount);
        const newGiveSaldoTerahan = giveSaldoTertahan - parseInt(result.invoice.amount);
        const updateReceive = await client.db("dbDitawar").collection("wallets").updateOne({id_user: new ObjectId(result.seller)}, {$set: {saldo: newReceiveSaldo, saldo_tertahan: newReceiveSaldoTertahan}});
        const updateGive = await client.db("dbDitawar").collection("wallets").updateOne({id_user: new ObjectId(result.buyer)}, {$set: {saldo_tertahan: newGiveSaldoTerahan}});

        const newTransaction = {
            wallet_id: receive._id,
            type: "sale",
            amount: result.invoice.amount,
        }

        const newTransaction2 = {
            wallet_id: give._id,
            type: "purchase",
            amount: result.invoice.amount,
        }

        const insertTransaction = await client.db("dbDitawar").collection("transactions").insertOne(newTransaction);
        const insertTransaction2 = await client.db("dbDitawar").collection("transactions").insertOne(newTransaction2);

        const updateReceiveHistory = await client.db("dbDitawar").collection("wallets").updateOne({id_user: new ObjectId(result.seller)}, {$push: {history: newTransaction}});
        const updateGiveHistory = await client.db("dbDitawar").collection("wallets").updateOne({id_user: new ObjectId(result.buyer)}, {$push: {history: newTransaction2}});
        const update = await client.db("dbDitawar").collection("transactions").updateOne({_id: new ObjectId(id)}, {$set: {"invoice.status": "settled"}});
        return update;
        
    } catch (error) {
        console.error(error);
        return null;
    }

}


export {getTransaction as getTransaction, finalizeTransaction as finalizeTransaction};
module.exports = {getTransaction, finalizeTransaction};