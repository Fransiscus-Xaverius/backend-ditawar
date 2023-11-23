import express, {Express} from 'express';
import dotenv from 'dotenv';
import router from './src/routes/router';
const cors = require('cors');
dotenv.config();

const app:Express = express();
app.use(express.json());
const port = process.env.PORT;
app.use(cors());   
app.use('/', router);

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});