import client from "../database/database";
import { ObjectId } from "mongodb";
import { Request, Response } from "express";

async function newRating(req: Request, res: Response) {
    const { buyer, seller, auction, rating, comment } = req.query;
    if (!buyer || !seller || !rating || !comment) {
        res.status(400).send("Missing parameters");
        return;
    }
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("ratings").insertOne({ buyer: new ObjectId(buyer.toString() ?? ''), seller: new ObjectId(seller.toString() ?? ''), auction: new ObjectId(auction?.toString() ?? ''), rating: rating, comment: comment });
        res.status(200).send(result);
    } catch (error) {
        return null;
    }
}

async function getUserRating(req: Request, res: Response) {
    const { id } = req.query;
    if (!id) {
        res.status(400).send("Missing parameters");
        return;
    }
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("ratings").find({ seller: new ObjectId(id?.toString() ?? "") }).toArray();
        res.status(200).send(result);
    } catch (error) {
        return null;
    }
}

async function getRatingByAuction(req: Request, res: Response) {
    const { id } = req.query;
    if (!id) {
        res.status(400).send("Missing parameters");
        return;
    }
    try {
        await client.connect();
        const o_id = new ObjectId(id?.toString() ?? "");
        const result = await client.db("dbDitawar").collection("ratings").findOne({ auction: o_id })
        res.status(200).json({ message: "success", result: result });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function getAllRating(req: Request, res: Response) {
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
    getAllRating,
    getRatingByAuction
}

module.exports = {
    newRating,
    getUserRating,
    getAllRating,
    getRatingByAuction
}