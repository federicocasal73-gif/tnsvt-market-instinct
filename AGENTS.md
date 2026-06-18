# TNSVT Market Instinct - Game App

## Descripción
Aplicación standalone del juego Market Instinct, extraída de `tnsvt-symfony/game-app/`.
Conecta al backend Symfony en `http://192.168.1.2:8000` via Perfil → Sync TNSVT.

## Commands
- **Build APK**: `cd android && gradlew.bat assembleDebug`
- **Sync capacitor**: `npx cap sync android`
- **Install via ADB**: `adb install -r android\app\build\outputs\apk\debug\app-debug.apk`

## Estructura
```
www/index.html              # Juego completo (7535 líneas) - modos + wallet + torneos + MP/BN/FCM
capacitor.config.json       # Capacitor v6, sin server.url (carga local)
android/                    # Android build con Capacitor
```

## Backend (Symfony - repo: tnsvt-symfony)
- API: `http://192.168.1.2:8000`
- Endpoints: /api/wallet/*, /api/tournament/*, /api/auth/*, etc.
- Admin: `http://192.168.1.2:8000/admin`
