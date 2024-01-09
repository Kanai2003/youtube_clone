import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";



// generate access token and refresh token
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}

// Register user
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, username, email, password } = req.body;

    if (
        // check if any of the required fields are empty
        [fullName, username, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // check if username is already taken
    const existedUser = await User.findOne({
        // check if any of the field is present in db
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(400, "Username or email already exist")
    }

    // get paths of avatar and coverImage from multer middleware
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files?.coverImage[0]?.path
    }


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    // upload avatar and coverImage on cloudinary from local path
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(500, "Something went wrong while uploading avatar")
    }

    const newUser = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    })

    const createdUser = await User.findById(newUser._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    )
})

// Login user
const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // if both of username and email are empty
    if (!(username || email)) {
        throw new ApiError(400, "Username or email is required")
    }

    if (!password) {
        throw new ApiError(400, "Password is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(400, "User not found")
    }

    const isPasswordMatched = await user.isPasswordCorrect(password)

    if (!isPasswordMatched) {
        throw new ApiError(400, "Wrong password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    // disselect password and refreshToken from user object and send it to client as a cookies
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in successfully"

            )
        )

})

// logout user
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
        )


})

// refresh access token using refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if (user?.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accesstoken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200, { accessToken, refreshToken: newRefreshToken })
            )
    } catch (error) {

    }

})

// Update password
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmNewPassword } = req.body

    if (newPassword !== confirmNewPassword) {
        throw new ApiError(400, "Reconfirm your password")
    }

    const user = await User.findById(req.user._id)

    const isPasswordMatched = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordMatched) {
        throw new ApiError(400, "Invalid old password")
    }


    user.password = newPassword

    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password changed successfully")
        )
})

// Get current user
const getCurrentUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id).select("-password -refreshToken")
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, { user }, "Current User fetched successfully")
        )
})

// Update current user details
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { username, fullName, email } = req.body

    if (!(fullName || username || email)) {
        throw new ApiError(400, "At least one field is required")
    }

    const user = User.findByIdAndUpdate(req.user?._id, {
        $set: {
            fullName: fullName || req.user.fullName,
            username: username || req.user.username,
            email: email || req.user.email
        }
    }, {
        new: true
    }).select("-password -refreshToken")

    return res
        .status(200)
        .json(
            new ApiError(200, user, "Account details updated successfully")
        )
})

//fix
// update avatar
const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.files?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar) {
        throw new ApiError(500, "Something went wrong while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.usre._id,
        {
            $set: {
                avatar: avatar.url
            }
        }, {
        new: true
    }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(
            new ApiError(200, user, "Avatar updated successfully")
        )

})

//fix
const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.files?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image is required")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(500, "Something went wrong while uploading cover image")
    }

    const user = await User.findByIdAndUpdate(
        req.usre._id,
        {
            $set: {
                avatar: coverImage.url
            }
        }, {
        new: true
    }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(
            new ApiError(200, user, "Cover image updated successfully")
        )
})

// get user channel profile
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    // mongodb aggregation pipeline
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                avatar: 1,
                coverImage: 1,
                isSubscribed: 1,
                email: req.user?.email ? 1 : 0

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "Channel not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "Channel fetched successfully")
        )
})

// 
const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
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
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "Watch history fetched successfully"
            )
        )
})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory
}