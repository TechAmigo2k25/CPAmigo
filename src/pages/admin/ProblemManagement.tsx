import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Eye, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { SkeletonTable } from "@/components/ui/skeleton-card";
import { Problem, Difficulty } from "@/types";
import { toast } from "@/hooks/use-toast";
import { get_problem } from "../../services/api";
import { useGlobalStats } from "../../contexts/GlobalStatsContext";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Mock problems data
const mockProblems: Problem[] = [];


export default function ProblemManagement() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [mockProblems, setMocProblem] = useState<Problem[]>([]);
  const navigate = useNavigate();
  const { setProblemCount, problemCount, studentCount } = useGlobalStats();



  const generateProblemPDF = (problem) => {
    const doc = new jsPDF();
    let y = 10;

    // Helper for section titles
    const addSection = (title) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(title, 10, y);
      y += 6;
    };

    const addText = (text) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(text || "-", 180);
      doc.text(lines, 10, y);
      y += lines.length * 5;
    };

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(problem.title, 10, y);
    y += 8;

    doc.setFontSize(12);
    doc.text(`Difficulty: ${problem.difficulty}`, 10, y);
    y += 10;

    // Description
    addSection("Description");
    addText(problem.description);

    // Input Format
    addSection("Input Format");
    addText(problem.inputFormat);

    // Output Format
    addSection("Output Format");
    addText(problem.outputFormat);

    // Constraints
    addSection("Constraints");
    addText(problem.constraints);

    // Sample Cases
    addSection("Sample Test Cases");

    addText(`Input 1: ${problem.sampleInput}`);
    addText(`Output 1: ${problem.sampleOutput}`);
    addText(`Explanation: ${problem.sampleInputDesc1}`);

    addText(`Input 2: ${problem.sampleInput2}`);
    addText(`Output 2: ${problem.sampleOutput2}`);
    addText(`Explanation: ${problem.sampleInputDesc2}`);

    // Test Cases Table
    addSection("Test Cases");

    autoTable(doc, {
      startY: y,
      head: [["Input", "Expected Output", "Hidden"]],
      body: problem.testCases.map(tc => [
        tc.input,
        tc.expectedOutput,
        tc.isHidden ? "Yes" : "No"
      ]),
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // Starter Code
    addSection("Starter Code");

    problem.startupcode.forEach((codeBlock) => {
      addText(`Language: ${codeBlock.language}`);
      addText(codeBlock.code);
      y += 3;
    });

    // Save
    doc.save(`${problem.title}.pdf`);
  };


  const getAlProblems = async () => {

    try {

      const res = await get_problem();
      setMocProblem(res.data.data);


    } catch (error) {
      toast({ title: "Error", description: "Failed to get problem.", variant: "destructive" });
    }
  }



  useEffect(() => {
    getAlProblems();
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredProblems = mockProblems.filter((problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = difficulty === "all" || problem.difficulty === difficulty;
    return matchesSearch && matchesDifficulty;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Problems</h1>
              <p className="text-muted-foreground">Manage coding problems</p>
            </div>
          </div>
          <SkeletonTable rows={6} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Problems</h1>
            <p className="text-muted-foreground">Manage coding problems</p>
          </div>

          <Button onClick={() => {
            navigate("/admin/problems/create");
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Problem
          </Button>

        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
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
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-border bg-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Title</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Difficulty</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Progress</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Created</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProblems.map((problem, index) => {

                  const percentage = problem.solved_count > 0 ? Math.round((problem.solved_count / studentCount) * 100) : 0;

                  return (
                    <motion.tr
                      key={problem._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4 font-medium">{problem.title}</td>
                      <td className="p-4">
                        <DifficultyBadge difficulty={problem.difficulty} />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-24">
                            <div
                              className="h-full bg-success rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {problem.solved_count}/{studentCount}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(problem.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <Button onClick={() =>generateProblemPDF(problem)}>
                          
                          File
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          navigate("/admin/problems/create", {
                            state: { problem },
                          })
                        }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredProblems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No problems found</p>
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}
