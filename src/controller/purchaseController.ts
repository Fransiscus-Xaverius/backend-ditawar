import { Request, Response } from 'express';
import client from '../database/database';
import { ObjectId } from 'mongodb';
const jwt = require("jsonwebtoken");
import { finalizeTransaction } from './transactionController';
import ENV from '../config/environments';
import { HTTP_STATUS_CODES, SERVER_RESPONSE_MESSAGES } from '../config/messages';

const getAllPurchase = async (req: Request, res: Response) => {
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("purchases").find().toArray();
        return res.status(HTTP_STATUS_CODES.CREATED).json({ msg: "Purchase Found", result: result });
    } catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ msg: "Internal server error" });
    }
}

const getPurchase = async (req: Request, res: Response) => {
    const { id } = req.query;
    try {
        await client.connect();
        const o_id = new ObjectId(id?.toString() ?? '');
        const result = await client.db("dbDitawar").collection("purchases").findOne({ _id: o_id });
        return res.status(HTTP_STATUS_CODES.CREATED).json({ msg: "Purchase Found", result: result });
    } catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ msg: "Internal server error" });
    }
}

const getPurchaseDetail = async (req: Request, res: Response) => {
    const { id } = req.query;
    try {
        await client.connect();
        const o_id = new ObjectId(id?.toString() ?? '');
        const result = await client.db("dbDitawar").collection("purchases").findOne({ _id: o_id });
        const buyer = await client.db("dbDitawar").collection("users").findOne({ _id: result.buyer });
        const seller = await client.db("dbDitawar").collection("users").findOne({ _id: result.seller });
        const item = await client.db("dbDitawar").collection("items").findOne({ _id: result.item });
        const auction = await client.db("dbDitawar").collection("auctions").findOne({ _id: result.auction });
        const transaction = await client.db("dbDitawar").collection("transactions").findOne({ _id: result.transaction });
        const purchaseObj = {
            _id: result._id,
            purchase: result,
            buyer: buyer,
            seller: seller,
            item: item,
            auction: auction,
            transaction: transaction,
            ended: result.ended
        }
        return res.status(HTTP_STATUS_CODES.CREATED).json({ msg: "Purchase Detail Found", result: purchaseObj });
    } catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ msg: "Internal server error" });
    }
}

const getAllPurchaseAsSeller = async (req: Request, res: Response) => {
    const { token } = req.query;
    const cert = ENV.PRIVATE_KEY;
    let decoded: any;
    try {
        decoded = jwt.verify(token, cert);
    } catch (error) {
        return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({ msg: SERVER_RESPONSE_MESSAGES.UNAUTHORIZED });
    }
    const user = decoded.user;
    const { _id } = user;
    console.log("ID:", _id);
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("purchases").find({ seller: new ObjectId(_id) }).toArray();
        return res.status(HTTP_STATUS_CODES.CREATED).json({ msg: "Purchase Found", result: result });
    } catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ msg: "Internal server error" });
    }
}

const getAllPurchaseAsBuyer = async (req: Request, res: Response) => {
    const { token } = req.query;
    const cert = ENV.PRIVATE_KEY;
    let decoded: any;
    try {
        decoded = jwt.verify(token, cert);
    } catch (error) {
        return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({ msg: SERVER_RESPONSE_MESSAGES.UNAUTHORIZED });
    }
    const user = decoded.user;
    const { _id } = user;
    console.log("ID:", _id);
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("purchases").find({ buyer: new ObjectId(_id) }).toArray();
        return res.status(HTTP_STATUS_CODES.CREATED).json({ msg: "Purchase Found", result: result });
    } catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ msg: "Internal server error" });
    }
}

async function markFinished(req: Request, res: Response) {
    console.log("-----------------------------------------------@")
    const id = req.query.id;
    const { token } = req.body;
    if (!id) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ msg: "Bad request (No id)" });
    }
    if (!token) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ msg: "Bad request (No token)" });
    }
    console.log('marking finished purchases: ', id)
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
            const purchase = await client.db("dbDitawar").collection("purchases").findOne({ _id: new ObjectId(id.toString()) });
            if (!purchase) {
                return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ msg: "purchase not found" });
            }
            const user = decoded.user;
            if (purchase.seller != user._id) {
                return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({ msg: SERVER_RESPONSE_MESSAGES.UNAUTHORIZED });
            }
        }
        catch (error) {
            console.error(error);
            return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ msg: "Internal server error" });
        }

        try {
            await client.connect();
            const result = await client.db("dbDitawar").collection("purchases").updateOne(
                { _id: new ObjectId(id.toString()) },
                {
                    $push: {
                        history: {
                            message: "purchase marked as finished by seller",
                            date: new Date(),
                            time: new Date().getTime(),
                            type: "marked"
                        }
                    }
                }
            );
            return res.status(HTTP_STATUS_CODES.CREATED).json({ msg: "purchase marked as finished", result: result });
        } catch (error) {
            console.error(error);
            return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ msg: "Internal server error" });
        }
    } catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ msg: "Internal server error" });
    }
}

