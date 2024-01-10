import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
    createTweet,
    getAllTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweets.controllers.js";

const router = Router();


router.use(verifyJWT);


router
    .route("/create")
    .post(createTweet)

router
    .route("/getall")
    .get(getAllTweets)

router
    .route("/update/:tweetId")
    .patch(updateTweet)
    .delete(deleteTweet)



export default router;