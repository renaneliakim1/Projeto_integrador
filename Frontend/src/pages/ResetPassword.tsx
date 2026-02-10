import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BookOpen, Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/api/axios";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Recupera o email do state se vier da página anterior
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleResendCode = async () => {
    /* if (!email) {
      toast({
        title: "Email necessário",
        description: "Por favor, insira seu email.",
        variant: "destructive",
      });
      return;
    } */

    setIsResendingCode(true);
    try {
      await apiClient.post('/auth/resend-code/', {
        email: email.toLowerCase().trim(),
      });

      toast({
        title: "Código reenviado!",
        description: "Verifique seu email novamente.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível reenviar o código. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsResendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

/*     // Validações
    if (!email || !code || !newPassword || !confirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    } */

    if (code.length !== 6) {
      toast({
        title: "Código inválido",
        description: "O código deve ter 6 dígitos.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Senha fraca",
        description: "A senha deve ter no mínimo 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/reset-password/', {
        email: email.toLowerCase().trim(),
        code: code.trim(),
        new_password: newPassword,
      });

      setIsSuccess(true);
      
      toast({
        title: "Senha redefinida!",
        description: response.data.message || "Sua senha foi alterada com sucesso.",
      });

      // Redireciona para o login após 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      let description = "Ocorreu um erro ao redefinir a senha. Tente novamente.";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            status: number; 
            data?: { error?: string; message?: string } 
          } 
        };
        
        if (axiosError.response?.data?.error) {
          description = axiosError.response.data.error;
        } else if (axiosError.response?.data?.message) {
          description = axiosError.response.data.message;
        }
      }
      
      toast({
        title: "Erro",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card className="p-8 shadow-elevated bg-card/80 backdrop-blur-sm border-border/50 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Senha Redefinida!
            </h2>
            <p className="text-muted-foreground mb-6">
              Sua senha foi alterada com sucesso.
              <br />
              Redirecionando para o login...
            </p>
            <Button 
              onClick={() => navigate('/login')}
              className="w-full bg-secondary hover:bg-secondary/90 text-white"
            >
              Ir para o login
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-knowledge rounded-full shadow-glow">
              <Lock className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Redefinir Senha
          </h1>
          <p className="text-muted-foreground mt-2">
            Insira o código recebido por email e sua nova senha
          </p>
        </div>

        <Card className="p-6 shadow-elevated bg-card/80 backdrop-blur-sm border-border/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="bg-background/50 border-border/50 focus:border-primary"
                disabled={isLoading}
                autoComplete="email"
              />
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="code" className="text-foreground">
                Código de Verificação
              </Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="bg-background/50 border-border/50 focus:border-primary text-center text-2xl tracking-widest"
                disabled={isLoading}
                maxLength={6}
                autoComplete="off"
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Código de 6 dígitos enviado para seu email
                </p>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={handleResendCode}
                  disabled={isResendingCode || isLoading}
                  className="text-xs h-auto p-0"
                >
                  {isResendingCode ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Reenviando...
                    </>
                  ) : (
                    'Reenviar código'
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-foreground">
                Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="bg-background/50 border-border/50 focus:border-primary pr-10"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirmar Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="bg-background/50 border-border/50 focus:border-primary pr-10"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-secondary hover:bg-secondary/90 text-white shadow-orange-glow"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Ou</span>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Não recebeu o código?{" "}
                <Link to="/forgot-password" className="text-primary hover:underline font-medium">
                  Solicitar novamente
                </Link>
              </p>
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

export default ResetPassword;
