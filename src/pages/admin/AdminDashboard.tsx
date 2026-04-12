import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, FileCode, CheckCircle2, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import AdminLayout from "@/layouts/AdminLayout";
import { StatCard } from "@/components/ui/stat-card";
import { SkeletonCard, SkeletonChart } from "@/components/ui/skeleton-card";
import { useGlobalStats } from "../../contexts/GlobalStatsContext";
import {get_solved_count,get_students,get_problem} from "../../services/api";
import { toast } from "@/hooks/use-toast";
// Mock data
const problemStats = [
  { name: "Two Sum", solved: 45 },
  { name: "Reverse String", solved: 38 },
  { name: "Binary Search", solved: 32 },
  { name: "Linked List", solved: 28 },
  { name: "Tree Traversal", solved: 22 },
  { name: "Dynamic Prog", solved: 15 },
];


export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const { problemCount, studentCount,setSolvedProblemCount,solvedproblemCount,setStudentCount,setProblemCount } = useGlobalStats();


  const getCount= async ()=>{
      try {
       const res= await get_solved_count();
        setSolvedProblemCount(res.data.solvedProblemCount);
    } catch (error) {
      console.error("Failed to fetch solved problem count:", error);
    }
  }

   const getStudentsData=async()=>{
  
      try {
        const res = await get_students();
        
        setStudentCount(res.data.count);
      } catch (error) {
        console.log(error);
      }
    }

  const getAlProblems = async () => {

    try {

      const res = await get_problem();
     
      setProblemCount(res.data.count);

    } catch (error) {
      toast({ title: "Error", description: "Failed to get problem.", variant: "destructive" });
    }
  }
  useEffect( () => {
    getAlProblems();
      getStudentsData();
  getCount();
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const studentProgress = [
  { name: "Solved", value: solvedproblemCount, color: "hsl(160, 84%, 39%)" },
  { name: "Unsolved", value: problemCount - solvedproblemCount, color: "hsl(217, 33%, 17%)" },
];


  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your coding platform</p>
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
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your coding platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Students"
            value={studentCount}
            icon={Users}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Total Problems"
            value={problemCount}
            icon={FileCode}
            variant="default"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Problems Solved"
            value={solvedproblemCount}
            icon={solvedproblemCount>0?CheckCircle2:TrendingUp}
            variant="success"
            description="Across all students"
          />
       
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bar Chart */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="text-lg font-semibold mb-6">Problem-wise Solved Count</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={problemStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }}
                  tickLine={{ stroke: "hsl(217, 33%, 22%)" }}
                  axisLine={{ stroke: "hsl(217, 33%, 22%)" }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
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
                <Bar
                  dataKey="solved"
                  fill="hsl(217, 91%, 60%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div> */}

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="text-lg font-semibold mb-6">Student Progress Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={studentProgress}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {studentProgress.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222, 47%, 14%)",
                    border: "1px solid hsl(217, 33%, 22%)",
                    borderRadius: "8px",
                    color: "hsl(0, 0%, 100%)",
                  }}
                />
                <Legend
                  formatter={(value) => <span style={{ color: "hsl(0, 0%, 100%)" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
