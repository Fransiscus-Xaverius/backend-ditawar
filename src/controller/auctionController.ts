import { Request, Response } from "express";
import client from "../database/database";
const jwt = require("jsonwebtoken");
import { ObjectId } from "mongodb";
import ENV from "../config/environments";
import { AuctionDto } from "../contracts/dto/auction.dto";
const nodemailer = require("nodemailer");

async function addAuction(req: Request, res: Response) {
  try {
    const {
      token,
      id_barang,
      starting_price,
      asking_price,
      tanggal_selesai,
      jam_selesai,
      kategori,
      kecamatan,
      kota_kabupaten,
      provinsi,
    } = req.body;
    const cert = ENV.PRIVATE_KEY;
    let decoded: any;
    try {
      decoded = jwt.verify(token, cert);
    } catch (error) {
      return res.status(401).json({ msg: "Unauthorized" });
    }
    const user = decoded.user;
    console.log(tanggal_selesai);
    console.log(new Date(tanggal_selesai + " " + jam_selesai));
    const newAuction: AuctionDto = {
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
      tanggal_selesai: new Date(tanggal_selesai + " " + jam_selesai),
      highest_bid: null,
      ended: false,
      bid_count: 0,
    };
    await client.connect();
    const result = await client
      .db("dbDitawar")
      .collection("auctions")
      .insertOne(newAuction);
    if (result) {
      return res.status(201).json({ msg: "Auction added", result: result });
    }
    return res.status(500).json({ msg: "Internal server error" });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
}

async function AuctionUpdate() {
  try {
    await client.connect();
    const result = await client
      .db("dbDitawar")
      .collection("auctions")
      .find({ ended: false })
      .toArray();
    const now = new Date();
    for (let i = 0; i < result.length; i++) {
      const auction = result[i];
      const end = new Date(auction.tanggal_selesai);
      if (now > end) {
        console.log("Found auction to end");
        await client
          .db("dbDitawar")
          .collection("auctions")
          .updateOne(
            { _id: new ObjectId(auction._id) },
            { $set: { ended: true } }
          );
        const highestBid = await client
          .db("dbDitawar")
          .collection("bids")
          .findOne({ _id: new ObjectId(auction.highest_bid) });
        if (highestBid) {
          const item = await client.db("dbDitawar").collection("items").findOne({ _id: new ObjectId(auction.id_barang) });
          if (item) {
            const seller = await client
              .db("dbDitawar")
              .collection("users")
              .findOne({ _id: new ObjectId(auction.id_user) });
            const buyer = await client
              .db("dbDitawar")
              .collection("users")
              .findOne({ _id: new ObjectId(highestBid.id_user) });
            if (buyer) {
              const wallet = await client
                .db("dbDitawar")
                .collection("wallets")
                .findOne({ id_user: new ObjectId(seller._id) });
              if (wallet) {
                const saldo = wallet.saldo;
                const saldo_tertahan = wallet.saldo_tertahan;
                const history = wallet.history;
                const newTransaction = {
                  id_auction: auction._id,
                  id_item: item._id,
                  buyer: buyer._id,
                  seller: seller._id,
                  type: "auction",
                  invoice: {
                    amount: highestBid.bid,
                    date: new Date(),
                    status: "pending",
                    description:
                      "Pembayaran untuk barang " +
                      item.nama +
                      " dengan harga " +
                      highestBid.bid,
                  },
                };
                const transaction = await client
                  .db("dbDitawar")
                  .collection("transactions")
                  .insertOne(newTransaction);

                history.push(transaction.insertedId);
                const update = await client
                  .db("dbDitawar")
                  .collection("wallets")
                  .updateOne(
                    { id_user: new ObjectId(seller._id) },
                    {
                      $set: {
                        saldo: saldo,
                        saldo_tertahan:
                          parseInt(saldo_tertahan) + parseInt(highestBid.bid),
                        history: history,
                      },
                    }
                  );
                console.log(update);

                const newPurchase = {
                  buyer: buyer._id,
                  seller: seller._id,
                  item: item._id,
                  auction: auction._id,
                  transaction: transaction.insertedId,
                  status: "pending",
                  history: [],
                };

                const purchase = await client
                  .db("dbDitawar")
                  .collection("purchases")
                  .insertOne(newPurchase);
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
    console.log(error);
  }
}

async function updateAuction(req: Request, res: Response) {
  try {
    let {
      token,
      id_auction,
      starting_price,
      asking_price,
      tanggal_selesai,
      jam_selesai,
      kategori,
      kecamatan,
      kota_kabupaten,
      provinsi,
    } = req.query;
    const cert = ENV.PRIVATE_KEY;
    let decoded: any;
    console.log(id_auction)
    try {
      decoded = jwt.verify(token, cert);
    } catch (error) {
      return res.status(401).json({ msg: "Unauthorized" });
    }
    const user = decoded.user;
    console.log(tanggal_selesai);
    console.log(new Date(tanggal_selesai + " " + jam_selesai));

    await client.connect();
    const o_id = new ObjectId(id_auction?.toString());
    let result;
    console.log("tai")
    result = await client
      .db("dbDitawar")
      .collection("auctions")
      .updateOne(
        { _id: o_id },
        {
          $set: {
            starting_price: starting_price,
            asking_price: asking_price,
            tanggal_selesai: new Date(tanggal_selesai + " " + jam_selesai),
            kategori_barang: kategori,
            kecamatan: kecamatan,
            kota_kabupaten: kota_kabupaten,
            provinsi: provinsi,
          },
        }
      );
    if (result.modifiedCount > 0) {
      return res.status(200).json({ msg: "Auction updated" });
    } else {
      return res.status(404).json({ msg: "Auction not found" });
    }
  } catch (error) {
    // console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
}

async function getAllAuction(req: Request, res: Response) {
  const cert = ENV.PRIVATE_KEY;
  try {
    await client.connect();
    const result = await client
      .db("dbDitawar")
      .collection("auctions")
      .find()
      .toArray();
    console.log(result);
    return res.status(201).json({ msg: "Item Found", result: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
}

async function getSampleAuctions(req: Request, res: Response) {
  try {
    const filter = [
      {
        $sample: { size: 20 },
      },
      {
        $match: { ended: false },
      },
    ];
    await client.connect();
    console.log("Sample Called")
    const result = await client
      .db("dbDitawar")
      .collection("auctions")
      .aggregate(filter)
      .toArray();
    // console.log(result);
    return res.status(201).json({ msg: "Item Found", result: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
}

async function getAuction(req: Request, res: Response) {
  const cert = ENV.PRIVATE_KEY;
  const { id } = req.query;
  // console.log(id);
  try {
    await client.connect();
    const o_id = new ObjectId(id?.toString() ?? "");
    const result = await client
      .db("dbDitawar")
      .collection("auctions")
      .findOne({ _id: o_id });
    return res.status(201).json({ msg: "Item Found", result: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
}

async function buyNowHandler(req: Request, res: Response) {
  const query = req.query;
  const head = req.headers;
  const { token } = head;
  const actualToken = Array.isArray(token)
    ? token[0].split(" ")[1]
    : token?.split(" ")[1];
  const cert = ENV.PRIVATE_KEY;
  let decoded: any;
  try {
    decoded = jwt.verify(actualToken, cert);
  } catch (error) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  const o_id = new ObjectId(decoded.user._id.toString() ?? "");
  // const newTransaction = {
  //   id_auction: decoded.user._id,
  //   id_item: item._id,
  //   buyer: buyer._id,
  //   type: "auction",
  //   invoice: {
  //     amount: highestBid.bid,
  //     date: new Date(),
  //     status: "pending",
  //     description:
  //       "Pembayaran untuk barang " +
  //       item.nama +
  //       " dengan harga " +
  //       highestBid.bid,
  //   },
  // };
  // console.log(decoded.user._id)
  // await client.connect();
  // const result = await client
  //   .db("dbDitawar")
  //   .collection("auctions")
  //   .updateOne({ _id: o_id }, { $set: { ended: true } });
  // console.log(JSON.stringify(decoded));
  // console.log(JSON.stringify(query));
}

async function getAuctionByQuery(req: Request, res: Response) {
  const { query } = req.query;
  const keyword = query?.toString() ?? "";
  // console.log(id);
  try {
    await client.connect();
    const items = await client
      .db("dbDitawar")
      .collection("items")
      .find({ nama: { $regex: keyword, $options: "i" } })
      .toArray();
    let result: any = [];
    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const id = item._id.toString();
        const auction = await client
          .db("dbDitawar")
          .collection("auctions")
          .findOne({ id_barang: id, ended: false });
        console.log(auction);
        if (auction) {
          let data = {
            item: item,
            auction: auction,
          };
          result.push(data);
        }
      }
    } catch (error) {
      return res.status(500).json({ msg: "Internal server error" });
    }
    return res.status(201).json({ msg: "Item Found", result: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
}

async function stopAuction(req: Request, res: Response) {
  try {
    const { id } = req.query;
    const o_id = new ObjectId(id?.toString() ?? "");
    await client.connect();
    const result = await client
      .db("dbDitawar")
      .collection("auctions")
      .updateOne({ _id: o_id }, { $set: { ended: true } });
    return res.status(201).json({ msg: "Auction ended", result: result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
}

async function warningAuction(req: Request, res: Response) {
  try {
    const { id_user } = req.query;
    const o_id = new ObjectId(id_user?.toString() ?? "");
    await client.connect();
    const result = await client
      .db("dbDitawar")
      .collection("users")
      .findOne({ _id: o_id });
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "a08690751@gmail.com",
        pass: "jyja uwei omtf fyfv",
      },
    });
    const mailOptions = {
      from: "a08690751@gmail.com",
      to: result.email,
      subject: "Warning Auction",
      text: "Attention, This message is a warning for your auction.",
    };

    await transporter.sendMail(mailOptions);
    return res.status(201).json({ msg: "Auction warning", result: result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
}

export {
  addAuction as addAuction,
  getAuction as getAuction,
  getAllAuction as getAllAuction,
  getSampleAuctions as getSampleAuctions,
  getAuctionByQuery as getAuctionByQuery,
  updateAuction as updateAuction,
  AuctionUpdate as AuctionUpdate,
  stopAuction as stopAuction,
  warningAuction as warningAuction,
  buyNowHandler as buyNowHandler,
};

module.exports = {
  addAuction,
  getAuction,
  getAllAuction,
  getSampleAuctions,
  getAuctionByQuery,
  updateAuction,
  AuctionUpdate,
  stopAuction,
  warningAuction,
  buyNowHandler,
};
