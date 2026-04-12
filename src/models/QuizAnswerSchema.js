import mongoose from 'mongoose';
const QuizAnswerSchema = new mongoose.Schema({

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QuizQuestion"
  },

  selectedOptionIndex: {
    type: Number
  },

  isCorrect: {
    type: Boolean
  }

}, { timestamps: true });

QuizAnswerSchema.index(
  { user_id: 1, questionId: 1 },
  { unique: true }
);


export default mongoose.model("QuizAnswer", QuizAnswerSchema);