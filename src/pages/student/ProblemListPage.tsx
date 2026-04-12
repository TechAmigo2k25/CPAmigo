import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Grid, List } from "lucide-react";
import { Link } from "react-router-dom";
import StudentLayout from "@/layouts/StudentLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { SkeletonTable } from "@/components/ui/skeleton-card";
import { Problem, Difficulty } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { get_problem,get_single_student } from "../../services/api";


export default function ProblemListPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [status, setStatus] = useState<"all" | "solved" | "unsolved">("all");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
 const [mockProblems, setMocProblem] = useState<Problem[]>([]);
 const [student,setStudent]=useState<any>(null);

   const getAlProblems = async () => {

    try {

      const res = await get_problem();
      setMocProblem(res.data.data);
      

    } catch (error) {
      toast({ title: "Error", description: "Failed to get problem.", variant: "destructive" });
    }
  }

  const getUser=async ()=>{
    try {
      const res= await get_single_student(localStorage.getItem("user_id"));
      if(res.status==200){
      setStudent(res.data.data);
     
      }

    } catch (error) {
      
      toast({ title: "Error", description: "Failed to get problem.", variant: "destructive" });
    }
  }

  useEffect(() => {
    getUser();
    getAlProblems();
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredProblems = mockProblems.filter((problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = difficulty === "all" || problem.difficulty === difficulty;
    const matchesStatus = status === "all" || (status === "solved" ? student.solved_problem.includes(problem._id) : !student.solved_problem.includes(problem._id));
    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  if (loading) {
    return (
      <StudentLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Problems</h1>
              <p className="text-muted-foreground">Practice and improve your skills</p>
            </div>
          </div>
          <SkeletonTable rows={8} />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Problems</h1>
            <p className="text-muted-foreground">Practice and improve your skills</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "card" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("card")}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty | "all")}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger> 
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v as "all" | "solved" | "unsolved")}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="solved">Solved</SelectItem>
              <SelectItem value="unsolved">Unsolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Problems List */}
        {viewMode === "table" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Title</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Difficulty</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProblems.map((problem, index) => (
                    <motion.tr
                      key={problem._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <StatusBadge solved={student.solved_problem.includes(problem._id)} />
                      </td>
                      <td className="p-4">
                        <span className="font-medium">{problem.title}</span>
                      </td>
                      <td className="p-4">
                        <DifficultyBadge difficulty={problem.difficulty} />
                      </td>
                      <td className="p-4 text-right">
                        <Link to={`/student/problem/${problem._id}`}>
                          <Button size="sm" variant={student.solved_problem.includes(problem._id) ? "outline" : "default"}>
                            {student.solved_problem.includes(problem._id) ? "View" : "Solve"}
                          </Button>
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProblems.map((problem, index) => (
              <motion.div
                key={problem._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "rounded-xl border p-6 transition-all hover:shadow-lg",
                  student.solved_problem.includes(problem._id) ? "bg-success/5 border-success/20" : "bg-card border-border"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <StatusBadge solved={student.solved_problem.includes(problem._id)} />
                  <DifficultyBadge difficulty={problem.difficulty} />
                </div>
                <h3 className="font-semibold text-lg mb-4">{problem.title}</h3>
                <Link to={`/student/problem/${problem._id}`}>
                  <Button className="w-full" variant={student.solved_problem.includes(problem._id) ? "outline" : "default"}>
                    {student.solved_problem.includes(problem._id) ? "View Solution" : "Start Solving"}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {filteredProblems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No problems found matching your criteria</p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
