# 🔍 DEBUG: Plano de Estudo - Foco do Usuário

## ✅ PROBLEMA IDENTIFICADO

**Diagnóstico Realizado**: Executei script `backend/check_focus.py` que revelou:

```
👤 Usuário: renaneliakim1@gmail.com
   🎯 Focus: 'Lógica' (salvo corretamente)
   ⚠️  Plano: Vazio ou inválido

👤 Usuário: renaneliakim2@gmail.com
   🎯 Focus: 'ENEM' (salvo corretamente)
   ⚠️  Plano: Vazio ou inválido
```

**Conclusão**: 
- ✅ O campo `focus` está sendo salvo corretamente no registro
- ✅ O backend está retornando o `focus` via API  
- ❌ **O plano de estudo não foi gerado porque o usuário não fez o Quiz de Nivelamento**

## Solução

Para ver o foco funcionando no Plano de Estudo:

1. **Faça login** com uma das contas de teste:
   - Email: `renaneliakim1@gmail.com` (Foco: Lógica)
   - Email: `renaneliakim2@gmail.com` (Foco: ENEM)

2. **Acesse o Dashboard** e clique em "Fazer Quiz de Nivelamento"

3. **Complete o Quiz** respondendo às 15 perguntas

4. **Aguarde a geração do plano** (a IA Gemini cria o plano personalizado)

5. **Acesse "Plano de Estudo"** e verifique:
   - Badge "🎯 Foco Principal: [seu foco]" no topo
   - Cards com badge "SEU FOCO" nas matérias relacionadas
   - Logs de debug no console do navegador (F12)

## Logs de Debug (para confirmar o funcionamento)

Após completar o quiz, abra o Console (F12) e procure:

```
🎯 DEBUG useGamification - Focus carregado do perfil: Lógica
🎯 DEBUG StudyPlan Component - userFocus: Lógica
🎯 DEBUG StudyPlan - Reorganizando por foco: { foco: "Lógica", ... }
🎯 DEBUG Card [área] - ehFocoPrincipal: true/false
```

---

## Problema Reportado
O plano de estudo não está exibindo o assunto que o usuário escolheu como foco principal.

## O que o código deveria fazer

1. **No Registro**: Usuário escolhe um foco (ex: "Matemática", "Português", "ENEM", etc.)
2. **Backend**: Salva o foco no campo `UserProfile.focus`
3. **useGamification**: Carrega o foco via API `/users/me/` e armazena em `userFocus`
4. **StudyPlan**: 
   - Mostra badge "🎯 Foco Principal: [foco]"
   - Reorganiza plano para priorizar matérias relacionadas ao foco
   - Marca cards com badge "SEU FOCO" quando `action.area` contém o `userFocus`

## Logs de Debug Adicionados

### 1. No useGamification (carregamento do focus)
```
🎯 DEBUG useGamification - Focus carregado do perfil: [valor]
⚠️ DEBUG useGamification - Profile.focus está vazio, usando default
```

### 2. No StudyPlan Component
```
🎯 DEBUG StudyPlan Component - userFocus: [valor]
```

### 3. Na função reorganizarPlanoPorFoco
```
🎯 DEBUG StudyPlan - Reorganizando por foco: { foco, focoLower }
🎯 DEBUG StudyPlan - Actions disponíveis: [lista de áreas]
  - "Matemática" contains "matemática"? true/false
🎯 DEBUG StudyPlan - Ações do foco: [áreas que correspondem]
🎯 DEBUG StudyPlan - Outras ações: [demais áreas]
```

### 4. No render dos cards
```
🎯 DEBUG Card [área] - ehFocoPrincipal: true/false, userFocus: [valor]
```

## Como Testar

### Passo 1: Verificar dados do perfil no backend

**Opção A - Via Swagger:**
1. Acesse: http://127.0.0.1:8000/swagger/
2. Clique em "Authorize" e insira seu token JWT
3. Abra o endpoint `GET /api/users/me/`
4. Clique em "Try it out" > "Execute"
5. Verifique na resposta se `profile.focus` está preenchido:

```json
{
  "profile": {
    "focus": "Matemática",  // ← Deve ter o foco que você escolheu no registro
    "gamification": {...},
    ...
  }
}
```

**Opção B - Via Terminal Python:**
```bash
cd backend
python manage.py shell
```
```python
from django.contrib.auth.models import User
from api.models import UserProfile

# Substitua 'seu_email@exemplo.com' pelo seu email
user = User.objects.get(email='seu_email@exemplo.com')
profile = user.profile
print(f"Focus: {profile.focus}")
```

