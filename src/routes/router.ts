import express, { Router } from 'express';

import { login } from '../controller/user';

const router: Router = express.Router();

//user endpoints
router.get("/login", login);


export default router;
