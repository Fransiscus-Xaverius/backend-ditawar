import { Request, Response } from "express";

async function addAuction(req:Request, res:Response){
  try {
    const {token, id_user, id_barang, starting_price, asking_price, start, end} = req.body;
  } catch (error) {
    
  }
}

export { addAuction as addAuction };
module.exports = { addAuction }
