# T.N.S.V.T Market Instinct — Session Notes

> Documento vivo. Resumen de todo lo construido, decisiones, y lo que queda pendiente.
> Última actualización: 2026-06-25 (sesión final)

---

## 1. Descripción

App standalone Android (Capacitor 6) que se conecta al backend Symfony en `http://192.168.1.2:8000` via **Perfil → Sync TNSVT**. El juego es de trading simulado con precios reales del mercado.

**Stack:**
- HTML/CSS/JS vanilla (sin frameworks)
- Canvas 2D para charts (custom rendering)
- Web Audio API para SFX procedurales
- localStorage para estado del cliente
- Capacitor 6 + Android (no iOS por ahora)

---

## 2. Estructura del Repo

```
www/
  index.html              # Juego completo (~11.6k líneas) — todo en un archivo
  error.html              # Página de error Capacitor
android/                  # Build Android (Capacitor v6)
backend/                  # (no se usa directamente, hay tnsvt-symfony aparte)
scripts/                  # Scripts auxiliares
docs/                     # Documentación
tools/                    # Utilidades varias
```

**Assets únicos en el index.html:**
- `www/index.html` — contiene TODO el juego: modos, wallet, torneos, fondos, 3D effects, animations
- No hay módulos JS separados — todo inline

---

## 3. Backend (Symfony)

- Repo: `tnsvt-symfony` (separado)
- API: `http://192.168.1.2:8000`
- Endpoints: `/api/wallet/*`, `/api/tournament/*`, `/api/auth/*`, `/api/mercadopago/*`, `/api/binance-pay/*`, `/api/market/prices`
- Admin: `http://192.168.1.2:8000/admin`

---

## 4. Modos de Juego

| Modo | Descripción |
|---|---|
| Clásico | Velas + LONG/SHORT/SKIP. Streaks, score, levels. |
| Supervivencia | Sin vidas, drawdown tracking. |
| Diario | Predicción diaria con bonus. |
| Arena | PvP contra bots con leaderboard. |
| Torneo | 12 rondas, equity independiente, 3 stages (qualifying/semi/final). |
| Portfolio | Sandbox $50K con spreads reales, leverage, SL/TP. |
| Fractal | Patrones chartistas (VIP). |
| Glosario | Diccionario de términos. |
| Misiones | Challenges diarios con XP rewards. |
| Liga | Competencia multiplayer (async). |
| Duelos 1v1 | PvP real-time contra otros jugadores. |

---

## 5. Instrumentos Disponibles

**Crypto (Binance batch ticker):** BTC, ETH, SOL, BNB, XRP, GOLD (PAXGUSDT)

**Forex/Indices (Yahoo Finance individual):** EURUSD, SP500, NASDAQ, WTI

**Stocks (Yahoo Finance individual):** AMD, MSFT, NVDA, AAPL, TSLA, GOOGL, AMZN, META

Total: **18 instrumentos** en Clásico, Supervivencia, Torneo, Portfolio.

---

## 6. Cambios Grandes por Sesión

### Sesión 2026-06-24
- Default sync config: ADMIN01 / TNSVT-2026-CristoRey! / http://192.168.1.2:8000
- DEMO user eliminado del DB
- Wallet demo balance: $327.8 (real de ADMIN01)

### Sesión 2026-06-24/25
- **Panel de trading integral en torneos**: reemplazó el panel básico con diseño profesional
  - 9 instrumentos, live price card, tabs USD/%/Unidades, leverage slider 1x-25x
  - Stop Loss con 4 modos (%, $, Price, Pips) + botones rápidos
  - Take Profit con 4 modos + R:R visual
  - Trailing Stop toggle, order preview, botones LONG/SKIP/SHORT/Leaderboard
- **SL/TP/Trailing contra todas las velas** (no solo close final)
- **Asset seleccionable** en torneo (no random)
- **Reanudar Torneo** button en lobby
- **Bounty system eliminado**
- **Backend 1v1 Duel mode**: Duel + DuelRound entities, DuelController, 7 endpoints

### Sesión 2026-06-25 — Mercado en vivo
- `/api/market/prices` endpoint con Binance batch + Yahoo Finance + file cache 8s
- 18 instrumentos disponibles con precios reales
- `trFetchPrices()` polling cada 5s en trade panel
- Real-time price change % en trade panel

