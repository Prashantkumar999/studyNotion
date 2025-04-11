import Course from "../models/Course"
import Section from "../models/Section"


// create section
export const createSection = async (req, res) => {
    try {
        // get data
        const { courseId, sectionName } = req.body
        // data validation 
        if (!courseId || !sectionName) {
            return res.status(400).json({
                success: false,
                message: "both courseId and sectionName of the section are required"
            })
        }
        // create section
        const newSection = await Section.create({ sectionName })
        //  now we have the new created section and we have to update course beacause in course model we have reference of section 
        const updatedCourseDetails = await Course.findByIdAndUpdate({ _id: courseId }, {
            // we have to push new section in section because its an array a course can have multiple sections 
            $push: {
                courseContent: newSection._id
            }
        }, { new: true }).populate({
            path: "courseContent",
            populate: {
                path: "subSection"
            }
        })
        // return response 

        return res.status(200).json({
            success: true,
            message: "section created successfully",
            data: updatedCourseDetails

        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "something went wrong!"
        })
    }
}
//update section
export const updateSection = async (req, res) => {
    try {
        //get data -- to update the section we need section id and the updated sectionName or content
        const { sectionId, sectionName } = req.body
        // validation 

        if (!sectionId || !sectionName) {
            return res.status(400).json({
                success: false,
                message: "both section id and sectionName are required"
            })
        }
        // update subsection note: we don't need to update course cause we have reference of section in course not the actual section 
        const updatedSection = await Section.findByIdAndUpdate(sectionId, {
            sectionName
        }, { new: true }).populate("subSection")
        // return response 

        return res.status(200).json({
            success: true,
            message: "section updated successfully",
            data: updatedSection,
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Something went wrong!"
        })
    }
}
// delete section 

export const deleteSection = async (req, res) => {
    try {

        //get course id and section id 
        const { courseId, sectionId } = req.body
        // validaiton 
        if (!sectionId || !courseId) {
            return res.status(400).json({
                success: false,
                message: "sectionId and courseId are required"
            })
        }

        // delete section
        await Section.findByIdAndDelete(sectionId)
        // delete section from course
        const updatedCourse = await Course.findByIdAndUpdate(courseId, {
            $pull: {
                courseContent: sectionId
            }
        }).populate({
            path: "courseContent",
            populate: {
                path: "subSection"
            }
        })

        //return response

        return res.status(200).json({
            success: true,
            message: "section successfully deleted",
            data:updatedCourse
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "something went wrong while deleting the section"
        })
    }

}