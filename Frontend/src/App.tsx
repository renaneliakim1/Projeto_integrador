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
import Suporte from "./pages/Suporte";
import Lesson from "./pages/Lesson";
import EditProfile from "./pages/EditProfile";
import StudyPlan from "./pages/StudyPlan";
import Trilha from "./pages/Trilha";
import QuickQuiz from "./pages/QuickQuiz";
import PublicProfile from "./pages/PublicProfile";
import PrivateRoute from "./components/PrivateRoute";
import { GamificationProvider } from "@/hooks/useGamification";
import FloatingTrilhaButton from "@/components/FloatingTrilhaButton";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <GamificationProvider>
          <Header />
          <FloatingTrilhaButton />
          <div className="min-h-screen flex flex-col justify-between pt-20">
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/trilha" element={<Trilha />} />
                <Route path="/subjects" element={<Subjects />} />
                <Route path="/game/:blocoId" element={<Game />} />
                <Route path="/lesson/:subjectId" element={<Lesson />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:userId" element={<PublicProfile />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/termos-condicoes" element={<TermosCondicoesDetalhado />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/about" element={<About />} />
                <Route path="/quiz-nivelamento" element={<QuizNivelamento />} />
                <Route path="/quiz-rapido" element={<QuickQuiz />} />
                <Route path="/suporte" element={<Suporte />} />
                <Route path="/study-plan" element={<StudyPlan />} />
                <Route element={<PrivateRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                </Route>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </GamificationProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;