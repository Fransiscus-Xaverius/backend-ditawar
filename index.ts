import express, {Express} from 'express';
import dotenv from 'dotenv';
import router from './src/routes/router';
const cors = require('cors');
import path from 'path';
import { AuctionUpdate } from './src/controller/auctionController';
import { BidUpdate } from './src/controller/bidController';

dotenv.config();

const app:Express = express();
app.use(express.json());
const port = process.env.PORT;
app.use(cors());   
app.use('/', router);
app.use('/static', express.static('public/images'))

setInterval(function() {
    AuctionUpdate();
    BidUpdate();
}, 1000);

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});