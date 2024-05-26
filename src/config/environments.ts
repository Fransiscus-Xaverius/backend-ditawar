import * as dotenv from 'dotenv';
import { Environment } from '../contracts/vo/environment.vo';

dotenv.config();

const ENV: Environment = {
    PORT: process.env.PORT,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    SALTROUNDS: process.env.SALTROUNDS,
    COMPANY_MAIL_SERVICE: process.env.COMPANY_MAIL_SERVICE,
    COMPANY_MAIL: process.env.COMPANY_MAIL,
    COMPANY_MAIL_PASSWORD: process.env.COMPANY_MAIL_PASSWORD,
    XENDIT_AUTH_TOKEN: process.env.XENDIT_AUTH_TOKEN,
    MONGODB_URI: process.env.MONGODB_URI,
}

export default ENV