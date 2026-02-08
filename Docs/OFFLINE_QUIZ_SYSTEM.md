# Sistema de Quiz com Fallback Offline

## 📋 Visão Geral

Este sistema garante que o quiz de nivelamento **E o plano de estudo** funcionem mesmo sem conexão com a internet, essencial para apresentações ao vivo onde a conexão pode ser instável.

## 🎯 Funcionalidades

### Modo Online (com Internet)
- ✅ Verifica automaticamente a conexão com a internet
- ✅ Gera 25 perguntas personalizadas usando IA do Google Gemini
- ✅ Perguntas adaptadas ao nível de escolaridade, idade e foco do usuário
- ✅ **Plano de estudo gerado por IA no backend**
- ✅ Cache local para reutilizar perguntas já geradas

### Modo Offline (sem Internet)
- ✅ Detecta automaticamente a falta de conexão
- ✅ Usa banco de 75 perguntas pré-definidas localmente
- ✅ Seleciona 25 perguntas personalizadas baseadas no foco do usuário
- ✅ **Gera plano de estudo localmente com algoritmo inteligente**
- ✅ Indicador visual amarelo informando que está em modo offline
- ✅ Todos os resultados são salvos normalmente
- ✅ **Plano salvo no localStorage para acesso futuro**

## 📁 Arquivos Criados/Modificados

### 1. `Frontend/src/utils/networkStatus.ts` (NOVO)
**Função:** Verifica a conectividade com a internet

**Principais recursos:**
```typescript
- checkInternetConnection(): Verifica conexão de forma inteligente
- useNetworkStatus(): Hook para monitorar mudanças na rede
```

**Como funciona:**
1. Verifica o status do navegador (`navigator.onLine`)
2. Tenta conectar ao backend local
3. Se falhar, tenta conexão externa (Google)
4. Retorna `true` se houver internet, `false` caso contrário

### 2. `Frontend/src/data/offlineQuizQuestions.ts` (NOVO)
**Função:** Banco de perguntas offline

**Conteúdo:**
- 75 perguntas organizadas por matéria
- Distribuição:
  - 12 perguntas de Matemática
  - 12 perguntas de Português
  - 10 perguntas de História
  - 10 perguntas de Geografia
  - 8 perguntas de Biologia
  - 6 perguntas de Física
  - 5 perguntas de Química
  - 6 perguntas de Inglês
  - 6 perguntas de Lógica
  - 6 perguntas de Informática
  - 6 perguntas de Programação

**Função `gerarQuizOffline(foco: string)`:**
- Seleciona 12 perguntas da área de foco (se disponível)
- Seleciona 13 perguntas variadas de outras áreas
- Embaralha e retorna 25 perguntas

### 3. `Frontend/src/utils/offlineStudyPlan.ts` (NOVO)
**Função:** Gerador de plano de estudo offline

**Principais recursos:**
```typescript
- gerarPlanoEstudoOffline(): Cria plano personalizado baseado nos resultados
- salvarPlanoLocal(): Salva plano no localStorage
- recuperarPlanoLocal(): Recupera plano salvo
```

**Como funciona:**
1. Analisa os resultados do quiz (acertos, erros, áreas fracas)
2. Identifica pontos fortes e fracos
3. Gera saudação personalizada
4. Cria plano de ação com prioridades
5. Define próximo desafio e mensagem motivacional
6. Salva tudo no localStorage

### 4. `Frontend/src/pages/QuizNivelamento.tsx` (MODIFICADO)
**Mudanças principais:**

1. **Importações adicionadas:**
   ```typescript
   import { checkInternetConnection } from "@/utils/networkStatus";
   import { gerarQuizOffline } from "@/data/offlineQuizQuestions";
   import { gerarPlanoEstudoOffline, salvarPlanoLocal } from "@/utils/offlineStudyPlan";
   import { WifiOff } from 'lucide-react';
   ```

2. **Novo estado:**
   ```typescript
   const [modoOffline, setModoOffline] = useState(false);
   ```

3. **Lógica de fallback para perguntas:**
   - Verifica internet antes de tentar gerar com IA
   - Se não houver internet → usa perguntas offline
   - Se houver internet mas IA falhar → usa perguntas offline
   - Se API Key não estiver configurada → usa perguntas offline

4. **Lógica de fallback para plano de estudo:**
   - Verifica internet antes de tentar gerar com API
   - Se não houver internet → gera plano offline
   - Se API falhar → gera plano offline como fallback
   - Plano offline é salvo no localStorage

5. **Indicador visual:**
   - Badge amarelo aparece quando em modo offline
   - Mensagem clara: "Modo Offline: Usando perguntas pré-definidas"
   - Garante ao usuário que os resultados serão salvos

### 5. `Frontend/src/pages/StudyPlan.tsx` (MODIFICADO)
**Mudanças principais:**

1. **Importações adicionadas:**
   ```typescript
   import { recuperarPlanoLocal } from '@/utils/offlineStudyPlan';
   import { WifiOff } from 'lucide-react';
   ```

2. **Novo estado:**
   ```typescript
   const [planoOffline, setPlanoOffline] = useState(false);
   ```

3. **Lógica de carregamento:**
   - Tenta carregar plano do servidor primeiro
   - Se falhar, busca plano salvo no localStorage
   - Indica visualmente quando o plano é offline

