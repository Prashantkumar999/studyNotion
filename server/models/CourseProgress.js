import mongoose, { mongo } from "mongoose";

const courseProgressSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    },
    completedVideos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "subSection"
        }
    ]
})

// module.exports = mongoose.model("CourseProgress", courseProgressSchema);

export default mongoose.model("CourseProgress",courseProgressSchema)