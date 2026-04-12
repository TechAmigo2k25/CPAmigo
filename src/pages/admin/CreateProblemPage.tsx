import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, X, Eye, EyeOff, Link as LinkIcon } from "lucide-react"; // Added Link icon
import { useNavigate, useLocation } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Difficulty, TestCase } from "@/types";
import { cn } from "@/lib/utils";
import { upload_problem, update_problem, get_pdf_urls } from "../../services/api";

type StartupCode = {
  language: string;
  code: string;
};

// Define PDF Item type based on your provided data
interface PDFItem {
  id: string;
  title: string;
  pdfUrl: string;
}

export default function CreateProblemPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [pdfurls, setpdfurls] = useState<PDFItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [startupcodeobj, setstartupcodeobj] = useState<StartupCode[]>([
    { language: "c", code: "" },
    { language: "cpp", code: "" },
    { language: "java", code: "" },
    { language: "python", code: "" },
  ]);

  const [formData, setFormData] = useState({
    title: "",
    difficulty: "" as Difficulty | "",
    pdfUrl: "", // NEW FIELD
    description: "",
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    sampleInput: "",
    sampleOutput: "",
    sampleInputDesc1: "",
    sampleInput2: "",
    sampleOutput2: "",
    sampleInputDesc2: "",
    startupcode: [] as StartupCode[],
    testCases: [] as TestCase[]
  });

  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: "", expectedOutput: "", isHidden: false },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.difficulty) newErrors.difficulty = "Difficulty is required";
    if (!formData.pdfUrl) newErrors.pdfUrl = "Please select a Problem PDF"; // VALIDATION FOR PDF
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.inputFormat.trim()) newErrors.inputFormat = "Input format is required";
    if (!formData.outputFormat.trim()) newErrors.outputFormat = "Output format is required";
    if (!formData.constraints.trim()) newErrors.constraints = "Constraints are required";
    if (!formData.sampleInput.trim()) newErrors.sampleInput = "Sample input is required";
    if (!formData.sampleOutput.trim()) newErrors.sampleOutput = "Sample output is required";
    if (!formData.sampleInput2.trim()) newErrors.sampleInput2 = "Sample input 2 is required";
    if (!formData.sampleOutput2.trim()) newErrors.sampleOutput2 = "Sample output 2 is required";
    if (!formData.sampleInputDesc1.trim()) newErrors.sampleInputDesc1 = "Description 1 is required";
    if (!formData.sampleInputDesc2.trim()) newErrors.sampleInputDesc2 = "Description 2 is required";

    const hasValidTestCase = testCases.some(tc => tc.input.trim() && tc.expectedOutput.trim());
    if (!hasValidTestCase) newErrors.testCases = "At least one complete test case is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateStartupCode = (language: string, code: string) => {
    setstartupcodeobj(prev =>
      prev.map(item => (item.language === language ? { ...item, code } : item))
    );
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", expectedOutput: "", isHidden: false }]);
  };

  const removeTestCase = (index: number) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter((_, i) => i !== index));
    }
  };

  const updateTestCase = (index: number, field: keyof TestCase, value: string | boolean) => {
    setTestCases(testCases.map((tc, i) =>
      i === index ? { ...tc, [field]: value } : tc
    ));
  };

  const handleupdate = async () => {
    if (!validateForm()) {
      toast({ title: "Error", description: "Please fix the errors in the form", variant: "destructive" });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = { ...formData, testCases, startupcode: startupcodeobj };
      const res = await update_problem(location.state.problem._id, payload);
      
      if (res.status === 200) {
        toast({ title: "Success", description: "Problem updated successfully!" });
        navigate("/admin/problems");
      } else {
        toast({ title: "Error", description: res.data.message || "Failed to update problem.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update problem.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({ title: "Error", description: "Please fix the errors in the form", variant: "destructive" });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = { ...formData, testCases, startupcode: startupcodeobj };
      const res = await upload_problem(payload);
      
      if (res.status === 200) {
        toast({ title: "Success", description: "Problem created successfully!" });
        navigate("/admin/problems");
      } else {
        toast({ title: "Error", description: res.data.message || "Failed to create problem.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create problem.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPdfUrl = async () => {
    try {
      const res = await get_pdf_urls();
      if (res.status === 200) {
        setpdfurls(res.data);
      }
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to fetch PDF mapping", variant: "destructive" });
    }
  };

  useEffect(() => {
    getPdfUrl();
    if (location.state?.problem) {
      const p = location.state.problem;
      setFormData({
        title: p.title || "",
        difficulty: p.difficulty || "",
        pdfUrl: p.pdfUrl || "",
        description: p.description || "",
        inputFormat: p.inputFormat || "",
        outputFormat: p.outputFormat || "",
        constraints: p.constraints || "",
        sampleInput: p.sampleInput || "",
        sampleOutput: p.sampleOutput || "",
        sampleInputDesc1: p.sampleInputDesc1 || "",
        sampleInput2: p.sampleInput2 || "",
        sampleOutput2: p.sampleOutput2 || "",
        sampleInputDesc2: p.sampleInputDesc2 || "",
        startupcode: p.startupcode || [],
        testCases: p.testCases || []
      });
      if (p.testCases) setTestCases(p.testCases);
      if (p.startupcode) setstartupcodeobj(p.startupcode);
    }
  }, [location.state]);

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/problems")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-1">
              {location.state?.problem ? "Edit Problem" : "Create Problem"}
            </h1>
            <p className="text-muted-foreground">Define problem details and test cases</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          {/* Basic Info */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Basic Information</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={errors.title ? "border-destructive" : ""}
                  placeholder="e.g., Two Sum"
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(v) => setFormData({ ...formData, difficulty: v as Difficulty })}
                >
                  <SelectTrigger className={errors.difficulty ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                {errors.difficulty && <p className="text-sm text-destructive">{errors.difficulty}</p>}
              </div>
            </div>

            {/* --- NEW PDF SELECTION FIELD --- */}
            <div className="space-y-2">
              <Label>Problem PDF Reference (External Source)</Label>
              <Select
                value={formData.pdfUrl}
                onValueChange={(url) => setFormData({ ...formData, pdfUrl: url })}
              >
                <SelectTrigger className={errors.pdfUrl ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select a title to link PDF" />
                </SelectTrigger>
                <SelectContent>
                  {pdfurls.map((pdf) => (
                    <SelectItem key={pdf.id} value={pdf.pdfUrl}>
                      {pdf.title} ({pdf.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.pdfUrl && (
                <div className="flex items-center gap-2 mt-2 text-xs text-blue-500">
                  <LinkIcon className="w-3 h-3" />
                  <a href={formData.pdfUrl} target="_blank" rel="noreferrer" className="hover:underline truncate">
                    Preview Link: {formData.pdfUrl}
                  </a>
                </div>
              )}
              {errors.pdfUrl && <p className="text-sm text-destructive">{errors.pdfUrl}</p>}
            </div>
            {/* ------------------------------- */}

            <div className="space-y-2">
              <Label htmlFor="description">Description (Markdown supported)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={cn("min-h-32 font-mono text-sm", errors.description ? "border-destructive" : "")}
                placeholder="Describe the problem in detail..."
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="inputFormat">Input Format</Label>
                <Textarea
                  id="inputFormat"
                  value={formData.inputFormat}
                  onChange={(e) => setFormData({ ...formData, inputFormat: e.target.value })}
                  className={cn("min-h-20", errors.inputFormat ? "border-destructive" : "")}
                />
                {errors.inputFormat && <p className="text-sm text-destructive">{errors.inputFormat}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="outputFormat">Output Format</Label>
                <Textarea
                  id="outputFormat"
                  value={formData.outputFormat}
                  onChange={(e) => setFormData({ ...formData, outputFormat: e.target.value })}
                  className={cn("min-h-20", errors.outputFormat ? "border-destructive" : "")}
                />
                {errors.outputFormat && <p className="text-sm text-destructive">{errors.outputFormat}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="constraints">Constraints</Label>
              <Textarea
                id="constraints"
                value={formData.constraints}
                onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                className={cn("min-h-20 font-mono text-sm", errors.constraints ? "border-destructive" : "")}
              />
              {errors.constraints && <p className="text-sm text-destructive">{errors.constraints}</p>}
            </div>

            {/* Sample Cases */}
            <div className="grid gap-4 sm:grid-cols-2 border-t pt-4">
              <div className="space-y-2">
                <Label>Sample Input 1</Label>
                <Textarea 
                  value={formData.sampleInput} 
                  onChange={(e) => setFormData({...formData, sampleInput: e.target.value})}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Sample Output 1</Label>
                <Textarea 
                  value={formData.sampleOutput} 
                  onChange={(e) => setFormData({...formData, sampleOutput: e.target.value})}
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
                <Label>Sample 1 Description</Label>
                <Textarea 
                  value={formData.sampleInputDesc1} 
                  onChange={(e) => setFormData({...formData, sampleInputDesc1: e.target.value})}
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 border-t pt-4">
              <div className="space-y-2">
                <Label>Sample Input 2</Label>
                <Textarea 
                  value={formData.sampleInput2} 
                  onChange={(e) => setFormData({...formData, sampleInput2: e.target.value})}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Sample Output 2</Label>
                <Textarea 
                  value={formData.sampleOutput2} 
                  onChange={(e) => setFormData({...formData, sampleOutput2: e.target.value})}
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
                <Label>Sample 2 Description</Label>
                <Textarea 
                  value={formData.sampleInputDesc2} 
                  onChange={(e) => setFormData({...formData, sampleInputDesc2: e.target.value})}
                />
            </div>
          </div>

          {/* Test Cases Section */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Test Cases</h2>
              <Button variant="outline" size="sm" onClick={addTestCase}>
                <Plus className="w-4 h-4 mr-2" /> Add Test Case
              </Button>
            </div>
            {errors.testCases && <p className="text-sm text-destructive">{errors.testCases}</p>}

            <div className="space-y-4">
              {testCases.map((testCase, index) => (
                <motion.div key={index} layout className="rounded-lg border border-border p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Test Case {index + 1}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {testCase.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <Label>Hidden</Label>
                        <Switch
                          checked={testCase.isHidden}
                          onCheckedChange={(v) => updateTestCase(index, "isHidden", v)}
                        />
                      </div>
                      {testCases.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => removeTestCase(index)}>
                          <X className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Textarea
                      placeholder="Input"
                      value={testCase.input}
                      onChange={(e) => updateTestCase(index, "input", e.target.value)}
                    />
                    <Textarea
                      placeholder="Expected Output"
                      value={testCase.expectedOutput}
                      onChange={(e) => updateTestCase(index, "expectedOutput", e.target.value)}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Startup Code Section */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
             <h2 className="text-lg font-semibold">Startup Code</h2>
             {startupcodeobj.map((item, index) => (
                <div key={index} className="space-y-2">
                  <Label className="capitalize">{item.language}</Label>
                  <Textarea
                    value={item.code}
                    onChange={(e) => updateStartupCode(item.language, e.target.value)}
                    className="min-h-28 font-mono text-sm"
                    placeholder={`Starter code for ${item.language}...`}
                  />
                </div>
              ))}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button variant="outline" onClick={() => navigate("/admin/problems")}>
              Cancel
            </Button>
            <Button 
              onClick={location.state?.problem ? handleupdate : handleSubmit} 
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (location.state?.problem ? "Updating..." : "Creating...") 
                : (location.state?.problem ? "Update Problem" : "Create Problem")}
            </Button>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}