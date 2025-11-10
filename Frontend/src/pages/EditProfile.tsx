import apiClient from '@/api/axios';
import EducacaoParticles from "@/components/EducacaoParticles";
import { AnimatedDatePicker } from "@/components/ui/AnimatedDatePicker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, EyeOff, Loader2, Trash2, User } from 'lucide-react';
import { useEffect, useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Link, useNavigate } from 'react-router-dom';

// Tipagem para os dados que esperamos do backend
interface UserProfileData {
  birth_date: string;
  educational_level: string;
  profession: string;
  focus: string;
  foto: string | null;
}
interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  profile: UserProfileData;
}

const EditProfile = () => {
  // State for profile info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [escolaridade, setEscolaridade] = useState("");
  const [dataNascimento, setDataNascimento] = useState<Date>();
  const [profissao, setProfissao] = useState("");
  const [foco, setFoco] = useState("");
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<string | null>(null);

  // State for password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuth();
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAccountDeleted, setIsAccountDeleted] = useState(false);

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast({ title: 'Senha necessária', description: 'Digite sua senha para confirmar a exclusão.', variant: 'destructive' });
      return;
    }

    setIsDeleting(true);

    try {
      let recaptchaToken = '';
      
      // Tenta executar o reCAPTCHA se disponível
      if (executeRecaptcha) {
        try {
          recaptchaToken = await executeRecaptcha('delete_account');
          console.log('reCAPTCHA token gerado para exclusão:', recaptchaToken);
        } catch (recaptchaError) {
          console.warn('reCAPTCHA não disponível, excluindo sem token:', recaptchaError);
        }
      }

      await apiClient.post('/users/me/delete-account/', { password: deletePassword });
      setIsAccountDeleted(true);
      toast({ title: 'conta desativada', description: 'Sua conta e dados foram removidos.', variant: 'default' });
      logout();
      navigate('/');
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = err as any;
      console.error('Erro ao apagar conta', e);
      const message = e?.response?.data?.detail || 'Falha ao apagar conta. Verifique sua senha.';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeletePassword('');
    }
  };

  const opcoesFoco = ["ENEM", "Lógica", "Direito", "Português", "Matemática", "Programação", "História"];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get<UserData>('/users/me/');
        const { data } = response;
        setName(data.first_name);
        setEmail(data.email);
        setEscolaridade(data.profile.educational_level || '');
        if (data.profile.birth_date) {
          // Adiciona um dia para corrigir problemas de fuso horário na conversão
          const date = new Date(data.profile.birth_date);
          date.setUTCDate(date.getUTCDate() + 1);
          setDataNascimento(date);
        }
        setProfissao(data.profile.profession || '');
        setFoco(data.profile.focus || '');
        setFotoPreview(data.profile.foto);
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        if (!isAccountDeleted) {
          toast({ title: "Erro ao carregar perfil", description: "Faça o login novamente.", variant: "destructive" });
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [logout, toast, isAccountDeleted]);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setFotoFile(base64);  // Now storing base64 string
        setFotoPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    let recaptchaToken = '';
    
    // Tenta executar o reCAPTCHA se disponível
    if (executeRecaptcha) {
      try {
        recaptchaToken = await executeRecaptcha('edit_profile');
        console.log('reCAPTCHA token gerado:', recaptchaToken);
      } catch (recaptchaError) {
        console.warn('reCAPTCHA não disponível, salvando sem token:', recaptchaError);
      }
    }

    const formData = new FormData();
    formData.append('first_name', name);
    formData.append('email', email);
    if (dataNascimento) {
      formData.append('profile.birth_date', dataNascimento.toISOString().split('T')[0]);
    }
    formData.append('profile.educational_level', escolaridade);
    formData.append('profile.profession', profissao);
    formData.append('profile.focus', foco);
    if (fotoFile) {
      formData.append('profile.foto', fotoFile);
    }

    // Log para depuração
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    // --- Lógica de Alteração de Senha ---
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast({
          title: "Erro ao alterar senha",
          description: "Por favor, preencha todos os três campos de senha para alterá-la.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        toast({
          title: "Erro",
          description: "A nova senha e a confirmação não são iguais.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        toast({
          title: "Erro",
          description: "A nova senha deve ter pelo menos 6 caracteres.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      try {
        await apiClient.post('/auth/password/change/', {
          new_password1: newPassword,
          new_password2: confirmPassword,
        });
        toast({
          title: "Senha alterada com sucesso!",
          description: "Sua senha foi atualizada.",
        });
        // Limpa os campos de senha após a alteração
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } catch (error) {
        console.error("Erro ao alterar a senha:", error);
        const axiosError = error as { response?: { data?: { detail?: string } } };
        const errorMessage = axiosError.response?.data?.detail || "Ocorreu um erro desconhecido.";
        toast({
          title: "Erro ao alterar a senha",
          description: errorMessage,
          variant: "destructive",
        });
        setIsLoading(false);
        return; // Para a execução se a senha falhar
      }
    }

    // --- Lógica para Salvar Informações do Perfil ---
    try {
      const { data } = await apiClient.patch<UserData>('/users/me/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Atualiza o estado local com os novos dados (opcional, mas bom para consistência)
      setName(data.first_name);
      setEmail(data.email);
      setEscolaridade(data.profile.educational_level || '');
      if (data.profile.birth_date) {
        const date = new Date(data.profile.birth_date);
        date.setUTCDate(date.getUTCDate() + 1);
        setDataNascimento(date);
      }
      setProfissao(data.profile.profession || '');
      setFoco(data.profile.focus || '');
      setFotoPreview(data.profile.foto);


      toast({
        title: "Perfil atualizado com sucesso!",
        description: "Suas informações foram salvas.",
      });
      
      // Notifica Profile.tsx para atualizar os dados
      window.dispatchEvent(new CustomEvent('app:data:updated', { detail: { type: 'profile' } }));
      
      navigate("/profile");

    } catch (error) {
      console.error("Erro ao salvar o perfil:", error);
      const axiosError = error as { response?: { data?: Record<string, string | string[]> } };
      const errorData = axiosError.response?.data;
      let description = "Ocorreu um erro desconhecido.";
      if (errorData) {
        // Pega a primeira chave de erro (ex: 'email', 'profile.focus')
        const firstErrorKey = Object.keys(errorData)[0];
        if (firstErrorKey) {
          description = `${firstErrorKey}: ${errorData[firstErrorKey]}`;
        }
      }
      toast({
        title: "Erro ao salvar perfil",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <EducacaoParticles />
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <EducacaoParticles />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-wisdom rounded-full shadow-orange-glow">
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
              <Label htmlFor="foto" className="text-foreground">Foto de perfil (Opcional)</Label>
              <Input id="foto" type="file" accept="image/*" onChange={handleFotoChange} className="bg-background/50 border-border/50 focus:border-primary" />
              {fotoPreview && (
                <div className="mt-4 flex justify-center">
                  <img 
                    src={fotoPreview} 
                    alt="Preview da foto de perfil" 
                    className="w-48 h-28 rounded-full object-cover border-4 border-primary/20 shadow-lg" 
                  />
                </div>
              )}
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

            <Button type="submit" className="w-full">Salvar Alterações</Button>
          </form>
        </Card>
        <div className="mt-6 space-y-4">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 bg-red-600 text-white hover:bg-red-700 focus:outline-none"
          >
            <Trash2 className="h-4 w-4" /> Apagar conta
          </button>

          <div className="text-center">
            <Link to="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">← Voltar para o Perfil</Link>
          </div>
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
              <Card className="sm:max-w-[425px] w-full mx-auto bg-card/80 backdrop-blur-sm p-6 sm:p-8 shadow-elevated border-border/50 overflow-hidden">
                <div>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 bg-red-50 text-red-600 rounded-full p-3">
                      <Trash2 className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">Apagar conta</h3>
                      <p className="text-sm text-muted-foreground mt-1">Digite sua senha para confirmar a exclusão permanente da sua conta.</p>
                      <p className="text-sm font-semibold text-red-600 mt-2">Essa ação é irreversível.</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="delete-password" className="block text-sm font-medium text-foreground mb-2">Senha</Label>
                    <div className="relative">
                      <Input
                        id="delete-password"
                        type={showDeletePassword ? "text" : "password"}
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Digite sua senha"
                        className="bg-background/50 border-border/50"
                      />
                      <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3" onClick={() => setShowDeletePassword(!showDeletePassword)}>
                        {showDeletePassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || !deletePassword}
                      className="inline-flex items-center"
                    >
                      {isDeleting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                      Apagar conta
                    </Button>
                  </div>
                </div>
              </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfile;