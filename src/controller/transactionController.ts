import { Request, Response } from "express";
const jwt = require("jsonwebtoken");
import client from "../database/database";
import { ObjectId } from "mongodb";
import ENV from "../config/environments";
import { HTTP_STATUS_CODES, SERVER_RESPONSE_MESSAGES } from "../config/messages";

async function getTransaction(req: Request, res: Response) {
    ;
    const { id, token } = req.query;
    if (!id) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ msg: "Bad request (No id)" });
    }
    if (!token) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ msg: "Bad request (No token)" });
    }
    try {
        //cek token
        const cert = ENV.PRIVATE_KEY;
        let decoded: any;
        try {
            decoded = jwt.verify(token!.toString(), cert);
        } catch (error) {
            return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({ msg: SERVER_RESPONSE_MESSAGES.UNAUTHORIZED });
        }

        try {
            await client.connect();
            const result = await client.db("dbDitawar").collection("transactions").findOne({ _id: new ObjectId(id.toString()) });
            if (!result) {
                return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ msg: "Transaction not found" });
            }
            return res.status(HTTP_STATUS_CODES.CREATED).json({ msg: "Transaction Found", result: result });
        } catch (error) {
            console.error(error);
            return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ msg: "Internal server error" });
        }
    } catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ msg: "Internal server error" });
    }
}

const finalizeTransaction = async (id: string, user: string) => {
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("transactions").findOne({ _id: new ObjectId(id) });
        if (!result) {
            return null;
        }
        if (result.buyer != user) {
            return null;
        }
        if (result.type != "auction") {
            return null;
        }
        if (result.invoice.status != "pending") {
            return null;
        }
        const receive = await client.db("dbDitawar").collection("wallets").findOne({ id_user: new ObjectId(result.seller) });
        const give = await client.db("dbDitawar").collection("wallets").findOne({ id_user: new ObjectId(result.buyer) });
        if (!receive || !give) {
            return null;
        }
        const receiveSaldo = parseInt(receive.saldo);
        const giveSaldo = parseInt(give.saldo);
        const receiveSaldoTertahan = parseInt(receive.saldo_tertahan);
        const giveSaldoTertahan = parseInt(give.saldo_tertahan);
        const newReceiveSaldo = receiveSaldo + parseInt(result.invoice.amount);
        const newReceiveSaldoTertahan = receiveSaldoTertahan - parseInt(result.invoice.amount);
        const newGiveSaldoTerahan = giveSaldoTertahan - parseInt(result.invoice.amount);
        const updateReceive = await client.db("dbDitawar").collection("wallets").updateOne({ id_user: new ObjectId(result.seller) }, { $set: { saldo: newReceiveSaldo, saldo_tertahan: newReceiveSaldoTertahan } });
        const updateGive = await client.db("dbDitawar").collection("wallets").updateOne({ id_user: new ObjectId(result.buyer) }, { $set: { saldo_tertahan: newGiveSaldoTerahan } });

        const newTransaction = {
            wallet_id: receive._id,
            auction: result.auction,
            type: "sale",
            amount: result.invoice.amount,
            date: new Date(),
            from: result.buyer
        }

        const newTransaction2 = {
            wallet_id: give._id,
            auction: result.auction,
            type: "purchase",
            amount: result.invoice.amount,
            date: new Date(),
            to: result.seller
        }

        const insertTransaction = await client.db("dbDitawar").collection("transactions").insertOne(newTransaction);
        const insertTransaction2 = await client.db("dbDitawar").collection("transactions").insertOne(newTransaction2);

        const updateReceiveHistory = await client.db("dbDitawar").collection("wallets").updateOne({ id_user: new ObjectId(result.seller) }, { $push: { history: newTransaction } });
        const updateGiveHistory = await client.db("dbDitawar").collection("wallets").updateOne({ id_user: new ObjectId(result.buyer) }, { $push: { history: newTransaction2 } });
        const update = await client.db("dbDitawar").collection("transactions").updateOne({ _id: new ObjectId(id) }, { $set: { "invoice.status": "settled" } });
        return update;

    } catch (error) {
        console.error(error);
        return null;
    }

}
async function getTransactionbyId(req: Request, res: Response) {
    const { id } = req.query;
    await client.connect();
    const o_id = new ObjectId(id?.toString() ?? '');
    const result = await client.db("dbDitawar").collection("transactions").findOne({ _id: new ObjectId(o_id) });
    return res.status(HTTP_STATUS_CODES.SUCCESS).json({ msg: "Transaction Found", result: result });
}

async function getAllTransactionTopup(req: Request, res: Response) {
    const { id } = req.query;
    await client.connect();
    const o_id = new ObjectId(id?.toString() ?? '');
    const result = await client.db("dbDitawar").collection("transactions").find({ wallet_id: new ObjectId(o_id), type: "topup", "invoice.status": "SETTLED" }).toArray();
    return res.status(HTTP_STATUS_CODES.SUCCESS).json({ msg: "Topup Found", result: result });
}
async function getAllTransactionSale(req: Request, res: Response) {
    const { id } = req.query;
    await client.connect();
    const o_id = new ObjectId(id?.toString() ?? '');
    const result = await client.db("dbDitawar").collection("transactions").find({ wallet_id: new ObjectId(o_id), type: "sale" }).toArray();
    return res.status(HTTP_STATUS_CODES.SUCCESS).json({ msg: "Topup Found", result: result });
}
async function getAllTransactionPurchase(req: Request, res: Response) {
    const { id } = req.query;
    await client.connect();
    const o_id = new ObjectId(id?.toString() ?? '');
    const result = await client.db("dbDitawar").collection("transactions").find({ wallet_id: new ObjectId(o_id), type: "purchase" }).toArray();
    return res.status(HTTP_STATUS_CODES.SUCCESS).json({ msg: "Topup Found", result: result });
}


export { getTransaction as getTransaction, finalizeTransaction as finalizeTransaction, getTransactionbyId as getTransactionbyId, getAllTransactionTopup as getAllTransactionTopup, getAllTransactionSale as getAllTransactionSale, getAllTransactionPurchase as getAllTransactionPurchase };
module.exports = { getTransaction, finalizeTransaction, getTransactionbyId, getAllTransactionTopup, getAllTransactionSale, getAllTransactionPurchase };

