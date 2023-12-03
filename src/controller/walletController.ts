import { Request, Response } from "express";
import dotenv from 'dotenv';
dotenv.config();
import client from "../database/database";
import { ObjectId } from "mongodb";
import { getInvoiceStatus } from "./paymentController";

async function validateWallet(id:any){
    try {
        console.log("validate wallet")
        await client.connect();
        const result = await client.db("dbDitawar").collection("wallets").findOne({id_user: new ObjectId(id?.toString() ?? '')});
        console.log("------------------")
        console.log(result)
        if(result){
            const history = result.history;
            let saldo = result.saldo;
            // let saldo_tertahan = result.result.saldo_tertahan;

            for (let i = 0; i < history.length; i++) {
                const element = history[i];
                console.log("KONTOL NJING")
                console.log(element)
                const transaction = await client.db("dbDitawar").collection("transactions").findOne({_id: element});
                console.log(transaction)
                if(transaction){
                    if(transaction.type == "topup" && transaction.invoice.status == "PENDING"){
                        const newStatus = await getInvoiceStatus(new ObjectId(transaction._id));
                        console.log("KONTOL")
                        console.log(newStatus)
                        if(newStatus == "SETTLED"){
                            console.log("SETTLED")
                            saldo += transaction.invoice.amount;
                            await client.db("dbDitawar").collection("wallets").updateOne({id_user: new ObjectId(id?.toString() ?? '')}, {$set: {saldo: saldo}});
                        }
                    }
                }
            }

            return result;
        }
        else{
            return null;
        }
        
    } catch (error) {
        console.error(error);
        return null;
    }
}

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
        await validateWallet(id);
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