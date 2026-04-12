import QuizQuestion from "../models/quizquestion.js";
import QuizAnswer from "../models/QuizAnswerSchema.js";
import { tryCatch } from "bullmq";
import mongoose from "mongoose";

export const createQuestion = async (req, res) => {
    try {

        const { question, options, correctIndex
        } = req.body;
        console.log(req.body);

        const newQuestion = await QuizQuestion.create({
            question,
            options,
            correctOptionIndex: correctIndex,
            createdBy: req.user.userId
        });

        res.status(200).json({
            success: true,
            data: newQuestion
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const addSubmission = async (req, res) => {
    try {
        console.log("BODY:", req.body);
        console.log("USER:", req.user);

        const { selectedOptionIndex, questionId } = req.body;

        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!mongoose.Types.ObjectId.isValid(questionId)) {
            return res.status(400).json({ message: "Invalid questionId" });
        }

        const user_id = new mongoose.Types.ObjectId(req.user.userId);
        const questionObjectId = new mongoose.Types.ObjectId(questionId);

        const quiz = await QuizQuestion.findById(questionObjectId);

        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }

        const existingAnswer = await QuizAnswer.findOne({
            user_id,
            questionId: questionObjectId
        });

        if (existingAnswer) {
            return res.status(400).json({
                success: false,
                message: "Answer Already Submitted"
            });
        }

        const isCorrect = quiz.correctOptionIndex == selectedOptionIndex;

        await QuizAnswer.create({
            user_id,
            questionId: questionObjectId,
            selectedOptionIndex,
            isCorrect
        });

        return res.status(200).json({
            success: true,
            message: isCorrect ? "Correct answer" : "Wrong answer"
        });

    } catch (error) {
        console.log("ERROR:", error);
        return res.status(500).json({ message: error.message });
    }
};
//controller to get the all quiz question for admin

export const getAllQuiz = async (req, res) => {
    try {

        const questions = await QuizQuestion.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: questions
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// //controller to get all quiz for the student 
// export const getAllQuizStudent = async (req, res) => {
//     try {

//         const questions = await QuizQuestion.find().sort({ createdAt: -1 });

//         res.status(200).json({
//             success: true,
//             data: questions
//         });
//     }
//     catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }


//update the quiz

export const updateQuiz = async (req, res) => {
    try {
        const { question, options, correctIndex } = req.body;
        const quizId = req.params.id;

        const updatedQuiz = await QuizQuestion.findByIdAndUpdate(
            quizId,
            {
                question,
                options,
                correctOptionIndex: correctIndex,
            },
            { new: true }
        );

        if (!updatedQuiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }

        res.status(200).json({
            success: true,
            data: updatedQuiz
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Production-ready controller for deleting a quiz
export const deleteQuiz = async (req, res) => {
    try {
        const quizId = req.params.id;
        const deletedQuiz = await QuizQuestion.findByIdAndDelete(quizId);
        if (!deletedQuiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }
        res.status(200).json({ success: true, message: "Quiz deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllQuizWithStatus = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.userId);

        const quizzes = await QuizQuestion.aggregate([
            {
                $lookup: {
                    from: "quizanswers",
                    let: { qId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$questionId", "$$qId"] },
                                        { $eq: ["$user_id", userId] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "answer"
                }
            },

            // 🔥 Add solved/unsolved + correctness
            {
                $addFields: {
                    isSolved: { $gt: [{ $size: "$answer" }, 0] },
                    userAnswer: ["$answer.selectedOptionIndex", 0],

                    isCorrect: {
                        $cond: [
                            { $gt: [{ $size: "$answer" }, 0] },
                            { $arrayElemAt: ["$answer.isCorrect", 0] },
                            null
                        ]
                    }
                }
            },

            // Optional: clean response
            {
                $project: {
                    answer: 0
                }
            },
            // 🔥 ADD THIS
            {
                $sort: { _id: -1 } // latest first
            }
        ]);

        res.json({
            success: true,
            data: quizzes
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};