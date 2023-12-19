import dotenv from "dotenv";
import connectDB from "./db/index.js";

//env configuration
dotenv.config({
    path:"./env"
})


connectDB()