### Sesión 2026-06-25 — Phase 1+2: Microinteracciones + Trading Animations
- `.press` scale-down en `:active`
- Ripple effect global en todos los botones/pills
- Pill bounce al seleccionar (320ms)
- HAPTICS extendidos: `long`, `short`, `skip`, `success`, `alert`, `burst`, `tick`
- Skeleton loaders (`.skeleton` con shimmer)
- **Trade execution flash** verde/rojo (600ms) en trade panel y portfolio
- **Counter animado** para $portfolio y $pnl (requestAnimationFrame + easeOutCubic)
- **Tick** up/down en precio live (280ms con color flash)
- **fxTradeResult** burst con score-pop + comboRing + screenShake
- **Glow** verde/rojo en PnL cuando cambia signo
- SFX nuevos: `tradeLong`, `tradeShort`

### Sesión 2026-06-25 — Phase 3: Charts Dinámicos
- **Candle entrance animation** (stagger 30ms, 600ms total, crece desde open price)
- **Crosshair overlay** con tooltip O/H/L/C + Δ% en vela bajo cursor
- **Live price line + pill** (ya existía)
- **Volume bars** (ya existía)

### Sesión 2026-06-25 — Phase 4: Onboarding Tour
- Sistema de spotlight overlay con `box-shadow: 0 0 0 9999px rgba(0,0,0,.78)`
- Tooltip flotante con arrow direccional (auto-flip si no entra en viewport)
- 4 pasos Portfolio + 4 pasos Torneo
- Botones "Saltar" / "Siguiente →" / "¡Empezar! 🚀"
- **Counter inicial animado** (0 → $50,000 con easeOutCubic) first-time users
- Persiste en `localStorage.tnsvt_onboarded_v1`

### Sesión 2026-06-25 — Phase 5+6: Polish + Modo 3D
- **Glassmorphism** fuerte (blur 20px + saturate 180%)
- **Round transition** slide horizontal (350ms) entre rondas
- **Countdown 3-2-1-GO** con scale + rotate
- **Podium rise** para top 3 del leaderboard (stagger 180ms)
- **Theme crossfade** 400ms al cambiar tema
- **Modo 3D PRO** opt-in via toggle en ticker
  - Card parallax en scroll del lobby (translateZ + rotateY)
  - Tilt on hover desktop (perspective 1400px + rotateX/Y ±5°)
  - Glassmorphism fuerte (blur 30px + saturate 200%)
  - Respeta `prefers-reduced-motion`

### Sesión 2026-06-25 — Phase 7: Sonidos Contextuales
- **20+ nuevos SFX procedurales**:
  - `tradeLong` / `tradeShort` / `tradeSkip` — acordes distintos por dirección
  - `tpHit` — campanita ascendente
  - `slHit` — buzzer descendente (alarma)
  - `trailingHit` — tap doble
  - `roundStart` — campana de boxing
  - `countdownTick` / `countdownGo` — beeps diferenciados
  - `bigWin` — fanfarria épica
  - `eliminated` — dramática descendente
  - `tierUp` — glissando ascendente
  - `levelUp` — acorde brillante
  - `streak10` — épico de 6 notas
  - `positionOpen` / `positionClose` — confirmación
  - `achievement` — chime de 5 tonos
  - `error` — doble buzzer
  - `notification` — bip suave
  - `modeToggle` — tap de modo 3D/2D
- **HAPTICS diferenciados por evento** (tpHit vs slHit muy distinto)
- **Volume slider** (0-100%) en ticker, persiste en `localStorage.tnsvt_sfxvol`
- **Music ambient toggle** 🎶/🎵 — drone procedural en pentatonic menor cada 3s

### Sesión 2026-06-25 — Phase 6 Expandida (3D PRO)
- **3D Flip Cards en Achievements** — `.flip-card` con `.flip-front` y `.flip-back`, tap para rotar 180°
- **Card 3D en Trade Panel** — 12 botones LONG/SHORT con clase `pro3d-trade-btn`: hover lift +Z + shadow verde/rojo + pulse "breathe" cada 2.5s
- **Depth of Field** — `--dof-blur` calculado basado en `--tz` (max 4px blur para cards atrás)
- **Animated Gradients** — `.glass-animated` con `@keyframes glass-gradient-shift` mueve background 300%×300% en 12s loop
- **Coverflow Hero Cards** — 3 cards (Clásico, Supervivencia, Portfolio) en perspectiva 3D en lobby. Central al frente, laterales rotadas ±20°/-35° con blur progresivo. Tap en lateral la rota al centro. Swipe horizontal funciona.
- **Mouse Parallax Lighting** — `.pro3d-lit` con `--light-x` y `--light-y` actualizados en mousemove. Radial-gradient highlight + box-shadow dinámico desde lado opuesto del mouse.

---

## 7. Configuración de Sync (por defecto)

```
Server: http://192.168.1.2:8000
Code:   TNSVT-2026-CristoRey!
User:   ADMIN01
```

---

## 8. localStorage Keys Persistentes

