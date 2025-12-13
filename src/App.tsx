import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import VerifyCredential from "./pages/VerifyCredential";
import StudentGrants from "./pages/student/Grants"; // Updated path
import RequestVerification from "./pages/RequestVerification";
import EmployerRequests from "./pages/employer/Requests"; // Updated path and name
import EmployerDashboard from "./pages/EmployerDashboard";
import EmployerVerificationDetail from "./pages/EmployerVerificationDetail";
import ApiAndBilling from "./pages/ApiAndBilling";
import StudentRegistry from "./pages/StudentRegistry";
import UniversityDashboard from "./pages/UniversityDashboard";
import AccessLogs from "./pages/AccessLogs";

// Auth Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import MyProfile from "./pages/MyProfile";
import ProtectedRoute from "./components/layout/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes */}

            {/* Student Profile (Student Only) */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/my-profile" element={<MyProfile />} />
              <Route path="/student/grants" element={<StudentGrants />} />
            </Route>

            {/* Registry & Verification (Institute Only) */}
            <Route element={<ProtectedRoute allowedRoles={['institute']} />}>
              <Route path="/registry" element={<StudentRegistry />} />
              <Route path="/access-logs" element={<AccessLogs />} />
              {/* Institute can verify via Registry */}
              <Route path="/verify-credential/:id" element={<EmployerVerificationDetail />} />
              <Route path="/university/dashboard" element={<UniversityDashboard />} />
            </Route>

            {/* Employer Specific */}
            <Route element={<ProtectedRoute allowedRoles={['employer']} />}>
              <Route path="/employer/requests" element={<EmployerRequests />} />
              <Route path="/employer/profile" element={<MyProfile />} /> {/* Reusing Profile for now */}
              <Route path="/request-verification" element={<RequestVerification />} />
            </Route>

            {/* Public/Shared Verification Route (Search Result) */}
            <Route path="/verify/:id" element={<VerifyCredential />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

