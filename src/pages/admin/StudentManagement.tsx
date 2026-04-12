import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { SkeletonTable } from "@/components/ui/skeleton-card";
import { useToast } from "@/hooks/use-toast";
import { Student } from "@/types";
import {register_user,get_students,update_students,delete_student} from "../../services/api";
import { asyncWrapProviders } from "async_hooks";
import { useGlobalStats } from "../../contexts/GlobalStatsContext";

const StudentPage = () => {
  const { setStudentCount } = useGlobalStats();

  // After fetching students:
  // setStudentCount(fetchedStudents.length);

  return <div>Student Page</div>;
};

export default function StudentManagement() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showPassword, setShowPassword] = useState(false);
    const { setStudentCount } = useGlobalStats();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_no: "",
    college_name: "",
    address:""
,    password: "",
    role:"student"
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const getStudentsData=async()=>{

    try {
      const res = await get_students();
      console.log(res);
      setStudents(res.data.data);
      
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
      getStudentsData();
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.mobile_no.trim()) {
      newErrors.mobile_no = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile_no)) {
      newErrors.mobile_no = "Mobile number must be 10 digits";
    }

    if (!formData.college_name.trim()) {
      newErrors.college_name = "College name is required";
    }

    if (!editingStudent) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (!/\d/.test(formData.password)) {
        newErrors.password = "Password must contain at least 1 number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (editingStudent) {
      try {
        console.log(editingStudent._id);
        const res = await update_students(formData, editingStudent._id);
        console.log(res);
        if (res.status === 200) {
          getStudentsData();
          toast({ title: "Success", description: "Student updated successfully" });
          resetForm();
        } else {
          toast({ title: "Error", description: "Failed to update student" });
        }
      } catch (error) {
        
      }
    } else {
      console.log(formData);
      const res= await register_user(formData);

      if(res.status==200){
        
      console.log(res);
      toast({ title: "Success", description: "Student added successfully" });
      resetForm();
      getStudentsData();
      }else{
        toast({ title: "Error", description: "Failed to add student" });
      }


     
    }

    
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
   setFormData({ name: student.name, email: student.email, mobile_no: student.mobile_no, college_name: student.college_name, address: student.address, password: "", role:"student" });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await delete_student(id);
      console.log(res);
      if (res.status === 200) {
        getStudentsData();
        toast({ title: "Success", description: "Student deleted successfully" });
      } else {
        toast({ title: "Error", description: "Failed to delete student" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred while deleting the student" });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", mobile_no: "", college_name: "", address: "", password: "", role:"student" });
    setErrors({});
    setEditingStudent(null);
    setIsDialogOpen(false);
    setShowPassword(false);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.college_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Students</h1>
              <p className="text-muted-foreground">Manage student accounts</p>
            </div>
          </div>
          <SkeletonTable rows={5} />
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
            <h1 className="text-3xl font-bold mb-2">Students</h1>
            <p className="text-muted-foreground">Manage student accounts</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
                <DialogDescription>
                  {editingStudent ? "Update student information" : "Fill in the details to add a new student"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile_no}
                    onChange={(e) => setFormData({ ...formData, mobile_no: e.target.value })}
                    className={errors.mobile_no ? "border-destructive" : ""}
                  />
                  {errors.mobile_no && <p className="text-sm text-destructive">{errors.mobile_no}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="college">College Name</Label>
                  <Input
                    id="college"
                    value={formData.college_name}
                    onChange={(e) => setFormData({ ...formData, college_name: e.target.value })}
                    className={errors.college_name ? "border-destructive" : ""}
                  />
                  {errors.college_name && <p className="text-sm text-destructive">{errors.college_name}</p>}
                </div>
                  <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={errors.address ? "border-destructive" : ""}
                  />
                  {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                </div>
                {!editingStudent && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={errors.password ? "border-destructive pr-10" : "pr-10"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={handleSubmit}>{editingStudent ? "Update" : "Add"} Student</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
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
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Mobile</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">College</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <motion.tr
                    key={student._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4 font-medium">{student.name}</td>
                    <td className="p-4 text-muted-foreground">{student.email}</td>
                    <td className="p-4 text-muted-foreground">{student.mobile_no}</td>
                    <td className="p-4 text-muted-foreground">{student.college_name}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(student)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Student</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {student.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(student._id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredStudents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No students found</p>
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}
