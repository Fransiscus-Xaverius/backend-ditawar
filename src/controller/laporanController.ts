import { Request, Response } from "express";
import client from "../database/database";
import { ObjectId } from "mongodb";
import { HTTP_STATUS_CODES } from "../config/messages";

async function newLaporan(req: Request, res: Response) {
  const { cust_id, seller_id, auction_id, reason } = req.query;
  if (!cust_id || !seller_id || !auction_id || !reason) {
    res.status(HTTP_STATUS_CODES.BAD_REQUEST).send("Missing parameters");
    return;
  }
  try {
    await client.connect();
    const result = await client
      .db("dbDitawar")
      .collection("laporan")
      .insertOne({
        buyer_id: new ObjectId(cust_id.toString() ?? ""),
        seller_id: new ObjectId(seller_id.toString() ?? ""),
        auction_id: new ObjectId(auction_id.toString() ?? ""),
        reason: reason,
      });
    res.status(HTTP_STATUS_CODES.SUCCESS).send(result);
  } catch (error) {
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(error);
  }
}

async function getLaporan(req: Request, res: Response) {
  const { id } = req.query;
  if (!id) {
    res.status(HTTP_STATUS_CODES.BAD_REQUEST).send("Missing parameters");
    return;
  }
  try {
    await client.connect();
    const result = await client
      .db("dbDitawar")
      .collection("laporan")
      .find({ _id: new ObjectId(id?.toString() ?? "") })
      .toArray();
    if (result) {
      res.status(HTTP_STATUS_CODES.SUCCESS).send(result);
    } else {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).send("Laporan not found");
    }
  } catch (error) {
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(error);
  }
}

async function getLaporanByAuction(req: Request, res: Response) {
  const { id } = req.query;
  if (!id) {
    res.status(HTTP_STATUS_CODES.BAD_REQUEST).send("Missing parameters");
    return;
  }
  try {
    await client.connect();
    const result = await client
      .db("dbDitawar")
      .collection("laporan")
      .findOne({ auction_id: new ObjectId(id?.toString() ?? "") });
    return res.status(HTTP_STATUS_CODES.SUCCESS).json({ message: "success", result: result });
  } catch (error) {
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(error);
  }
}

async function getAllLaporan(req: Request, res: Response) {
  try {
    await client.connect();
    const result = await client
      .db("dbDitawar")
      .collection("laporan")
      .find({})
      .toArray();
    res.status(HTTP_STATUS_CODES.SUCCESS).send(result);
  } catch (error) {
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(error);
  }
}

export { newLaporan, getLaporan, getAllLaporan, getLaporanByAuction };

module.exports = {
  newLaporan,
  getLaporan,
  getAllLaporan,
  getLaporanByAuction,
};
