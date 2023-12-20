import { Request, Response } from "express";
import dotenv from 'dotenv';
dotenv.config();
import client from "../database/database";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
import { newWallet } from "./walletController";
import { ObjectId } from "mongodb";
const nodemailer = require('nodemailer');

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
            passwordlength: password.length,
            profile_picture:user.profile_picture
        }});
    } catch (err) {
        console.error(err);
        return res.status(500).json({msg: "Internal server error"});
    }
}

async function Reload(req:Request,res:Response) {
    const { id } = req.query;
    const o_id = new ObjectId(id?.toString() ?? '');
    await client.connect();
    const user = await client.db("dbDitawar").collection("users").findOne({_id:o_id});
    const privateKey = process.env.PRIVATE_KEY;
    var token = jwt.sign({ user:user }, privateKey, { expiresIn: '30d' });
    return res.status(200).json({msg: "Login successful", token:token, user:{
        nama:user.nama,
        email:user.email,
        phone:user.phone,
        city:user.city,
        _id:user._id,
        role:user.role,
        profile_picture:user.profile_picture
    }});
}

async function reloadUser(req:Request, res:Response){
    try {
        const {token} = req.query;
        await client.connect();
        const cert = process.env.PRIVATE_KEY;
        let decoded:any;
        try {
            decoded = jwt.verify(token, cert);
        } catch (error) {
            return res.status(401).json({msg: "Unauthorized"});
        }
        const user = decoded.user;
        const result = await client.db("dbDitawar").collection("users").findOne({_id: new ObjectId(user._id)});
        console.log("PP:",result.profile_picture)
        var newToken = jwt.sign({ user:user }, cert, { expiresIn: '30d' });
        return res.status(200).json({msg: "Login successful", token:newToken, user:{
            nama:result.nama,
            email:result.email,
            phone:result.phone,
            city:result.city,
            _id:result._id,
            role:result.role,
            profile_picture:result.profile_picture
        }});
    } catch (err) {
        console.log(err);
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
            console.log("USERDATA:",payload);
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
            role:"unverified",
            profile_picture:"default_avatar.jpg"
        }
        const result = await client.db("dbDitawar").collection("users").insertOne(newUser);
        const user = await client.db("dbDitawar").collection("users").findOne({email:email});
        const wallet = await newWallet(user._id, 0);
        return res.status(200).json({msg: "User created successfully",result : result});
    
    } catch (err) {
        console.error(err);
        return res.status(500).json({msg: "Internal server error"});
    }
}

async function getUserById(req:Request, res:Response){
    const {id} = req.query;
    try {
        await client.connect();
        const o_id = new ObjectId(id?.toString() ?? '');
        const result = await client.db("dbDitawar").collection("users").findOne({_id: o_id});
        const userObj = {
            nama:result.nama,
            email:result.email,
            phone:result.phone,
            address:result.address,
            city:result.city,
            province:result.province,
            _id:result._id,
            role:result.role
        }
        return res.status(201).json({msg: "User Found", result:userObj});
    } catch (error) {
        console.error(error);
        return res.status(500).json({msg: "Internal server error"});
    }
} 




async function requestVerification(req:Request, res:Response){

}

async function verification(req:Request, res:Response){
    const {id} = req.query;
    try {
        await client.connect();
        const o_id = new ObjectId(id?.toString() ?? '');
        const result = await client.db("dbDitawar").collection("users").findOne({_id: o_id});
        if(result.role == "unverified"){
            await client.db("dbDitawar").collection("users").updateOne({_id: o_id},{$set:{role:"verified"}});
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'a08690751@gmail.com',
                    pass: 'jyja uwei omtf fyfv',
                },
                });
            const mailOptions = {
                from: 'a08690751@gmail.com',
                to: result.email,
                subject: 'Verified Account',
                text: 'Hello, Your account has been verified.',
            };

            await transporter.sendMail(mailOptions)
        }
        return res.status(201).json({msg: "User Verified"});
    } catch (error) {
        return res.status(500).json({msg: "Internal server error"});
    }
}

async function banned(req:Request, res:Response){
    const {id} = req.query;
    try {
        await client.connect();
        const o_id = new ObjectId(id?.toString() ?? '');
        const result = await client.db("dbDitawar").collection("users").findOne({_id: o_id});
        if(result.role == "banned"){
            await client.db("dbDitawar").collection("users").updateOne({_id: o_id},{$set:{role:"verified"}});
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'a08690751@gmail.com',
                    pass: 'jyja uwei omtf fyfv',
                },
                });
            const mailOptions = {
                from: 'a08690751@gmail.com',
                to: result.email,
                subject: 'Unbanned Account',
                text: 'Hello, Your account has been unbanned.',
            };

            await transporter.sendMail(mailOptions)
        }
        else{
            await client.db("dbDitawar").collection("users").updateOne({_id: o_id},{$set:{role:"banned"}});
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'a08690751@gmail.com',
                    pass: 'jyja uwei omtf fyfv',
                },
                });
            const mailOptions = {
                from: 'a08690751@gmail.com',
                to: result.email,
                subject: 'Banned Account',
                text: 'Hello, Your account has been banned.',
            };

            await transporter.sendMail(mailOptions)
        }
        return res.status(201).json({msg: "User Update"});
    } catch (error) {
        return res.status(500).json({msg: "Internal server error"});
    }
}

async function updateUserById(req:Request, res:Response) {
    const {id} = req.query;
    try {
        await client.connect();
        const o_id = new ObjectId(id?.toString() ?? '');
        if(req.body.password){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            const result = await client.db("dbDitawar").collection("users").updateOne({_id: o_id},{
                $set : {
                    nama:req.body.nama,
                    email:req.body.email,
                    phone:req.body.phone,
                    city : req.body.city,
                    profile_picture : req.body.profile_picture,
                    password : hashedPassword
                }
            });
        }
        else {
            const result = await client.db("dbDitawar").collection("users").updateOne({_id: o_id},{
                $set : {
                    nama:req.body.nama,
                    email:req.body.email,
                    phone:req.body.phone,
                    city : req.body.city,
                    profile_picture : req.body.profile_picture
                }
            });
        }
        return res.status(201).json({msg: "User Updated"});
    } catch (error) {
        return res.status(500).json({msg: "Internal server error"});
    }
}

async function sendMail(req: Request, res: Response) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'a08690751@gmail.com',
            pass: 'jyja uwei omtf fyfv',
        },
    });
    const mailOptions = {
        from: 'a08690751@gmail.com',
        to: req.query.email,
        subject: req.body.subject,
        html: req.body.msg
       
    };

    await transporter.sendMail(mailOptions);
}

export {login as login, register as register, getDataFromToken as getDataFromToken, verification as verification, allUser as allUser, getUserById as getUserById, updateUserById as updateUserById, reloadUser as reloadUser,Reload as Reload, banned as banned, sendMail as sendMail}

module.exports = { login, register , getDataFromToken, verification, allUser, getUserById, updateUserById, reloadUser,Reload, banned, sendMail};


