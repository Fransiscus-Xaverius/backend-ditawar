import { Request, Response } from "express";
import client from "../database/database";
import { ObjectId } from "mongodb";

// POST /feedback
async function createFeedback(req: Request, res: Response) {
	try {
		await client.connect();
		const { id_user, id_auction } = req.query;
		const { rating, review } = req.body;
		const o_id = new ObjectId(id_user?.toString() ?? "");
		const o_id2 = new ObjectId(id_auction?.toString() ?? "");
		const result = await client.db("dbDitawar").collection("feedbacks").insertOne({
			id_user: o_id,
			id_auction: o_id2,
			rating: rating,
			review: review,
		});

        return res.status(201).json({message: "success"});
	} catch (error) {
		return res.status(500).json({ message: "Internal server error" });
	}
}

// GET /feedback/:id
async function getFeedbackByIdAuction(req: Request, res: Response) {
    try {
        await client.connect();
        const { id } = req.query;
        const o_id = new ObjectId(id?.toString() ?? "");
        const result = await client.db("dbDitawar").collection("feedbacks").findOne({ id_auction: o_id });
        return res.status(200).json({ message: "success", result: result });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

export { createFeedback as createFeedback, getFeedbackByIdAuction as getFeedbackByIdAuction };

module.exports = { createFeedback, getFeedbackByIdAuction };
