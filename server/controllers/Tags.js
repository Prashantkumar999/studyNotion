import Tag from "../models/Tags";

//create tag handler function 

export const createTag = async (req, res) => {
    try {
        //get data...title and description 
        const { name, description } = req.body

        // data validation 
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "both the title and description are required"
            })
        }
        // create db entry
        const tagDetails = await Tag.create({ name: name, description: description }, { new: true })
        console.log(tagDetails)
        //return response
        return res.status(200).json({
            success: false,
            message: "tag created successfully"
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "something went wrong"
        })
    }
}

//get all tags handler function 

export const showAllTags = async (req, res) => {
    try {
        const allTags = await Tag.find({}, { name: true, description: true })
        return res.status(200).json({
            success: true,
        wdaw    message: "all tags fetched successfully",
            allTags
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "something went wrong while fetching the data"
        })
    }
}

