import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

const BillingCycle = {
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
  ANNUAL: "annual",
} as const;

const Plans: React.FC = () => {
  const [cycle, setCycle] = useState<string>(BillingCycle.MONTHLY);
  

  const prices: Record<string, { label: string; price: string; subtitle?: string }> = {
    [BillingCycle.MONTHLY]: { label: "Mensal", price: "R$ 14,99" },
    [BillingCycle.QUARTERLY]: { label: "Trimestral", price: "R$ 43,62", subtitle: "(-3%)" },
    [BillingCycle.ANNUAL]: { label: "Anual", price: "R$ 632,99", subtitle: "(-10%)" },
  };

  const benefitsByCycle: Record<string, string[]> = {
    [BillingCycle.MONTHLY]: [
      'Relatório avançado',
      'Vidas ilimitadas',
      'Sem anúncios',
      'Perguntas sem cronômetro',
      'Conquistas exclusivas',
      'Questões dinâmicas',
    ],
    [BillingCycle.QUARTERLY]: [
      'Relatório avançado completo + exportação em CSV',
      'Vidas ilimitadas',
      'Sem anúncios',
      'Perguntas sem cronômetro',
      'Conquistas exclusivas',
      'Questões dinâmicas',
      'Acesso antecipado a novos módulos (pré-lançamento)',
      'Perfil família/contas multiusuário (até 3 membros)',
    ],
    [BillingCycle.ANNUAL]: [
      'Relatório avançado completo + exportação em CSV',
      'Relatórios exportáveis (PDF+CSV) e agendamento automático',
      'Vidas ilimitadas',
      'Sem anúncios',
      'Perguntas sem cronômetro',
      'Conquistas exclusivas',
      'Questões dinâmicas',
      'Acesso antecipado a novos módulos (pré-lançamento)',
      'Perfil família/contas multiusuário (até 6 membros)',
      'Prioridade máxima de suporte (chat + SLA)',
      'Banco de questões exclusivo e atualizações contínuas',
      'Acesso antecipado a novos recursos e conteúdo beta',
      'Oferta de renovação automática com desconto especial',
    ],
  };

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-bold">Planos Skillio</h1>
        <p className="text-sm text-muted-foreground mt-2">Escolha o plano que melhor combina com seu aprendizado.</p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {/* Free Plan */}
        <div className="bg-card border rounded-lg p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Plano Skillio (Grátis)</h3>
              <p className="text-xs text-muted-foreground">Atual</p>
            </div>
            <div className="text-sm font-bold">Grátis</div>
          </div>

          <div className="mt-4 flex-1">
            <ul className="space-y-2 text-sm">
              <li>Limite de <strong>5 vidas</strong></li>
              <li>Com anúncios</li>
            </ul>
          </div>

          <div className="mt-6">
            <Link to="/" className="block">
              <Button className="w-full">Continuar grátis</Button>
            </Link>
          </div>
        </div>

        {/* Pro overview / pricing selector */}
        <div className="md:col-span-2 bg-card border rounded-lg p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Plano Skillio Pro</h3>
              <p className="text-sm text-muted-foreground">Recursos avançados para usuários dedicados</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setCycle(BillingCycle.MONTHLY)} className={`px-3 py-1 rounded-md ${cycle === BillingCycle.MONTHLY ? 'bg-primary text-white' : 'bg-transparent border'}`}>
                Mensal
              </button>
              <button onClick={() => setCycle(BillingCycle.QUARTERLY)} className={`px-3 py-1 rounded-md ${cycle === BillingCycle.QUARTERLY ? 'bg-primary text-white' : 'bg-transparent border'}`}>
                Trimestral
              </button>
              <button onClick={() => setCycle(BillingCycle.ANNUAL)} className={`px-3 py-1 rounded-md ${cycle === BillingCycle.ANNUAL ? 'bg-primary text-white' : 'bg-transparent border'}`}>
                Anual
              </button>
              
            </div>

            <div className="mt-3 text-center md:text-left">
              <div className="text-2xl font-bold">{prices[cycle].price}</div>
              <div className="text-xs text-muted-foreground">{prices[cycle].label} {prices[cycle].subtitle ? <span className="ml-1">{prices[cycle].subtitle}</span> : null}</div>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4 flex-1">
            <div>
              <h4 className="font-medium">O que inclui</h4>
              <ul className="mt-3 space-y-2 text-sm">
                {benefitsByCycle[cycle].map((b) => (
                  <li key={b} className="flex items-start gap-2"><span className="text-emerald-500">✓</span> {b}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium">Próximos passos</h4>
              <p className="text-sm text-muted-foreground mt-2">Ao assinar o Skillio Pro você terá acesso imediato aos benefícios acima. Escolha seu ciclo e prossiga.</p>

              <div className="mt-4 space-y-3">
                <div className="text-center text-xs text-muted-foreground">Teste grátis de 3 dias</div>
                <Button className="w-full">Assinar {prices[cycle].label} — {prices[cycle].price}</Button>
                <Link to="/planos/termos" className="text-xs text-muted-foreground block text-center">Ver termos e condições</Link>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Plans;
