import User from "../models/User"
import mailSender from "../utils/mailSender"
import bcrypt from "bcrypt"
import crypto from 'crypto';


//reset password token

export const resetPasswordToker = async (req, res) => {
    try {
        //get email from req body 
        const { email } = req.body
        // check if user for this email exists or not ...email validation 
        const user = await User.findOne({ email })
        if (!user) {
            return res.json({
                success: false,
                message: "this user does not exists"
            })
        }
        // generate token
        const token = crypto.randomUUID()

        // update user by adding token and expiration time 
        const updatedDetails = await User.findOneAndUpdate({ email: email }, {
            token: token,
            resetPasswordExpires: Date.now() + 5 * 60 * 1000
        }, { new: true })
        // carete url
        const url = `http://localhost:3000/update-password/${token}`

        // send mail with url to change the password ,,,,add other things like user can user password change url only once
        await mailSender(email, "password reset link", `password reset link ${url}`)

        //return response 
        return res.status(200).json({
            success: true,
            message: "email sent successfully"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "something went wrong"
        })
    }

}


// reset password 


// note: to update the user password we will use token to find the user
export const resetPassword = async (req, res) => {
    try {
        //data fetch 
        const { password, confirmPassword, token } = req.body
        //validation
        if (!password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "both password and confirm password are required"
            })
        }

        if (password !== confirmPassword) {
            return res.json({
                success: false,
                message: "both the password and confirm password should be same"
            })
        }
        //get user details from db using token 
        const userDetails = await User.findOne({ token: token })
        if (!userDetails) {
            return res.json({
                success: false,
                message: "token is invalid"
            })
        }
        // token time check 
        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "Token has expired. Please request a new password reset."
            });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10)
        // update password
        const updatedUser = await User.findOneAndUpdate({ token: token }, {
            password: hasedPassword
        }, { new: true })

        // Update password and clear token fields

        // userDetails.password = hashedPassword;
        // userDetails.token = undefined;
        // userDetails.resetPasswordExpires = undefined;
        // await userDetails.save();

        // this thing will make sure to use reset password link only once

        //return response
        return res.status(200).json({
            success: true,
            message: "password reset successfully"
        })

    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred"
        });
    }

}