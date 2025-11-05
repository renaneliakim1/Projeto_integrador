import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle } from "lucide-react";
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
import emailjs from 'emailjs-com'; // Make sure to install with: npm install emailjs-com

const Suporte = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");
    if (storedName) {
      setName(storedName);
    }
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleWhatsAppClick = () => {
    const whatsappNumber = "5511999999999";
    const whatsappMessage = "Olá! Preciso de ajuda com o Skillio.";
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, "_blank");
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !message) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, preencha todos os campos para enviar sua mensagem.",
        variant: "destructive",
      });
      return;
    }

    const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
    const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
    const userID = import.meta.env.VITE_EMAILJS_USER_ID as string;

    if (!serviceID || !templateID || !userID) {
      toast({
        title: "Erro de configuração",
        description: "O serviço de email não está configurado corretamente. Por favor, contate o suporte.",
        variant: "destructive",
      });
      return;
    }

    const templateParams = {
      from_name: name,
      from_email: email,
      message: message,
    };

    emailjs.send(serviceID, templateID, templateParams, userID)
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
        toast({
          title: "Email enviado com sucesso!",
          description: "Sua mensagem foi enviada. Entraremos em contato em breve.",
        });
        setIsDialogOpen(false); // Close the dialog on success
        setMessage(""); // Clear the message
      })
      .catch((err) => {
        console.error('FAILED...', err);
        toast({
          title: "Erro ao enviar email",
          description: "Ocorreu um erro. Por favor, tente novamente ou use o WhatsApp.",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-primary bg-clip-text text-transparent">
            Suporte ao Usuário
          </CardTitle>
          <CardDescription className="text-center text-lg text-muted-foreground pt-2">
            Precisa de ajuda? Entre em contato conosco.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 pt-6">
          <p className="text-center text-muted-foreground">
            Se você encontrou um problema, tem alguma dúvida ou sugestão, nossa equipe está pronta para ajudar. Escolha um dos canais de comunicação abaixo:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full h-24 text-lg bg-secondary hover:bg-secondary/90 text-white shadow-orange-glow">
                  <Mail className="mr-3 h-8 w-8" />
                  Enviar Email
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-card/80 backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle>Contato por Email</DialogTitle>
                  <DialogDescription>
                    Preencha os campos abaixo para nos enviar uma mensagem.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSendEmail}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Nome
                      </Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="message" className="text-right">
                        Mensagem
                      </Label>
                      <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} className="col-span-3" placeholder="Digite sua mensagem aqui..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">
                        Cancelar
                      </Button>
                    </DialogClose>
                    <Button type="submit">Enviar Mensagem</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              onClick={handleWhatsAppClick}
              className="w-full h-24 text-lg bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-white shadow-lg shadow-cyan-glow/20"
            >
              <MessageCircle className="mr-3 h-8 w-8" />
              Chamar no WhatsApp
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground pt-4">
            Nosso horário de atendimento é de segunda a sexta, das 9h às 18h.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Suporte;