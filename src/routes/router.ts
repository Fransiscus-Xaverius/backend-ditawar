import express, { Router } from 'express';

import { login, register, getDataFromToken } from '../controller/userController';
import { uploadFile } from '../controller/auctionController';
const router: Router = express.Router();

//user endpoints
router.post("/login", login);
router.post("/register", register);
router.get("/getDataFromToken", getDataFromToken);

//test uploadfile
router.post("/uploadFile", uploadFile);

export default router;
