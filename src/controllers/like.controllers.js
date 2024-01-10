import mongoose, {isValidObjectId} from "mongoose";
import { Like } from "../models/likes.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";

// toggle like on a video
const toggleVideoLike = asyncHandler( async (req, res) => {
    const {videoId} = req.params;
    const userId = req.user._id;

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const isLiked = await Like.exists({video: videoId, likedBy: userId});

    if(isLiked){
        await Like.deleteOne({video: videoId, likedBy: userId});
        return res
                .status(200)
                .json(new ApiResponse(200, "Unliked successfully"));
    }

    const like = await Like.create({video: videoId, likedBy: userId});

    if( !like ){
        throw new ApiError(500, "Something went wrong while liking the video");
    }

    return res
            .status(200)
            .json(new ApiResponse(200, like, "Liked successfully"));
})

// toggle like on a tweet
const toggleTweetLike = asyncHandler( async (req, res) => {
    const {tweetId} = req.params;
    const userId = req.user._id;

    if(!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    const isLiked = await Like.exists({tweet: tweetId, likedBy: userId});

    if(isLiked){
        await Like.deleteOne({tweet: tweetId, likedBy: userId});
        return res
                .status(200)
                .json(new ApiResponse(200, "Unliked successfully"));
    }

    const like = await Like.create({tweet: tweetId, likedBy: userId});

    if( !like ){
        throw new ApiError(500, "Something went wrong while liking the tweet");
    }

    return res
            .status(200)
            .json(new ApiResponse(200, like, "Liked successfully"));
})

// fix: test this route after building comment feature
// toggle like on a comment 
const toggleCommentLike = asyncHandler( async (req, res) => {
    const {commentId} = req.params;
    const userId = req.user._id;

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }

    const isLiked = await Like.exists({comment: commentId, likedBy: userId});

    if( isLiked ){
        await Like.deleteOne({comment: commentId, likedBy: userId});
        return res
                .status(200)
                .json(new ApiResponse(200, "Unliked successfully"));
    }

    const like = await Like.create({comment: commentId, likedBy: userId});

    if( !like ){
        throw new ApiError(500, "Something went wrong while liking the comment");
    }

    return res
            .status(200)
            .json(new ApiResponse(200, like, "Liked successfully"));
})


// get all liked videos of a user
const getLikedVideos = asyncHandler( async (req, res) => {
    const userId = req.user._id;

    const likedVideos = await Like.find({likedBy: userId, video: {$exists: true}})

    if( !likedVideos ){
        throw new ApiError(500, "Something went wrong while fetching liked videos");
    }

    return res
            .status(200)
            .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
})

// get all liked tweets of a user
const getLikedTweets = asyncHandler( async (req, res) => {
    const userId = req.user._id;

    const likedTweets = await Like.find({likedBy: userId, tweet: {$exists: true}})

    if( !likedTweets ){
        throw new ApiError(500, "Something went wrong while fetching liked tweets");
    }

    return res
            .status(200)
            .json(new ApiResponse(200, likedTweets, "Liked tweets fetched successfully"));
})

export {
    toggleVideoLike,
    toggleTweetLike,
    toggleCommentLike,
    getLikedVideos,
    getLikedTweets
}