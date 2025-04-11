import mongoose, { mongo } from "mongoose";

const courseSchema = new mongoose.Schema({
    courseName:{
        type:String
    },
    courseDescription:{
        type:String,
        trim:true
    },
    instructor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    whatYouWillLearn:{
        type:String
    },
    courseContent:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Section"
        }
    ],
    ratingAndReviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"RatingAndReview"
        }
    ],
    price:{
        type:Number
    },
    thumbnail:{
        type:String
    },
    tag:{
        type:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Tag"
        }
    },
    studentEnrolled:[
        {
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"User",
        }
    ]
})

// module.exports = mongoose.model("Course",courseSchema)

export default mongoose.model("Course",courseSchema)