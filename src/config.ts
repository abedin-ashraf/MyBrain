import * as dotenv from 'dotenv'

dotenv.config();
export const JWT_PASSWORD = process.env.JWT_PASSWORD || "secret";