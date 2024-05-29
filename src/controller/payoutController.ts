import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import client from "../database/database";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
import { ObjectId } from "mongodb";
import { trusted } from "mongoose";
import ENV from "../config/environments";
import { HTTP_STATUS_CODES } from "../config/messages";
const authToken = Buffer.from(`${ENV.XENDIT_AUTH_TOKEN}:`).toString("base64");

async function createPayout(req: Request, res: Response) {
  const {
    nama,
    nama_rekening,
    email,
    phone,
    desc,
    amount,
    city,
    kode_pos,
    provinsi,
    alamat,
    wallet_id,
  } = req.body;
  console.log("payment called");

  await client.connect();
  const wallet = await client
    .db("dbDitawar")
    .collection("wallets")
    .findOne({ _id: new ObjectId(wallet_id) });
  if (!wallet) {
    return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ msg: "Wallet not found" });
  }
  if (parseInt(wallet.saldo) < parseInt(amount)) {
    return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ msg: "Insufficient balance" });
  }

  try {
    console.log("masuk try");
    const newTransaction = {
      wallet_id: wallet_id,
      type: "payout",
      amount: amount,
      date: new Date(),
    };

    const result = await client
      .db("dbDitawar")
      .collection("transactions")
      .insertOne(newTransaction);

    const newHistory = {
      transaction_id: result.insertedId,
      type: "payout",
      date: new Date(),
      amount: amount,
    };

    const insertHistory = await client
      .db("dbDitawar")
      .collection("wallets")
      .updateOne(
        { _id: new ObjectId(wallet_id) },
        { $push: { history: newHistory } }
      );

    const newSaldo = parseInt(wallet.saldo) - parseInt(amount);
    const updateSaldo = await client
      .db("dbDitawar")
      .collection("wallets")
      .updateOne(
        { _id: new ObjectId(wallet_id) },
        { $set: { saldo: newSaldo } }
      );
    console.log(insertHistory);
    console.log(updateSaldo);

    return res
      .status(HTTP_STATUS_CODES.CREATED)
      .json({ msg: "Payout created" });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ msg: "Internal server error" });
  }

  //code if XENDIT ACCOUNT IS VERIFIED, OUR ACCOUNT IS NOT VERIFIED
  // const { data, status } = await axios.post(
  //     `https://api.xendit.co/v2/payouts`,
  //     {
  //         external_id: `payout-${
  //             Math.random().toString(36).split(".")[1]
  //         }`,
  //         amount: parseInt(amount),
  //         email: email,
  //         description: desc,
  //         bank_code: "BCA",
  //         account_holder_name: nama,
  //         account_number: phone,
  //     },
  //     {
  //         headers: {
  //             Authorization: `Basic ${authToken}`,
  //         },
  //     }
  // );
}

export { createPayout as createPayout };
module.exports = { createPayout };
