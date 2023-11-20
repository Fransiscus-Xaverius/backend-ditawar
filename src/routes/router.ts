import express, { Router } from 'express';

import { login, register } from '../controller/userController';

const router: Router = express.Router();

//user endpoints
router.post("/login", login);
router.post("/register", register);


export default router;
