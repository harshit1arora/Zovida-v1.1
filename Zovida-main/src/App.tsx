import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import ScanPage from "./pages/ScanPage";
import ResultsPage from "./pages/ResultsPage";
import DoctorsPage from "./pages/DoctorsPage";
import AuthPage from "./pages/AuthPage";
import SOSPage from "./pages/SOSPage";
import FamilyPage from "./pages/FamilyPage";
import HistoryPage from "./pages/HistoryPage";
import PassportPage from "./pages/PassportPage";
import ProfilePage from "./pages/ProfilePage";
import CommunityPage from "./pages/CommunityPage";
import NotFound from "./pages/NotFound";
import ZovidaChatbot from "./components/ZovidaChatbot";
import NetworkStatus from "./components/NetworkStatus";
import ReminderService from "./components/ReminderService";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const userId = localStorage.getItem('zovida_user_id');
  if (!userId) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <NetworkStatus />
          <ReminderService />
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<Index />} />
            <Route path="/scan" element={<ProtectedRoute><ScanPage /></ProtectedRoute>} />
            <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
            <Route path="/doctors" element={<ProtectedRoute><DoctorsPage /></ProtectedRoute>} />
            <Route path="/sos" element={<ProtectedRoute><SOSPage /></ProtectedRoute>} />
            <Route path="/family" element={<ProtectedRoute><FamilyPage /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
            <Route path="/passport/:id" element={<PassportPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ZovidaChatbot />
          <Toaster />
          <Sonner />
        </div>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
