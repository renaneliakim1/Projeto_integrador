Resumo Analítico do Sistema de Gamificação
O sistema foi projetado para engajar o usuário através de uma combinação de pontos de experiência (XP), níveis, missões diárias, vidas (corações) e uma trilha de aprendizado estruturada.

1. Estrutura da Trilha de Aprendizagem
A base do sistema é a trilhaPrincipal, que é gerada dinamicamente.

Quantidade de Níveis: A trilha é composta por 30 níveis.
Quantidade de Blocos: Cada um dos 30 níveis contém 15 blocos de perguntas.
Total de Blocos: 30 níveis * 15 blocos/nível = 450 blocos no total.
Tipos de Blocos: Os blocos são divididos em dois tipos, com uma proporção fixa dentro de cada nível:
Blocos de Foco ('foco'): 10 por nível. Focados no objetivo principal de estudo do usuário.
Blocos de Revisão ('bncc'): 5 por nível. Focados em conhecimentos gerais da Base Nacional Comum Curricular.
O padrão é: 2 blocos de foco seguidos por 1 bloco bncc.
2. Sistema de Pontuação (XP) e Níveis
O progresso do usuário é medido em Pontos de Experiência (XP), que permitem subir de nível.

Fórmula de XP para Nível: A quantidade de XP necessária para passar para o próximo nível aumenta exponencialmente, calculada pela fórmula: XP = Math.floor(100 * Math.pow(nível_atual, 1.5)).
Exemplo:
Nível 1 ➔ 2: 100 XP
Nível 2 ➔ 3: 282 XP
Nível 3 ➔ 4: 519 XP
Fontes de Ganho de XP:
Completar um Bloco: Concluir um bloco na trilha principal recompensa o usuário com 10 XP.
Completar Missões Diárias: Cada missão diária completada concede 50 XP.
Quiz de Nivelamento: Na tela de resultado do quiz, é exibido um ganho de 10 XP por acerto. No entanto, uma análise do código mostra que este é um ganho apenas visual na tela de resumo do quiz e não parece ser adicionado ao total de XP do usuário através do hook useGamification. A função addXp não é chamada neste momento.
3. Missões e Conquistas
Para incentivar o engajamento contínuo, o sistema possui missões diárias e conquistas de longo prazo.

Missões Diárias: Existem 3 missões que são reiniciadas todos os dias:
Completar 3 blocos de perguntas.
Acertar 20 perguntas.
Manter a sequência de login (entrar no app todos os dias).
Conquistas (Achievements): São marcos permanentes que o usuário pode alcançar.
Por Blocos Completos: "Primeiro Passo" (1), "Pegando o Ritmo" (10), "Maratonista do Saber" (50), "Centurião do Conhecimento" (100).
Por Nível Alcançado: "Aprendiz Dedicado" (Nível 5), "Estudante Experiente" (Nível 10), "Mestre do Nivelamento" (Nível 20).
Por Sequência de Login: "Consistência é a Chave" (3 dias), "Hábito Formado" (7 dias), "Lenda Viva" (30 dias).
Por XP Acumulado: "Acumulador de XP" (1.000 XP), "Força do Conhecimento" (5.000 XP).
4. Sistema de Vidas (Corações)
Para adicionar um elemento de desafio, existe um sistema de "vidas".

Máximo de Vidas: O usuário pode ter no máximo 5 corações.
