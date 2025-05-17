import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Jobs from "./pages/Jobs";
import QuickJobs from "./pages/QuickJobs";
import RecruiterDashboard from "./pages/recruiter/Dashboard";
import WorkerDashboard from "./pages/worker/Dashboard";
import WorkerProfile from "./pages/worker/Profile";
import RecruiterProfile from "./pages/recruiter/Profile";
import RequestService from "./pages/RequestService";
import ServiceBids from "./pages/ServiceBids";
import WorkerServiceRequests from "./pages/WorkerServiceRequests";

// Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children, requiredRole }: { children: JSX.Element, requiredRole?: 'worker' | 'recruiter' }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/quick-jobs" element={<QuickJobs />} />
      
      {/* Protected routes */}
      <Route
        path="/worker/dashboard"
        element={
          <ProtectedRoute requiredRole="worker">
            <WorkerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/profile"
        element={
          <ProtectedRoute requiredRole="worker">
            <WorkerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/dashboard"
        element={
          <ProtectedRoute requiredRole="recruiter">
            <RecruiterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/profile"
        element={
          <ProtectedRoute requiredRole="recruiter">
            <RecruiterProfile />
          </ProtectedRoute>
        }
      />
      
      {/* New Quick Service Routes */}
      <Route
        path="/request-service"
        element={
          <ProtectedRoute>
            <RequestService />
          </ProtectedRoute>
        }
      />
      <Route
        path="/service-bids/:requestId"
        element={
          <ProtectedRoute>
            <ServiceBids />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/service-requests"
        element={
          <ProtectedRoute requiredRole="worker">
            <WorkerServiceRequests />
          </ProtectedRoute>
        }
      />
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <AppRoutes />
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
