import { Request, Response } from "express";
import client from "../database/database";
const jwt = require('jsonwebtoken');
import { ObjectId } from "mongodb";
var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/dbDitawar');

const itemSchema = new mongoose.Schema({
  nama: String
});

const Item = mongoose.model('items', itemSchema);


async function addAuction(req:Request, res:Response){
  try {
    const {token, id_barang, starting_price, asking_price, tanggal_selesai, jam_selesai, kategori, kecamatan, kota_kabupaten, provinsi } = req.body;
    const cert = process.env.PRIVATE_KEY;
    let decoded:any;
    try {
        decoded = jwt.verify(token, cert);
    } catch (error) {
        return res.status(401).json({msg: "Unauthorized"});
    }
    const user = decoded.user;
    console.log(tanggal_selesai)
    console.log(new Date(tanggal_selesai+" "+jam_selesai))
    const newAuction = {
        id_user: user._id,
        nama_penjual: user.nama,
        id_barang: id_barang,
        kategori_barang: kategori,
        starting_price: starting_price,
        asking_price: asking_price,
        tanggal_mulai: new Date(),
        kecamatan: kecamatan,
        kota_kabupaten: kota_kabupaten,
        provinsi: provinsi,
        tanggal_selesai: new Date(tanggal_selesai+" "+jam_selesai)
    }
    await client.connect();
    const result = await client.db("dbDitawar").collection("auctions").insertOne(newAuction);
    if(result){
      return res.status(201).json({msg: "Auction added", result:result}); 
    }
    return res.status(500).json({msg: "Internal server error"});

  } catch (error) {
    // console.log(error);
    return res.status(500).json({msg: "Internal server error"});
  }
}

async function getAllAuction(req:Request, res:Response){
  const cert = process.env.PRIVATE_KEY;
  try {
    await client.connect();
    const result = await client.db("dbDitawar").collection("auctions").find().toArray();
    console.log(result);
    return res.status(201).json({msg: "Item Found", result:result});
  } catch (error) {
      console.error(error);
      return res.status(500).json({msg: "Internal server error"});
  }
}

async function getSampleAuctions(req:Request, res:Response){
  try {
    const filter = [
      {
        $sample: { size: 10 }
      }
    ]
    await client.connect();
    const result = await client.db("dbDitawar").collection("auctions").aggregate(filter).toArray();
    // console.log(result);
    return res.status(201).json({msg: "Item Found", result:result});
  } catch (error) {
      console.error(error);
      return res.status(500).json({msg: "Internal server error"});
  }
}

async function getAuction(req:Request, res:Response){
  const cert = process.env.PRIVATE_KEY;
  const {id} = req.query;
  // console.log(id);
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

async function getAuctionByQuery(req:Request, res:Response){
  const {query} = req.query;
  const keyword = query?.toString() ?? '';
  // console.log(id);
  try {
      await client.connect();
      const items = await client.db("dbDitawar").collection("items").find({nama: {$regex: keyword}}).toArray();
      let result:any = [];
      try {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const id = item._id.toString();
          const auction = await client.db("dbDitawar").collection("auctions").findOne({id_barang: id});
          console.log(auction);
          if(auction){
            let data = {
              item: item,
              auction: auction
            }
            result.push(data);
          }
        }
      } catch (error) {
        return res.status(500).json({msg: "Internal server error"});
      }
      return res.status(201).json({msg: "Item Found", result:result});
  } catch (error) {
      console.error(error);
      return res.status(500).json({msg: "Internal server error"});
  }
}

export { 
  addAuction as addAuction , 
  getAuction as getAuction, 
  getAllAuction as getAllAuction, 
  getSampleAuctions as getSampleAuctions, 
  getAuctionByQuery as getAuctionByQuery
};

module.exports = { 
  addAuction , 
  getAuction, 
  getAllAuction, 
  getSampleAuctions, 
  getAuctionByQuery 
}
