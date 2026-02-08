# 📱 Guia Rápido - Teste em Rede Local

## 🚀 Iniciando os Servidores

### Opção 1: Iniciar TUDO de uma vez (Recomendado)
```
start_network.bat
```
Este script:
- ✅ Detecta automaticamente o IP da sua rede
- ✅ Inicia Backend (Django) e Frontend (Vite) 
- ✅ Abre duas janelas (uma para cada servidor)
- ✅ Mostra o endereço para acessar

### Opção 2: Iniciar Separadamente

**Backend:**
```
backend\start_network.bat
```

**Frontend:**
```
Frontend\start_network.bat
```

---

## 📱 Como Testar no Celular

1. **Certifique-se que o PC e celular estão na MESMA WiFi**

2. **Execute o script:**
   ```
   start_network.bat
   ```

3. **Anote o IP que aparecer na tela** (ex: `192.168.0.89`)

4. **No celular, abra o navegador e digite:**
   ```
   http://[SEU_IP]:8080
   ```
   Exemplo: `http://192.168.0.89:8080`

5. **Pronto!** Agora você pode testar normalmente 🎉

---

## 🏠 Testando em Redes Diferentes

O script **detecta automaticamente o IP**, então funciona em qualquer rede:
- 🏠 Casa
- 🏢 Trabalho/Faculdade
- ☕ Cafeteria
- 📶 Hotspot do celular

**Basta executar o script e ele mostrará o IP correto!**

---

## 🔥 Firewall (Configuração Única)

Se for a primeira vez testando em uma rede, pode ser necessário permitir no firewall:

### Windows Defender Firewall:
```
1. Painel de Controle > Sistema e Segurança > Firewall do Windows
2. Configurações Avançadas
3. Regras de Entrada > Nova Regra
4. Porta > TCP > 8000,8080
5. Permitir Conexão > Nome: "SKILLIO Dev"
```

---

## 🛑 Parando os Servidores

- Feche as janelas do terminal **OU**
- Pressione `CTRL+C` em cada janela

---

## 🐛 Solução de Problemas

### Celular não consegue acessar:
1. ✅ PC e celular estão na mesma WiFi?
2. ✅ Firewall está permitindo as portas 8000 e 8080?
3. ✅ O IP está correto? (veja no terminal)
4. ✅ Servidores estão rodando? (veja as janelas abertas)

### IP mudou:
- **Normal!** Cada rede pode dar um IP diferente
- Basta executar o script novamente que ele detecta o novo IP

### Erro de porta já em uso:
```
netstat -ano | findstr :8080
taskkill /F /PID [NUMERO_DO_PID]
```

---

## 💡 Dicas

- 📌 **Salve o IP temporariamente** no celular para não precisar digitar sempre
- 🔄 **O IP pode mudar** quando você reiniciar o PC ou trocar de rede
- 📱 **Use o modo desenvolvedor** no Chrome mobile para debugar (chrome://inspect)
- 🌐 **Adicione aos favoritos** do celular para acesso rápido

---

## 📊 Estrutura dos Scripts

```
Projeto_integrador/
├── start_network.bat         ← Inicia TUDO (recomendado)
├── backend/
│   └── start_network.bat     ← Apenas backend
└── Frontend/
    └── start_network.bat     ← Apenas frontend
```
