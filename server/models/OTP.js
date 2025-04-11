import mongoose from "mongoose";
import mailSender from "../utils/mailSender.js"; 

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 5 * 60, // expires in 5 minutes
    },
});

// Function to send OTP email
const sendVerificationEmail = async (email, otp) => {
    try {
        const mailResponse = await mailSender(email, "Verification mail from XYZ", otp);
        console.log("Email sent successfully", mailResponse);
    } catch (error) {
        console.log("Something went wrong while sending email", error);
        throw error;
    }
};

// Pre-save middleware
OTPSchema.pre("save", async function (next) {
    await sendVerificationEmail(this.email, this.otp);
    next();
});

export default mongoose.model("OTP", OTPSchema);
