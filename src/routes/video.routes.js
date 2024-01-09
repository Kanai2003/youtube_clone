import { Router } from "express";
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
    publishVideo,
    getVideoById,
    updateVideoById,
    deleteVideoById,
    togglePublisStatus
} from "../controllers/video.controller.js";



const router = Router()


router
    .route("/publish")
    .post(
        verifyJWT,
        // multer middleware
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1
            },
            //fix: upload thumbnail also
            // {
            //     name: "thumbnail",
            //     maxCount: 1
            // }
        ]),
        publishVideo
    )

router
    .route("/getVideo/:id")
    .get(verifyJWT, getVideoById)

router
    .route("/updateVideo/:id")
    .patch(verifyJWT, updateVideoById)

router
    .route("/deleteVideo/:id")
    .delete(verifyJWT, deleteVideoById)

router  
    .route("/togglePublishStatus/:id")
    .patch(verifyJWT, togglePublisStatus)


export default router;