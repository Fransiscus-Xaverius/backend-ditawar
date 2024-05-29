import { Request, Response } from "express";
import client from "../database/database";
import { ObjectId } from "mongodb";
import { HTTP_STATUS_CODES } from "../config/messages";

// POST /feedback
async function createService(req: Request, res: Response) {
	try {
		await client.connect();
		const { id_user, id_auction } = req.query;
		const o_id = new ObjectId(id_user?.toString() ?? "");
		const o_id2 = new ObjectId(id_auction?.toString() ?? "");
		const result = await client.db("dbDitawar").collection("services").insertOne({
			id_user: o_id,
			id_auction: o_id2,
			msg : req.body.msg,
		});

        return res.status(HTTP_STATUS_CODES.CREATED).json({message: "success"});
	} catch (error) {
		return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
	}
}

async function getAllService(req: Request, res: Response) {
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("services").find({}).toArray();
        return res.status(HTTP_STATUS_CODES.SUCCESS).json({ message: "success", result: result });
    } catch (error) {
        return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
    
}

// GET /feedback/:id
async function getServiceByIdAuction(req: Request, res: Response) {
    try {
        await client.connect();
        const { id } = req.query;
        const o_id = new ObjectId(id?.toString() ?? "");
        const result = await client.db("dbDitawar").collection("services").findOne({ id_auction: o_id });
        return res.status(HTTP_STATUS_CODES.SUCCESS).json({ message: "success", result: result });
    } catch (error) {
        return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
}

export { createService as createService, getServiceByIdAuction as getServiceByIdAuction, getAllService as getAllService };

module.exports = { createService, getServiceByIdAuction, getAllService };
