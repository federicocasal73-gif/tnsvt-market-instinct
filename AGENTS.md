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

## Cambios grandes (2026-06-25)
- **Panel de trading integral en torneos**: reemplacé el panel básico del torneo por el mismo diseño profesional del portfolio:
  - Asset selector con 9 instrumentos (BTC, ETH, SOL, BNB, XRP, GOLD, SP500, EURUSD, NASDAQ)
  - Live price card con precio, cambio %, spread, 24h high/low
  - Tamaño de posición con tabs USD/%/Unidades + botones rápidos 10/25/50/75/100%
  - Apalancamiento con slider 1x-25x
  - Stop Loss con modos %/$/Precio/Pips + botones rápidos
  - Take Profit con modos %/$/Precio/R:R + botones rápidos
  - Trailing Stop toggle con slider de distancia
  - Order preview con tamaño, nocional, margen, SL/TP prices, R:R visual
  - Botones LONG / SKIP / SHORT / Leaderboard
- **SL/TP/Trailing contra velas**: `torneoPlay()` ahora itera todas las velas generadas y verifica SL, TP y trailing stop en cada vela (no solo contra el close final)
- **Asset seleccionable**: el torneo genera velas para el activo que elijas en las pills, no random
- Funciones nuevas: `trInitTradePanel`, `trAssetSelect`, `trSizeTab`, `trQuickSize`, `trSetLev`, `trToggleSL/TP`, `trSetSL/TP`, `trToggleTrail`, `trCalcPreview`, `trGetUsdSize`, `trUpdateLivePrice`

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

## Session 2026-06-24/25
- Added **Reanudar Torneo** button in lobby (conditional on `torneoState.active`)
- `resumeTorneo()` restores game panel, shows toast with current round
- Removed **Bounty system**: HTML row, `setBounty()`, `populateBountyTargets()`, bounty fields from state
- Moved leaderboard button next to direction buttons
- `torneoState.active = true` on `startTorneo()`
- Backend 1v1 Duel mode: Duel + DuelRound entities, DuelController, 7 endpoints (create/join/get/next-round/play/cancel), wallet integration, PnL calculation, migration
