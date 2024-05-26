import { Request, Response } from "express";
import axios from "axios";
import client from "../database/database";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
import { ObjectId } from "mongodb";
import { trusted } from "mongoose";
import ENV from "../config/environments";
const authToken = Buffer.from(`${ENV.XENDIT_AUTH_TOKEN}:`).toString("base64");

async function createInvoice(req: Request, res: Response) {
    const { nama, email, phone, desc, amount, city, kode_pos, provinsi, alamat, wallet_id } = req.body;
    console.log('payment called')
    console.log(req.body);
    try {
        console.log(parseInt(amount));
        const { data, status } = await axios.post(
            `https://api.xendit.co/v2/invoices`,
            {
                external_id: `invoice-${Math.random().toString(36).split(".")[1]
                    }`,
                amount: parseInt(amount) + 5000,
                description: desc,
                invoice_duration: 86400,
                customer: {
                    given_names: nama,
                    surname: nama,
                    email: email,
                    mobile_number: phone,
                    addresses: [
                        {
                            city: city,
                            country: "Indonesia",
                            postal_code: "12345",
                            state: provinsi,
                            street_line1: "Jalan Makan",
                            street_line2: "Kecamatan Kebayoran Baru",
                        },
                    ],
                },
                customer_notification_preference: {
                    invoice_created: ["whatsapp", "sms", "email", "viber"],
                    invoice_reminder: ["whatsapp", "sms", "email", "viber"],
                    invoice_paid: ["whatsapp", "sms", "email", "viber"],
                    invoice_expired: ["whatsapp", "sms", "email", "viber"],
                },
                currency: "IDR",
                items: [
                    {
                        name: "Top Up Wallet",
                        quantity: 1,
                        price: 9000,
                        category: "Top Up",
                    },
                ],
                fees: [
                    {
                        type: "ADMIN",
                        value: 5000,
                    },
                ],
            },
            {
                headers: {
                    Authorization: `Basic ${authToken}`,
                },
            }
        );

        if (status == 200) {
            try {
                await client.connect();
                const transaction = await client.db("dbDitawar").collection("transactions").insertOne({
                    wallet_id: new ObjectId(wallet_id),
                    type: "topup",
                    invoice: {
                        xendit_id: data.id,
                        amount: amount,
                        status: data.status,
                        external_id: data.external_id
                    }
                });
                console.log(transaction);
                try {
                    let newHistory = {
                        transaction_id: new ObjectId(transaction.insertedId),
                        type: "topup",
                        amount: amount,
                        date: new Date()
                    }
                    const wallet = await client.db("dbDitawar").collection("wallets").updateOne({ _id: new ObjectId(wallet_id) }, { $push: { history: newHistory } });
                    console.log(wallet);
                } catch (error) {
                    return res.status(500).send("Internal Server Error");
                }
            } catch (error) {
                return res.status(500).send("Internal Server Error");
            }
        }
        else {
            return res.status(status).send(data);
        }

        return res.status(status).send(data);
    } catch (err) {
        console.log(err)
        return res.status(400).send(err);
    }
};

//expire invoice xendit
const ExpireInvoice = async (req: Request, res: Response) => {
    const result = { ...req.body };
    try {
        const { data, status } = await axios.post(
            `https://api.xendit.co/v2/invoices/${result.invoice_id}/expire`,
            {},
            {
                headers: {
                    Authorization: `Basic ${authToken}`,
                },
            }
        );
        return res.status(status).send(data);
    } catch (err) {
        return res.status(400).send(err);
    }
};

const getInvoiceStatus = async (id: ObjectId) => {
    try {
        const transaction = await client.db("dbDitawar").collection("transactions").findOne({ _id: id });
        if (transaction) {
            const invoice = transaction.invoice;
            if (invoice.status == "PENDING") {
                const { data, status } = await axios.get(
                    `https://api.xendit.co/v2/invoices/${invoice.xendit_id}`,
                    {
                        headers: {
                            Authorization: `Basic ${authToken}`,
                        },
                    }
                );
                if (data.status == "EXPIRED") {
                    const result = await client.db("dbDitawar").collection("transactions").updateOne({ _id: id }, { $set: { "invoice.status": "EXPIRED" } });
                    return "EXPIRED";
                }
                else if (data.status == "SETTLED") {
                    const result = await client.db("dbDitawar").collection("transactions").updateOne({ _id: id }, { $set: { "invoice.status": "SETTLED" } });
                    return "SETTLED";
                }
                else {
                    return "PENDING";
                }
            }
            else {
                return invoice.status;
            }
        }
        else {
            return null;
        }

    } catch (error) {
        console.error(error);
        return null;
    }
}

//get by id invoice xendit
const GetInvoicebyInvoice_id = async (req: Request, res: Response) => {
    const result = { ...req.body };
    try {
        const { data, status } = await axios.get(
            `https://api.xendit.co/v2/invoices/${result.invoice_id}`,
            {
                headers: {
                    Authorization: `Basic ${authToken}`,
                },
            }
        );
        return res.status(status).send(data);
    } catch (err) {
        return res.status(400).send(err);
    }
};

//get by external id
const GetInvoicebyExternal_id = async (req: Request, res: Response) => {
    const result = { ...req.body };
    try {
        const { data, status } = await axios.get(
            `https://api.xendit.co/v2/invoices/?${result.external_id}`,
            {
                headers: {
                    Authorization: `Basic ${authToken}`,
                },
            }
        );
        return res.status(status).send(data);
    } catch (err) {
        return res.status(400).send(err);
    }
};


//untuk admin
const GetAllInvoice = async (req: Request, res: Response) => {
    try {
        const { data, status } = await axios.get(
            `https://api.xendit.co/v2/invoices`,
            {
                headers: {
                    Authorization: `Basic ${authToken}`,
                },
            }
        );
        return res.status(status).send(data);
    } catch (err) {
        return res.status(400).send(err);
    }
};

const GetAllTransactions = async (req: Request, res: Response) => {
    try {
        await client.connect();
        const transactions = await client.db("dbDitawar").collection("transactions").find().toArray();
        return res.status(200).send(transactions);
    } catch (error) {
        return res.status(500).send("Internal Server Error");
    }
};

export {
    createInvoice as createInvoice,
    ExpireInvoice as ExpireInvoice,
    GetInvoicebyInvoice_id as GetInvoicebyInvoice_id,
    GetInvoicebyExternal_id as GetInvoicebyExternal_id,
    GetAllInvoice as GetAllInvoice,
    getInvoiceStatus as getInvoiceStatus,
    GetAllTransactions as GetAllTransactions
}

module.exports = {
    createInvoice,
    ExpireInvoice,
    GetInvoicebyInvoice_id,
    GetInvoicebyExternal_id,
    GetAllInvoice,
    getInvoiceStatus,
    GetAllTransactions
};