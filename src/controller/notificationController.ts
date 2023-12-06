import client from "../database/database";
import { ObjectId } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

async function createNotification(id_user:String, message:String, type:String){
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("notifications").insertOne({id_user: id_user, message: message, type: type, read: false});
        return result
    } catch (error) {
        return null;
    }
}

async function getNotification(id_user:String){
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("notifications").find({id_user: id_user}).toArray();
        return result
    } catch (error) {
        return null;
    }
}

async function readNotification(id_user:String){
    try {
        await client.connect();
        const result = await client.db("dbDitawar").collection("notifications").updateMany({id_user: id_user}, {$set: {read: true}});
        return result
    } catch (error) {
        return null;
    }
}

export   {
    createNotification,
    getNotification,
    readNotification
}

module.exports = {
    createNotification,
    getNotification,
    readNotification
}