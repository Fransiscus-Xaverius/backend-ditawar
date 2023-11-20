import { Request, Response } from "express";

require("dotenv").config();

import client from "../database/database";

async function login (req:Request,res:Response){
    try {
        const {username, password} = req.query; 
        if (!username || !password) {
            return res.status(400).json({msg: "Please enter all fields"});
        }
        await client.connect();
        const user = await client.db("dbDitawar").collection("users").findOne({username: username, password: password});
        if (!user) {
            return res.status(400).json({msg: "Invalid credentials"});
        }
        return res.status(200).json({msg: "Login successful"});
    } catch (err) {
        console.error(err);
        return res.status(500).json({msg: "Internal server error"});
    }
}

async function register (req:Request, res:Response){
    try {
        const {username, password} = req.query;
        if (!username || !password) {
            console.log(username);
            console.log(password);
            return res.status(400).json({msg: "Please enter all fields"});
        }
        await client.connect();
        const existingUser = await client.db("dbDitawar").collection("users").findOne({username: username});
        if (existingUser) {
            return res.status(400).json({msg: "User already exists"});
        }
        const newUser = {
            username: username,
            password: password
        }
        await client.db("dbDitawar").collection("users").insertOne(newUser);
        return res.status(200).json({msg: "User created successfully"});
    
    } catch (err) {
        console.error(err);
        return res.status(500).json({msg: "Internal server error"});
    }
}

async function verification(req:Request, res:Response){
    
}

export {login as login, register as register}

module.exports = { login, register };


