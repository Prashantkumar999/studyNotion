import Course from "../models/Course"
import Tag from "../models/Tags"
import User from "../models/User"
import { uploadImageToCloudinary } from "../utils/imageUploader"

//create course
export const createCourse = async (req, res) => {
    try {

        //fetch data
        const { courseName, courseDescription, whatYouWillLearn, price, tag } = req.body
        const { thumbnail } = req.files.thumbnailImage

        // data validation 

        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const userId = req.user.id
        const instructorDetails = await User.findById(userId)
        console.log(instructorDetails)

        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "instrutor not found"
            })
        }

        // check given tag is valid or not
        const tagDetails = await Tag.findById(tag)
        if (!tagDetails) {
            return res.status(404).json({
                success: false,
                message: "tag details not found"
            })
        }

        // upload thumnail to cloudinary 
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME)

        //create an entry for new course 
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            price,
            tag: tagDetails._id,//or tag:tag or just tag
            thumbnail: thumbnailImage.secure_url
        })

        // update user ,,,,add course into the course list of instructor

        await User.findByIdAndUpdate({ _id: instructorDetails._id }, {
            $push: {
                courses: newCourse._id
            }
        }, { new: true })

        // update tag schema 
        await Tag.findByIdAndUpdate({ _id: tagDetails._id }, {
            $push: {
                course: newCourse._id
            }
        }, { new: true })


        // return respose
        return res.status(200).json({
            success: true,
            message: "course created successfully",
            data: newCourse
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "something went wrong while creating the course",
            error: error.message
        })
    }
}
//get all courses

export const getAllCourse = async (req, res) => {
    try {

        const allCourses = await Course.find({}, {
            courseName: true,
            price: true,
            thumbnail: true,
            instructor: true,
            ratingAndReviews: true,
            studentEnrolled: true,
        }).populate("instructor").exec()


        //return response

        return res.status(200).json({
            success: true,
            message: "data fetched successfully",
            data: allCourses
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "something went wrong while fetching the data please try again later",
            error: error.message
        })
    }
}