import FloatingTrilhaButton from "@/components/FloatingTrilhaButton";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { PWAPrompt } from "@/components/PWAPrompt";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GamificationProvider } from "@/hooks/useGamification";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import RecaptchaLegalNotice from "./components/RecaptchaLegalNotice";
import TermosCondicoesDetalhado from "./components/TermosCondicoesDetalhado";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import EditProfile from "./pages/EditProfile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Game from "./pages/Game";
import Index from "./pages/Index";
import Lesson from "./pages/Lesson";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import QuickQuiz from "./pages/QuickQuiz";
import QuizNivelamento from "./pages/QuizNivelamento";
import Ranking from "./pages/Ranking";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import StudyPlan from "./pages/StudyPlan";
import Subjects from "./pages/Subjects";
import Suporte from "./pages/Suporte";
import Trilha from "./pages/Trilha";

const queryClient = new QueryClient();

// Substitua esta chave pela sua chave do Google reCAPTCHA v3
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "YOUR_RECAPTCHA_SITE_KEY";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PWAPrompt />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <GamificationProvider>
            <Header />
            <FloatingTrilhaButton />
            <div className="min-h-screen flex flex-col justify-between pt-20">
              <main className="flex-1">
                <Routes>
                  {/* Rotas Públicas */}
                  <Route path="/" element={<Index />} />
                  <Route path="/subjects" element={<Subjects />} />
                  <Route path="/ranking" element={<Ranking />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/termos-condicoes" element={<TermosCondicoesDetalhado />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/suporte" element={<Suporte />} />
                  
                  {/* Rotas Protegidas - Requerem Autenticação */}
                  <Route element={<PrivateRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/trilha" element={<Trilha />} />
                    <Route path="/lesson/:subjectId" element={<Lesson />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/:userId" element={<PublicProfile />} />
                    <Route path="/edit-profile" element={<EditProfile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/quiz-nivelamento" element={<QuizNivelamento />} />
                    <Route path="/quiz-rapido" element={<QuickQuiz />} />
                    <Route path="/study-plan" element={<StudyPlan />} />
                    <Route path="/game/:blocoId" element={<Game />} />
                  </Route>
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <RecaptchaLegalNotice />
              <Footer />
            </div>
          </GamificationProvider>
        </BrowserRouter>
      </TooltipProvider>
    </GoogleReCaptchaProvider>
  </QueryClientProvider>
);

export default App;