import express, {Express} from 'express';
import dotenv from 'dotenv';
import router from './src/routes/router';

dotenv.config();

const app:Express = express();
const port = process.env.PORT;

app.use('/', router);

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});