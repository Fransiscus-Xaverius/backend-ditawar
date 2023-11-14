import { Request, Response } from "express";

require("dotenv").config();

import client from "../database/database";

async function login (req:Request,res:Response){
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Connected successfully to server");
    } catch (err) {
        console.error(err);
    }
}

export {login as login}

module.exports = { login };


