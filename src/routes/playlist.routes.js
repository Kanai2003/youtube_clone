import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js"

const router = Router()

router.use(verifyJWT)

router
    .route("/")
    .post(createPlaylist)
    .get(getUserPlaylists)

router
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist)

router
    .route("/add/:playlistId/:videoId")
    .put(addVideoToPlaylist)

router
    .route("/remove/:playlistId/:videoId")
    .patch(removeVideoFromPlaylist)


export default router