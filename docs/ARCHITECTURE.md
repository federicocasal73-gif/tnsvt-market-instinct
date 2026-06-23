# TNSVT Market Instinct — Arquitectura Técnica v2

## Resumen

Aplicación Android standalone (Capacitor v6) del juego T.N.S.V.T Market Instinct.
Combina juego offline con conexión opcional al backend Symfony (tnsvt-symfony).

```
┌─────────────────────────────────────────────┐
│        ANDROID APK (Play Store)             │
│                                              │
│  ┌───────────────────────────────────────┐  │
│  │   www/index.html (HTML/JS/CSS)        │  │
│  │                                        │  │
│  │   - Classic / Survival / Arena        │  │
│  │   - Portfolio / Wallet (offline)      │  │
│  │   - Torneos (online)                  │  │
│  │   - Pagos (deep-link → navegador)    │  │
│  │   - Sync con backend                  │  │
│  │   - FCM Push                          │  │
│  └───────────────────────────────────────┘  │
│                                              │
│  Capacitor Plugins:                          │
│   - Browser (deep-link a checkout)           │
│   - PushNotifications (FCM)                  │
│   - App (URL handling)                       │
│   - Preferences (storage)                    │
└──────────────────┬───────────────────────────┘
                   │ HTTPS (cuando online)
                   ▼
┌──────────────────────────────────────────────┐
│     Symfony Backend (Hostinger Business)     │
│                                               │
│  /api/tournaments/    → Torneos               │
│  /api/mercadopago/    → Pagos MP              │
│  /api/binance-pay/    → Pagos Binance         │
│  /api/wallet/         → Sincronización        │
│  /api/market/         → Datos de mercado      │
│  /api/auth/           → Autenticación         │
└──────────────────────────────────────────────┘
```

## Estructura de archivos

```
tnsvt-market-instinct/
├── www/
│   ├── index.html              # Juego completo (~8500 líneas)
│   ├── js/                     # [NUEVO v2] Módulos JS
│   │   ├── api.js              # Cliente API + JWT auth
│   │   ├── wallet.js           # Sync wallet offline/online
│   │   ├── pagos.js            # Pagos deep-link (MP/BN/Crypto)
│   │   ├── torneos.js          # UI torneos (lista, detalle, join)
│   │   ├── fcm.js              # Push notifications handler
│   │   └── integrate.js        # Capa de integración v2
│   ├── error.html
│   └── manifest.json (PWA)
├── android/
│   └── app/src/main/
│       └── AndroidManifest.xml # [MODIFICADO] + tnsvt:// scheme
├── capacitor.config.json       # [MODIFICADO] deep-link config
└── package.json                # [MODIFICADO] + plugins
```

## Flujo de pago (Google Play Compliant)

Para cumplir con las políticas de Google Play Store, los pagos digitales
se procesan FUERA de la app (en navegador externo):

```
1. Usuario click "Pagar entrada"
   │
2. App abre Chrome con https://tudominio.com/checkout/tournament/X
   │   (Capacitor Browser plugin)
   │
3. Usuario paga con Mercado Pago / Binance / Crypto
   │
4. Backend acredita el pago + genera claim_token
   │
5. Redirige a: tnsvt://payment-success?token=abc123
   │
6. App recibe el deep link (Android Intent Filter)
   │
7. App llama POST /api/checkout/claim con el token
   │
8. Backend confirma → App muestra "¡Inscripto!"
```

### Esquemas registrados

- `com.tnsvt.game://` → apertura general desde otras apps
- `tnsvt://payment` → retorno desde checkout
- `tnsvt://payment-success` → pago exitoso
- `tnsvt://payment-failure` → pago fallido
- `tnsvt://tournament` → abrir torneo específico

## Build APK

```batch
# Desde la raíz del repo
cd android
gradlew.bat assembleDebug

# APK generado en:
# android\app\build\outputs\apk\debug\app-debug.apk
```

## Configuración backend

El primer inicio el usuario debe configurar el backend en
**Perfil → Sync TNSVT** (igual que en la versión anterior).

```
Server URL: https://tudominio.com   (producción)
            http://192.168.1.2:8000 (LAN dev)
Game Code:  <código generado en admin>
```

## Tests rápidos

```batch
# 1. Build
cd android
gradlew.bat assembleDebug

# 2. Instalar
adb install -r app\build\outputs\apk\debug\app-debug.apk

# 3. Sync Capacitor (si modificás plugins)
cd ..
npx cap sync android
```

## Changelog

### v2.0 (Jun 2026)
- ✅ Capa de integración v2 con JWT auth
- ✅ Módulo de pagos deep-link (cumple Google Play policies)
- ✅ Sync wallet offline-first
- ✅ FCM push handler mejorado
- ✅ Inyección de botón "Torneos" en nav
- ✅ Deep links: `tnsvt://payment-success`, `tnsvt://tournament`
- ✅ AndroidManifest con permisos POST_NOTIFICATIONS

### v1.x (existente)
- Juego offline completo (Classic / Survival / Arena / Fractal)
- Torneos integrados con backend (sync legacy vía X-Game-Code)
- MP + Binance Pay vía window.location.href
- FCM push
- Auto-update desde backend