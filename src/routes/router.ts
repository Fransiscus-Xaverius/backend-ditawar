import express, { Router } from 'express';

import { login, register, getDataFromToken } from '../controller/userController';
import { uploadFile, addItem, getItem, getImage} from '../controller/itemController';
import { addAuction, getAuction, getAllAuction } from '../controller/auctionController';

const router: Router = express.Router();

//user endpoints
router.post("/login", login);
router.post("/register", register);
router.get("/getDataFromToken", getDataFromToken);

//item endpoints
router.post("/uploadFile", uploadFile);
router.post("/addItem", addItem);
router.get("/item", getItem);
router.get('/image', getImage);

//auction endpoints
router.post("/auction", addAuction);
router.get("/auction", getAuction);
router.get("/allAuction", getAllAuction)

export default router;