const finishPurchase = async (req: Request, res: Response) => {
    const id = req.query.id;
    const { token } = req.body;
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
        let purchase = null;
        try {
            await client.connect();
            purchase = await client.db("dbDitawar").collection("purchases").findOne({ _id: new ObjectId(id.toString()) });
            if (!purchase) {
                return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ msg: "purchase not found" });
            }
            const user = decoded.user;
            if (purchase.buyer != user._id) {
                return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({ msg: SERVER_RESPONSE_MESSAGES.UNAUTHORIZED });
            }
        }
        catch (error) {
            console.error(error);
            return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ msg: "Internal server error" });
        }

        try {
            await client.connect();
            const result = await client.db("dbDitawar").collection("purchases").updateOne(
                { _id: new ObjectId(id.toString()) },
                {
                    $push: {
                        history: {
                            message: "purchase marked as finished by buyer",
                            date: new Date(),
                            time: new Date().getTime(),
                            type: "finished"
                        }
                    }
                }
            );
            const result2 = await client.db("dbDitawar").collection("purchases").updateOne(
                { _id: new ObjectId(id.toString()) },
                { $set: { status: "finished" } }
            );

            const tryFinalize = await finalizeTransaction(purchase.transaction, decoded.user._id);

            if (!tryFinalize) {
                return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ msg: "Internal server error" });
            }

            return res.status(HTTP_STATUS_CODES.CREATED).json({ msg: "purchase set as finished", result: result });
        } catch (error) {
            console.error(error);
            return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ msg: "Internal server error" });
        }
    } catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ msg: "Internal server error" });
    }
}

const endPurchase = async (req: Request, res: Response) => {
    const { id } = req.query;
    const { user_id } = req.query;
    if (!id || !user_id) return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ msg: "Bad Request" });
    const user = await client.db("dbDitawar").collection("users").findOne({ _id: new ObjectId(user_id?.toString() ?? '') });
    if (!user) return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ msg: "User not found" });
    const purchase = await client.db("dbDitawar").collection("purchases").findOne({ _id: new ObjectId(id?.toString() ?? '') });
    if (!purchase) return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ msg: "Purchase not found" });
    if (purchase.buyer != user._id) return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ msg: "User is not the buyer" });

    try {
        await client.connect();
        const o_id = new ObjectId(id?.toString() ?? '');
        const result = await client.db("dbDitawar").collection("purchases").updateOne({ _id: o_id }, { $set: { ended: true } });
        return res.status(HTTP_STATUS_CODES.CREATED).json({ msg: "Purchase Ended", result: result });
    } catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ msg: "Internal server error" });
    }
}

const updatePurchase = async (req: Request, res: Response) => {
    const { id } = req.query;
    const { token, update } = req.body;
    if (!id || !token || !update) return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ msg: "Bad Request" });
    const cert = ENV.PRIVATE_KEY;
    let decoded: any;
    try {
        decoded = jwt.verify(token, cert);
    } catch (error) {
        return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({ msg: SERVER_RESPONSE_MESSAGES.UNAUTHORIZED });
    }
    const user = decoded.user;
    await client.connect();
    const purchase = await client.db("dbDitawar").collection("purchases").findOne({ _id: new ObjectId(id?.toString() ?? '') });
    if (!purchase) return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ msg: "Purchase not found" });
    if (purchase.seller != user._id) return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ msg: "Unauthorized (User is not the seller)" });
    const result = await client.db("dbDitawar").collection("purchases").updateOne(
        { _id: new ObjectId(id.toString()) },
        {
            $push: {
                history: {
                    message: update,
                    date: new Date(),
                    time: new Date().getTime(),
                    type: "update"
                }
            }
        }
    );
    return res.status(HTTP_STATUS_CODES.CREATED).json({ msg: "Purchase updated", result: result });
}

export {
    getAllPurchase as getAllPurchase,
    getPurchase as getPurchase,
    getAllPurchaseAsSeller as getAllPurchaseAsSeller,
    getAllPurchaseAsBuyer as getAllPurchaseAsBuyer,
    endPurchase as endPurchase,
    getPurchaseDetail as getPurchaseDetail,
    markFinished as markFinished,
    finishPurchase as finishPurchase,
    updatePurchase as updatePurchase
}

module.exports = {
    getAllPurchase,
    getPurchase,
    getAllPurchaseAsSeller,
    getAllPurchaseAsBuyer,
    endPurchase,
    getPurchaseDetail,
    markFinished,
    finishPurchase,
    updatePurchase
};