| Key | Propósito |
|---|---|
| `tnsvt_onboarded_v1` | Tour completado (0/1) |
| `tnsvt_pro3d_v1` | Modo 3D PRO activo (0/1) |
| `tnsvt_music_v1` | Música ambiental activa (0/1) |
| `tnsvt_sfxvol` | Volumen SFX (0.0–1.0) |
| `tnsvt_portfolio` | JSON del portfolio del usuario |
| `tnsvt_xp` | XP total acumulado |
| `tnsvt_rank` | Rango actual (NOVICIO/APRENDIZ/etc.) |
| `tnsvt_theme` | Tema visual seleccionado |

---

## 9. Toggles en Top Bar (Ticker)

- 🔊/🔇 **Sound** — SFX on/off
- Slider **Vol** — volumen SFX 0-100%
- 🎶/🎵 **Music** — música ambiental on/off
- ⚪/🟡 **3D PRO** — modo 3D on/off

---

## 10. Bugs Conocidos

1. **WebView crash al cargar**: `TypeError: Cannot read properties of undefined (reading 'triggerEvent')` — Error del runtime de Capacitor. Hacer `npx cap sync android` asegura que el bridge esté actualizado.

---

## 11. Build & Deploy

**Build APK:**
```bash
cd C:\Users\HP 240 inch G9\tnsvt-market-instinct
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

**Install via ADB:**
```bash
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

**Device de testing:** Z Fold 6 (RFCXA0HZXFZ) via USB

---

## 12. Historial de Commits Relevantes

| Commit | Descripción |
|---|---|
| `934f8ae` | Inicial |
| `bff87cf` | Rebase |
| `813f99f` | Rebase |
| `f34c55c` | Rebase |
| `80bf23e` | phase1+2: microinteracciones + trading animations |
| `988d459` | phase3+4: candle entrance + crosshair + onboarding tour |
| `5f84608` | phase5+6: glassmorphism + countdown + podium + theme + 3D mode |
| `3c4ea70` | phase7: extended SFX + HAPTICS + volume slider + ambient music |
| `75f4868` | phase6 expanded: flip cards + 3D trade buttons + DOF + animated gradients + coverflow + lighting |

---

## 13. Próximas Fases / Ideas Pendientes

### Backend (tnsvt-symfony)
- Tour onboarding para Survival, Arena, Daily
- Achievements dinámicos (auto-unlock desde JS)
- 3D flip cards en achievements (UI ya lista en game-app)

### Game App (tnsvt-market-instinct)
- Splash screen animada (intro JS al inicio)
- Skeleton loaders más visibles
- Achatamiento del nuevo 3D en el clásico/supervivencia (no solo trade panel)
- Sound environmentales en background (candle ticking, news bell)
- Theme transition más elaborado
- Performance guard (auto-fallback 2D si FPS < 30)
- Volume slider para music independiente del SFX
- Re-trigger del tour desde Perfil → Ajustes
- More stocks (NFLX, CRM, DIS, INTC, BA, etc.)
- Crypto extra (DOGE, ADA, DOT, AVAX)

---

## 14. Performance Considerations

- **Z Fold 6** es potente pero todas las features 3D juntas pueden bajar FPS
- DOF blur solo cuando hay parallax activo
- Lighting deshabilitado en touch devices (ya implementado)
- `prefers-reduced-motion` deshabilita todo 3D
- Static cache en backend (`php -S` no persiste static vars → usa file cache)

---

## 15. URLs y Puertos

- **Backend Symfony**: `http://192.168.1.2:8000`
- **Admin Panel**: `http://192.168.1.2:8000/admin`
- **Market Prices endpoint**: `http://192.168.1.2:8000/api/market/prices`
- **Duelo API**: `http://192.168.1.2:8000/api/duels/*`
- **Wallet API**: `http://192.168.1.2:8000/api/wallet/*`
- **Tournament API**: `http://192.168.1.2:8000/api/tournaments/*`

---

## 16. Archivos Críticos

- `www/index.html` — Juego completo (TODO en uno)
- `android/app/build.gradle` — Build config Android
- `package.json` — Dependencias JS (Capacitor)
- `capacitor.config.json` — Configuración Capacitor

---

## 17. Comandos Útiles

```bash
# Ver logs del cell
adb logcat | findstr "chromium"

# Tomar screenshot
adb shell screencap -p /sdcard/screen.png
adb pull /sdcard/screen.png

# Reinstalar APK limpio
adb uninstall com.tnsvt.marketinstinct
adb install android\app\build\outputs\apk\debug\app-debug.apk

# Limpiar cache backend
rm -rf var/cache/dev/*
php bin/console cache:clear

# Crear nueva migración
php bin/console make:migration
php bin/console doctrine:migrations:migrate
```