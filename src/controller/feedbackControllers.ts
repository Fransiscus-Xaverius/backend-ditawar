import { Request, Response } from "express";
import client from "../database/database";
import { ObjectId } from "mongodb";
import { HTTP_STATUS_CODES } from "../config/messages";

// POST /feedback
async function createFeedback(req: Request, res: Response) {
  try {
    await client.connect();
    const { id_user, id_auction } = req.query;
    const { rating, review } = req.body;
    const o_id = new ObjectId(id_user?.toString() ?? "");
    const o_id2 = new ObjectId(id_auction?.toString() ?? "");
    const result = await client
      .db("dbDitawar")
      .collection("feedbacks")
      .insertOne({
        id_user: o_id,
        id_auction: o_id2,

        review: review,
      });

    return res.status(HTTP_STATUS_CODES.CREATED).json({ message: "success" });
  } catch (error) {
    return res
      .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
}

async function getAllFeedback(req: Request, res: Response) {
  try {
    await client.connect();
    const result = await client
      .db("dbDitawar")
      .collection("feedbacks")
      .find({})
      .toArray();
    return res.status(HTTP_STATUS_CODES.SUCCESS).json({ message: "success", result: result });
  } catch (error) {
    return res
      .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
}

// GET /feedback/:id
async function getFeedbackByIdAuction(req: Request, res: Response) {
  try {
    await client.connect();
    const { id } = req.query;
    const o_id = new ObjectId(id?.toString() ?? "");
    const result = await client
      .db("dbDitawar")
      .collection("feedbacks")
      .findOne({ id_auction: o_id });
    return res.status(HTTP_STATUS_CODES.SUCCESS).json({ message: "success", result: result });
  } catch (error) {
    return res
      .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
}

export {
  createFeedback as createFeedback,
  getFeedbackByIdAuction as getFeedbackByIdAuction,
  getAllFeedback as getAllFeedback,
};

module.exports = { createFeedback, getFeedbackByIdAuction, getAllFeedback };
