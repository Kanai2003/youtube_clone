import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';

import {
    toggleSubscription,
    getSubscribedChannels,
    getUserChannelSubscribers
} from "../controllers/subscription.controller.js";


const router = Router()

router.use(verifyJWT);


router
    .route("/c/:channelId")
    .post(toggleSubscription)

router
    .route("/c/subscribed")
    .get(getSubscribedChannels)

router
    .route("/c/subscribers")
    .get(getUserChannelSubscribers)




export default router;