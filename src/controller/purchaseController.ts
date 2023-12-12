import { Request, Response } from 'express';
import client from '../database/database';
import { ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
const jwt = require("jsonwebtoken");

const getAllPurchase = async (req:Request, res:Response) => {
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("purchases").find().toArray();
        return res.status(201).json({msg: "Purchase Found", result:result});
    } catch (error) {
        console.error(error);
        return res.status(500).json({msg: "Internal server error"});
    }
}

const getPurchase = async (req:Request, res:Response) => {
    const {id} = req.query;
    try {
        await client.connect();
        const o_id = new ObjectId(id?.toString() ?? '');
        const result = await client.db("dbDitawar").collection("purchases").findOne({_id: o_id});
        return res.status(201).json({msg: "Purchase Found", result:result});
    } catch (error) {
        console.error(error);
        return res.status(500).json({msg: "Internal server error"});
    }
}

const getPurchaseDetail = async (req:Request, res:Response) => {
    const {id} = req.query;
    try {
        await client.connect();
        const o_id = new ObjectId(id?.toString() ?? '');
        const result = await client.db("dbDitawar").collection("purchases").findOne({_id: o_id});
        const buyer = await client.db("dbDitawar").collection("users").findOne({_id: result.buyer});
        const seller = await client.db("dbDitawar").collection("users").findOne({_id: result.seller});
        const item = await client.db("dbDitawar").collection("items").findOne({_id: result.item});
        const auction = await client.db("dbDitawar").collection("auctions").findOne({_id: result.auction});
        const transaction = await client.db("dbDitawar").collection("transactions").findOne({_id: result.transaction});
        const purchaseObj = {
            _id: result._id,
            buyer: buyer,
            seller: seller,
            item: item,
            auction: auction,
            transaction: transaction,
            ended: result.ended
        }
        return res.status(201).json({msg: "Purchase Detail Found", result:purchaseObj});
    } catch (error) {
        console.error(error);
        return res.status(500).json({msg: "Internal server error"});
    }
}

const getAllPurchaseAsSeller = async (req:Request, res:Response) => {
    const {token} = req.query;
    const cert = process.env.PRIVATE_KEY;
    let decoded:any;
    try {
        decoded = jwt.verify(token, cert);
    } catch (error) {
        return res.status(401).json({msg: "Unauthorized"});
    }
    const user = decoded.user;
    const {_id} = user;
    console.log("ID:", _id);
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("purchases").find({seller: new ObjectId(_id)}).toArray();
        return res.status(201).json({msg: "Purchase Found", result:result});
    } catch (error) {
        console.error(error);
        return res.status(500).json({msg: "Internal server error"});
    }
}

const getAllPurchaseAsBuyer = async (req:Request, res:Response) => {
    const {token} = req.query;
    const cert = process.env.PRIVATE_KEY;
    let decoded:any;
    try {
        decoded = jwt.verify(token, cert);
    } catch (error) {
        return res.status(401).json({msg: "Unauthorized"});
    }
    const user = decoded.user;
    const {_id} = user;
    console.log("ID:", _id);
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("purchases").find({buyer: new ObjectId(_id)}).toArray();
        return res.status(201).json({msg: "Purchase Found", result:result});
    } catch (error) {
        console.error(error);
        return res.status(500).json({msg: "Internal server error"});
    }
}

