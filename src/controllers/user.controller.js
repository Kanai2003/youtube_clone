import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// Register user
const registerUser = asyncHandler( async (req, res) => {
    const {fullName, username, email, password } = req.body;

    if(
        // check if any of the required fields are empty
        [fullName, username, email, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    // check if username is already taken
    const existedUser = await User.findOne({
        // check if any of the field is present in db
        $or: [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(400, "Username or email already exist")
    }

    // get paths of avatar and coverImage from multer middleware
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files?.coverImage[0]?.path
    }


    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }

    // upload avatar and coverImage on cloudinary from local path
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if( !avatar ){
        throw new ApiError(500, "Something went wrong while uploading avatar")
    }

    const newUser = await User.create( {
        fullName,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    })

    const createdUser = await User.findById( newUser._id ).select(
        "-password -refreshToken"
    )

    if( !createdUser ){
        throw new ApiError(500, "Something went wrong while creating user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    )
})





export { registerUser }