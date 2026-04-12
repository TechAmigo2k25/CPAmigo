import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileCode, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import StudentLayout from "@/layouts/StudentLayout";
import { StatCard } from "@/components/ui/stat-card";
import { SkeletonCard, SkeletonChart } from "@/components/ui/skeleton-card";
import { useGlobalStats } from "../../contexts/GlobalStatsContext";
import { get_single_student, get_problem, get_quiz_count, get_student_progress } from "../../services/api";
import { toast } from "@/hooks/use-toast";
;


export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const { setProblemCount, setSolvedProblemCount, problemCount, solvedproblemCount } = useGlobalStats();
  const [quizcount, setQuizCount] = useState({ total_quiz: 0, solved: 0, correct: 0, wrong: 0 });
  const [progressOverTime, setProgressOverTime] = useState([]);
  const progressData = [
    { name: "Solved", value: solvedproblemCount, color: "hsl(160, 84%, 39%)" },
    { name: "Unsolved", value: problemCount - solvedproblemCount, color: "hsl(0, 0%, 100%)" },
  ];
  const COLORS = ['#22c55e', '#ef4444', '#9ca3af'];
  const getProblems = async () => {
    try {
      const res = await get_problem();

      if (res.status == 200) {
        setProblemCount(res.data.data.length);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to get problems.", variant: "destructive" });
    }
  }

  const getquizcount = async () => {
    try {

      const res = await get_quiz_count();
      if (res.status == 200) {
        setQuizCount(res.data.data)
      } else {
        toast({ title: "Error", description: "Failed to get Quiz Count.", variant: "destructive" });
      }

    } catch (error) {
      toast({ title: "Error", description: "Failed to get Quiz Count.", variant: "destructive" });
    }
  }
  const getUser = async () => {
    try {
      const res = await get_single_student(localStorage.getItem("user_id"));
      if (res.status == 200) {
        setSolvedProblemCount(res.data.data.solved_problem.length);
      }

    } catch (error) {
      toast({ title: "Error", description: "Failed to get problem.", variant: "destructive" });
    }


  }

  const get_month_progress = async (month: string) => {

    try {
      const res = await get_student_progress({ month });
      setProgressOverTime(res.data.data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to get Progress.", variant: "destructive" });
    }
  }

  useEffect(() => {
    const yearMonth = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit'
    }).format(new Date());


    getUser();
    getProblems();
    getquizcount();
    get_month_progress(yearMonth);
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <StudentLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-muted-foreground">Track your coding progress</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <SkeletonChart className="h-80" />
            <SkeletonChart className="h-80" />
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
     <div className="flex justify-between items-center px-6 py-4 border-b bg-background shrink-0">
      <div className="space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">Track your coding progress and keep solving</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Problems"
            value={problemCount}
            icon={FileCode}
            variant="default"
          />
          <StatCard
            title="Solved Problems"
            value={solvedproblemCount}
            icon={CheckCircle2}
            variant="success"
            trend={{ value: 3, isPositive: true }}
          />
          <StatCard
            title="Pending Problems"
            value={problemCount - solvedproblemCount}
            icon={Clock}
            variant="warning"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-6 space-y-4"
          >
            <h3 className="text-lg font-semibold">Quiz Stats</h3>

            <div className="space-y-2 text-sm">

              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Questions</span>
                <span className="font-medium">{quizcount.total_quiz}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Solved</span>
                <span className="font-medium text-blue-500">{quizcount.solved}</span>
              </div>

              <div className="border-t pt-2 mt-2 space-y-1">

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Correct</span>
                  <span className="font-medium text-green-500">{quizcount.correct}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wrong</span>
                  <span className="font-medium text-red-500">{quizcount.wrong}</span>
                </div>

              </div>
            </div>
          </motion.div>


        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="text-lg font-semibold mb-6">DSA Problem Status</h3>
            <ResponsiveContainer width="110%" height={300}>
              <PieChart>
                <Pie
                  data={progressData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ stroke: "hsl(0, 0%, 100%)" }}
                >
                  {progressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222, 47%, 14%)",
                    border: "1px solid hsl(217, 33%, 22%)",
                    borderRadius: "8px",
                    color: "hsl(210, 40%, 98%)",
                  }}
                />
                <Legend
                  formatter={(value) => <span style={{ color: "hsl(210, 40%, 98%)" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="text-lg font-semibold mb-6">DSA Problem Progress Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" />
                <XAxis
                  dataKey="week"
                  tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }}
                  tickLine={{ stroke: "hsl(217, 33%, 22%)" }}
                  axisLine={{ stroke: "hsl(217, 33%, 22%)" }}
                />
                <YAxis
                  tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }}
                  tickLine={{ stroke: "hsl(217, 33%, 22%)" }}
                  axisLine={{ stroke: "hsl(217, 33%, 22%)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222, 47%, 14%)",
                    border: "1px solid hsl(217, 33%, 22%)",
                    borderRadius: "8px",
                    color: "hsl(210, 40%, 98%)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(160, 84%, 39%)"
                  strokeWidth={3}
                  dot={{ fill: "hsl(160, 84%, 39%)", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "hsl(160, 84%, 50%)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="text-lg font-semibold mb-6">Quiz Problem Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart width={200} height={200}>
                <Pie data={[
                  { name: "Correct", value: quizcount.correct },
                  { name: "Wrong", value: quizcount.wrong },
                  { name: "Unsolved", value: quizcount.total_quiz - quizcount.solved }
                ]}
                 dataKey="value" 
                outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {[
                    { name: "Correct", value: quizcount.correct },
                    { name: "Wrong", value: quizcount.wrong },
                    { name: "Unsolved", value: quizcount.total_quiz - quizcount.solved }
                  ].map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

        </div>
        </div>
      </div>
    
    </StudentLayout>
  );
}
