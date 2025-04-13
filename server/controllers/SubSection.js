import SubSection from "../models/SubSection"
import Section from "../models/Section"
import { uploadMediaToCloudinary } from "../utils/imageUploader"

//create subsection
export const createSubSection = async (req, res) => {
    try {
        //get data
        const { title, timeDuration, description, sectionId } = req.body
        //get video 
        const video = req.files.videoFile
        //video file check 
        if (!video) {
            return res.status(400).json({
                success: false,
                message: "video file is required"
            })
        }
        //data validation 
        if (!title || !timeDuration || !description || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        // upload video to cloudinary to get the url 
        const uploadedVideoDetails = await uploadMediaToCloudinary(video, process.env.FOLDER_NAME)
        // create subsection
        const newSubSection = await SubSection.create({
            title,
            timeDuration,
            description,
            videoUrl: uploadedVideoDetails.secure_url
        })
        // console.log(newSubSection)
        // add subsection to section 

        const updatedSection = await Section.findByIdAndUpdate(sectionId, {
            $push: {
                subSection: newSubSection._id
            }
        }, { new: true }).populate("subSection").exec()
        //return response
        return res.status(200).json({
            success: true,
            message: "sub-section created successfully",
            data: updatedSection
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "something went wrong!",
        })
    }
}

//update subSection



//delete subSection

export const deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body

        if (!subSectionId || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "sectionId and subSectionId are required"
            })
        }

        // delete subSection 
        await SubSection.findByIdAndDelete(subSectionId)

        // delete from section 
        const updatedSection = await Section.findByIdAndUpdate(sectionId, {
            $pull: {
                subSection: subSectionId
            }
        }, { new: true })

        // return response with updated section 

        return res.status(200).json({
            success: true,
            message: "sub-section deleted successfully",
            updatedSection
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "something went wrong while deleting the sub-section please try again later"
        })
    }
}