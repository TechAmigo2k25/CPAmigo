import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import Problem from '../models/Problem.js';
import { tryCatch } from 'bullmq';
import Submission from '../models/submission.js'
import mongoose from 'mongoose';
import QuizQuestion from '../models/quizquestion.js';
import QuizAnswer from '../models/QuizAnswerSchema.js'
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password -__v") // exclude sensitive fields
      .lean();

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });

  } catch (error) {
    console.error("Get Students Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch students",
    });
  }
};

export const getSingleStudent = async (req, res) => {

  try {
    const { id } = req.params;
    const student = await User.findById(id).select("-password -__v").lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: student
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student",
    });
  }
}

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUser = req.user; // From auth middleware

    // 1️⃣ Authorization check
    if (loggedInUser.role !== 'admin' && loggedInUser.userId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const {
      name,
      email,
      mobile_no,
      college_name,
      address,
      password,
      role,
      isActive
    } = req.body;

    // 2️⃣ Email uniqueness check
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      user.email = email.toLowerCase();
    }

    // 3️⃣ Update allowed fields
    if (name) user.name = name;
    if (mobile_no) user.mobile_no = mobile_no;
    if (college_name) user.college_name = college_name;
    if (address) user.address = address;

    // 4️⃣ Password update (rehash)
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters'
        });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // 5️⃣ Admin-only fields
    if (loggedInUser.role === 'admin') {
      if (role) user.role = role;
      if (typeof isActive === 'boolean') user.isActive = isActive;
    }

    await user.save();

    const updatedUser = user.toObject();


    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUser = req.user;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 1️⃣ Admin → Hard delete
    if (loggedInUser.role === 'admin') {
      await User.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: 'User permanently deleted'
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Unauthorized action'
    });

  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


export const createProblem = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can create problems'
      });
    }
    console.log(req.user);

    const {
      title,
      difficulty,
      description,
      inputFormat,
      outputFormat,
      constraints,
      sampleInput,
      sampleOutput,
      sampleInput2,
      sampleOutput2,
      sampleInputDesc1,
      sampleInputDesc2,
      testCases,
      startupcode,
      pdfUrl
    } = req.body;

    if (!testCases || testCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one test case is required'
      });
    }

    const problem = await Problem.create({
      title,
      difficulty,
      description,
      inputFormat,
      outputFormat,
      constraints,
      sampleInput,
      sampleOutput,
      sampleInput2,
      sampleOutput2,
      sampleInputDesc1,
      sampleInputDesc2,
      testCases,
      startupcode,
      pdfUrl,
      createdBy: req.user.userId
    });

    return res.status(200).json({
      success: true,
      message: 'Problem created successfully',
      data: problem
    });

  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Problem title already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
    console.log(error);
  }
};

export const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find().sort({ createdAt: -1 });


    res.status(200).json({
      success: true,
      count: problems.length,
      data: problems,
    });

  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};



export const getQuizCount = async (req, res) => {
  try {
    const user_id = new mongoose.Types.ObjectId(req.user.userId);

    // Run queries in parallel (important optimization)
    const [
      totalQuiz,
      solvedCount,
      correctCount,
      wrongCount
    ] = await Promise.all([
      QuizQuestion.countDocuments(),

      QuizAnswer.countDocuments({ user_id }),

      QuizAnswer.countDocuments({
        user_id,
        isCorrect: true
      }),

      QuizAnswer.countDocuments({
        user_id,
        isCorrect: false
      })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total_quiz: totalQuiz,
        solved: solvedCount,
        correct: correctCount,
        wrong: wrongCount
      }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateProblem = async (req, res) => {
  try {
    const { id } = req.params;

    /* ============================= */
    /* 2️⃣ Check if Problem Exists  */
    /* ============================= */

    const existingProblem = await Problem.findById(id);

    if (!existingProblem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }


    const updatedProblem = await Problem.findByIdAndUpdate(
      id,
      { $set: req.body },
      {
        new: true,          // return updated doc
        runValidators: true // enforce schema validation
      }
    );

    return res.status(200).json({
      success: true,
      message: "Problem updated successfully",
      data: updatedProblem,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getSolvedProblemCount = async (req, res) => {
  try {
    const count = await Problem.countDocuments({
      solved_count: { $gt: 0 }
    });

    return res.status(200).json({
      success: true,
      solvedProblemCount: count
    });

  } catch (error) {
    console.error("Error getting solved problem count:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

export const getSingleProblem = async (req, res) => {
  try {
    const { problem_id, user_id } = req.body;
    const problem = await Problem.findById(problem_id);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    const submission = await Submission.findOne({
      user_id: new mongoose.Types.ObjectId(user_id),
      problem_id: new mongoose.Types.ObjectId(problem_id)
    });

    return res.status(200).json({
      success: true,
      data: problem,
      submission: submission || null
    });
  } catch (error) {
    console.error("Error fetching single problem:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

export const getMonthlyWeeklyProgress = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const { month } = req.body;
    console.log(month);

    let startDate, endDate;

    if (month) {
      const [year, mon] = month.split("-");
      startDate = new Date(year, mon - 1, 1);
      endDate = new Date(year, mon, 0, 23, 59, 59);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    const data = await Submission.aggregate([
      {
        $match: {
          user_id: userId,
          "result.status": "Passed", // 🔥 only solved
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },

      // 🔥 Remove duplicate solves (same problem multiple submissions)
      {
        $group: {
          _id: "$problem_id",
          firstSolveDate: { $first: "$createdAt" }
        }
      },

      // 📊 Calculate week
      {
        $project: {
          week: {
            $ceil: {
              $divide: [{ $dayOfMonth: "$firstSolveDate" }, 7]
            }
          }
        }
      },

      {
        $group: {
          _id: "$week",
          count: { $sum: 1 }
        }
      },

      {
        $sort: { _id: 1 }
      }
    ]);

    // 🔥 Fill missing weeks (important for graph UI)
    const result = [];
    for (let i = 1; i <= 5; i++) {
      const found = data.find(d => d._id === i);
      result.push({
        week: `Week ${i}`,
        count: found ? found.count : 0
      });
    }

    res.json({
      success: true,
      data: result
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};