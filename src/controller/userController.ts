import { Request, Response } from "express";
import dotenv from 'dotenv';
dotenv.config();
import client from "../database/database";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function login (req:Request,res:Response){
    try {
        const {email, password} = req.query; 
        if (!email || !password) {
            return res.status(400).json({msg: "Please enter all fields"});
        }
        await client.connect();
        const user = await client.db("dbDitawar").collection("users").findOne({email:email});
        if (!user) {
            return res.status(404).json({msg: "Invalid credentials"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(404).json({msg: "Invalid credentials"});
        }
        const privateKey = process.env.PRIVATE_KEY;
        var token = jwt.sign({ user:user }, privateKey, { expiresIn: '30d' });
        return res.status(200).json({msg: "Login successful", token:token, user:{
            nama:user.nama,
            email:user.email,
            phone:user.phone,
            city:user.city
        }});
    } catch (err) {
        console.error(err);
        return res.status(500).json({msg: "Internal server error"});
    }
}

async function getDataFromToken(req:Request, res:Response){
    const {token} = req.query;
    const cert = process.env.PRIVATE_KEY;
    jwt.verify(token, cert, function (err:any, payload:any) {
        if(err){
            return res.status(401).json({msg: "Unauthorized"});
        }
        else {
            return res.status(200).json({msg: "Authorized", payload:payload});
        }
    });
}

async function register (req:Request, res:Response){
    try {
        const { password, phone, email, city, name} = req.query;
        if (!email || !password) {
            return res.status(400).json({msg: "Please enter all fields"});
        }
        await client.connect();
        const existingUser = await client.db("dbDitawar").collection("users").findOne({email:email});
        if (existingUser) {
            return res.status(409).json({msg: "Email is already registered"});
        }
        const phoneNumberUsed = await client.db("dbDitawar").collection("users").findOne({phone:phone});
        if (phoneNumberUsed) {  
            return res.status(409).json({msg: "Phone number already used"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = {
            email:email,
            password: hashedPassword,
            nama:name,
            phone:phone,
            city:city
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

export {login as login, register as register, getDataFromToken as getDataFromToken, verification as verification}

module.exports = { login, register , getDataFromToken, verification};


