import mongoose, { Types } from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/likes.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


// Get the channel stats like total video views, total subscribers, total videos, total likes etc.
const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const totalView = await Video.aggregate([
        {
            $match: {
                owner: new Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                Views: { $sum: "$views" }
            }
        }
    ])

    const totalSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new Types.ObjectId(userId)
            }
        },
        {
            $count: "totalSubscribers"
        }
    ])

    const totalVideos = await Video.aggregate([
        {
            $match: {
                owner: new Types.ObjectId(userId)
            }
        },
        {
            $count: "totalVideos"
        }
    ])

    const totalLikes = await Like.aggregate([
        {
            $match: {
                video: { $exists: true }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        {
            $match: {
                "videoDetails.owner": new Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: { $sum: 1 }
            }
        }
    ])

    const stats = {
        totalView: totalView[0]?.Views || 0,
        totalSubscribers: totalSubscribers[0]?.totalSubscribers || 0,
        totalVideos: totalVideos[0]?.totalVideos || 0,
        totalLikes: totalLikes[0]?.totalLikes || 0
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { stats }, "Details fetched successfully"))
})


// Get all the videos uploaded by the channel
const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const videos = await Video.find({ owner: userId })
    if (!videos) {
        new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { videos }, "Video fetched successfully"))
})

export {
    getChannelStats,
    getChannelVideos
}