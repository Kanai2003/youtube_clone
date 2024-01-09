import mongoose, {Schema} from "mongoose";

const playlistSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        videos: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            }
        ],
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required : true,
        },
        thumbnail: {  //cloudinary image url
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
)

export const Playlist = mongoose.model("Playlist", playlistSchema);