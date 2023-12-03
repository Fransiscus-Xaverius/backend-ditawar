import { Request, Response } from "express";
import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();
import client from "../database/database";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authToken = Buffer.from(`${process.env.XENDIT_AUTH_TOKEN}:`).toString("base64");

async function createInvoice (req:Request, res:Response) {

    const {nama, email, phone, desc, amount, city, kode_pos, provinsi, alamat} = req.body;

    try {
        const { data, status } = await axios.post(
            `https://api.xendit.co/v2/invoices`,
            {
                external_id: `invoice-${
                    Math.random().toString(36).split(".")[1]
                }`,
                amount: amount,
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
                            postal_code: kode_pos,
                            state: provinsi,
                            street_line1: alamat,
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
                        name: "Top Up Saldo",
                        quantity: 1,
                        price: amount,
                        category: "Top Up",
                    },
                ],
                fees: [
                    {
                        type: "ADMIN FEE",
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
        return res.status(status).send(data);
    } catch (err) {
        return res.status(400).send(err);
    }
};

//expire invoice xendit
const ExpireInvoice = async (req:Request, res:Response) => {
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

//get by id invoice xendit
const GetInvoicebyInvoice_id = async (req:Request, res:Response) => {
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
const GetInvoicebyExternal_id = async (req:Request, res:Response) => {
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
const GetAllInvoice = async (req:Request, res:Response) => {
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

export {createInvoice as createInvoice, ExpireInvoice as ExpireInvoice, GetInvoicebyInvoice_id as GetInvoicebyInvoice_id, GetInvoicebyExternal_id as GetInvoicebyExternal_id, GetAllInvoice as GetAllInvoice}

module.exports = { createInvoice, ExpireInvoice, GetInvoicebyInvoice_id, GetInvoicebyExternal_id, GetAllInvoice };