import mongoose, {isValidObjectId} from "mongoose";
import {Subscription} from "../models/subscription.model.js";
import {User} from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";


// toggle the subscription of a user to a channel
const toggleSubscription = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const {channelId} = req.params;

    if (!isValidObjectId(channelId)) {
        return next(new ApiError("Invalid channel id", 400));
    }

    const isSubscribed = await Subscription.exists({subscriber: userId, channel: channelId});

    if(isSubscribed){
        await Subscription.deleteOne({subscriber: userId, channel: channelId});
        return res
                .status(200)
                .json(new ApiResponse(200, "Unsubscribed successfully"));
    }

    const subscription = await Subscription.create({subscriber: userId, channel: channelId});

    return res
            .status(200)
            .json(new ApiResponse(200, subscription, "Subscribed successfully"));
})



// subscriber list of a channel(user)
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // find all subscription document from mongodb where userId is equal to channel id
    const subscriptions = await Subscription.find({channel: userId})

    if( subscriptions.length === 0){
        return res
                .status(200)
                .json(new ApiResponse(200, "No subscribers found"));
    }

    const subscriberIds = subscriptions.map(subscription => subscription.subscriber);

    const subscribers = await User.find({ _id: {$in: subscriberIds}});

    return res
            .status(200)
            .json( new ApiResponse(200, subscribers, "Subscribers found syccessfully"))

})

// channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const subscriptions = await Subscription.find({subscriber: userId})

    if( subscriptions.length === 0){
        return res
                .status(200)
                .json(new ApiResponse(200, "No subscriptions found"));
    }

    const channelIds = subscriptions.map(subscription => subscription.channel);
    const channels = await User.find({_id: {$in: channelIds}});

    return res
            .status(200)
            .json(new ApiResponse(200, channels, "Subscriptions found"));

})




export {
    toggleSubscription,
    getSubscribedChannels,
    getUserChannelSubscribers,
}