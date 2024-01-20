import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';

import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js"

const router = Router()

router.use(verifyJWT)

router
    .route("/:videoId")
    .get(getVideoComments)

router  
    .route("/add-comment")
    .post(addComment)

router  
    .route("/update-comment/:commentId")
    .post(updateComment)

router
    .route("/delete-comment/:commentId")
    .post(deleteComment)

export default router