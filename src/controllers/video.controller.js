import mongoose, {isValidObjectId} from "mongoose";
import {Video} from "../models/video.model.js";
import {User} from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {asyncHandler} from "../utils/asyncHandler.js";


//publish a video
const publishVideo = asyncHandler(async (req, res, next) => {
    const { title, description } = req.body;

    // check if any of the required fields are empty
    if( [title, description].some((field) => field?.trim() === "") ){
        throw new ApiError(400, "Title and description both are required");
    }

    const videoPath = req.files?.videoFile[0]?.path;
    // const thumbnailPath = req.files?.thumbnail?.path || "";

    if(!videoPath){
       throw new ApiError(400, "Video is required");
    }

    //fix: upload thumbnail also
    // upload video and thumbnail on cloudinary
    const videoFile = await uploadOnCloudinary(videoPath);
    // const thumbnail = await uploadOnCloudinary(thumbnailPath);

    // console.log(videoFile);
    // console.log(videoFile.url);

    if(!videoFile ){
       throw new ApiError(500, "Something went wrong while uploading video");
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        // thumbnail: thumbnail.url||"",
        owner: req.user._id,
    });

    if( !video ){
        throw new ApiError(500, "Something went wrong while creating video");
    }

    return res.status(201).json(new ApiResponse(201, "Video created successfully"));
})

// get any video by its id
const getVideoById = asyncHandler( async (req, res, next) => {
    const { id } = req.params;

    if(!isValidObjectId(id)){
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findById(id);

    if(!video){
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video found"));
})

//update video's title and description by its id
const updateVideoById = asyncHandler( async (req, res, next) => {
    const { id } = req.params;
    
    if(!isValidObjectId(id)){
        throw new ApiError(400, "Invalid video id");
    }
    
    const { title, description } = req.body;

    if( !(title || description) ){
        throw new ApiError(400, "Title or description or both are required");
    }

    const video = await Video.findByIdAndUpdate(id, {title, description}, {new: true});

    if(!video){
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video updated successfully"));
})

// delete video by its id
//fix: also delete from cloudinary
const deleteVideoById = asyncHandler( async (req, res, next) => {
    const { id } = req.params;

    if(!isValidObjectId(id)){
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findByIdAndDelete(id);

    if(!video){
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Video deleted successfully"));
})

// toggle video's publish status by its id
const togglePublisStatus = asyncHandler( async (req, res, next) => {
    const {id} = req.params

    if(!isValidObjectId(id)){
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findByIdAndUpdate(id, {isPublished: !Video.isPublished}, {new: true});

    if(!video){
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video visibility updated successfully"));
})

//TODO: get all videos based on query, sort, pagination

export {
    publishVideo,
    getVideoById,
    updateVideoById,
    deleteVideoById,
    togglePublisStatus

}