### Passo 2: Verificar logs no navegador

1. **Abra o DevTools** (F12 no navegador)
2. **Acesse a aba Console**
3. **Navegue para a página do Plano de Estudo**
4. **Procure pelos logs:**

```
🎯 DEBUG useGamification - Focus carregado do perfil: [...]
🎯 DEBUG StudyPlan Component - userFocus: [...]
🎯 DEBUG StudyPlan - Reorganizando por foco: {...}
🎯 DEBUG Card [...] - ehFocoPrincipal: [...]
```

### Passo 3: Analisar os logs

#### ✅ Cenário Correto:
```
🎯 DEBUG useGamification - Focus carregado do perfil: Matemática
🎯 DEBUG StudyPlan Component - userFocus: Matemática
🎯 DEBUG StudyPlan - Reorganizando por foco: { foco: "Matemática", focoLower: "matemática" }
🎯 DEBUG StudyPlan - Actions disponíveis: ["Matemática Básica", "Português", ...]
  - "Matemática Básica" contains "matemática"? true
  - "Português" contains "matemática"? false
🎯 DEBUG Card Matemática Básica - ehFocoPrincipal: true, userFocus: Matemática
```
→ Neste caso, o badge "SEU FOCO" deve aparecer

#### ❌ Problema 1: Focus não está sendo carregado
```
⚠️ DEBUG useGamification - Profile.focus está vazio, usando default
🎯 DEBUG StudyPlan Component - userFocus: Conhecimentos Gerais
```
→ **Solução**: O backend não tem o focus salvo. Verifique:
- Se você preencheu o campo de foco no registro
- Se o campo foi enviado ao backend (veja Network no DevTools)
- Se o serializer está salvando o campo corretamente

#### ❌ Problema 2: Focus carregado mas não corresponde
```
🎯 DEBUG useGamification - Focus carregado do perfil: ENEM
🎯 DEBUG StudyPlan - Actions disponíveis: ["Matemática Básica", "Português", ...]
  - "Matemática Básica" contains "enem"? false
  - "Português" contains "enem"? false
```
→ **Solução**: O foco "ENEM" não corresponde aos nomes das áreas no plano.
- O plano usa nomes específicos (Matemática, Português, etc.)
- O foco genérico "ENEM" não bate com esses nomes
- Isso é esperado: ENEM abrange várias matérias, então nenhuma será marcada como "SEU FOCO"

## Possíveis Causas e Soluções

### Causa 1: Campo focus vazio no banco
**Verificar**: SQL direto ou Django shell
```python
from api.models import UserProfile
profiles = UserProfile.objects.filter(focus__isnull=False, focus__gt='')
for p in profiles:
    print(f"{p.user.email}: {p.focus}")
```

**Solução**: Se vazio, fazer login novamente ou atualizar perfil via:
```bash
python manage.py shell
```
```python
from django.contrib.auth.models import User
user = User.objects.get(email='seu_email@exemplo.com')
user.profile.focus = 'Matemática'
user.profile.save()
```

### Causa 2: Serializer não retorna focus
**Verificar**: `backend/api/serializers.py` linha 148
```python
fields = (..., 'focus', ...)  # ← focus deve estar aqui
```

### Causa 3: Foco não corresponde aos nomes das áreas
**Exemplo**: Você escolheu "ENEM" mas o plano tem "Matemática Básica"
- "enem" não está contido em "matemática básica"
- Logo, nenhum badge aparece

**Solução**: Mapear focos genéricos para matérias específicas

### Causa 4: Gemini AI está gerando nomes inconsistentes
Se o plano tem "Ciências Exatas" mas você escolheu "Matemática", não vai bater.

**Solução**: Validar os nomes das áreas retornadas pela AI

## Próximos Passos

1. **Execute os testes acima**
2. **Copie os logs do console**
3. **Cole aqui os resultados** para que eu possa analisar:

```
[Cole os logs aqui]
```

4. **Informe**:
   - Qual foi o foco que você escolheu no registro?
   - Quais são os nomes das áreas que aparecem no seu plano?
   - O badge "SEU FOCO" apareceu em algum card?

## Remoção dos Logs (após debug)

Após identificar o problema, remova os `console.log` adicionados:
- `Frontend/src/hooks/useGamification.tsx` (linhas ~84-87)
- `Frontend/src/pages/StudyPlan.tsx` (linhas ~176-188, ~348, ~255)
