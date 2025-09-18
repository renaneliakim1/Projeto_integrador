import { useState } from "react";
import EducacaoParticles from "@/components/EducacaoParticles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Eye, EyeOff, User, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Novo componente para termos e condições
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
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [escolaridade, setEscolaridade] = useState("");
  const [foco, setFoco] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Opções de Foco
  const opcoesFoco = ["ENEM", "Lógica", "Direito", "Português", "Matemática", "Programação", "História"];

  // Validação e navegação
  const handleAvancar = () => {
    if (step === 1) {
      if (!aceitouTermos || !name || !email || !password || !confirmPassword) {
        toast({
          title: "Preencha todos os campos e aceite os termos.",
          variant: "destructive",
        });
        return;
      }
      if (password !== confirmPassword) {
        toast({
          title: "Senhas não coincidem",
          description: "As senhas digitadas não são iguais.",
          variant: "destructive",
        });
        return;
      }
      if (password.length < 6) {
        toast({
          title: "Senha muito curta",
          description: "A senha deve ter pelo menos 6 caracteres.",
          variant: "destructive",
        });
        return;
      }
    }
    if (step === 2) {
      if (!escolaridade) {
        toast({
          title: "Selecione sua escolaridade.",
          variant: "destructive",
        });
        return;
      }
      setStep(step + 1);
      return;
    }
    setStep(step + 1);
  };

  const handleVoltar = () => {
    setStep(step - 1);
  };

  const handleCadastro = () => {
    // Simulação de cadastro
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userEducationalLevel', escolaridade);
    localStorage.setItem('userFocus', foco);
    window.dispatchEvent(new Event('user-auth-changed'));
    toast({
      title: "Conta criada com sucesso!",
      description: "Bem vindo ao Skillio! Sua conta foi criada.",
    });
    navigate("/quiz-nivelamento");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <EducacaoParticles />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-growth rounded-full shadow-green-glow">
              <User className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Criar Conta
          </h1>
          <p className="text-muted-foreground mt-2">
            Junte-se ao Skillio e comece a aprender
          </p>
        </div>
        <Card className="p-6 shadow-elevated bg-card/80 backdrop-blur-sm border-border/50 relative">
          {step > 1 && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleVoltar}
              className="absolute top-4  left-4 z-50 bg-background/80 hover:bg-background/90"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {step === 1 && (
            <form className="space-y-6 pt-10" onSubmit={e => {e.preventDefault(); handleAvancar();}}>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Nome </Label>
                <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome completo" className="bg-background/50 border-border/50 focus:border-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu_email@email.com" className="bg-background/50 border-border/50 focus:border-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Senha</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="bg-background/50 border-border/50 focus:border-primary pr-10" />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirmar senha</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirme sua senha" className="bg-background/50 border-border/50 focus:border-primary pr-10" />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <TermosCondicoes />
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="aceitouTermos"
                  checked={aceitouTermos}
                  onChange={e => setAceitouTermos(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-primary rounded border-border/50 focus:ring-2 focus:ring-primary mr-2"
                />
                <Label htmlFor="aceitouTermos" className="text-foreground">Aceito os termos e condições</Label>
              </div>
              <Button type="submit" className="w-full bg-gradient-growth" disabled={!(aceitouTermos && name && email && password && confirmPassword)}>
                Avançar
              </Button>
            </form>
          )}
          {step === 2 && (
            <form className="space-y-6 pt-10" onSubmit={e => {e.preventDefault(); handleAvancar();}}>
              <div className="space-y-2">
                <Label htmlFor="escolaridade" className="text-foreground">Escolaridade</Label>
                <select id="escolaridade" value={escolaridade} onChange={e => setEscolaridade(e.target.value)} className="bg-background/50 border border-border/50 focus:border-primary rounded-md px-3 py-2 w-full text-foreground">
                  <option value="">Selecione</option>
                  <option value="basico">Básico</option>
                  <option value="fundamental">Ensino Fundamental</option>
                  <option value="medio">Ensino Médio</option>
                  <option value="medio">Superior</option>

                </select>
              </div>
              <Button type="submit" className="w-full bg-gradient-growth">Avançar</Button>
            </form>
          )}
          {step === 3 && (
            <form className="space-y-6 pt-10" onSubmit={e => {e.preventDefault(); handleAvancar();}}>
              <div className="space-y-2">
                <Label htmlFor="foco" className="text-foreground">Qual seu foco?</Label>
                <Input id="foco" type="text" value={foco} onChange={e => setFoco(e.target.value)} placeholder="Digite seu foco principal (ex: ENEM, Lógica...)" className="bg-background/50 border-border/50 focus:border-primary" list="opcoesFoco" />
                <datalist id="opcoesFoco">
                  {opcoesFoco.map((s, i) => <option key={i} value={s} />)}
                </datalist>
              </div>
              <Button type="submit" className="w-full bg-gradient-growth">Avançar</Button>
            </form>
          )}
          {step === 4 && (
            <form className="space-y-6 pt-10" onSubmit={e => {e.preventDefault(); handleCadastro();}}>
              <div className="space-y-2">
                <Label htmlFor="foto" className="text-foreground">Foto de perfil</Label>
                <Input id="foto" type="file" accept="image/*" onChange={e => setFoto(e.target.files?.[0] ? URL.createObjectURL(e.target.files[0]) : null)} />
                {foto && <img src={foto} alt="Foto de perfil" className="mt-2 w-24 h-24 rounded-full object-cover mx-auto" />}
              </div>
              <Button type="submit" className="w-full bg-gradient-growth">Finalizar cadastro</Button>
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
