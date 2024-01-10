import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';

import {
    toggleVideoLike,
    toggleTweetLike,
    toggleCommentLike,
    getLikedVideos,
    getLikedTweets
} from "../controllers/like.controllers.js";


const router = Router()

router.use(verifyJWT);


router
    .route("/v/:videoId")
    .post(toggleVideoLike)

router
    .route("/t/:tweetId")
    .post(toggleTweetLike)

//fix: test this route after building comment feature
router
    .route("/c/:commentId")
    .post(toggleCommentLike)

router
    .route("/liked-videos")
    .get(getLikedVideos)

router
    .route("/liked-tweets")
    .get(getLikedTweets)


export default router;