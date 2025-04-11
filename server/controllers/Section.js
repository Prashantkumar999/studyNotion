import Section from "../models/Section"


// create section
export const createSection = async (req, res) => {
    // get data
    const { courseId, title } = req.body
    // data validation 
    if (!courseId || !title) {
        return res.status(400).json({
            success: false,
            message: "both courseId and title of the section are required"
        })
    }
    // create section
    const newSection = await Section.create({title})
    //  now we have the new created section and we have to update course 
    // return response 



}
//update section
export const updateSection = async (req, res) => {

}
// delete section 

export const deleteSection = async (req, res) => {

}