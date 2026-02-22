import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Loader2, Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/api/axios";
import emailjs from '@emailjs/browser';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira seu email.",
        variant: "destructive",
      });
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Gerar código no backend
      const response = await apiClient.post('/auth/forgot-password/', {
        email: email.toLowerCase().trim(),
      });

      const { code, username } = response.data;

      // Verifica se o backend informou que o email não está cadastrado.
      const backendMessage = (
        response.data?.error || response.data?.message || response.data?.detail || ""
      ).toString();
      const backendLower = backendMessage.toLowerCase();

      if (
        response.data?.success === false ||
        response.data?.exists === false ||
        response.data?.registered === false ||
        backendLower.includes("not found") ||
        backendLower.includes("não encontrado") ||
        backendLower.includes("não cadastrado") ||
        backendLower.includes("user not found")
      ) {
        toast({
          title: "Email não cadastrado",
          description: "O email informado não está cadastrado no sistema.",
          variant: "destructive",
        });
        return;
      }

      // Se o backend não retornou um código válido, interrompe e mostra erro genérico
      if (!code) {
        toast({
          title: "Erro",
          description: "Não foi possível gerar o código de recuperação. Verifique o email digitado e tente novamente.",
          variant: "destructive",
        });
        return;
      }

      // 2. Enviar email usando EmailJS (direto do browser)
      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_d427cse',
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_sen9xx4',
          {
            to_email: email.toLowerCase().trim(),
            to_name: username || 'Usuário',
            reset_code: code,
            message: `Seu código de recuperação de senha é: ${code}\n\nEste código é válido por 10 minutos.`
          },
          import.meta.env.VITE_EMAILJS_USER_ID || 'sNWIk3c3ZX9fB_hHq'
        );

        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada. O código foi enviado para seu email.",
          duration: 6000,
        });
        
        setIsCodeSent(true);
        
        // Redireciona para a página de reset após 3 segundos
        setTimeout(() => {
          navigate('/reset-password', { 
            state: { email: email.toLowerCase().trim() } 
          });
        }, 3000);

      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
        toast({
          title: "Email não enviado",
          description: "Não foi possível enviar o email. Entre em contato com o suporte.",
          variant: "destructive",
        });
      }

    } catch (error) {
      let description = "Ocorreu um erro ao enviar o código. Tente novamente.";

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            status?: number;
            data?: { error?: string; message?: string };
          };
        };

        const status = axiosError.response?.status;
        const data = axiosError.response?.data;
        const messageText = (data?.error || data?.message || "").toString();
        const lower = messageText.toLowerCase();

        // Se o backend retornar 404 ou uma mensagem indicando que o usuário não foi encontrado,
        // exibimos uma mensagem clara de "Email não cadastrado".
        if (
          status === 404 ||
          lower.includes("not found") ||
          lower.includes("não encontrado") ||
          lower.includes("não cadastrado") ||
          lower.includes("user not found")
        ) {
          description = "Email não cadastrado";
        } else if (data?.error) {
          description = data.error;
        } else if (data?.message) {
          description = data.message;
        }
      }

      toast({
        title: description === "Email não cadastrado" ? "Email não cadastrado" : "Erro",
        description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-knowledge rounded-full shadow-glow">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Recuperar Senha
          </h1>
          <p className="text-muted-foreground mt-2">
            Digite seu email para receber o código de recuperação
          </p>
        </div>

        <Card className="p-6 shadow-elevated bg-card/80 backdrop-blur-sm border-border/50">
          {!isCodeSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="bg-background/50 border-border/50 focus:border-primary pl-10"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enviaremos um código de 6 dígitos para este email
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-secondary hover:bg-secondary/90 text-white shadow-orange-glow"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Enviando...' : 'Enviar Código'}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Código Enviado!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Verifique sua caixa de entrada e spam.
                  <br />
                  Redirecionando...
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Ou</span>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Lembrou sua senha?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Fazer login
                </Link>
              </p>
              
              {isCodeSent && (
                <p className="text-sm text-muted-foreground">
                  Já tem o código?{" "}
                  <Link 
                    to="/reset-password" 
                    state={{ email: email.toLowerCase().trim() }}
                    className="text-primary hover:underline font-medium"
                  >
                    Redefinir senha
                  </Link>
                </p>
              )}
            </div>
          </div>
        </Card>

        <div className="text-center mt-6">
          <Link 
            to="/login" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;