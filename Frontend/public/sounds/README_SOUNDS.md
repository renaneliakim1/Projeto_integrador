# 🔊 Sons do Jogo - Instruções de Configuração

## 📁 Estrutura de Arquivos

Coloque os arquivos de som nesta pasta (`Frontend/public/sounds/`) com os seguintes nomes:

```
Frontend/public/sounds/
├── correct.mp3     # Som de resposta correta
├── wrong.mp3       # Som de resposta errada
├── victory.mp3     # Som de vitória (quiz concluído)
├── defeat.mp3      # Som de derrota (game over)
└── README_SOUNDS.md
```

## 🎵 Onde Encontrar Sons Gratuitos

### Opção 1: Sites de Sons Gratuitos
- **Freesound.org** - https://freesound.org
- **Mixkit** - https://mixkit.co/free-sound-effects/
- **Zapsplat** - https://www.zapsplat.com
- **Pixabay** - https://pixabay.com/sound-effects/

### Opção 2: Sons Recomendados

**Para Acerto (correct.mp3):**
- Busque: "success", "correct", "coin", "ding", "positive"
- Duração sugerida: 0.5 - 1 segundo
- Tom: Agudo e positivo

**Para Erro (wrong.mp3):**
- Busque: "wrong", "error", "buzz", "negative"
- Duração sugerida: 0.5 - 1 segundo
- Tom: Grave e indicativo de erro

**Para Vitória (victory.mp3):**
- Busque: "victory", "success", "level complete", "fanfare"
- Duração sugerida: 2 - 4 segundos
- Tom: Celebrativo e triunfante

**Para Derrota (defeat.mp3):**
- Busque: "game over", "defeat", "fail", "lose"
- Duração sugerida: 2 - 3 segundos
- Tom: Descendente e dramático

## 🎨 Sugestões de Sons por Estilo

### Estilo Minimalista/Moderno
- Acerto: Som de "click" suave ou "ping"
- Erro: Som de "pop" negativo ou "buzz" curto
- Vitória: Ascensão de notas musicais
- Derrota: Descendência de notas musicais

### Estilo Retrô/8-bit
- Acerto: Som de moeda de jogos clássicos
- Erro: Beep de erro 8-bit
- Vitória: Melodia de conclusão de fase estilo Mario
- Derrota: Game over do estilo arcade

### Estilo Educacional
- Acerto: Aplauso suave ou "muito bem!"
- Erro: "Ops!" ou sino suave
- Vitória: Aplausos + fanfarra
- Derrota: Som de "tente novamente"

## ⚙️ Configurações Técnicas

### Formato Recomendado
- **Formato:** MP3 (compatibilidade universal)
- **Taxa de bits:** 128 kbps ou superior
- **Taxa de amostragem:** 44.1 kHz
- **Canais:** Estéreo ou Mono

### Tamanho dos Arquivos
- Mantenha arquivos pequenos para carregamento rápido
- Tamanho ideal: 50KB - 200KB por arquivo
- Sons de acerto/erro: máximo 100KB
- Sons de vitória/derrota: máximo 300KB

## 🔧 Conversão de Formatos

Se você tiver arquivos WAV ou OGG, converta para MP3:

### Usando Online
- **CloudConvert** - https://cloudconvert.com/
- **Online-Convert** - https://audio.online-convert.com/

### Usando Software
- **Audacity** (gratuito) - https://www.audacityteam.org/
- **FFmpeg** (linha de comando)

Comando FFmpeg para converter:
```bash
ffmpeg -i input.wav -b:a 128k output.mp3
```

## 🎛️ Ajuste de Volume

O volume dos sons está configurado em **50%** (0.5) por padrão no código.

Para ajustar, edite o arquivo `Game.tsx` na linha com `audio.volume = 0.5;`

Valores aceitos: 0.0 (mudo) até 1.0 (100%)

## ✅ Testando os Sons

1. Coloque os arquivos MP3 na pasta `public/sounds/`
2. Inicie o servidor de desenvolvimento
3. Acesse um quiz e teste:
   - Resposta correta → deve tocar `correct.mp3`
   - Resposta errada → deve tocar `wrong.mp3`
   - Completar quiz → deve tocar `victory.mp3`
   - Perder o jogo → deve tocar `defeat.mp3`

## 🚨 Troubleshooting

### Os sons não tocam?
1. Verifique se os arquivos estão na pasta correta
2. Confirme se os nomes dos arquivos estão exatos (minúsculas)
3. Teste em navegador diferente (alguns bloqueiam autoplay)
4. Abra o Console do navegador (F12) para ver mensagens de erro

### Sons muito altos ou baixos?
- Ajuste o volume no código (Game.tsx)
- Ou normalize o áudio antes de adicionar os arquivos

## 📝 Nota Importante

Os sons são **opcionais**. Se os arquivos não estiverem presentes, o jogo continua funcionando normalmente sem áudio. O sistema ignora silenciosamente erros de carregamento de som.

---

**Status Atual:** ⚠️ Arquivos de som não incluídos (adicione-os seguindo este guia)
