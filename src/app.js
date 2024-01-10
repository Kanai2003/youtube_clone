import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

//middleware config
app.use(express.json({limit: "16kb"}));  //config for json data
app.use(express.urlencoded({extended: true, limit: "16kb"}));  //config for encoded url
app.use(express.static("public")); //config for static assets
app.use(cookieParser())



// import routes
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"


//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)



export { app };