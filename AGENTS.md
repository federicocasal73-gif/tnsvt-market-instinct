# TNSVT Market Instinct - Game App v2.0 (Final)

## Descripción
Aplicación standalone del juego Market Instinct, conector al backend Symfony en `http://192.168.1.2:8000` via Perfil → Sync TNSVT.

## Commands
- **Sync Capacitor**: `npx cap sync android`
- **Build Debug APK**: `cd android && gradlew.bat assembleDebug`
- **Build Release APK**: `cd android && gradlew.bat assembleRelease`
- **Install via ADB**: `adb install -r android\app\build\outputs\apk\debug\app-debug.apk`

## Bugs conocidos
1. **WebView crash al cargar**: `TypeError: Cannot read properties of undefined (reading 'triggerEvent')` — Error del runtime de Capacitor, no del código de la app. Se agregó `window.onerror` global para capturarlo. Hacer `npx cap sync android` asegura que el bridge esté actualizado.

## Estructura
```
www/index.html              # Juego completo (~9674 líneas) - modos + wallet + torneos + fondos
www/error.html              # Página de error para Capacitor
www/js/                     # Módulos JS (api, wallet, pagos, torneos, fcm, integrate)
android/                    # Android build con Capacitor v6
```

## Backend (Symfony - tnsvt-symfony)
- API: `http://192.168.1.2:8000`
- Endpoints: /api/wallet/*, /api/tournament/*, /api/auth/*, /api/mercadopago/*, /api/binance-pay/*
- Admin: `http://192.168.1.2:8000/admin`

## Session 2026-06-24
- Default sync config: ADMIN01 / TNSVT-2026-CristoRey! / http://192.168.1.2:8000
- DEMO user deleted from DB (ID 40, code DEMO, $50k wallet removed)
- Wallet demo balance changed from 50000 to 327.8 (ADMIN01's real balance)
