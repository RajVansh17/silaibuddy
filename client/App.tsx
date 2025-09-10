import "./global.css";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import VerifyOtp from "./pages/VerifyOtp";
import { GoogleOAuthProvider } from "@react-oauth/google";

const queryClient = new QueryClient();
const clientId = "YOUR_GOOGLE_CLIENT_ID"; // Replace with your actual Google Client ID

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground">
          <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
              <Link to="/" className="inline-flex items-center gap-2 font-extrabold tracking-tight">
                <span className="text-xl sm:text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Silaibuddy</span>
              </Link>
            </div>
          </header>
          <main>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={"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"}>
    <App />
  </GoogleOAuthProvider>
);