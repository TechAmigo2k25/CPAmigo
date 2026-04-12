import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import StudentLayout from "@/layouts/StudentLayout";
import { Button } from "@/components/ui/button";
import { SkeletonTable } from "@/components/ui/skeleton-card";
import { toast } from "@/hooks/use-toast";
import { get_all_quiz_student, addSubmission, getQuizStatus,get_quiz_count } from "../../services/api";

interface Quiz {
  _id: string;
  question: string;
  options: { text: string }[];
  createdAt: string;
}

export default function StudentQuiz() {

  const [loading, setLoading] = useState(true);
  const [quizList, setQuizList] = useState<Quiz[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [filter, setFilter] = useState<"all" | "solved" | "unsolved">("all");
  const [quizstatuslist, setQuizstatuslist] = useState([]);
const [quizcount,setQuizCount]=useState({ total_quiz: 0, solved: 0, correct: 0, wrong: 0 });
  
// const fetchQuiz = async () => {
//     try {
//       const res = await get_all_quiz_student();
//       setQuizList(res.data.data);
//     } catch {
//       toast({
//         title: "Error",
//         description: "Failed to load quizzes",
//         variant: "destructive"
//       });
//     }
//   };

    const getquizcount=async()=>{
    try {

      const res= await get_quiz_count();
    if(res.status==200)
    {
      setQuizCount(res.data.data)
    }else{
         toast({ title: "Error", description: "Failed to get Quiz Count.", variant: "destructive" });
    }
      
    } catch (error) {
      toast({ title: "Error", description: "Failed to get Quiz Count.", variant: "destructive" });
    }
  }

  useEffect(() => {
    getquizcount();
    // fetchQuiz();
    get_Quiz_Status();
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectOption = (quizId: string, optionIndex: number) => {
    setAnswers({
      ...answers,
      [quizId]: optionIndex
    });
  };

  const handleSubmit = async (quiz: Quiz) => {
    //  const sele

    if (answers[quiz._id] === undefined) {
      toast({
        title: "Select an option first",
        variant: "destructive"
      });
      return;
    }

    try {
      const res = await addSubmission({
        selectedOptionIndex: answers[quiz._id],
        questionId: quiz._id
      });


      if (res.success) {
        toast({
          description: res.data.message || "Answer submitted",
          variant: "default"
        });
        // fetchQuiz();
        get_Quiz_Status();
        getquizcount();

      } else {
        // 🔥 THIS handles 400 properly
        toast({
          title: res.data.message || "Something went wrong",
          variant: "destructive"
        });
      }

    } catch (error) {
      // ❗ Only for unexpected crashes (network failure, etc.)
      console.log(error);
      toast({
        title: "Unexpected error",
        variant: "destructive"
      });
    }

  };

  const filteredQuizList = quizstatuslist.filter((quiz) => {
    if (filter === "solved") return quiz.isSolved == true;
    if (filter === "unsolved") return answers[quiz._id] === undefined;
    return true;
  });

  const get_Quiz_Status = async () => {

    try {
      const res = await getQuizStatus();
      setQuizstatuslist(res.data.data);

    } catch (error) {
      toast({
        title: "Something went wrong",
        variant: "destructive"
      });
    }
  }

  if (loading) {
    return (
      <StudentLayout>
        <SkeletonTable rows={5} />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="h-screen flex flex-col">

        {/* 🔒 Fixed Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-background shrink-0">
          <div>
            <h1 className="text-3xl font-bold mb-1">Quiz</h1>
            <p className="text-muted-foreground">
              Answer the following questions
            </p>
          </div>

          <div className="flex gap-2">

            <div className="flex gap-2 mr-2">



              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Questions</span>
                <span className="font-medium ml-3">{quizcount.total_quiz}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Solved</span>
                <span className="font-medium text-blue-500 ml-3">{quizcount.solved}</span>
              </div>



              <div className="flex justify-between">
                <span className="text-muted-foreground">Correct </span>
                <span className="font-medium text-green-500 ml-3">{quizcount.correct}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Wrong</span>
                <span className="font-medium text-red-500 ml-3">{quizcount.wrong}</span>
              </div>

            </div>
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "solved" ? "default" : "outline"}
              onClick={() => setFilter("solved")}
            >
              Solved
            </Button>

          </div>
        </div>

        {/* 🔁 Scrollable Quiz List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {filteredQuizList.map((quiz, index) => {
            const userAnswer = answers[quiz._id];
            const isSolved = quiz.isSolved;

            return (
              <motion.div
                key={quiz._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border rounded-xl p-6 bg-card space-y-4"
              >
                <h2 className="font-semibold text-lg">
                   {quiz.question}
                </h2>

                <div className="space-y-2">
                  {quiz.options.map((opt, i) => {
                    const isCorrect = quiz.correctOptionIndex === i;
                    const isUserSelected = quiz.userAnswer?.[0]?.[0] === i;

                    return (
                      <label
                        key={i}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition
                      
                      ${isSolved && isCorrect ? "border-green-500" : ""}
                      ${isSolved && isUserSelected && !isCorrect ? "border-red-500" : ""}
                   
                      ${!isSolved ? "cursor-pointer hover:bg-muted" : "opacity-80"}
                    `}
                      >
                        <input
                          type="radio"
                          name={quiz._id}
                          checked={answers[quiz._id] === i}
                          disabled={isSolved}
                          onChange={() => handleSelectOption(quiz._id, i)}
                        />

                        <span>{opt.text}</span>

                        {isSolved && isCorrect && (
                          <span className="text-green-600 text-sm">(Correct)</span>
                        )}

                        {isSolved && isUserSelected && !isCorrect && (
                          <span className="text-red-600 text-sm">(Your Answer)</span>
                        )}
                      </label>
                    );
                  })}
                </div>

                {!isSolved && filter !== "solved" && (
                  <Button onClick={() => handleSubmit(quiz)} className="mt-2">
                    Submit Answer
                  </Button>
                )}
              </motion.div>
            );
          })}

          {filteredQuizList.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No quiz available
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
