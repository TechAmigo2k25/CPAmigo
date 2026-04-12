import { Router } from 'express';
 import {updateUser,deleteUser,createProblem,getAllStudents,getAllProblems,
    updateProblem,getSolvedProblemCount,getSingleStudent,getSingleProblem,getQuizCount,getMonthlyWeeklyProgress} from '../../controllers/user.controller.js';
import { authenticateJWT } from '../../middlewares/auth.middleware.js';
import {submitSolution} from '../../controllers/codesubmission.controller.js';
 import { createQuestion,getAllQuiz,updateQuiz,deleteQuiz,addSubmission,getAllQuizWithStatus } from '../../controllers/quiz.controller.js';

const router = Router();

router.get('/getstudents', authenticateJWT, getAllStudents);
router.get('/getsinglestudent/:id', authenticateJWT, getSingleStudent);
router.post('/updateuser/:id', authenticateJWT, updateUser);
router.delete('/deleteuser/:id', authenticateJWT, deleteUser);
router.post("/submitsolution",authenticateJWT,submitSolution);
router.post("/uploadproblem",authenticateJWT,createProblem);
router.post("/updateproblem/:id",authenticateJWT,updateProblem);
router.post('/getprogress',authenticateJWT,getMonthlyWeeklyProgress);

router.get("/getproblems",authenticateJWT,getAllProblems);
router.post("/getsingleproblem",authenticateJWT,getSingleProblem);

router.get('/getcountsolvedproblems', authenticateJWT,getSolvedProblemCount );

router.post("/quiz/create",authenticateJWT,createQuestion);
router.post("/quiz/update/:id",authenticateJWT,updateQuiz);
router.delete('/quiz/delete/:id',authenticateJWT,deleteQuiz)

router.get("/getAllquiz",authenticateJWT,getAllQuiz);
// router.get("/student/getAllQuiz",authenticateJWT,getAllQuizStudent);

router.post('/quiz/addanswer',authenticateJWT,addSubmission);
router.post('/quiz/quizwithstatus',authenticateJWT,getAllQuizWithStatus);
router.get("/quiz/getquizcount",authenticateJWT,getQuizCount);



export default router;