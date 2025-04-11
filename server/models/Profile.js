import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    gender: {
        type: String
    },
    dataOfBirth: {
        type: String
    },
    about:{
        type:String,
        trim:true
    },
    contactNumber:{
        type:String,
    }
})

// module.exports = mongoose.model("Profile", profileSchema);
export default mongoose.model("Profile",profileSchema)