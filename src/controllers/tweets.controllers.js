import mongoose, {isValidObjectId} from "mongoose";
import {User} from "../models/user.model.js";
import {Tweet} from "../models/tweets.model.js"
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";

// create new tweet
const createTweet = asyncHandler( async (req, res) => {
    const userId = req.user._id;
    const {content} = req.body;

    if( !content ){
        return new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.create({owner: userId, content});

    return res
            .status(201)
            .json(new ApiResponse(201, tweet, "Tweet created successfully"));
})

// get all tweets of a user
const getAllTweets = asyncHandler( async (req, res) => {
    const userId = req.user._id;

    const tweets = await Tweet.find({owner: userId})

    if( !tweets){
        return new ApiError(404, "No tweets found")
    }

    if( tweets.length === 0 ){
        return res
            .status(200)
            .json(new ApiResponse(200, "You don't have any tweets yet"))
    }

    return res
            .status(200)
            .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
})

// update a tweet by its id
const updateTweet = asyncHandler( async (req, res) => {
    const userId = req.user._id;
    const {tweetId} = req.params;
    const {content} = req.body;

    if( !content ){
        return new ApiError(400, "Content is required");
    }

    if( !isValidObjectId(tweetId) ){
        return new ApiError(400, "Invalid tweet id");
    }

    const tweet = await Tweet.findOne({_id: tweetId, owner: userId})

    if(!tweet){
        return new ApiError(404, "Tweet not found");
    }

    if( tweet.content === content ){
        return new ApiError(400, "Tweet content is same as previous");
    }

    tweet.content = content;

    await tweet.save();

    // const updatedTweet = await Tweet.findOne({_id: tweetId, owner: userId})

    return res
            .status(200)
            .json(new ApiResponse(200, /*updatedTweet*/ tweet, "Tweet updated successfully"));

})

// delete a tweet by its id
const deleteTweet = asyncHandler( async (req, res) => {
    const userId = req.user._id;
    const {tweetId} = req.params;

    if( !isValidObjectId(tweetId) ){
        return new ApiError(400, "Invalid tweet id");
    }

    const deletedTweet = await Tweet.findOneAndDelete({_id: tweetId, owner: userId})

    if( !deletedTweet ){
        return new ApiError(500, "Something went wrong while deleting tweet");
    }

    return res
            .status(200)
            .json(new ApiResponse(200, "Tweet deleted successfully"));
})


export {
    createTweet,
    getAllTweets,
    updateTweet,
    deleteTweet

}