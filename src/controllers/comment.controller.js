import mongoose, {Types, isValidObjectId} from "mongoose"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Comment} from "../models/comments.model.js"
import {Video} from "../models/video.model.js"


const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid VideoId")
    }

    const aggregate = await Comment.aggregate([
        {
            $match:{
                video: new Types.ObjectId(videoId)
            }
        }
    ])

    await Comment.aggregatePaginate(aggregate)
        .then( (result)=> {
            return res.status(200).json(new ApiResponse(200, {result}, "Comment(s) fetched successfully"))
        })
        .catch((error)=> {
            throw new ApiError(400, error, "Something went wrong!")
        })
})

const addComment = asyncHandler(async (req, res) => {
    const userId = req._id
    const {content} = req.body
    const {videoId} = req.query

    if(!content) {
        throw new ApiError(400, "Content is required")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "video does not exist")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(400, "Video not found!")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: userId
    })

    if(!comment){
        throw new ApiError(400, "Comment not created!")
    }

    return res
            .status(200)
            .json(
                200,
                new ApiResponse(200, comment, "Comment created successfully")
            )
})

const updateComment = asyncHandler(async (req, res) => {
    const {content} = req.body
    const {commentId} = req.params

    if(!content){
        throw new ApiError(400, "Content is required!")
    }
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid CommentId!")
    }

    const comment = await Comment.findOne({_id: commentId})

    if(!comment){
        throw new ApiError(400, "comment not found!")
    }

    if(comment.content === content){
        throw new ApiError(408, "content is same as previous")
    }

    comment.content = content

    await comment.save();

    return res
            .status(200)
            .json(
                200,
                new ApiResponse(200, comment, "Comment updated successfully")
            )
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid CommentId!")
    }
    
    const comment = await Comment.findByIdAndDelete(commentId)

    if(!comment){
        throw new ApiError(400, "Something went wrong whild deleting the comment")
    }

    return res  
            .status(200)
            .json(new ApiResponse(200, "Comment Deleted successfully!"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}