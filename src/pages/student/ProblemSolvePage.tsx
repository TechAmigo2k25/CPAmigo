import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import {
  ArrowLeft,
  Play,
  Send,
  Clock,
  Database,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  LanguagesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { ExecutionStatus } from "@/types";
import { cn } from "@/lib/utils";
import { get_single_problem, submit_solution } from "../../services/api";
import { toast } from "@/hooks/use-toast";
import test from "node:test";
import { ProblemPdfPreview } from "@/components/ProblemPreviewPdf";
import { set } from "date-fns";

// Language configurations
const languages = [
  {
    value: "python",
    label: "Python",
    defaultCode: " "
  },
  {
    value: "cpp",
    label: "C++",
    defaultCode: ""
  },
  {
    value: "java",
    label: "Java",
    defaultCode: " "
  },
  {
    value: "c",
    label: "C",
    defaultCode: ""
  },
];

// Interface for problem data
interface Problem {
  _id: string;
  title: string;
  difficulty: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  sampleInput: string;
  sampleOutput: string;
  sampleInput2: string;
  sampleOutput2: string;
  sampleInputDesc1: string;
  sampleInputDesc2: string;
  pdfUrl:string,
  testCases: Array<{
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }>;
  solved_count: number;
  timeLimit?: number;
  memoryLimit?: number;
}

export default function ProblemSolvePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState(languages[0].defaultCode);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>("idle");
  const [output, setOutput] = useState("");
  const [testResults, setTestResults] = useState<{ passed: number; total: number } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [solutiondata, setSolutiondata] = useState<any>(null);
  const [isProgramRun, setProgramRun] = useState(false);
  const [codeMap, setCodeMap] = useState<Record<string, string>>({});
  const [language_list, setLanguageList] = useState(
    [
      {
        value: "python",
        label: "Python",
        defaultCode: " "
      },
      {
        value: "cpp",
        label: "C++",
        defaultCode: ""
      },
      {
        value: "java",
        label: "Java",
        defaultCode: " "
      },
      {
        value: "c",
        label: "C",
        defaultCode: ""
      },
    ]
  )


  const handleRun = async () => {
    setIsRunning(true);
    setOutput("");
    setExecutionStatus("running");

    try {
      const res = await submit_solution({
        code: code,
        language: language,
        problemId: id,
        userId: localStorage.getItem("user_id"),
        testCases: [problem?.testCases[0], problem?.testCases[1]],
        temp: "run"
      });

      if (res.status == 200) {
        {
          console.log(res);

          if (res.data.result.status == "Passed") {
            setOutput(` Input ${res.data.result.testcases[0].input} : Output ${res.data.result.testcases[0].actualOutput} \n Input ${res.data.result.testcases[1].input} : Output ${res.data.result.testcases[1].actualOutput}
              `);

            setExecutionStatus("success");
            setProgramRun(true);
            setIsRunning(false);

          } else {
            setOutput(res.data.result.testcases[0].actualOutput || "Execution Failed");
            setExecutionStatus("failed");
            setIsRunning(false);
          }

        }

      }
    } catch (error) {
      console.log(error);
      toast({ title: "Error", description: "Failed to run code.", variant: "destructive" });
      setExecutionStatus("error");
      setIsRunning(false);
      return;
    }
  }

  const handleSubmit = async () => {

    if (!isProgramRun) {
      toast({ title: "Error", description: "Please run your code successfully at least once before submitting.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    setOutput("");
    setExecutionStatus("running");

    try {
      const res = await submit_solution({
        code: code,
        language: language,
        problemId: id,
        userId: localStorage.getItem("user_id"),
        testCases: problem?.testCases,
        temp: "submit",
        startupcode: language_list

      });

      if (res.status == 200) {
        {

          setIsSubmitting(false);

          // if (res.data.result.status == "Passed") {
          setTestResults({ passed: res.data.result.totaltestcasepassed, total: res.data.result.testcases.length });
          if (res.data.result.totaltestcasepassed == res.data.result.testcases.length) {
            setExecutionStatus("success");
            let outputText = `✅ All test cases passed!\n\n`;
            res.data.result.testcases.forEach((test, index) => {
              outputText += `Test Case ${index + 1}: ${test.status}\n`;
            });
            setOutput(outputText);
            setShowCelebration(true);
          } else {

            setExecutionStatus("failed");
            let outputText = `❌ ${res.data.result.totaltestcasepassed}/${res.data.result.testcases.length} test cases passed.\n\n`;
            res.data.result.testcases.forEach((test, index) => {
              outputText += `input : ${test.input}  Expected: ${test.expectedOutput}\n  Got: ${test.actualOutput}\n`;
            });
            setOutput(outputText);
          }

        }

      }
      setIsRunning(false);
      setIsSubmitting(false);

    } catch (error) {
      console.log(error);
      toast({ title: "Error", description: "Failed to run code.", variant: "destructive" });
      setExecutionStatus("error");
      setIsRunning(false);
      setIsSubmitting(false);

      return;
    }
  }

  // Simulate submission





  const getStatusIcon = () => {
    switch (executionStatus) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-destructive" />;
      case "error":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return null;
    }
  };


  const getSingleProblem = async () => {
    try {
      setLoading(true);
      const res = await get_single_problem({ user_id: localStorage.getItem("user_id"), problem_id: id });
      if (res.status === 200) {
        setProblem(res.data.data);


        if (res.data.submission != null) {

          handleLanguageChange(res.data.submission.language);
          setLanguage(res.data.submission.language);
          setCode(res.data.submission.code);
          setSolutiondata(res.data.submission);
          setLanguageList(res.data.submission.startupcode)
        } else {
          const newCodeMap: Record<string, string> = {};

          res.data.data.startupcode.forEach((item) => {
            newCodeMap[item.language] = item.code;
          });

          setCodeMap(newCodeMap);

          console.log(newCodeMap);

          updateLanguagesWithCode(newCodeMap);
          setCode(newCodeMap["java"]);
        }

      } else {
        toast({ title: "Error", description: "Failed to get problem details.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to get problem details.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  const handleLanguageChange = (value: string) => {
    const selectedLang = language_list.find(
      (lang) => lang.value === value
    );
    setLanguage(value);

    if (selectedLang) {
      setCode(selectedLang.defaultCode);
    }
  };

  const updateLanguagesWithCode = (startupcode) => {
    setLanguageList(prev =>
      prev.map(lang => ({
        ...lang,
        defaultCode: startupcode[lang.value],
      }))
    );
  };

  const handleresetcode = () => {
    console.log("reset code");

    console.log(language)
    updateLanguagesWithCode(codeMap);
    setCode(codeMap[language])
    console.log(codeMap);


  }


  useEffect(() => {
    getSingleProblem();
    setProgramRun(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Problem Not Found</h2>
          <p className="text-muted-foreground mb-4">The problem you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/student/problems")}>Back to Problems</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/student/problems")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-semibold">{problem.title}</h1>
                <DifficultyBadge difficulty={problem.difficulty.toLowerCase() as any} />
                {/* The PDF Preview Logic */}
                {problem.pdfUrl && (
                  <ProblemPdfPreview
                    pdfUrl={problem.pdfUrl}
                    problemTitle={problem.title}
                  />
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {problem.timeLimit || 1}s
                </span>
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  {problem.memoryLimit || 256}MB
                </span>
                <span className="flex items-center gap-1">
                  Solved: {problem.solved_count}
                </span>
              </div>
            </div>
          </div>

          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {language_list.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Panel - Problem Description */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-1/2 border-r border-border overflow-auto scrollbar-thin"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4">
              <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                Description
              </TabsTrigger>
              <TabsTrigger value="submissions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                Submissions
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="flex-1 overflow-auto p-6 mt-0">
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {problem.description}
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <ChevronDown className="w-4 h-4" />
                      Input Format
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{problem.inputFormat}</p>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <ChevronDown className="w-4 h-4" />
                      Output Format
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{problem.outputFormat}</p>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <ChevronDown className="w-4 h-4" />
                      Constraints
                    </h4>
                    <p className="text-sm text-muted-foreground font-mono whitespace-pre-wrap">{problem.constraints}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-editor-bg border border-editor-border p-4">
                      <h4 className="font-semibold mb-2 text-sm">Sample Input</h4>
                      <pre className="text-sm font-mono text-muted-foreground">{problem.sampleInput}</pre>
                    </div>
                    <div className="rounded-lg bg-editor-bg border border-editor-border p-4">
                      <h4 className="font-semibold mb-2 text-sm">Sample Output</h4>
                      <pre className="text-sm font-mono text-muted-foreground">{problem.sampleOutput}</pre>
                    </div>
                  </div>

                  <div className="rounded-lg bg-editor-bg border border-editor-border p-4">
                    <h4 className="font-semibold mb-2 text-sm w-100">Description</h4>

                    <pre className="text-sm font-mono text-muted-foreground whitespace-pre-wrap break-words">
                      {problem.sampleInputDesc1}
                    </pre>
                  </div>



                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-editor-bg border border-editor-border p-4">
                      <h4 className="font-semibold mb-2 text-sm">Sample Input 2</h4>
                      <pre className="text-sm font-mono text-muted-foreground">{problem.sampleInput2}</pre>
                    </div>
                    <div className="rounded-lg bg-editor-bg border border-editor-border p-4">
                      <h4 className="font-semibold mb-2 text-sm">Sample Output 2</h4>
                      <pre className="text-sm font-mono text-muted-foreground">{problem.sampleOutput2}</pre>
                    </div>
                  </div>
                  <div className="rounded-lg bg-editor-bg border border-editor-border p-4">
                    <h4 className="font-semibold mb-2 text-sm w-100">Description</h4>

                    <pre className="text-sm font-mono text-muted-foreground whitespace-pre-wrap break-words">
                      {problem.sampleInputDesc2}
                    </pre>
                  </div>

                  {/* Test Cases Preview (Optional) */}
                  {problem.testCases && problem.testCases.length > 0 && (
                    <div className="rounded-lg bg-muted/50 p-4">
                      <h4 className="font-semibold mb-2">Test Cases</h4>
                      <p className="text-sm text-muted-foreground">
                        Total test cases: {problem.testCases.length}
                        ({problem.testCases.filter(t => t.isHidden).length} hidden)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="submissions" className="flex-1 overflow-auto p-6 mt-0">
              <div className="text-center py-12 text-muted-foreground">
                <p>No submissions yet</p>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Right Panel - Code Editor */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-1/2 flex flex-col"
        >
          {/* Editor */}
          <div className="flex-1 min-h-[300px]">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => {
                const newCode = value || "";
                setCode(newCode);
                // ✅ update defaultCode for selected language
                setLanguageList(prev =>
                  prev.map(lang =>
                    lang.value === language
                      ? { ...lang, defaultCode: newCode }
                      : lang
                  )
                );
              }}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: "on",
                padding: { top: 16 },
              }}
            />
          </div>

          {/* Output Console */}
          <div className="h-48 border-t border-border bg-editor-bg">
            <div className="flex items-center justify-between px-4 py-2 border-b border-editor-border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Output</span>
                {getStatusIcon()}
                {testResults && (
                  <span className={cn(
                    "text-xs font-medium",
                    testResults.passed === testResults.total ? "text-success" : "text-destructive"
                  )}>
                    {testResults.passed}/{testResults.total} passed
                  </span>
                )}
              </div>
            </div>
            <div className="p-4 h-[calc(100%-44px)] overflow-auto scrollbar-thin">
              {executionStatus === "running" ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm">Running...</span>
                </div>
              ) : (
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {output || "Run your code to see output here"}
                </pre>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-border bg-card">
            <Button className="bg-red-500 text-white hover:bg-red-600"
              onClick={() => {
                setIsRunning(false);
                setExecutionStatus("idle");
              }

              }
            >
              Stop
            </Button>

            <Button
              variant="outline"
              onClick={handleresetcode}
            >
              Reset Code
            </Button>



            <Button
              variant="outline"
              onClick={handleRun}
              disabled={isRunning || isSubmitting}
            >
              {isRunning ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Run
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isRunning || isSubmitting}
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Submit
            </Button>


          </div>
        </motion.div>

      </div>

      <ConfettiCelebration
        isVisible={showCelebration}
        onClose={() => setShowCelebration(false)}
      />
    </div>
  );
}


