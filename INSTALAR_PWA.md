# 📱 Como Instalar o PWA "Taberna Tapper"

## 🌐 PASSO 1: Hospedar Online

### Opção A: Netlify Drop (MAIS RÁPIDO - 2 minutos)

1. Acesse: **https://app.netlify.com/drop**

2. **Arraste a pasta inteira** `game` para o site

3. Aguarde o upload (alguns segundos)

4. Copie o link gerado (ex: `https://nome-aleatorio.netlify.app`)

5. ✅ Pronto! Seu jogo está online

---

### Opção B: GitHub Pages (Grátis e Permanente)

```powershell
cd "C:\Users\matheus.rodrigues\Desktop\game"

# Fazer commit
git add .
git commit -m "Taberna Tapper PWA"

# Criar repositório no GitHub primeiro em: https://github.com/new
# Nome sugerido: taberna-tapper

# Depois execute (substitua SEU_USUARIO):
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/taberna-tapper.git
git push -u origin main
```

No GitHub:
1. Vá em **Settings** → **Pages**
2. Source: **main** branch
3. Save
4. Acesse: `https://seu_usuario.github.io/taberna-tapper`

---

### Opção C: Vercel (Profissional)

1. Acesse: **https://vercel.com**
2. Crie conta (login com GitHub)
3. New Project → Import
4. Selecione a pasta
5. Deploy!

---

## 📱 PASSO 2: Instalar no Celular

### Android (Chrome/Edge):

1. Abra o link do jogo no navegador
2. Toque no menu **⋮** (3 pontinhos)
3. Selecione **"Adicionar à tela inicial"** ou **"Instalar app"**
4. Confirme
5. ✅ Ícone aparecerá na tela inicial!

### iPhone/iPad (Safari):

1. Abra o link no Safari
2. Toque no botão **Compartilhar** (quadrado com seta)
3. Role e toque em **"Adicionar à Tela de Início"**
4. Confirme
5. ✅ App instalado!

### Computador (Chrome/Edge):

1. Abra o jogo no navegador
2. Clique no ícone **⊕** ou **🖥️** na barra de endereço
3. Ou vá em Menu → **"Instalar Taberna Tapper"**
4. ✅ Abre como janela separada!

---

## 🎮 Recursos do PWA

✅ **Funciona Offline** - Após primeira visita, joga sem internet
✅ **Ícone na Tela** - Como app nativo
✅ **Tela Cheia** - Sem barra do navegador
✅ **Rápido** - Carrega instantaneamente
✅ **Atualiza Sozinho** - Sempre a versão mais recente
✅ **Zero Instalação** - Não ocupa espaço da Play Store

---

## 🔄 Atualizar o Jogo

Basta fazer upload novamente no Netlify/GitHub que o PWA atualiza automaticamente!

---

## 💡 DICA EXTRA: QR Code

Gere um QR Code do link em: **https://www.qr-code-generator.com/**

Escaneie com a câmera do celular para abrir direto!

---

## 📊 Comparação com APK

| Recurso | PWA | APK |
|---------|-----|-----|
| Instalação | 5 segundos | 5-10 minutos |
| Tamanho | ~2 MB | ~5-8 MB |
| Atualizações | Automática | Manual (re-baixar) |
| Distribuição | Link | Arquivo .apk |
| Play Store | ❌ | ✅ |
| iOS | ✅ | ❌ |
| Offline | ✅ | ✅ |

---

## ❓ Problemas?

**"Não aparece opção de instalar"**
- Use Chrome ou Edge (navegadores modernos)
- Certifique que está em HTTPS (Netlify já usa)

**"Ícone não aparece"**
- Os ícones SVG serão convertidos automaticamente
- Alguns celulares demoram 1-2 minutos

**"Não funciona offline"**
- Abra uma vez com internet
- Service Worker precisa cachear os arquivos

---

## 🚀 Próximo Passo

**Escolha uma opção de hospedagem e me avise quando subir!**

Recomendo **Netlify Drop** pela simplicidade:
1. Abra https://app.netlify.com/drop
2. Arraste a pasta `game`
3. Copie o link
4. Teste no celular!

---

**Duração total: ~5 minutos** ⚡
