import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Subjects from "./pages/Subjects";
import Game from "./pages/Game";
import Profile from "./pages/Profile";
import Ranking from "./pages/Ranking";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import TermosCondicoesDetalhado from "./components/TermosCondicoesDetalhado";
import Header from "@/components/Header";
import Dashboard from "./pages/Dashboard";
import QuizNivelamento from "./pages/QuizNivelamento";
import Footer from "@/components/Footer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Header />
        <div className="min-h-screen flex flex-col justify-between">
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/game/:subjectId" element={<Game />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/ranking" element={<Ranking />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/termos-condicoes" element={<TermosCondicoesDetalhado />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/about" element={<About />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/quiz-nivelamento" element={<QuizNivelamento />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
