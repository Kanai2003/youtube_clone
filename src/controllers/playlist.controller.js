import mongoose, { Types, isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

// create playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    const userId = req.user._id

    if (!name) {
        throw new ApiError(408, "Name is required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: userId
    })


    if (!playlist) {
        throw new ApiError(408, "Something went wrong while creating the playlists")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist created successfully"))

})

// fix: not getting all the video properly
//get user's playlists
const getUserPlaylists = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const playlist = await Playlist.aggregate([
        {
            $match: {
                owner: new Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",

                pipeline: [
                    {
                        $sort: { createdAt: -1 }
                    }
                ]
            }
        },
        {
            $addFields: {
                playlistThumbnail: {
                    $cond: {
                        if: { $isArray: "$videos" },
                        then: { $first: "$videos.thumbnail" },
                        else: null,
                    },
                },
            },
        },
        {
            $project: {
                name: 1,
                description: 1,
                playlistThumbnail: 1
            }
        }

    ])

    if(!playlist){
        throw new ApiError(500, "something went wrong!")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Playlists fetched Successfully"))

})

// fix: not getting all the video properly
// get a playlist by id
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(408, "Invalid Playlist Id");
    }

    const isPlaylistExist = await Playlist.findById(playlistId);
    if (!isPlaylistExist) {
        throw new ApiError(404, "Playlist not found!");
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: Types.ObjectId(playlistId),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",

                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",

                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
            },
        },
        {
            $addFields: {
                owner: {
                    $first: "$ownerDetails",
                },
            },
        },
        {
            $project: {
                ownerDetails: 0, // Exclude redundant ownerDetails field
            },
        },
    ]);

    if (!playlist || playlist.length === 0) {
        throw new ApiError(500, "Something went wrong!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});


// add Video to a playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(408, "Invalid PlaylistId or VideoId!");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found!");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found!");
    }

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already exists in the playlist!");
    }

   
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $push: { videos: videoId } }, 
        { new: true }
    );

   
    if (!updatedPlaylist) {
        throw new ApiError(500, "Something went wrong while updating the playlist!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Successfully added the video"));
});


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Validate ObjectIds
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(408, "Invalid PlaylistId or VideoId!");
    }

    // Check if playlist exists
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found!");
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found!");
    }

    // Check if the video exists in the playlist
    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video does not exist in the playlist!");
    }

    // Update the playlist by pulling the videoId
    const updateStatus = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: videoId } }, // Assuming 'videos' is the correct array field
        { new: true }
    );

    // Check if the update was successful
    if (!updateStatus) {
        throw new ApiError(500, "Something went wrong while updating the playlist!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updateStatus, "Video removed from playlist successfully"));
});


const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    
    if(!isValidObjectId(playlistId)){
        throw new ApiError(408, "Invalid playlist Id!")
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId);

    if(!playlist){
        throw new ApiError(404, "Playlist not found!")
    }
    return res
            .status(200)
            .json(new ApiResponse(200, "Playlist Successfully deleted"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(408, "Invalid Playlist Id");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found!");
    }

    // Set the update fields based on the provided values or retain the existing values
    const updateFields = {};
    if (name !== undefined) {
        updateFields.name = name;
    }
    if (description !== undefined) {
        updateFields.description = description;
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, updateFields, { new: true });

    if (!updatedPlaylist) {
        throw new ApiError(404, "Updated Playlist not found!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Playlist Updated successfully"));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}