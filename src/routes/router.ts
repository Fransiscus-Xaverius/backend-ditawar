import express, { Router } from 'express';

import { login, register, getDataFromToken, updateUserById} from '../controller/userController';
import { uploadFile, addItem, getItem, getImage} from '../controller/itemController';
import { addAuction, getAuction, getAllAuction, getSampleAuctions, getAuctionByQuery, updateAuction } from '../controller/auctionController';
import { allUser, getUserById } from '../controller/userController';
import { getBid, addBid } from '../controller/bidController';
import { createInvoice, ExpireInvoice, GetInvoicebyInvoice_id, GetInvoicebyExternal_id } from '../controller/paymentController';
import { getWallet, useSaldo, addSaldo } from '../controller/walletController';

const router: Router = express.Router();

//router

//user endpoints
router.post("/login", login);
router.post("/register", register);
router.get("/getDataFromToken", getDataFromToken);
router.get('/allUser', allUser);
router.get('/user', getUserById);
router.put('/user',updateUserById)

//item 
router.post("/uploadFile", uploadFile);
router.post("/addItem", addItem);
router.get("/item", getItem);
router.get('/image', getImage);

//auction endpoints
router.post("/auction", addAuction);
router.get("/auction", getAuction);
router.put('/auction', updateAuction);
router.get("/allAuction", getAllAuction);
router.get('/sampleAuction', getSampleAuctions);
router.get('/search', getAuctionByQuery);

//payment endpoints
router.post("/createInvoice", createInvoice);
router.post("/expireInvoice", ExpireInvoice);
router.get("/getInvoicebyInvoice_id", GetInvoicebyInvoice_id);
router.get("/getInvoicebyExternal_id", GetInvoicebyExternal_id);

//wallet endpoints
router.get("/wallet", getWallet);
router.post('/wallet/add', addSaldo);
router.post("/wallet/use", useSaldo);

//bid endpoints
router.post("/bid", addBid);
router.get("/bid", getBid);

export default router;
