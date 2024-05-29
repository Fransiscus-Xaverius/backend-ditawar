import client from "../database/database";
import { ObjectId } from "mongodb";
import { Request, Response } from "express";
import { HTTP_STATUS_CODES } from "../config/messages";

async function newRating(req: Request, res: Response) {
    const { buyer, seller, auction, rating, comment } = req.query;
    if (!buyer || !seller || !rating || !comment) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).send("Missing parameters");
        return;
    }
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("ratings").insertOne({ buyer: new ObjectId(buyer.toString() ?? ''), seller: new ObjectId(seller.toString() ?? ''), auction: new ObjectId(auction?.toString() ?? ''), rating: rating, comment: comment });
        res.status(HTTP_STATUS_CODES.SUCCESS).send(result);
    } catch (error) {
        return null;
    }
}

async function getUserRating(req: Request, res: Response) {
    const { id } = req.query;
    if (!id) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).send("Missing parameters");
        return;
    }
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("ratings").find({ seller: new ObjectId(id?.toString() ?? "") }).toArray();
        res.status(HTTP_STATUS_CODES.SUCCESS).send(result);
    } catch (error) {
        return null;
    }
}

async function getRatingByAuction(req: Request, res: Response) {
    const { id } = req.query;
    if (!id) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).send("Missing parameters");
        return;
    }
    try {
        await client.connect();
        const o_id = new ObjectId(id?.toString() ?? "");
        const result = await client.db("dbDitawar").collection("ratings").findOne({ auction: o_id })
        res.status(HTTP_STATUS_CODES.SUCCESS).json({ message: "success", result: result });
    } catch (error) {
        return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
}

async function getAllRating(req: Request, res: Response) {
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("ratings").find({}).toArray();
        res.status(HTTP_STATUS_CODES.SUCCESS).send(result);
    } catch (error) {
        return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(error);
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