4. **Indicador visual:**
   - Badge amarelo quando plano é local
   - Mensagem: "Plano Gerado Localmente"

## 🔄 Fluxo de Funcionamento

```
┌─────────────────────────────────────┐
│  Usuário acessa Quiz Nivelamento    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Verifica cache local                │
│  (perguntas já geradas?)             │
└──────────────┬──────────────────────┘
               │
               ├─► SIM → Usa cache
               │
               ├─► NÃO → Verifica internet
               │
               ▼
┌─────────────────────────────────────┐
│  checkInternetConnection()           │
└──────────────┬──────────────────────┘
               │
               ├─► SEM INTERNET
               │   └─► gerarQuizOffline()
               │       └─► Mostra badge offline
               │
               └─► COM INTERNET
                   └─► Verifica API Key
                       ├─► Sem API Key → Modo offline
                       └─► Com API Key → Tenta IA
                           ├─► Sucesso → Usa IA
                           └─► Falha → gerarQuizOffline()

┌─────────────────────────────────────┐
│  Usuário completa o quiz             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Salva resultados (XP, performance)  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Verifica internet para plano        │
└──────────────┬──────────────────────┘
               │
               ├─► COM INTERNET
               │   └─► POST /generate-study-plan/
               │       ├─► Sucesso → Navega para /study-plan
               │       └─► Falha → Fallback offline
               │
               └─► SEM INTERNET
                   └─► gerarPlanoEstudoOffline()
                       └─► salvarPlanoLocal()
                           └─► Navega para /study-plan

┌─────────────────────────────────────┐
│  Usuário acessa Plano de Estudo     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Tenta carregar do servidor          │
└──────────────┬──────────────────────┘
               │
               ├─► Sucesso → Exibe plano online
               │
               └─► Falha → recuperarPlanoLocal()
                           ├─► Encontrou → Exibe plano offline
                           └─► Não encontrou → Mensagem de erro
```

## 🎨 Feedback Visual

### Indicador de Modo Offline
```tsx
<div className="bg-amber-50 border-amber-200 text-amber-800">
  <WifiOff /> Modo Offline: Usando perguntas pré-definidas
</div>
```

### Tela de Loading
- **Online:** "Gerando 25 perguntas personalizadas com IA..."
- **Offline:** "Carregando perguntas pré-definidas..."

### Toast Notifications
- Internet indisponível
- IA não disponível
- API Key não configurada

## 🧪 Testando o Sistema

### Teste 1: Simular Sem Internet
1. Desconecte o WiFi do PC
2. Acesse o quiz de nivelamento
3. ✅ Deve mostrar badge amarelo de modo offline
4. ✅ Quiz deve funcionar normalmente com perguntas pré-definidas

### Teste 2: Simular Falha na IA
1. Remova ou altere a API Key do Gemini no `.env`
2. Acesse o quiz de nivelamento
3. ✅ Deve ativar modo offline automaticamente
4. ✅ Deve mostrar toast informando sobre API Key

### Teste 3: Modo Normal (com Internet)
1. Mantenha conexão e API Key configurada
2. Acesse o quiz de nivelamento
3. ✅ Não deve mostrar badge offline
4. ✅ Perguntas devem ser geradas pela IA

## 📊 Vantagens do Sistema

1. **Confiabilidade:** Sistema funciona independente da internet
2. **Apresentações:** Segurança para demonstrações ao vivo
3. **Backup Automático:** Fallback transparente para o usuário
4. **Experiência Consistente:** Mesmo comportamento online/offline
5. **Feedback Claro:** Usuário sempre sabe qual modo está ativo

## 🔧 Manutenção

### Adicionar Mais Perguntas Offline
Edite: `Frontend/src/data/offlineQuizQuestions.ts`

```typescript
export const offlineQuizQuestions: PerguntaQuiz[] = [
  // Adicione novas perguntas aqui
  {
    pergunta: 'Sua pergunta aqui?',
    alternativas: ['A', 'B', 'C', 'D'],
    resposta: 0, // Índice da resposta correta (0-3)
    area: 'Matemática' // Uma das áreas válidas
  }
];
```

### Ajustar Timeout de Conexão
Edite: `Frontend/src/utils/networkStatus.ts`

```typescript
// Mudar de 3000ms (3 segundos) para outro valor
const timeoutId = setTimeout(() => controller.abort(), 3000);
```

## ⚠️ Observações Importantes

1. **Matérias Válidas:** Use apenas as matérias definidas em `MATERIAS_VALIDAS`
2. **Quantidade de Perguntas:** Sempre gere 25 perguntas (padrão do sistema)
3. **Cache:** Perguntas online são cacheadas por combinação de foco/escolaridade/idade
4. **Resultados:** Modo offline salva resultados da mesma forma que modo online

## 🚀 Para Apresentações

**Recomendações:**
1. ✅ Teste o modo offline antes da apresentação
2. ✅ Tenha perguntas relevantes para o seu público no banco offline
3. ✅ Se possível, gere perguntas online antes e confie no cache
4. ✅ Explique ao público que o sistema tem fallback automático

**Caso a Internet Caia Durante a Apresentação:**
- O sistema detecta automaticamente
- Mostra feedback visual discreto
- Continua funcionando normalmente
- Resultados são salvos corretamente
