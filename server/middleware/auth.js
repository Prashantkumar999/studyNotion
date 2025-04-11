import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import User from "../models/User"

dotenv.config()
//auth

export const auth = async (req, res, next) => {
    try {
        // extract token
        const token = req.cookies.token || req.body.token || req.header("Authorisation").replace("Bearer ", "")
        // if token is missing 
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "token is missing"
            })
        }
        //token verification
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET)
            console.log(decode) //testing 
            req.user = decode

        } catch {
            return res.status(401).json({
                success: false,
                message: "token is invalid"
            })
        }
        next()
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "something went wrong while validating the token"
        })
    }

}

// isStudent

export const isStudent = (req, res, next) => {
    try {
        if (req.user.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: "this is the protected route for the students only"
            })
        }
        next()
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "user role cannot be verified, please try again"
        })
    }
}

//isInstructor

export const isInstructor = (req, res, next) => {
    try {
        if (req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for the instructor only"
            })
        }
        next()
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "User cannot be verified pleaes try again later"
        })
    }
}

//isAdmin

export const isAdmin = (req, res, next) => {
    try {
        if (req.user.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for the Admin only"
            })
        }
        next()
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "User cannot be verified pleaes try again later"
        })
    }
}