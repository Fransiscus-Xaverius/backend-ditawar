import express, { Router } from 'express';

import { login, register, getDataFromToken} from '../controller/userController';
import { uploadFile, addItem, getItem, getImage} from '../controller/itemController';
import { addAuction, getAuction, getAllAuction } from '../controller/auctionController';
import { allUser } from '../controller/userController';
import { getBid, addBid } from '../controller/bidController';

const router: Router = express.Router();

//user endpoints
router.post("/login", login);
router.post("/register", register);
router.get("/getDataFromToken", getDataFromToken);
router.get('/allUser', allUser);

//item 
router.post("/uploadFile", uploadFile);
router.post("/addItem", addItem);
router.get("/item", getItem);
router.get('/image', getImage);

//auction endpoints
router.post("/auction", addAuction);
router.get("/auction", getAuction);
router.get("/allAuction", getAllAuction)

//bid endpoints
router.post("/bid", addBid);
router.get("/bid", getBid);

export default router;
