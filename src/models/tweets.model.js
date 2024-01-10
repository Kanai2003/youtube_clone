import mongoose,{ Schema } from "mongoose";

const tweetSchema = new Schema(
    {
        owner: {
            types: Schema.Types.ObjectId,
            ref: "User"
        },
        content: {
            type: String,
            required: true,
        },
        //TODO: including new fields retweets
        // retweets: [
        //     {
        //         type: Schema.Types.ObjectId,
        //         ref: "User"
        //     }
        // ],
    },
    {
        timestamps: true,
    }
    
)

export const Tweet = mongoose.model("Tweet", tweetSchema)