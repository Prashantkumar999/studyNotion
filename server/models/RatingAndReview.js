import mongoose from "mongoose";

const ratingAndReviewsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    rating: {
        type: Number,
        required: true,
    },
    review: {
        type: String,
        required: true,
    }
})

// module.exports = mongoose.model("RatingAndReview",ratingAndReviewsSchema)
export default mongoose.model("RatingAndReview",ratingAndReviewsSchema)