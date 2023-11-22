import express, { Router } from 'express';

import { login, register, getDataFromToken } from '../controller/userController';

const router: Router = express.Router();

//user endpoints
router.post("/login", login);
router.post("/register", register);
router.get("/getDataFromToken", getDataFromToken);

export default router;
