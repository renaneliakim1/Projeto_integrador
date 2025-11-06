
export default function RecaptchaLegalNotice() {
  return (
    <div className="text-xs text-center py-2 px-4 opacity-70 text-muted-foreground">
      Este site é protegido pelo reCAPTCHA e se aplicam a{" "}
      <a 
        href="https://policies.google.com/privacy?hl=pt-BR" 
        target="_blank" 
        rel="noopener noreferrer"
        className="underline hover:text-primary transition-colors"
      >
        Política de Privacidade
      </a>{" "}
      e os{" "}
      <a 
        href="https://policies.google.com/terms?hl=pt-BR" 
        target="_blank" 
        rel="noopener noreferrer"
        className="underline hover:text-primary transition-colors"
      >
        Termos de Serviço
      </a>{" "}
      do Google.
    </div>
  );
}
