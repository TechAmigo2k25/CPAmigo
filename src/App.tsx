import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentManagement from "./pages/admin/StudentManagement";
import ProblemManagement from "./pages/admin/ProblemManagement";
import CreateProblemPage from "./pages/admin/CreateProblemPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import ProblemListPage from "./pages/student/ProblemListPage";
import ProblemSolvePage from "./pages/student/ProblemSolvePage";
import QuizManagement from "./pages/admin/QuizManagement";
import StudentQuiz from "./pages/student/StudentQuiz"
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: "admin" | "student" }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // or spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/student"} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={
        isAuthenticated 
          ? <Navigate to={user?.role === "admin" ? "/admin" : "/student"} replace />
          : <LoginPage />
      } />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute role="admin"><StudentManagement /></ProtectedRoute>} />
      <Route path="/admin/problems" element={<ProtectedRoute role="admin"><ProblemManagement /></ProtectedRoute>} />
      <Route path="/admin/problems/create" element={<ProtectedRoute role="admin"><CreateProblemPage /></ProtectedRoute>} />
      <Route path="/admin/quiz" element={<ProtectedRoute role="admin"><QuizManagement /></ProtectedRoute>} />

      
      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/problems" element={<ProtectedRoute role="student"><ProblemListPage /></ProtectedRoute>} />
      <Route path="/student/problem/:id" element={<ProtectedRoute role="student"><ProblemSolvePage /></ProtectedRoute>} />
      <Route path="/student/quiz" element={<ProtectedRoute role="student"><StudentQuiz /></ProtectedRoute>} />

      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/CPAmigo/">
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
