import { useState, useEffect } from "react";
import EducacaoParticles from "@/components/EducacaoParticles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnimatedDatePicker } from "@/components/ui/AnimatedDatePicker";
import { Separator } from "@/components/ui/separator";

const EditProfile = () => {
  // State for profile info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [escolaridade, setEscolaridade] = useState("");
  const [dataNascimento, setDataNascimento] = useState<Date>();
  const [profissao, setProfissao] = useState("");
  const [foco, setFoco] = useState("");
  const [foto, setFoto] = useState<string | null>(null);

  // State for password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const opcoesFoco = ["ENEM", "Lógica", "Direito", "Português", "Matemática", "Programação", "História"];

  useEffect(() => {
    // Load existing user data
    setName(localStorage.getItem('userName') || '');
    setEmail(localStorage.getItem('userEmail') || '');
    setEscolaridade(localStorage.getItem('userEducationalLevel') || '');
    const birthDateISO = localStorage.getItem('userBirthDate');
    if (birthDateISO) {
      setDataNascimento(new Date(birthDateISO));
    }
    setProfissao(localStorage.getItem('userProfession') || '');
    setFoco(localStorage.getItem('userFocus') || '');
    setFoto(localStorage.getItem('userPhoto') || null);
  }, []);

  const handleSave = () => {
    // --- Lógica de Alteração de Senha ---
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast({
          title: "Erro ao alterar senha",
          description: "Por favor, preencha todos os três campos de senha para alterá-la.",
          variant: "destructive",
        });
        return; // Impede o salvamento do resto do perfil se a senha estiver incompleta
      }

      if (newPassword !== confirmPassword) {
        toast({
          title: "Erro",
          description: "A nova senha e a confirmação não são iguais.",
          variant: "destructive",
        });
        return;
      }

      if (newPassword.length < 6) {
        toast({
          title: "Erro",
          description: "A nova senha deve ter pelo menos 6 caracteres.",
          variant: "destructive",
        });
        return;
      }
      
      // Lógica para alterar a senha (ex: chamada de API)
      console.log("Alterando a senha...");
      // Se a alteração de senha for bem-sucedida, pode continuar para salvar o perfil
    }

    // --- Lógica para Salvar Informações do Perfil ---
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userEducationalLevel', escolaridade);
    localStorage.setItem('userBirthDate', dataNascimento ? dataNascimento.toISOString() : '');
    localStorage.setItem('userProfession', profissao);
    localStorage.setItem('userFocus', foco);
    if (foto) {
      localStorage.setItem('userPhoto', foto);
    }

    toast({
      title: "Perfil atualizado com sucesso!",
      description: "Suas informações foram salvas.",
    });
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative overflow-hidden">
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
            Editar Perfil
          </h1>
          <p className="text-muted-foreground mt-2">
            Atualize suas informações pessoais ou altere sua senha.
          </p>
        </div>
        <Card className="p-6 shadow-elevated bg-card/80 backdrop-blur-sm border-border/50 relative">
          <Link to="/profile">
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 left-4 z-50 bg-background/80 hover:bg-background/90"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <form className="space-y-6 pt-10" onSubmit={e => {e.preventDefault(); handleSave();}}>
            {/* --- Seção de Informações Pessoais --- */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Nome</Label>
              <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome completo" className="bg-background/50 border-border/50 focus:border-primary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu_email@email.com" className="bg-background/50 border-border/50 focus:border-primary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="escolaridade" className="text-foreground">Escolaridade</Label>
              <select id="escolaridade" value={escolaridade} onChange={e => setEscolaridade(e.target.value)} className="bg-background/50 border border-border/50 focus:border-primary rounded-md px-3 py-2 w-full text-foreground">
                <option value="">Selecione</option>
                <option value="basico">Básico</option>
                <option value="fundamental">Ensino Fundamental</option>
                <option value="medio">Ensino Médio</option>
                <option value="superior">Superior</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Data de Nascimento</Label>
              <AnimatedDatePicker
                  date={dataNascimento}
                  onSelect={setDataNascimento}
                  minYear={1950}
                  maxYear={new Date().getFullYear()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profissao" className="text-foreground">Profissão <span className="text-muted-foreground">(Opcional)</span></Label>
              <Input id="profissao" type="text" value={profissao} onChange={e => setProfissao(e.target.value)} placeholder="Sua profissão" className="bg-background/50 border-border/50 focus:border-primary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="foco" className="text-foreground">Qual seu foco?</Label>
              <Input id="foco" type="text" value={foco} onChange={e => setFoco(e.target.value)} placeholder="Digite seu foco principal (ex: ENEM, Lógica...)" className="bg-background/50 border-border/50 focus:border-primary" list="opcoesFoco" />
              <datalist id="opcoesFoco">
                {opcoesFoco.map((s, i) => <option key={i} value={s} />)}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="foto" className="text-foreground">Foto de perfil</Label>
              <Input id="foto" type="file" accept="image/*" onChange={e => setFoto(e.target.files?.[0] ? URL.createObjectURL(e.target.files[0]) : null)} />
              {foto && <img src={foto} alt="Foto de perfil" className="mt-2 w-24 h-24 rounded-full object-cover mx-auto" />}
            </div>

            <Separator className="my-8 bg-border/50" />

            {/* --- Seção de Alteração de Senha --- */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-center">Alterar Senha </h3>
                    <p className="text-sm text-muted-foreground text-center">Preencha os campos abaixo apenas se desejar alterar sua senha.</p>
                </div>
                <div className="space-y-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <div className="relative">
                    <Input 
                    id="current-password" 
                    type={showCurrentPassword ? "text" : "password"} 
                    value={currentPassword} 
                    onChange={e => setCurrentPassword(e.target.value)} 
                    className="bg-background/50 border-border/50 focus:border-primary"
                    />
                    <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                    {showCurrentPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                    </Button>
                </div>
                </div>
                <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <div className="relative">
                    <Input 
                    id="new-password" 
                    type={showNewPassword ? "text" : "password"} 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    className="bg-background/50 border-border/50 focus:border-primary"
                    />
                    <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3" onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                    </Button>
                </div>
                </div>
                <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <div className="relative">
                    <Input 
                    id="confirm-password" 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    className="bg-background/50 border-border/50 focus:border-primary"
                    />
                    <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                    </Button>
                </div>
                </div>
            </div>

            <Button type="submit" className="w-full bg-gradient-growth">Salvar Alterações</Button>
          </form>
        </Card>
        <div className="text-center mt-6">
          <Link to="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">← Voltar para o Perfil</Link>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
