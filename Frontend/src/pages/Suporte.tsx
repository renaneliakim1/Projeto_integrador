import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Send, User, ArrowLeft, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import emailjs from 'emailjs-com';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { motion } from "framer-motion";

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_USER_ID = import.meta.env.VITE_EMAILJS_USER_ID;

const Suporte = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { executeRecaptcha } = useGoogleReCaptcha();

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");
    if (storedName) setName(storedName);
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const handleWhatsAppClick = () => {
    const whatsappNumber = "5511999999999";
    const whatsappMessage = "Olá! Preciso de ajuda com o Skillio.";
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, "_blank");
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !message) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, preencha todos os campos para enviar sua mensagem.",
        variant: "destructive",
      });
      return;
    }

    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_USER_ID) {
      toast({
        title: "Erro de configuração",
        description: "O serviço de email não está configurado. Por favor, contate o suporte.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      let token = '';
      
      // Tenta executar o reCAPTCHA se disponível
      if (executeRecaptcha) {
        try {
          token = await executeRecaptcha('contact_form');
        } catch (recaptchaError) {
          console.warn('reCAPTCHA não disponível, enviando sem token:', recaptchaError);
        }
      }

      const templateParams = {
        from_name: name,
        from_email: email,
        message: message,
        'g-recaptcha-response': token,
      };

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_USER_ID);
      
      toast({
        title: "Email enviado! 📧",
        description: "Sua mensagem foi enviada com sucesso. Retornaremos em breve!",
        className: "bg-gradient-growth text-white border-none",
      });
      
      setIsDialogOpen(false);
      setMessage("");
      setName("");
      setEmail("");
    } catch (err) {
      console.error('Erro ao enviar email:', err);
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro. Tente novamente ou use o WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 border-primary/10 shadow-2xl bg-card/95 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="flex justify-center">
                <div className="p-4 bg-gradient-primary rounded-full">
                  <MessageCircle className="h-12 w-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Central de Suporte
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Estamos aqui para ajudar! Escolha a melhor forma de contato.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 pb-8">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                <p className="text-center text-muted-foreground leading-relaxed">
                  Tem alguma dúvida, sugestão ou encontrou algum problema? 
                  Nossa equipe está pronta para te auxiliar da melhor forma possível.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Card */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="h-full">
                      <Card className="h-full cursor-pointer border-2 border-secondary/50 hover:border-secondary transition-all duration-300 shadow-lg hover:shadow-orange-glow/20 bg-gradient-to-br from-secondary/10 to-secondary/5">
                        <CardContent className="flex flex-col items-center justify-between p-8 space-y-4 h-full min-h-[320px]">
                          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                            <div className="p-4 bg-secondary/20 rounded-full">
                              <svg className="h-10 w-10 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                              </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-foreground">Email</h3>
                            <p className="text-center text-sm text-muted-foreground flex-1 flex items-center">
                              Envie uma mensagem detalhada e receba resposta em breve
                            </p>
                          </div>
                          <Button className="w-full bg-secondary hover:bg-secondary/90 text-white">
                            Abrir Formulário
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[500px] bg-card border-2 border-primary/20">
                    <DialogHeader className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary/20 rounded-lg">
                          <Mail className="h-6 w-6 text-secondary" />
                        </div>
                        <DialogTitle className="text-2xl">Contato por Email</DialogTitle>
                      </div>
                      <DialogDescription className="text-base">
                        Preencha o formulário abaixo e retornaremos o mais rápido possível.
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSendEmail} className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Nome Completo
                          </Label>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Seu nome"
                            className="h-11"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu.email@exemplo.com"
                            className="h-11"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message" className="text-sm font-medium flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            Mensagem
                          </Label>
                          <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Descreva sua dúvida, problema ou sugestão..."
                            className="min-h-[120px] resize-none"
                            required
                          />
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg">
                          <Shield className="h-4 w-4 text-primary" />
                          <span>Suas informações estão protegidas e seguras com reCAPTCHA v3.</span>
                        </div>
                      </div>

                      <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                          <Button type="button" variant="outline" disabled={isSending}>
                            Cancelar
                          </Button>
                        </DialogClose>
                        <Button
                          type="submit"
                          disabled={isSending}
                          className="bg-secondary hover:bg-secondary/90 text-white"
                        >
                          {isSending ? (
                            <>
                              <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Enviar Mensagem
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* WhatsApp Card */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="h-full">
                  <Card
                    onClick={handleWhatsAppClick}
                    className="h-full cursor-pointer border-2 border-green-500/50 hover:border-green-500 transition-all duration-300 shadow-lg hover:shadow-green-500/20 bg-gradient-to-br from-green-500/10 to-green-500/5"
                  >
                    <CardContent className="flex flex-col items-center justify-between p-8 space-y-4 h-full min-h-[320px]">
                      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <div className="p-4 bg-green-500/20 rounded-full">
                          <svg className="h-10 w-10 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">WhatsApp</h3>
                        <p className="text-center text-sm text-muted-foreground flex-1 flex items-center">
                          Fale conosco agora e obtenha resposta rápida
                        </p>
                      </div>
                      <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                        Abrir WhatsApp
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 rounded-lg p-6 text-center space-y-2">
                <p className="font-semibold text-foreground">Horário de Atendimento</p>
                <p className="text-sm text-muted-foreground">
                  Segunda a Sexta: <span className="font-medium text-foreground">9h às 18h</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Mensagens enviadas fora do horário serão respondidas no próximo dia útil.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Suporte;