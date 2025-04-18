import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
	courseName: {
		type: String,
		required: true,
		trim: true,
	},
	courseDescription: {
		type: String,
		required: true,
		trim: true,
	},
	instructor: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	whatYouWillLearn: {
		type: String,
		required: true,
	},
	courseContent: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Section",
		}
	],
	ratingAndReviews: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "RatingAndReview",
		}
	],
	price: {
		type: Number,
		required: true,
	},
	thumbnail: {
		type: String,
		required: true,
	},
	category: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Category", // Use correct model name (you were using "Tag" before)
		required: true,
	},
	tag: {
		type: [String],
		required: true,
	},
	studentEnrolled: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		}
	],
	status: {
		type: String,
		enum: ["Draft", "Published"],
		default: "Draft",
	},
	instructions: {
		type: [String],
	},
},
{
	timestamps: true,
});
  
export default mongoose.model("Course", courseSchema);
