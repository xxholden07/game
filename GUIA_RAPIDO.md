# 🎮 GUIA RÁPIDO: Transformar em App Android

## ⚡ PASSOS SIMPLES

### 1️⃣ Instalar Node.js
1. Baixe: https://nodejs.org/ (versão LTS)
2. Instale (Next, Next, Finish)
3. Reinicie o PowerShell

### 2️⃣ Instalar Android Studio
1. Baixe: https://developer.android.com/studio
2. Instale tudo (inclui SDK e emulador)
3. Abra e complete o setup inicial

### 3️⃣ Executar Comandos (no PowerShell)
```powershell
cd "C:\Users\matheus.rodrigues\Desktop\game"
npm install
npx cap add android
npx cap sync
npx cap open android
```

### 4️⃣ No Android Studio
- Aguarde o Gradle terminar (5-10 min primeira vez)
- Vá em: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- Clique em **locate** quando aparecer
- Copie o arquivo `app-debug.apk`

### 5️⃣ Instalar no Celular
- Transfira o APK para o celular
- Abra o arquivo e instale
- Permita "Fontes desconhecidas" se pedir

---

## 📱 ALTERNATIVA MAIS RÁPIDA: PWA (sem APK)

Se não quiser instalar tudo, pode usar como **Progressive Web App**:

1. Hospede os arquivos em algum servidor (GitHub Pages, Netlify, Vercel)
2. Acesse pelo celular
3. No Chrome/Safari, clique em "Adicionar à tela inicial"
4. Funciona como app nativo!

### Hospedar no GitHub Pages (GRÁTIS):
```powershell
cd "C:\Users\matheus.rodrigues\Desktop\game"
git add .
git commit -m "Taberna Tapper v1.0"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/taberna-tapper.git
git push -u origin main
```

Depois:
- Vá em Settings → Pages
- Source: main branch
- Save
- Acesse: `https://seu_usuario.github.io/taberna-tapper`

---

## 🎯 OPÇÃO MAIS FÁCIL: Usar Online

1. **Itch.io** - Upload grátis de jogos HTML5
   - https://itch.io/
   - Crie conta
   - Upload dos arquivos
   - Jogue online ou baixe

2. **Netlify Drop** - Arraste e solte
   - https://app.netlify.com/drop
   - Arraste a pasta `game`
   - Link pronto!

---

## 🔧 Requisitos de Sistema

**Para gerar APK:**
- Windows 10/11
- 8GB RAM mínimo
- 10GB espaço livre
- Internet estável

**Para jogar (celular):**
- Android 5.0+ ou iOS 11+
- Navegador moderno (Chrome, Safari)

---

## 💡 RECOMENDAÇÃO

Se você **nunca usou Android Studio**, sugiro:
1. Use a opção **PWA** (adicionar à tela inicial)
2. Ou hospede no **Itch.io** ou **Netlify**
3. Mais rápido e funciona igual!

O APK é melhor para:
- Distribuir offline
- Publicar na Google Play
- Ter ícone personalizado
- Rodar sem navegador

---

## 📞 Precisa de Ajuda?

Se instalou Node.js e Android Studio, execute:
```powershell
cd "C:\Users\matheus.rodrigues\Desktop\game"
npm install
```

E me avise se der erro!
