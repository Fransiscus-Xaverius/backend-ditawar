import express, { Router } from 'express';

import { login, register } from '../controller/user';

const router: Router = express.Router();

//user endpoints
router.get("/login", login);
router.post("/register", register);


export default router;