async function markFinished(req:Request, res:Response){
    console.log("-----------------------------------------------@")
    const id = req.query.id;
    const {token} = req.body;
    if(!id){
        return res.status(400).json({msg: "Bad request (No id)"});
    }
    if(!token){
        return res.status(400).json({msg: "Bad request (No token)"});
    }
    console.log('marking finished purchases: ', id)
    try {
        //cek token
        const cert = process.env.PRIVATE_KEY;
        let decoded:any;
        try {
            decoded = jwt.verify(token!.toString(), cert);
        } catch (error) {
            return res.status(401).json({msg: "Unauthorized"});
        }

        try{
            await client.connect();
            const purchase = await client.db("dbDitawar").collection("purchases").findOne({_id: new ObjectId(id.toString())});
            if(!purchase){
                return res.status(404).json({msg: "purchase not found"});
            }
            const user = decoded.user;
            if(purchase.seller != user._id){
                return res.status(401).json({msg: "Unauthorized"});
            }
        }
        catch(error){
            console.error(error);
            return res.status(500).json({msg: "Internal server error"});
        }

        try {
            await client.connect();
            const result = await client.db("dbDitawar").collection("purchases").updateOne(
                { _id: new ObjectId(id.toString()) },
                { $push: { history: {
                    message:"purchase marked as finished by seller",
                    date: new Date(),
                    time: new Date().getTime(),
                    type: "marked"
                } } }
            );
            return res.status(201).json({msg: "purchase marked as finished", result: result});
        } catch (error) {
            console.error(error);
            return res.status(500).json({msg: "Internal server error"});
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({msg: "Internal server error"});
    }
}

const finishPurchase = async (req:Request, res:Response) => {
    const id = req.query.id;
    const {token} = req.body;
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

        try{
            await client.connect();
            const purchase = await client.db("dbDitawar").collection("purchases").findOne({_id: new ObjectId(id.toString())});
            if(!purchase){
                return res.status(404).json({msg: "purchase not found"});
            }
            const user = decoded.user;
            if(purchase.buyer != user._id){
                return res.status(401).json({msg: "Unauthorized"});
            }
        }
        catch(error){
            console.error(error);
            return res.status(500).json({msg: "Internal server error"});
        }

        try {
            await client.connect();
            const result = await client.db("dbDitawar").collection("purchases").updateOne(
                { _id: new ObjectId(id.toString()) },
                { $push: { history: {
                    message:"purchase marked as finished by buyer",
                    date: new Date(),
                    time: new Date().getTime(),
                    type: "finished"
                } } }
            );
            return res.status(201).json({msg: "purchase marked as finished", result: result});
        } catch (error) {
            console.error(error);
            return res.status(500).json({msg: "Internal server error"});
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({msg: "Internal server error"});
    }
}

const endPurchase = async (req:Request, res:Response) => {
    const {id} = req.query;
    const {user_id} = req.query; 
    if(!id || !user_id) return res.status(400).json({msg: "Bad Request"});
    const user = await client.db("dbDitawar").collection("users").findOne({_id: new ObjectId(user_id?.toString() ?? '')});
    if(!user) return res.status(400).json({msg: "User not found"});
    const purchase = await client.db("dbDitawar").collection("purchases").findOne({_id: new ObjectId(id?.toString() ?? '')});
    if(!purchase) return res.status(400).json({msg: "Purchase not found"});
    if(purchase.buyer != user._id) return res.status(400).json({msg: "User is not the buyer"});

    try {
        await client.connect();
        const o_id = new ObjectId(id?.toString() ?? '');
        const result = await client.db("dbDitawar").collection("purchases").updateOne({_id: o_id}, {$set: {ended: true}});
        return res.status(201).json({msg: "Purchase Ended", result:result});
    } catch (error) {
        console.error(error);
        return res.status(500).json({msg: "Internal server error"});
    }
}

export {
    getAllPurchase as getAllPurchase,
    getPurchase as getPurchase,
    getAllPurchaseAsSeller as getAllPurchaseAsSeller,
    getAllPurchaseAsBuyer as getAllPurchaseAsBuyer,
    endPurchase as endPurchase,
    getPurchaseDetail as getPurchaseDetail,
    markFinished as markFinished,
    finishPurchase as finishPurchase
}

module.exports = { 
    getAllPurchase, 
    getPurchase, 
    getAllPurchaseAsSeller, 
    getAllPurchaseAsBuyer,
    endPurchase, 
    getPurchaseDetail,
    markFinished,
    finishPurchase
};
