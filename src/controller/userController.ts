import { Request, Response } from "express";
import dotenv from 'dotenv';
dotenv.config();
import client from "../database/database";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
import { newWallet } from "./walletController";

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
            city:user.city,
            _id:user._id,
            role:user.role,
            passwordlength: password.length
        }});
    } catch (err) {
        console.error(err);
        return res.status(500).json({msg: "Internal server error"});
    }
}

async function allUser(req:Request, res:Response){
    await client.connect();
    const result = await client.db("dbDitawar").collection("users").find().toArray();
    console.log(result);
    return res.status(200).send({result:result, message:"Berhasil"});
}

async function getDataFromToken(req:Request, res:Response){
    const {token} = req.query;
    const cert = process.env.PRIVATE_KEY;
    jwt.verify(token, cert, function (err:any, payload:any) {
        if(err){
            return res.status(401).json({msg: "Unauthorized"});
        }
        else {
            console.log(payload);
            return res.status(200).json({msg: "Authorized", payload:payload});
        }
    });
}

async function register (req:Request, res:Response){
    try {
        const { password, phone, email, city, name, province, address} = req.query;
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
            address:address,
            city:city,
            province:province,
            role:"unverified"
        }
        await client.db("dbDitawar").collection("users").insertOne(newUser);
        const user = await client.db("dbDitawar").collection("users").findOne({email:email});
        const wallet = await newWallet(user._id, 0);
        return res.status(200).json({msg: "User created successfully"});
    
    } catch (err) {
        console.error(err);
        return res.status(500).json({msg: "Internal server error"});
    }
}

async function topUp(req:Request, res:Response){ //top up wallet

}

async function verification(req:Request, res:Response){
    
}

export {login as login, register as register, getDataFromToken as getDataFromToken, verification as verification, allUser as allUser}

module.exports = { login, register , getDataFromToken, verification, allUser};


