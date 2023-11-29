import { Request, Response } from "express";
import client from "../database/database";
const jwt = require('jsonwebtoken');
import { ObjectId } from "mongodb";

async function addAuction(req:Request, res:Response){
  try {
    const {token, id_barang, starting_price, asking_price, tanggal_selesai, jam_selesai, kategori } = req.body;
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
        kategori_barang: kategori,
        starting_price: starting_price,
        asking_price: asking_price,
        tanggal_mulai: new Date(),
        tanggal_selesai: new Date(tanggal_selesai+" "+jam_selesai)
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

async function getAllAuction(req:Request, res:Response){
  const cert = process.env.PRIVATE_KEY;
	try {
		await client.connect();
		const result = await client
			.db("dbDitawar")
			.collection("auctions")
			.find()
			.toArray();
		for (let i = 0; i < result.length; i++) {
			const item_id = result[i].id_barang;
      const o_id = new ObjectId(item_id?.toString() ?? "");
			const temp_item = await client
				.db("dbDitawar")
				.collection("items")
				.findOne({ _id: o_id });
			result[i] = {
        id_user: result[i].id_user,
        nama_penjual: result[i].nama_penjual,
        id_barang: result[i].id_barang,
        starting_price: result[i].starting_price,
        asking_price: result[i].asking_price,
        tanggal_mulai: result[i].tanggal_mulai,
        tanggal_selesai: result[i].tanggal_selesai,
        item : temp_item
      }
		}
		console.log(result);
		return res.status(201).json({ msg: "Item Found", result: result });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ msg: "Internal server error" });
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

export { addAuction as addAuction , getAuction as getAuction, getAllAuction as getAllAuction};
module.exports = { addAuction , getAuction, getAllAuction }
