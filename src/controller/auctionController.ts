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
        tanggal_selesai: new Date(tanggal_selesai+" "+jam_selesai),
        highest_bid: null,
        ended: false
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

async function AuctionUpdate(){
  try {
    await client.connect();
    const result = await client.db("dbDitawar").collection("auctions").find({ended:false}).toArray();
    const now = new Date();
    for (let i = 0; i < result.length; i++) {
      const auction = result[i];
      const end = new Date(auction.tanggal_selesai);
      if(now > end){
        console.log("Found auction to end")
        await client.db("dbDitawar").collection("auctions").updateOne({_id: new ObjectId(auction._id)}, {$set: {ended: true}});
        const highestBid = await client.db("dbDitawar").collection("bids").findOne({_id: new ObjectId(auction.highest_bid)});
        if(highestBid){
          const item = await Item.findOne({_id: new ObjectId(auction.id_barang)});
          if(item){
            const seller = await client.db("dbDitawar").collection("users").findOne({_id: new ObjectId(auction.id_user)});
            const buyer = await client.db("dbDitawar").collection("users").findOne({_id: new ObjectId(highestBid.id_user)});
            if(buyer){
              const wallet = await client.db("dbDitawar").collection("wallets").findOne({id_user: new ObjectId(seller._id)});
              if(wallet){
                const saldo = wallet.saldo;
                const saldo_tertahan = wallet.saldo_tertahan;
                const history = wallet.history;
                const newTransaction = {
                  id_auction: auction._id,
                  id_item: item._id,
                  buyer: buyer._id,
                  type:"auction",
                  invoice: {
                    amount: highestBid.bid,
                    date: new Date(),
                    status: "pending",
                    description: "Pembayaran untuk barang "+item.nama+" dengan harga "+highestBid.bid
                  }
                }
                const transaction = await client.db("dbDitawar").collection("transactions").insertOne(newTransaction);

                history.push(transaction.insertedId);
                const update = await client.db("dbDitawar").collection("wallets").updateOne({id_user: new ObjectId(seller._id)}, {$set: {saldo: saldo, saldo_tertahan: parseInt(saldo_tertahan) + parseInt(highestBid.bid), history: history}});
                console.log(update);
              }
            }
          }
        }
      }
      // else{
      //   console.log(now, end);
      // }
    }

  } catch (error) {
    console.log(error)
  }
}

async function updateAuction(req:Request, res:Response){
  try {
    const {token, id_auction, starting_price, asking_price, tanggal_selesai, jam_selesai, kategori, kecamatan, kota_kabupaten, provinsi, highest_bid } = req.body;
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

    await client.connect();
    const o_id = new ObjectId(id_auction);
    const result = await client.db("dbDitawar").collection("auctions").updateOne(
      { _id: o_id },
      {
        $set: {
          starting_price: starting_price,
          asking_price: asking_price,
          tanggal_selesai: new Date(tanggal_selesai+" "+jam_selesai),
          kategori_barang: kategori,
          kecamatan: kecamatan,
          kota_kabupaten: kota_kabupaten,
          provinsi: provinsi,
          highest_bid: highest_bid,

        }
      }
    );
    if (result.modifiedCount > 0) {
      return res.status(200).json({ msg: "Auction updated" });
    } else {
      return res.status(404).json({ msg: "Auction not found" });
    }
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
      },
      {
        $match: { ended: false }
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
      const items = await client.db("dbDitawar").collection("items").find({nama: {$regex: keyword, $options:"i"}}).toArray();
      let result:any = [];
      try {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const id = item._id.toString();
          const auction = await client.db("dbDitawar").collection("auctions").findOne({id_barang: id, ended: false});
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
  getAuctionByQuery as getAuctionByQuery,
  updateAuction as updateAuction,
  AuctionUpdate as AuctionUpdate
};

module.exports = { 
  addAuction , 
  getAuction, 
  getAllAuction, 
  getSampleAuctions, 
  getAuctionByQuery,
  updateAuction,
  AuctionUpdate 
}
