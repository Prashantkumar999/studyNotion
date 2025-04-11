import mongoose, { mongo } from "mongoose";

const sectionSchema = new mongoose.Schema({
    sectionName: {
        type: String
    },
    subSection: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubSection"
        }
    ]

})

// module.exports = mongoose("Section", sectionSchema)
export default mongoose.model("Section", sectionSchema)