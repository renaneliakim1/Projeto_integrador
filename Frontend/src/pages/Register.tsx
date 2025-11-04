import { useState } from "react";
import EducacaoParticles from "@/components/EducacaoParticles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnimatedDatePicker } from "@/components/ui/AnimatedDatePicker";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/api/axios";

export const TermosCondicoes = () => (
  <div className="mb-4">
    <p className="text-sm text-muted-foreground">
      Ao criar uma conta, você concorda com nossos
      <Link to="/termos-condicoes" className="text-primary hover:underline ml-1">Termos e Condições</Link>.
    </p>
  </div>
);

const Register = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [escolaridade, setEscolaridade] = useState("");
  const [dataNascimento, setDataNascimento] = useState<Date>();
  const [profissao, setProfissao] = useState("");
  const [foco, setFoco] = useState("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const opcoesFoco = ["ENEM", "Lógica", "Direito", "Português", "Matemática", "Programação", "História"];

  const handleAvancar = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!aceitouTermos || !name || !email || !password || !confirmPassword) {
        toast({ title: "Preencha todos os campos e aceite os termos.", variant: "destructive" });
        return;
      }
      if (password !== confirmPassword) {
        toast({ title: "Senhas não coincidem", variant: "destructive" });
        return;
      }
      if (password.length < 8) {
        toast({ title: "Senha muito curta", description: "A senha deve ter pelo menos 8 caracteres.", variant: "destructive" });
        return;
      }
    }
    if (step === 2) {
      if (!escolaridade || !dataNascimento) {
        toast({ title: "Preencha sua escolaridade e data de nascimento.", variant: "destructive" });
        return;
      }
    }
    setStep(step + 1);
  };

  const handleVoltar = () => setStep(step - 1);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('first_name', name);
    // Agrupando os dados do perfil para o serializer aninhado
    formData.append('terms_accepted', String(aceitouTermos));
    if (dataNascimento) formData.append('birth_date', dataNascimento.toISOString().split('T')[0]);
    if (escolaridade) formData.append('educational_level', escolaridade);
    if (profissao) formData.append('profession', profissao);
    if (foco) formData.append('focus', foco);
    if (fotoFile) formData.append('foto', fotoFile);

    try {
      const response = await apiClient.post('/users/register/', formData, {
        headers: {
          // Força o Content-Type para multipart/form-data para sobrescrever qualquer padrão global do axios.
          'Content-Type': 'multipart/form-data',
        },
      });

      const { access, refresh } = response.data;
      login(access, refresh);
      
      // Marca que o usuário acabou de se cadastrar para limpar caches antigos
      sessionStorage.setItem('justRegistered', 'true');

      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao Skillio!",
      });
      navigate("/quiz-nivelamento");

    } catch (error) {
      let description = "Ocorreu um erro inesperado. Tente novamente.";
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: Record<string, string | string[]> } };
        if (axiosError.response?.data) {
          try {
            // Tenta extrair a mensagem de erro do DRF
            const errors = axiosError.response.data;
            const errorKey = Object.keys(errors)[0];
            const errorMessages = errors[errorKey];
            // Se for um erro de validação, será um array.
            // Se for um erro de unicidade (como email duplicado), pode ser uma string.
            const message = Array.isArray(errorMessages) ? errorMessages[0] : errorMessages;
            // O DRF retorna "user with this email already exists."
            description = message.replace("user with this email already exists.", "Já existe uma conta com este e-mail.");
          } catch {
            description = "Não foi possível processar o erro retornado pelo servidor."
          }
        }
      }
      toast({
        title: "Erro no cadastro",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none"><EducacaoParticles /></div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-wisdom rounded-full shadow-orange-glow"><User className="h-8 w-8 text-white" /></div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">Criar Conta</h1>
          <p className="text-muted-foreground mt-2">Junte-se ao Skillio e comece a aprender</p>
        </div>
        <Card className="p-6 shadow-elevated bg-card/80 backdrop-blur-sm border-border/50 relative">
          {step > 1 && (
            <Button variant="outline" size="icon" onClick={handleVoltar} className="absolute top-4 left-4 z-50 bg-background/80 hover:bg-background/90" disabled={isLoading}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          {step === 1 && (
            <form className="space-y-6 pt-10" onSubmit={handleAvancar}>
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome completo" disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu_email@email.com" disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" disabled={isLoading} />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}><EyeOff className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirme sua senha" disabled={isLoading} />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isLoading}><EyeOff className="h-4 w-4" /></Button>
                </div>
              </div>
              <TermosCondicoes />
              <div className="flex items-center mb-2">
                <input type="checkbox" id="aceitouTermos" checked={aceitouTermos} onChange={e => setAceitouTermos(e.target.checked)} className="form-checkbox h-5 w-5 text-primary rounded border-border/50 focus:ring-2 focus:ring-primary mr-2" disabled={isLoading} />
                <Label htmlFor="aceitouTermos">Aceito os termos e condições</Label>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || !(aceitouTermos && name && email && password && confirmPassword)}>Avançar</Button>
              <div className="text-center mt-4"><p className="text-sm text-muted-foreground">Já possui conta? <Link to="/login" className="text-primary hover:underline">Login</Link></p></div>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-6 pt-10" onSubmit={handleAvancar}>
              <div className="space-y-2">
                <Label htmlFor="escolaridade">Escolaridade</Label>
                <select id="escolaridade" value={escolaridade} onChange={e => setEscolaridade(e.target.value)} className="bg-background/50 border border-border/50 focus:border-primary rounded-md px-3 py-2 w-full text-foreground" disabled={isLoading}>
                  <option value="">Selecione</option>
                  <option value="basico">Básico</option>
                  <option value="fundamental">Ensino Fundamental</option>
                  <option value="medio">Ensino Médio</option>
                  <option value="superior">Superior</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Data de Nascimento</Label>
                <AnimatedDatePicker date={dataNascimento} onSelect={setDataNascimento} minYear={1950} maxYear={new Date().getFullYear()} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profissao">Profissão <span className="text-muted-foreground">(Opcional)</span></Label>
                <Input id="profissao" type="text" value={profissao} onChange={e => setProfissao(e.target.value)} placeholder="Sua profissão" disabled={isLoading} />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>Avançar</Button>
            </form>
          )}

          {step === 3 && (
            <form className="space-y-6 pt-10" onSubmit={handleAvancar}>
              <div className="space-y-2">
                <Label htmlFor="foco">Qual seu foco?</Label>
                <Input id="foco" type="text" value={foco} onChange={e => setFoco(e.target.value)} placeholder="Digite seu foco principal (ex: ENEM, Lógica...)" list="opcoesFoco" disabled={isLoading} />
                <datalist id="opcoesFoco">{opcoesFoco.map((s, i) => <option key={i} value={s} />)}</datalist>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>Avançar</Button>
            </form>
          )}

          {step === 4 && (
            <form className="space-y-6 pt-10" onSubmit={handleCadastro}>
              <div className="space-y-2">
                <Label htmlFor="foto">Foto de perfil (Opcional)</Label>
                <Input id="foto" type="file" accept="image/*" onChange={handleFotoChange} disabled={isLoading} />
                {fotoPreview && <img src={fotoPreview} alt="Preview" className="mt-2 w-24 h-24 rounded-full object-cover mx-auto" />}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Finalizando...' : 'Finalizar Cadastro'}
              </Button>
            </form>
          )}
        </Card>
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">← Voltar para o início</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;