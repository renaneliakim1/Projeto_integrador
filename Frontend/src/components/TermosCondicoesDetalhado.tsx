import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TermosCondicoesDetalhado: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl">
        <Card className="p-8 shadow-elevated bg-card/80 backdrop-blur-sm border-border/50">
          <h1 className="text-2xl font-bold mb-4 text-primary">Termos e Condições</h1>
          <p className="mb-4 text-muted-foreground">
            Bem-vindo à plataforma EdGame! Ao utilizar nossos serviços, você concorda com os seguintes termos e condições:
          </p>
          <ul className="list-disc pl-6 mb-4 text-foreground space-y-2">
            <li><strong>Uso da Plataforma:</strong> O usuário deve utilizar a plataforma de forma ética, respeitando outros usuários e as regras de conduta estabelecidas.</li>
            <li><strong>Proteção de Dados:</strong> Seus dados pessoais são coletados apenas para fins de cadastro, personalização da experiência e melhoria dos serviços. Não compartilhamos seus dados com terceiros sem consentimento.</li>
            <li><strong>LGPD:</strong> Seguimos a Lei Geral de Proteção de Dados (LGPD). Você pode solicitar a exclusão, correção ou acesso aos seus dados a qualquer momento.</li>
            <li><strong>Segurança:</strong> Adotamos medidas de segurança para proteger suas informações, mas recomendamos que você mantenha sua senha segura e não compartilhe com terceiros.</li>
            <li><strong>Conteúdo:</strong> É proibido publicar conteúdo ofensivo, ilegal ou que viole direitos autorais. O descumprimento pode resultar em suspensão ou exclusão da conta.</li>
            <li><strong>Responsabilidade:</strong> A EdGame não se responsabiliza por danos causados por uso indevido da plataforma ou por informações fornecidas por terceiros.</li>
            <li><strong>Atualizações:</strong> Os termos podem ser atualizados periodicamente. Recomendamos que revise esta página regularmente.</li>
            <li><strong>Contato:</strong> Para dúvidas sobre privacidade ou uso de dados, entre em contato pelo email suporte@edgame.com.br.</li>
          </ul>
          <Button className="mt-4" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default TermosCondicoesDetalhado;
