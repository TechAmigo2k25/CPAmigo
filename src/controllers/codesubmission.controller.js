
import Problem from "../models/Problem.js";
import { submissionQueue, myqueueEvents } from "../submissinqueue/submission.queue.js"
import Submission from "../models/submission.js";
import User from "../models/user.js";

export const  submitSolution = async (req, res) => {
  try {
    const { code, language, problemId, userId, testCases, temp,startupcode } = req.body;
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    
    const queueresult = await submissionQueue.add("runCode", {
      code,
      language,
      testCases: testCases,
      problemId,
      userId
    });
    console.log("Job added to queue with ID:", queueresult.id);
    // ✅ Pass queueEvents here, not connection
    const result = await queueresult.waitUntilFinished(myqueueEvents);

    if (result.status == "Passed") {

      if (temp == "submit") {
        const submission_res = await Submission.findOneAndUpdate(
          { user_id: userId, problem_id: problemId },
          {
            $set: {
              code,
              result,
              language,
              startupcode
            },
            $setOnInsert: {
              createdAt: new Date()
            }
          },
          {
            upsert: true,
            new: true
          }
        );

        const user = await User.findByIdAndUpdate(
          userId,
          {
            $addToSet: { solved_problem: problemId }
          },
          { new: true }
        );

        //updae solved count in problem collection only at the first time when user submit the correct solution for the problem
        if (!submission_res.createdAt || submission_res.createdAt.getTime() === submission_res.updatedAt.getTime()) {
        const problem = await Problem.findByIdAndUpdate(
          problemId,
          {
            $inc: { solved_count: 1 }
          },
          { new: true }
        );

      }
    }

      return res.json({ message: "Submission  successfully", result: result });

    } else {
      return res.json({ message: "Submission failed", result: result });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};