import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Products from "./pages/Products";
import Initiatives from "./pages/Initiatives";
import InitiativeDetail from "./pages/InitiativeDetail";
import Signals from "./pages/Signals";
import Settings from "./pages/Settings";
import MonthlySnapshots from "./pages/MonthlySnapshots";
import People from "./pages/People";
import AuditTrail from "./pages/AuditTrail";
import Delegation from "./pages/Delegation";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="/initiatives" element={<ProtectedRoute><Initiatives /></ProtectedRoute>} />
            <Route path="/initiatives/new" element={<ProtectedRoute><InitiativeDetail /></ProtectedRoute>} />
            <Route path="/initiatives/:id" element={<ProtectedRoute><InitiativeDetail /></ProtectedRoute>} />
            <Route path="/delegation" element={<ProtectedRoute requiredRole="manager"><Delegation /></ProtectedRoute>} />
            <Route path="/signals" element={<ProtectedRoute><Signals /></ProtectedRoute>} />
            <Route path="/snapshots" element={<ProtectedRoute><MonthlySnapshots /></ProtectedRoute>} />
            <Route path="/people" element={<ProtectedRoute><People /></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute><AuditTrail /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute requiredRole="admin"><Settings /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
