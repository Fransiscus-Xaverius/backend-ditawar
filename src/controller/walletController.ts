import { Request, Response } from "express";
import dotenv from 'dotenv';
dotenv.config();
import client from "../database/database";
import { ObjectId } from "mongodb";

async function newWallet(id_user:String, saldo:Number){
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("wallets").insertOne({id_user: id_user, saldo: saldo, saldo_tertahan: 0, history: []});
        return result
    } catch (error) {
        return null;
    }
}

async function getWallet(req:Request, res:Response){
    const {id} = req.query;
    console.log(id);
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("wallets").findOne({id_user: new ObjectId(id?.toString() ?? '')});

        return res.status(201).json({msg: "Wallet Found", result:result});
    } catch (error) {
        console.error(error);
        return res.status(500).json({msg: "Internal server error"});
    }
}

async function addSaldo(req:Request, res:Response){
    try {
        const {id_user, saldo} = req.query;
        await client.connect();
        const result = await client.db("dbDitawar").collection("wallets").updateOne({id_user: id_user}, {$set: {saldo: saldo}});
        return res.status(201).json({msg: "Successfully added Saldo to wallet!", result:result});
    } catch (error) {
        return res.status(500).json({msg: "Internal server error"});
    }
}

async function useSaldo(req:Request, res:Response){
    try {
        const {id_user, saldo} = req.query;
        await client.connect();
        const result = await client.db("dbDitawar").collection("wallets").updateOne({id_user: id_user}, {$set: {saldo: saldo}});
        return res.status(201).json({msg: "Payment via wallet successful", result:result});
    } catch (error) {
        return res.status(500).json({msg: "Internal server error"});
    }
}

export {newWallet as newWallet, getWallet as getWallet, addSaldo as addSaldo, useSaldo as useSaldo}

module.exports = { newWallet, getWallet, addSaldo, useSaldo };