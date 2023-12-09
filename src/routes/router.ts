import express, { Router } from "express";

import {
  login,
  register,
  getDataFromToken,
  updateUserById,
  Reload,
  verification,
  banned,
} from "../controller/userController";
import {
  uploadFile,
  addItem,
  getItem,
  getImage,
} from "../controller/itemController";
import {
  addAuction,
  getAuction,
  getAllAuction,
  getSampleAuctions,
  getAuctionByQuery,
  updateAuction,
  stopAuction,
  warningAuction,
  buyNowHandler,
} from "../controller/auctionController";
import { allUser, getUserById, reloadUser } from "../controller/userController";
import { getBid, addBid } from "../controller/bidController";
import {
  createInvoice,
  ExpireInvoice,
  GetInvoicebyInvoice_id,
  GetInvoicebyExternal_id,
  GetAllTransactions,
} from "../controller/paymentController";
import { getWallet, useSaldo, addSaldo } from "../controller/walletController";
import {
  getAllPurchase,
  getPurchase,
  getAllPurchaseAsBuyer,
  getAllPurchaseAsSeller,
  endPurchase,
  getPurchaseDetail,
} from "../controller/purchaseController";

const router: Router = express.Router();

//router

//user endpoints
router.post("/login", login);
router.post("/register", register);
router.get("/getDataFromToken", getDataFromToken);
router.get("/allUser", allUser);
router.get("/user", getUserById);
router.put("/user", updateUserById);
router.get("/reload-user", reloadUser);
router.post("/reload", Reload);
router.put("/verification", verification);
router.put("/banned", banned);

//item
router.post("/uploadFile", uploadFile);
router.post("/addItem", addItem);
router.get("/item", getItem);
router.get("/image", getImage);

//auction endpoints
router.post("/auction", addAuction);
router.get("/auction", getAuction);
router.put("/auction", updateAuction);
router.get("/allAuction", getAllAuction);
router.get("/sampleAuction", getSampleAuctions);
router.get("/search", getAuctionByQuery);
router.put("/stopAuction", stopAuction);
router.post("/warningAuction", warningAuction);
router.post("/buy-now", buyNowHandler);

//payment endpoints
router.post("/createInvoice", createInvoice);
router.post("/expireInvoice", ExpireInvoice);
router.get("/getInvoicebyInvoice_id", GetInvoicebyInvoice_id);
router.get("/getInvoicebyExternal_id", GetInvoicebyExternal_id);
router.get("/allTransactions", GetAllTransactions);

//wallet endpoints
router.get("/wallet", getWallet);
router.post("/wallet/add", addSaldo);
router.post("/wallet/use", useSaldo);

//bid endpoints
router.post("/bid", addBid);
router.get("/bid", getBid);

//purchase endpoints
router.get("/allPurchase", getAllPurchase);
router.get("/purchase", getPurchase);
router.get("/allPurchaseAsBuyer", getAllPurchaseAsBuyer);
router.get("/allPurchaseAsSeller", getAllPurchaseAsSeller);
router.post("/endPurchase", endPurchase);
router.get("/purchase-detail", getPurchaseDetail);

export default router;
