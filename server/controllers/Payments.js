import mongoose from "mongoose";
import { instance } from "../cofig/razorpay";
import Course from "../models/Course";
import User from "../models/User";
import mailSender from "../utils/mailSender"; // unused for now, but can be used after payment
// import { courseEnrollmentEmail } from "../mail/templates"; // if you plan to send email

export const capturePayment = async (req, res) => {
	try {
		// Extract user and course ID
		const { courseId } = req.body;
		const userId = req.user.id;

		// Validate courseId
		if (!courseId) {
			return res.status(400).json({
				success: false,
				message: "Course ID is required",
			});
		}

		// Check if course exists
		const course = await Course.findById(courseId);
		if (!course) {
			return res.status(404).json({
				success: false,
				message: "Course not found",
			});
		}

		// Check if user is already enrolled
		const uId = new mongoose.Types.ObjectId(userId);
		if (course.studentEnrolled.includes(uId)) {
			return res.status(400).json({
				success: false,
				message: "User is already enrolled in this course",
			});
		}

		// Create Razorpay order
		const amount = course.price;
		const currency = "INR";

		const options = {
			amount: amount * 100, // Razorpay accepts amount in paisa
			currency,
			receipt: `receipt_${Math.floor(Math.random() * 1000000)}`,
			notes: {
				courseId,
				userId,
			},
		};

		const paymentResponse = await instance.orders.create(options);
		console.log("Razorpay order created:", paymentResponse);

		// Send response to frontend
		return res.status(200).json({
			success: true,
			message: "Payment order created successfully",
			data: {
				courseName: course.courseName,
				courseDescription: course.courseDescription,
				thumbnail: course.thumbnail,
				orderId: paymentResponse.id,
				currency: paymentResponse.currency,
				amount: paymentResponse.amount,
			},
		});
	} catch (error) {
		console.error("Error in capturePayment:", error);
		return res.status(500).json({
			success: false,
			message: "An error occurred while creating the payment order",
			error: error.message,
		});
	}
};

//  verify signature
exports.verifySignature = async (req, res) => {
	const webhookSecret = "12345678"

	const signature = req.headers["x-razorpay-signature"]

	const shasum = crypto.createHmac("sha256", webhookSecret)
	shasum.update(JSON.stringify(req.body))
	const digest = shasum.digest("hex")

	if (signature === digest) {
		console.log("Payment is Authorised")

		const { courseId, userId } = req.body.payload.payment.entity.notes;

		try {
			//fulfil the action

			//find the course and enroll the student in it
			const enrolledCourse = await Course.findOneAndUpdate(
				{ _id: courseId },
				{ $push: { studentsEnrolled: userId } },
				{ new: true },
			);

			if (!enrolledCourse) {
				return res.status(500).json({
					success: false,
					message: 'Course not Found',
				});
			}

			console.log(enrolledCourse)

			//find the student andadd the course to their list enrolled courses me 
			const enrolledStudent = await User.findOneAndUpdate(
				{ _id: userId },
				{ $push: { courses: courseId } },
				{ new: true },
			);

			console.log(enrolledStudent);

			//mail send krdo confirmation wala 
			const emailResponse = await mailSender(
				enrolledStudent.email,
				"Congratulations from CodeHelp",
				"Congratulations, you are onboarded into new CodeHelp Course",
			);

			console.log(emailResponse)
			return res.status(200).json({
				success: true,
				message: "Signature Verified and COurse Added",
			});


		}
		catch (error) {
			console.log(error);
			return res.status(500).json({
				success: false,
				message: error.message,
			})
		}
	}
	else {
		return res.status(400).json({
			success: false,
			message: 'Invalid request',
		})
	}


};