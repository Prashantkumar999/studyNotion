import Course from "../models/Course.js"
import Category from "../models/Category.js"
import User from "../models/User.js"
import { uploadImageToCloudinary } from "../utils/imageUploader.js"

// Create a new course
export const createCourse = async (req, res) => {
	try {
		const userId = req.user.id;
		let {
			courseName,
			courseDescription,
			whatYouWillLearn,
			price,
			tag,
			category,
			status,
			instructions,
		} = req.body;

		const thumbnail = req.files?.thumbnailImage;

		if (
			!courseName ||
			!courseDescription ||
			!whatYouWillLearn ||
			!price ||
			!tag ||
			!thumbnail ||
			!category
		) {
			return res.status(400).json({
				success: false,
				message: "All Fields are Mandatory",
			});
		}

		if (!status || status === undefined) {
			status = "Draft";
		}

		// Check if user is instructor
		const instructorDetails = await User.findById(userId);
		if (!instructorDetails || instructorDetails.accountType !== "Instructor") {
			return res.status(404).json({
				success: false,
				message: "Instructor Details Not Found",
			});
		}

		// Validate category
		const categoryDetails = await Category.findById(category);
		if (!categoryDetails) {
			return res.status(404).json({
				success: false,
				message: "Category Details Not Found",
			});
		}

		// Upload thumbnail
		const thumbnailImage = await uploadImageToCloudinary(
			thumbnail,
			process.env.FOLDER_NAME
		);

		// Create course
		const newCourse = await Course.create({
			courseName,
			courseDescription,
			instructor: instructorDetails._id,
			whatYouWillLearn,
			price,
			tag,
			category: categoryDetails._id,
			thumbnail: thumbnailImage.secure_url,
			status,
			instructions,
		});

		// Add course to instructor's profile
		await User.findByIdAndUpdate(
			instructorDetails._id,
			{ $push: { courses: newCourse._id } },
			{ new: true }
		);

		// Add course to category
		await Category.findByIdAndUpdate(
			categoryDetails._id,
			{ $push: { course: newCourse._id } },
			{ new: true }
		);

		return res.status(200).json({
			success: true,
			message: "Course Created Successfully",
			data: newCourse,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: "Failed to create course",
			error: error.message,
		});
	}
};

// Get all courses
export const getAllCourses = async (req, res) => {
	try {
		const allCourses = await Course.find(
			{},
			{
				courseName: true,
				price: true,
				thumbnail: true,
				instructor: true,
				ratingAndReviews: true,
				studentsEnroled: true,
			}
		)
			.populate("instructor")
			.exec();

		return res.status(200).json({
			success: true,
			data: allCourses,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: "Can't Fetch Course Data",
			error: error.message,
		});
	}
};

// Get course details
export const getCourseDetails = async (req, res) => {
	try {
		const { courseId } = req.body;

		const courseDetails = await Course.find({ _id: courseId })
			.populate({
				path: "instructor",
				populate: {
					path: "additionalDetails",
				},
			})
			.populate("category")
			.populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();

		if (!courseDetails || courseDetails.length === 0) {
			return res.status(400).json({
				success: false,
				message: `Could not find the course with ID: ${courseId}`,
			});
		}

		return res.status(200).json({
			success: true,
			message: "Course Details fetched successfully",
			data: courseDetails[0],
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch course details",
			error: error.message,
		});
	}
};
