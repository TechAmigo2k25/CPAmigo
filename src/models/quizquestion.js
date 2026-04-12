import mongoose from "mongoose";

const QuizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },

  options: [
    {
      text: String
    }
  ],

  correctOptionIndex: {
    type: Number,
    required: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }

}, { timestamps: true });

export default mongoose.model("QuizQuestion", QuizQuestionSchema);