import Course from "../models/Course"
import Profile from "../models/Profile"
import User from "../models/User"

//update profile
export const updateProfile = async (req, res) => {
    try {
        //get data and userId
        const { gender, dateOfBirth = "", about = "", contactNumber } = req.body
        //get userID
        const id = req.user.id
        //validation 

        if (!contactNumber || !id || !gender) {
            return res.status(400).json({
                sucess: false,
                message: "All fields are required"
            })
        }
        //find profile
        const userDetails = await User.findById(id)
        //get profile id
        const profileId = userDetails.additionalDetails
        //get profile data
        const profileDetails = await Profile.findById(profileId)
        //update profile
        profileDetails.about = about
        profileDetails.dateOfBirth = dateOfBirth
        profileDetails.gender = gender
        profileDetails.contactNumber = contactNumber

        await profileDetails.save()
        // return response

        return res.status(200).json({
            success: true,
            message: "profile updated successfully",
            profileDetails
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "something went wrong while updating the profile please try again later"
        })
    }
}

//delete profile/user

export const deleteAccount = async (req, res) => {
    try {
        //get id 
        const id = req.user.id
        //validation 
        const userDetails = await User.findById(id)
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "user not found"
            })
        }
        //delete profile 
        await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails })
        //unenroll user form all enrolled courses        

        //delete user
        await User.findByIdAndDelete({ _id: id })

        //return response 
        return res.status(200).json({
            success: false,
            message: "user deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "something went wrong while deleting the account"
        })
    }
}

// get user details

export const getUserDetails = async (req, res) => {
    try {
        //get id 
        const id = req.user.id
        const userDetails = await User.findById(id).populate("additionalDetails").exec()
        
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "user not found"
            })
        }
        // return response

        return res.status(200).json({
            success: false,
            message: "user details fetched successfully",
            userDetails,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "something went wrong"
        })
    }
}