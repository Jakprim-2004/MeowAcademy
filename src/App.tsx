import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RateReview from "./pages/RateReview";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ReviewManagement from "./pages/ReviewManagement";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OrderStatus from "./pages/OrderStatus";


const queryClient = new QueryClient();

const App = () => {
  // Global Meow Sound Effect 🐱🔊
  useEffect(() => {
    const playMeow = () => {
      try {
        const audio = new Audio("/sounds/meow.mp3");
        audio.volume = 0.3; // Volume level

        const playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Silence autoplay errors
          });
        }
      } catch (error) {
        // Ignore errors
      }
    };

    window.addEventListener("click", playMeow);
    return () => window.removeEventListener("click", playMeow);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/reviews" element={<ReviewManagement />} />
            <Route path="/order-status" element={<OrderStatus />} />
            <Route path="/rate-review/:orderId" element={<RateReview />} />
            <Route path="/review/:token" element={<RateReview />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
