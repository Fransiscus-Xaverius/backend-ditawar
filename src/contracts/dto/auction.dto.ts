import { ObjectId } from "mongodb"

export interface AuctionDto {
    id_user: ObjectId,
    nama_penjual: string | undefined,
    id_barang: ObjectId,
    kategori_barang: string | undefined,
    starting_price: number | undefined,
    asking_price: number | undefined,
    tanggal_mulai: Date,
    kecamatan: string | undefined,
    kota_kabupaten: string | undefined,
    provinsi: string | undefined,
    tanggal_selesai: Date,
    highest_bid: string | undefined | null,
    ended: boolean,
    bid_count: number,
}