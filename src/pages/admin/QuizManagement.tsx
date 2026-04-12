
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Trash2, Edit } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

import { SkeletonTable } from "@/components/ui/skeleton-card";
import { toast } from "@/hooks/use-toast";
import { add } from "date-fns";
import { add_quiz, get_all_quiz, update_quiz, deleteQuiz } from "../../services/api";

interface Quiz {
    _id: string;
    question: string;
    options: string[];
    correctOptionIndex: number;
    createdAt: string;
}

export default function QuizManagement() {

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [quizList, setQuizList] = useState<Quiz[]>([]);

    const [openDialog, setOpenDialog] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [quizToDelete, setQuizToDelete] = useState<string | null>(null);

    let options = [
        { "text": " " },
        { "text": "" },
        { "text": " " },
        { "text": " " }
    ]

    const [form, setForm] = useState({
        question: "",
        options: [
            { text: "" },
            { text: "" },
            { text: "" },
            { text: "" }
        ],
        correctIndex: 0
    });

    const fetchQuiz = async () => {

        try {
            const res = await get_all_quiz();

            setQuizList(res.data.data);

        } catch (error) {

            toast({
                title: "Error",
                description: "Failed to fetch quizzes",
                variant: "destructive"
            });

        }

    };

    useEffect(() => {

        fetchQuiz();

        const timer = setTimeout(() => setLoading(false), 800);

        return () => clearTimeout(timer);

    }, []);

    const filteredQuiz = quizList.filter((quiz) =>
        quiz.question.toLowerCase().includes(search.toLowerCase())
    );

    const handleOptionChange = (index: number, value: string) => {

        const updatedOptions = [...form.options];

        updatedOptions[index] = {
            ...updatedOptions[index],
            text: value
        };

        setForm({
            ...form,
            options: updatedOptions
        });

    };

    const resetForm = () => {

        setForm({
            question: "",
            options: [
                { text: "" },
                { text: "" },
                { text: "" },
                { text: "" }
            ],
            correctIndex: 0
        });

        setEditingQuiz(null);

    };

    const handleCreateOrUpdate = async () => {

      

        if (!form.question) {
            toast({
                title: "Validation",
                description: "Question is required",
                variant: "destructive"
            });
            return;
        }

        try {

            if (editingQuiz) {

                const res = await update_quiz(editingQuiz._id, form);
               

                toast({
                    title: "Quiz Updated"
                });

            } else {

                const res = await add_quiz(form);
               

                if (res.status == 200) {
                    toast({
                        title: "Quiz Created"
                    });
                } else {
                    toast({
                        title: "Error",
                        description: "Failed to create quiz",
                        variant: "destructive"
                    });
                }

            }

            resetForm();
            setOpenDialog(false);
            fetchQuiz();

        } catch {

            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive"
            });

        }

    };

    const handleDelete = async () => {

        if (!quizToDelete) return;

        try {

            const res = await deleteQuiz(quizToDelete);
           

            setQuizList((prev) => prev.filter((q) => q._id !== quizToDelete));

            toast({
                title: "Quiz Deleted"
            });

        } catch (error) { }

        setDeleteDialogOpen(false);
        setQuizToDelete(null);

    };

    if (loading) {

        return (
            <AdminLayout>
                <SkeletonTable rows={6} />
            </AdminLayout>
        );

    }

    return (
        <AdminLayout>

            <div className="space-y-6">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                    <div>
                        <h1 className="text-3xl font-bold mb-2">Quiz Management</h1>
                        <p className="text-muted-foreground">
                            Manage MCQ questions
                        </p>
                    </div>

                    <Dialog open={openDialog} onOpenChange={setOpenDialog}>

                        <DialogTrigger asChild>
                            <Button onClick={() => {
                                resetForm();
                            }}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Quiz
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-lg">

                            <DialogHeader>
                                <DialogTitle>
                                    {editingQuiz ? "Update Question" : "Create Question"}
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">

                                <Input
                                    placeholder="Enter Question"
                                    value={form.question}
                                    onChange={(e) =>
                                        setForm({ ...form, question: e.target.value })
                                    }
                                />

                                {form.options.map((opt, index) => (
                                    <Input
                                        key={index}
                                        placeholder={`Option ${index + 1}`}
                                        value={opt.text}
                                        onChange={(e) =>
                                            handleOptionChange(index, e.target.value)
                                        }
                                    />
                                ))}


                                <div className="space-y-2">
                                    <Label htmlFor="correctOption">Correct Option</Label>

                                    <Select
                                        value={String(form.correctIndex)}
                                        onValueChange={(v) =>
                                            setForm({ ...form, correctIndex: Number(v) })
                                        }
                                    >
                                        <SelectTrigger id="correctOption">
                                            <SelectValue placeholder="Select Correct Option" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="0">Option 1</SelectItem>
                                            <SelectItem value="1">Option 2</SelectItem>
                                            <SelectItem value="2">Option 3</SelectItem>
                                            <SelectItem value="3">Option 4</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                            </div>

                            <DialogFooter>

                                <Button onClick={handleCreateOrUpdate}>
                                    {editingQuiz ? "Update" : "Create"}
                                </Button>

                            </DialogFooter>

                        </DialogContent>

                    </Dialog>

                </div>

                <div className="flex gap-4">

                    <div className="relative flex-1 max-w-md">

                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                        <Input
                            placeholder="Search quiz..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />

                    </div>

                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-xl border border-border bg-card overflow-hidden"
                >

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead>

                                <tr className="border-b border-border bg-muted/50">

                                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                        Question
                                    </th>

                                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                        Correct Answer
                                    </th>

                                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                        Created
                                    </th>

                                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredQuiz.map((quiz, index) => (

                                    <motion.tr
                                        key={quiz._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-border hover:bg-muted/30"
                                    >

                                        <td className="p-4 font-medium">
                                            {quiz.question}
                                        </td>

                                        <td className="p-4">
                                            {quiz.options[quiz.correctOptionIndex]?.text}
                                        </td>

                                        <td className="p-4 text-muted-foreground">
                                            {new Date(quiz.createdAt).toLocaleDateString()}
                                        </td>

                                        <td className="p-4 text-right flex justify-end gap-2">

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setEditingQuiz(quiz);
                                                    setForm({
                                                        ...form,
                                                        question: quiz.question,
                                                        options: quiz.options.map((opt: any) => ({ text: opt.text })),
                                                        correctIndex: quiz.correctOptionIndex
                                                    });

                                                    setOpenDialog(true);
                                                }}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setQuizToDelete(quiz._id);
                                                    setDeleteDialogOpen(true);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>

                                        </td>

                                    </motion.tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                    {filteredQuiz.length === 0 && (

                        <div className="text-center py-12 text-muted-foreground">
                            No quizzes found
                        </div>

                    )}

                </motion.div>

            </div>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>

                    <DialogHeader>
                        <DialogTitle>Delete Quiz</DialogTitle>
                    </DialogHeader>

                    <p className="text-muted-foreground">
                        Are you sure you want to delete this quiz?
                    </p>

                    <DialogFooter>

                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            No
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            Yes, Delete
                        </Button>

                    </DialogFooter>

                </DialogContent>
            </Dialog>

        </AdminLayout>
    );
}

