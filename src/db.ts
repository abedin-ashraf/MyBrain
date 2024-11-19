import mongoose, { model, Schema } from "mongoose";
import * as dotenv from 'dotenv'

dotenv.config();
const mongo_url = process.env.MONGO_URL;

if (!mongo_url) {
    throw new Error("mongo_url is not defined")
}

mongoose.connect(mongo_url)
    .then(() => { console.log("Connected to MongoDB") })
    .catch((err) => console.log("MongoDB connection error: ", err));

//Schema
const UserSchema = new Schema({
    username: { type: String, unique: true },
    password: String
})
const contentSchema = new Schema({
    title: String,
    link: String,
    tags: [{ type: mongoose.Types.ObjectId, ref: "Tag" }],
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true }
})



export const UserModel = model("User", UserSchema);
export const ContentModel = model("Content", contentSchema);