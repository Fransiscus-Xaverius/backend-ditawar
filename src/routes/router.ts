import express, { Router } from 'express';

import { login, register, getDataFromToken } from '../controller/userController';
import { uploadFile, addItem } from '../controller/itemController';

const router: Router = express.Router();

//user endpoints
router.post("/login", login);
router.post("/register", register);
router.get("/getDataFromToken", getDataFromToken);

//item endpoints
router.post("/uploadFile", uploadFile);
router.post("/addItem", addItem);

export default router;
