import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PlanosTerms: React.FC = () => {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold">Termos e Condições — Ofertas Skillio</h1>
        <p className="text-sm text-muted-foreground mt-2">Estas condições descrevem os termos aplicáveis aos planos de assinatura Skillio.</p>

        <div className="mt-6 space-y-6 bg-card border rounded-lg p-6">
          <div>
            <h2 className="text-lg font-semibold">Visão Geral</h2>
            <p className="text-sm text-muted-foreground mt-2">Ao assinar o Skillio Pro, você concorda com as condições comerciais, políticas de faturamento e regras de cancelamento abaixo. O plano gratuito permanece disponível com limitações.</p>
          </div>

          <div>
            <h3 className="font-medium">Ofertas e Preços</h3>
            <ul className="mt-2 text-sm space-y-1">
              <li><strong>Skillio Pro Mensal:</strong> R$ 14,99</li>
              <li><strong>Skillio Pro Trimestral:</strong> R$ 43,62 (-3%)</li>
              <li><strong>Skillio Pro Anual:</strong> R$ 632,99 (-10%)</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-2">Os valores acima já incluem impostos quando aplicáveis. As ofertas promocionais podem ser alteradas a qualquer momento; preços vigentes são exibidos na página de compra.</p>
          </div>

          <div>
            <h3 className="font-medium">Renovação e Pagamento</h3>
            <p className="text-sm text-muted-foreground mt-2">As assinaturas são renovadas automaticamente ao final do ciclo contratado, utilizando o mesmo método de pagamento salvo. Você será notificado por e-mail antes de renovações importantes.</p>
          </div>

          <div>
            <h3 className="font-medium">Cancelamento e Reembolso</h3>
            <p className="text-sm text-muted-foreground mt-2">Você pode cancelar a renovação automática a qualquer momento nas configurações da sua conta. Reembolsos são avaliados caso a caso; entre em contato com o suporte através da página de Suporte para solicitações.</p>
          </div>

          <div>
            <h3 className="font-medium">Política de Uso</h3>
            <p className="text-sm text-muted-foreground mt-2">Os benefícios do Skillio Pro (vidas ilimitadas, ausência de anúncios, perguntas sem cronômetro, conquistas exclusivas, questões dinâmicas e relatórios avançados) são vinculados à conta do assinante e não podem ser transferidos entre contas.</p>
          </div>

          <div>
            <h3 className="font-medium">Alterações nos Termos</h3>
            <p className="text-sm text-muted-foreground mt-2">A Skillio pode atualizar estes termos ocasionalmente. Publicaremos a versão atualizada nesta página e notificaremos assinantes quando mudanças forem relevantes.</p>
          </div>

          <div>
            <h3 className="font-medium">Contato</h3>
            <p className="text-sm text-muted-foreground mt-2">Para dúvidas sobre cobrança, reembolso ou condições das ofertas, acesse a página <Link to="/suporte" className="text-primary underline">Suporte</Link> ou envie um e-mail para nossa equipe.</p>
          </div>

          <div className="pt-4 border-t flex gap-3">
            <Link to="/planos" className="flex-1">
              <Button variant="outline" className="w-full">Voltar a Planos</Button>
            </Link>
            <Link to="/register" className="flex-1">
              <Button className="w-full">Assinar agora</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanosTerms;
