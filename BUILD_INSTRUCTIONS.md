# 📱 Como Gerar APK do Taberna Tapper

## 🔧 Pré-requisitos

### Para Android:
1. **Node.js** - [Download](https://nodejs.org/)
2. **Android Studio** - [Download](https://developer.android.com/studio)
3. **Java JDK 17** - Instalado com Android Studio

### Para iOS (somente macOS):
1. **Xcode** - Instale pela App Store
2. **Node.js**

---

## 📦 Passos para Instalar e Gerar APK

### 1️⃣ Instalar Dependências
```bash
cd "C:\Users\matheus.rodrigues\Desktop\game"
npm install
```

### 2️⃣ Inicializar Capacitor (primeira vez)
```bash
npx cap init "Taberna Tapper" com.taberna.tapper
```

### 3️⃣ Adicionar Plataforma Android
```bash
npx cap add android
```

### 4️⃣ Sincronizar Arquivos
```bash
npx cap sync
```

### 5️⃣ Abrir no Android Studio
```bash
npx cap open android
```

---

## 🏗️ Gerar APK no Android Studio

1. **Android Studio** abrirá automaticamente
2. Aguarde o Gradle Build terminar (primeira vez demora)
3. Vá em: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
4. Aguarde a compilação
5. Clique em **locate** no popup para encontrar o APK
6. O APK estará em: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📲 Instalar no Android

### Método 1: USB (Developer Mode)
1. Ative **Opções do Desenvolvedor** no Android (toque 7x em "Número da versão")
2. Ative **Depuração USB**
3. Conecte o celular no PC
4. No Android Studio, clique no botão ▶️ **Run**

### Método 2: Transferir APK
1. Copie o arquivo `app-debug.apk`
2. Transfira para o celular (WhatsApp, e-mail, cabo USB)
3. No celular, abra o APK e instale
4. Permita **Fontes Desconhecidas** se necessário

---

## 🍎 Para iOS (somente macOS)

```bash
npx cap add ios
npx cap open ios
```

No Xcode:
1. Selecione seu dispositivo/simulador
2. Clique em ▶️ **Run**

---

## 🔄 Atualizar App (após modificações)

Sempre que editar o código HTML/CSS/JS:

```bash
npx cap sync
```

Depois, rebuild no Android Studio (Build → Rebuild Project)

---

## 🎮 Controles Mobile

O jogo já funciona com toque na tela:
- **Toque nas setas** para mover o bartender
- **Toque no botão servir** para servir bebidas
- **Toque nos poderes** para selecioná-los

---

## ❓ Problemas Comuns

### "Command not found: npx"
- Instale o Node.js primeiro

### "SDK not found"
- Abra Android Studio → Settings → Android SDK
- Instale Android 13.0 (API 33) ou superior

### "Gradle build failed"
- Aguarde terminar todos os downloads
- Internet estável é necessária

### APK não instala no celular
- Vá em Configurações → Segurança → Permitir fontes desconhecidas
- Algumas marcas (Xiaomi, Huawei) têm menu separado para isso

---

## 📊 Tamanhos Esperados

- **APK Debug**: ~5-8 MB
- **APK Release (assinado)**: ~3-5 MB

---

## 🚀 Gerar APK de Produção (Release)

No Android Studio:
1. **Build → Generate Signed Bundle / APK**
2. Escolha **APK**
3. Crie uma **keystore** (guardar senha!)
4. Assine o APK
5. APK estará em `android/app/release/`

---

## 📝 Notas Importantes

- O app rodará **offline** após instalado
- Não precisa de servidor
- Tamanho do app: ~5 MB
- Compatível com Android 5.0+ (API 21+)

---

## 🎯 Próximos Passos

Para publicar na Google Play Store:
1. Criar conta Google Play Console ($25 única vez)
2. Gerar APK Release assinado
3. Criar ficha na loja (screenshots, descrição)
4. Upload do APK
5. Aguardar aprovação (~2-7 dias)

---

**Qualquer dúvida, consulte a [documentação do Capacitor](https://capacitorjs.com/docs)**
