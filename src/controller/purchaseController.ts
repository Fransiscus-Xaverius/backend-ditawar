import { Request, Response } from 'express';
import client from '../database/database';
import { ObjectId } from 'mongodb';

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

const getAllPurchaseAsSeller = async (req:Request, res:Response) => {
    const {id} = req.query;
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("purchases").find({seller: id}).toArray();
        return res.status(201).json({msg: "Purchase Found", result:result});
    } catch (error) {
        console.error(error);
        return res.status(500).json({msg: "Internal server error"});
    }
}

const getAllPurchaseAsBuyer = async (req:Request, res:Response) => {
    const {id} = req.query;
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("purchases").find({buyer: id}).toArray();
        return res.status(201).json({msg: "Purchase Found", result:result});
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
    endPurchase as endPurchase
}

module.exports = { getAllPurchase, getPurchase, getAllPurchaseAsSeller, getAllPurchaseAsBuyer, endPurchase };
