import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });

export const JWT_SECRET = process.env.JWT_SECRET as string;
export const MONGODB_URI = process.env.MONGODB_URI as string;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
