import { AuctionDto } from "../dto/auction.dto";
import client from "../../database/database";
import { ObjectId } from "mongodb";

export class AuctionDao implements AuctionDto {
  public _id?: ObjectId;
  public id_user: ObjectId;
  public nama_penjual: string | undefined;
  public id_barang: ObjectId;
  public kategori_barang: string | undefined;
  public starting_price: number | undefined;
  public asking_price: number | undefined;
  public tanggal_mulai: Date;
  public kecamatan: string | undefined;
  public kota_kabupaten: string | undefined;
  public provinsi: string | undefined;
  public tanggal_selesai: Date;
  public highest_bid: string | null | undefined;
  public ended: boolean;
  public bid_count: number;

  constructor(auction: AuctionDto) {
    this.id_user = auction.id_user;
    this.nama_penjual = auction.nama_penjual;
    this.id_barang = auction.id_barang;
    this.kategori_barang = auction.kategori_barang;
    this.starting_price = auction.starting_price;
    this.asking_price = auction.asking_price;
    this.tanggal_mulai = auction.tanggal_mulai;
    this.kecamatan = auction.kecamatan;
    this.kota_kabupaten = auction.kota_kabupaten;
    this.provinsi = auction.provinsi;
    this.tanggal_selesai = auction.tanggal_selesai;
    this.highest_bid = auction.highest_bid;
    this.ended = auction.ended;
    this.bid_count = auction.bid_count;
  }

  public async addAuction(): Promise<any> {
    try {
      const result = await client
        .db("dbDitawar")
        .collection("auctions")
        .insertOne(this);
      return result;
    } catch (error) {
      console.error("Error adding auction:", error);
      throw error;
    }
  }

  public static async getAuctionById(id: string): Promise<AuctionDto | null> {
    try {
      const auction = await client
        .db("dbDitawar")
        .collection("auctions")
        .findOne({ _id: new ObjectId(id) });
      return auction;
    } catch (error) {
      console.error("Error retrieving auction by ID:", error);
      throw error;
    }
  }

  public static async getOngoingAuctions(): Promise<AuctionDto[]> {
    try {
      await client.connect();
      const ongoingAuctions = await client
        .db("dbDitawar")
        .collection("auctions")
        .find({ ended: false })
        .toArray();
      return ongoingAuctions;
    } catch (error) {
      console.error("Error retrieving ongoing auctions:", error);
      throw error;
    } finally {
      await client.close();
    }
  }
  public static async endAuction(auctionId: string | ObjectId): Promise<void> {
    const validAuctionId =
      typeof auctionId === "string" ? new ObjectId(auctionId) : auctionId;
    await client
      .db("dbDitawar")
      .collection("auctions")
      .updateOne({ _id: validAuctionId }, { $set: { ended: true } });
  }

  public static async getHighestBid(bidId: string | ObjectId) {
    const validBidId = typeof bidId === "string" ? new ObjectId(bidId) : bidId;
    const bid = await client
      .db("dbDitawar")
      .collection("bids")
      .findOne({ _id: validBidId });
    return bid;
  }
}
