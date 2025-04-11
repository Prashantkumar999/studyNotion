import User from "../models/User.js";
import OTP from "../models/OTP.js";
import Profile from "../models/Profile.js"
import otpGenerator from "otp-generator";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv, { configDotenv } from "dotenv"

dotenv.config()

//otp

export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({
                success: false,
                message: "User already exists. Please use a different email.",
            });
        }
        // Generate a unique OTP
        let otp;
        let otpFound = true;

        while (otpFound) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            otpFound = await OTP.findOne({ otp });
        }
        // Save OTP in the DB
        const otpEntry = await OTP.create({ email, otp });
        console.log("OTP stored:", otpEntry);

        //return response ,, otp is just for the testing purpose only

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            otp, // for testing only
        });

    } catch (error) {
        console.error("sendOTP error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while sending OTP",
        });
    }
};


//sign up

// This function generates a random cartoon avatar image URL using the DiceBear Avatars API, specifically the avataaars style — which gives a fun cartoon-style face.

const getRandomCartoonAvatar = () => {
    const seed = Math.random().toString(36).substring(2, 12);
    return `https://api.dicebear.com/8.x/avataaars/svg?seed=${seed}`;
};


export const signUp = async (req, res) => {
    try {
        // data fetching from req.body
        const { firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp } = req.body
        // data validation
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "Please fill all the details"
            })
        }

        // password validation (password and the confirm password should be same)
        if (password !== confirmPassword) {
            return res.status(400).json({
                // note: 401 is use for Missing/invalid data from client
                success: false,
                messgae: "password and confirm password should be same"
            })
        }
        //check for user if already exists or not 

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists please try again with different email"
            })
        }
        //find most recent otp 
        const recentOTP = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1)
        console.log(recentOTP)// for testing 
        if (!recentOTP) {
            return res.status(400).json({
                success: false,
                message: "otp not found"
            })
        } else if (otp !== recentOTP) {
            return res.status(400).json({
                success: false,
                message: "invalid otp"
            })
        }
        //password hashing

        const hashedPassword = await bcrypt.hash(password, 10)

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        })
        const avtarImage = getRandomCartoonAvatar()

        //create db entry
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: avtarImage,

        })
        // return response

        return res.status(200).json({
            success: true,
            messgae: "account created",
            user
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "something went wrong"
        })

    }
}

//log in 

export const logIn = async (req, res) => {
    try {
        // get data form req body
        const { email, password } = req.body
        //data validation 
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "please provide both email and password"
            })
        }
        // check user exists or not 

        const user = await User.findOne({ email }).populate("additionalDetails")

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User does not exists, please sign up first"
            })
        }

        // check password is correct or not and if all things are good then generate the token
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h"
            })
            user.token = token
            user.password = undefined

            //create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "user logged in successfully"
            })
        } else {
            return res.status(401).json({
                success: false,
                message: "password is incorrect please try again"
            })
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "login failed please try again"
        })
    }

}

// change password

export const changePassword = async (req, res) => {
    //get data 
    const { oldPassword, newPassword, confirmNewPassword } = req.body
    // validation
    if (!oldPassword || !newPassword || !confirmNewPassword) {
        return res.status(400).json({
            success: false,
            message: "please fill all the fields"
        })
    }
    try {
        //get the userID 
        const userID = req.user.id
        //find the user 
        const user = await User.findOne({ _id: userID })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "user not found"
            })
        }

        //password match
        const isMatch = await bcrypt.compare(oldPassword, user.password)
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "incorrect old password"
            })
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                messgae: "new password and comnfirm new password should be same"
            })
        }

        //hash new password

        const newHashedPassword = await bcrypt.hash(newPassword, 10)
        //if the pass is correct then ..... update pass
        user.password = newHashedPassword
        await user.save()
        //send mail
        // i will do this thing later 

        //return response

        return res.status(200).json({
            success: true,
            message: "password updated successfully"
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "something went wrong"
        })
    }


}
