import { Request, Response } from "express";
import client from "../database/database";
const jwt = require('jsonwebtoken');
import { ObjectId } from "mongodb";

async function addAuction(req:Request, res:Response){
  try {
    const {token, id_barang, starting_price, asking_price, tanggal_selesai, jam_selesai } = req.body;
    const cert = process.env.PRIVATE_KEY;
    let decoded:any;
    try {
        decoded = jwt.verify(token, cert);
    } catch (error) {
        return res.status(401).json({msg: "Unauthorized"});
    }
    const user = decoded.user;
    const newAuction = {
        id_user: user._id,
        nama_penjual: user.nama,
        id_barang: id_barang,
        starting_price: starting_price,
        asking_price: asking_price,
        tanggal_mulai: new Date().toLocaleString(),
        tanggal_selesai: new Date(tanggal_selesai+" "+jam_selesai).toLocaleString()
    }
    await client.connect();
    const result = await client.db("dbDitawar").collection("auctions").insertOne(newAuction);
    if(result){
      return res.status(201).json({msg: "Auction added", result:result}); 
    }
    return res.status(500).json({msg: "Internal server error"});

  } catch (error) {
    console.log(error);
    return res.status(500).json({msg: "Internal server error"});
  }
}

async function getAuction(req:Request, res:Response){
  const cert = process.env.PRIVATE_KEY;
  const {id} = req.query;
  console.log(id);
  try {
      await client.connect();
      const o_id = new ObjectId(id?.toString() ?? '');
      const result = await client.db("dbDitawar").collection("auctions").findOne({_id: o_id});
      return res.status(201).json({msg: "Item Found", result:result});
  } catch (error) {
      console.error(error);
      return res.status(500).json({msg: "Internal server error"});
  }
}

export { addAuction as addAuction , getAuction as getAuction};
module.exports = { addAuction , getAuction }
