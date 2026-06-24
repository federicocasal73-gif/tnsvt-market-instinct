# T.N.S.V.T — Market Instinct

> **Aplicación móvil standalone (Capacitor 6 + Android)**
> Estado: **v1.3.0** — release candidate
> Build: `applicationId = com.tnsvt.game` · `versionName = 1.3.0` · `versionCode = 8`

---

## 1. Resumen ejecutivo

**T.N.S.V.T Market Instinct** es un juego móvil de trading的教育 (educativo) que enseña a leer fractales de mercado, BOS (Break of Structure), LG (Last Gap), Zonas de Oferta/Demanda y Setup 2-Step. El usuario compite contra gráficos generados algorítmicamente, contra la IA, contra otros traders en torneos y opera con precios reales en modo Portfolio.

### Características principales

- **7 modos de juego** (Classic, Survival, Daily Challenge, Arena 1vs1, Modo Histórico, Modo Fractal, Portfolio, Torneo)
- **17 temas visuales** (Rainbow, Lava, Aurora, Neon City, Galaxia, Diamante Negro, Cosmic Drift, Unicornio Pastel, Aurora Boreal Pro, T.N.S.V.T Original, + 7 más)
- **12 marcos de avatar** (Corona de Oro, Aura Violeta, Llama Viva, Diamante Prisma, Plasma Verde, Rojo Sangre, Galaxia, Rayo Eléctrico, Olas del Mercado, Infernal, Cristal Diamante, Sin Marco)
- **14 avatares** (Bull, Bear, Whale, AlgoBot, Fox, Oráculo, Shark, + 7 más)
- **7 efectos de acierto** (Confetti Storm, Lightning Strike, Nova Explosion, Star Rain, Matrix Rain, Aurora, Shockwave)
- **4 fondos ambientales** (Matrix Rain, Star Rain, Aurora Curtain, Galaxy Particles) — exclusivos, permanentes detrás del juego
- **50+ variaciones de gráficos** (volatilidad × trend × pattern × spike × gap)
- **Precios en tiempo real** vía CoinGecko (BTC, ETH, SOL, BNB, XRP) + simulación para macro (GOLD, SP500, NAS100, DXY, EURUSD)
- **Leaderboards y ranking global** vía backend Symfony (TNSVT Sync)
- **Sistema de gamificación** con XP, rangos, misiones diarias/semanales, achievements, tienda
- **Sistema económico progresivo** (~3.5 meses para tienda completa)

---

## 2. Sistema de recompensas

### 2.1 XP — Economía

| Parámetro | Valor |
|---|---|
| **Multiplicador base** | `0.075` (los valores nominales declarados en el código son teóricos, el XP real guardado es ×0.075) |
| **`XP_ECONOMY_VERSION`** | `3` (si cambia, auto-reset al upgrade para evitar ventaja de jugadores beta) |
| **Persistencia** | `localStorage.tnsvt_xp` + `localStorage.tnsvt_xp_version` |

### 2.2 Rangos (RANKS)

| Rango | XP mínimo | Color |
|---|---|---|
| NOVICE | 0 | `#6a5a8a` |
| APPRENTICE | 500 | `#60a5fa` |
| OPERATOR | 1,500 | `#a78bfa` |
| STRATEGIST | 3,500 | `#c8a0ff` |
| MASTER | 7,000 | `#f0c060` |
| ORACLE | 15,000 | `#ffd700` |

### 2.3 XP por actividad (valores mostrados al usuario, ya aplicados ×0.075)

#### Classic Mode
| Acción | XP |
|---|---|
| Correcto (racha < 3) | +7 |
| Correcto (racha 3-4) | +13 |
| Correcto (racha 5+) | +18 |

#### Streak Milestones (Classic)
| Racha | Logro | XP bonus |
|---|---|---|
| 3 | Triple Exacto | +7 |
| 5 | Llama Viva | +15 |
| 10 | Imparable | +37 |
| 20 | En Llamas | +60 |
| 50 | Dedicado Total | +150 |

#### Survival Mode
| Ronda | XP |
|---|---|
| 1 | +4 |
| 5 | +8 |
| 10 | +12 |
| 15+ | +22 |

#### Daily Challenge
| Resultado | XP |
|---|---|
| Acierto | +22 |
| Skip | 0 |
| Incorrecto | +1 (por participar) |

#### Arena 1vs1
| Resultado | XP |
|---|---|
| Victoria | +22 |
| Empate | +11 |
| Derrota | +5 |

#### Histórico
| Dificultad | XP por acierto |
|---|---|
| Fácil | +7 |
| Medio | +15 |
| Difícil | +26 |

#### Fractal Modes (BOS / LG / ZONAS / SETUP)
| Modo | XP base |
|---|---|
| BOS | +15 |
| LG | +18 |
| ZONAS | +22 |
| SETUP 2-STEP | +37 |

#### Torneo
| Posición final | XP |
|---|---|
| 🏆 Leyenda (≥100% P&L) | +225 |
| 🥇 1° Lugar (≥50%) | +150 |
| 🥈 2° Lugar (≥25%) | +75 |
| 🥉 3° Lugar (≥10%) | +37 |
| Top 10 (≥0%) | +22 |
| Participante | +3-15 |

#### Misiones (diarias y semanales)
- **Diarias**: +7 a +22 XP cada una
- **Semanales**: +22 a +90 XP cada una

#### Logros (Achievements)
21 logros disponibles, XP entre +3 y +150.

### 2.4 Progresión esperada (×0.075)

| Métrica | Valor |
|---|---|
| XP/día Classic (jugador promedio) | ~225 |
| Días hasta MAESTRO | ~31 |
| Días hasta ORÁCULO | ~66 |
| Compra tienda completa | ~110 días (~3.5 meses) |
| Items premium/semana | ~1 |
| Completionist (todo desbloqueado) | ~6 meses |

### 2.5 Misiones Diarias (9 totales)

| ID | Misión | XP |
|---|---|---|
| d1 | Acertar 5 operaciones | +11 |
| d2 | Racha de 3 en Survival | +15 |
| d3 | Jugar el Daily Challenge | +7 |
| d4 | Ganar 1 Arena 1vs1 | +18 |
| d5 | Operar 3 activos distintos | +13 |
| d6 | Acertar 1 trade en 2 timeframes | +15 |
| d7 | Llegar a ronda 5 en Survival | +16 |
| d8 | Completar 1 evento histórico | +22 |
| d9 | Hacer 1 long + 1 short en Classic | +12 |

### 2.6 Misiones Semanales (6 totales)

| ID | Misión | XP |
|---|---|---|
| w1 | 200 operaciones totales | +75 |
| w2 | Jugar 5 días seguidos | +37 |
| w3 | Completar 3 eventos históricos | +45 |
| w4 | Llegar a rango ESTRATEGA | +60 |
| w5 | Acertar 30 trades en Survival | +90 |
| w6 | Comprar 1 item en la tienda | +22 |

### 2.7 Logros (21 totales)

| ID | Logro | XP |
|---|---|---|
| first | Primer Trade | +3 |
| streak3 | Triple Exacto | +7 |
| streak5 | Llama Viva | +15 |
| survivor | Superviviente | +22 |
| daily7 | Semana Completa | +37 |
| arena10 | Gladiador | +30 |
| torneo1 | Campeón | +75 |
| hist | Historiador | +45 |
| oracle | Oráculo | +150 |
| precision80 | Cirujano | +60 |
| bos_first | Cazador de BOS | +45 |
| lg_master | Maestro del LG | +52 |
| zone_pro | Cartógrafo | +37 |
| streak10 | Imparable | +37 |
| trader_rich | Ballena | +67 |
| all_assets | Polímata | +30 |
| all_modes | Versátil | +45 |
| speed_demon | Speed Trader | +33 |
| win_streak5 | Rey de la Racha | +60 |
| no_skip_streak | Decisor | +41 |

### 2.8 Tienda (SISTEMA DE COMPRA)

- **Moneda**: XP (se gasta, no se gana)
- **Categorías**: Marcos · Avatars · Temas · Efectos · Fondos
- **Equipping**: solo 1 item activo por categoría (excepto Marcos/Avatars/Efectos que son opcionales)
- **Persistencia**: `localStorage.tnsvt_shop` (Set de IDs) + `localStorage.tnsvt_equipped` (objeto)
- **Costos**: entre 300 XP (items básicos) y 3,000 XP (premium)

---

## 3. Modos de juego

### 3.1 Classic Mode (`s-classic`)
- Predicción Long / Short / Skip sobre gráfico de 40 velas
- Timeframes: 5M, 15M, 1H, 4H, 1D, 1W
- Activos: BTC, ETH, SOL, BNB, XRP, GOLD, SP500, NAS100, EURUSD, WTI, DXY
- Animación del resultado: 5 velas adicionales se revelan
- Milestone visual con `showMilestone()`: "Great!" / "Excellent!" / "Oracle Mind" / "You are Master!" / "En Llamas!" / "¡DEDICADO!"

### 3.2 Survival (`s-survival`)
- 3 vidas, rondas infinitas
- Dificultad progresiva: ronda 1-3 = FÁCIL, 4-6 = MEDIA, 7-12 = DIFÍCIL, 13+ = EXTREMA
- Racha de 3 → +50% XP, racha de 5 → +100% XP + recupera vida
- Game Over al perder 3 vidas

### 3.3 Daily Challenge (`s-daily`)
- 1 chart por día, mismo para todos los usuarios (seeded)
- 1 solo intento
- Auto-rotación diaria con countdown
- Asset: BTC, ETH, SOL, GOLD, SP500 (rotado)

### 3.4 Arena 1vs1 (`s-arena`)
- 5 rondas contra un rival IA
- Time bonus: si responde antes de 10s, +50 XP
- Rival aleatorio con winrate variable

### 3.5 Modo Histórico (`s-historico`)
- 22 eventos reales del mercado: FTX, COVID, BTC ETF, SNB, Terra/LUNA, CPI, Lehman, Flash Crash 2010, Brexit, SVB, BlackRock ETF, DeFi Summer, Ethereum Merge, CZ Resignation, Tesla FOMO, Amazon COVID, Oil Goes Negative, Gold COVID, Euro-Dollar Parity, Dot-com, China Ban, Libra Crisis
- Cada evento tiene contexto macro completo
- Al acertar muestra "lesson" educativa

### 3.6 Modo Fractal (`s-fractal`)
4 sub-modos con gráficos interactivos:
- **BOS** — Marcar el nivel del Break of Structure
- **LG** — Marcar el nivel del Last Gap
- **ZONAS** — Identificar zona institucional
- **SETUP** — Análisis completo BOS + LG + Zona + Entry

### 3.7 Portfolio (`s-portfolio`)
- $50,000 virtuales
- 7 activos operables: BTC, ETH, SOL, BNB, XRP, GOLD, SP500
- Stop Loss, Take Profit, Trailing Stop
- Mini-charts de posición con histórico de precio
- Stats: Win Rate, Max Drawdown, P&L Cerrado
- **Persistencia**: balance + posiciones + history en `localStorage.tnsvt_portfolio`
- **Integración con Torneo**: el torneo toma "prestado" del portfolio y devuelve el capital + P&L al finalizar

### 3.8 Torneo (`s-torneos`)
- 3 tiers: Free, Pro, VIP
- 3 formatos: Classic, Knockout, Consistency
- 3 stages: Qualifying, Semifinal, Final (12 rondas cada uno)
- News events por ronda (bullish/bearish/volatile)
- Bounty targets, Jackpot pool
- Leaderboard en vivo
- Inscripción vía TNSVT Sync (backend) o práctica local

---

## 4. Sistema económico

### 4.1 Filosofía

El XP es **escaso por diseño**. La idea es:
1. **Juego de 1-3 meses** para desbloquear todo
2. **Incentivar mastery** (más racha = más XP por respuesta)
3. **Premiar consistencia** (misiones diarias/semanales)
4. **Crear成就感 (sense of achievement)** en hitos (logros)

### 4.2 Multiplicador histórico

| Versión | Multiplicador | Días para MAESTRO | Días tienda completa |
|---|---|---|---|
| v1.0 (inicial) | 1.0 (×1) | 1 | 2 |
| v1.1 (×0.5) | 0.5 | 5 | 17 |
| v1.2 (×0.15) | 0.15 | 16 | 55 |
| **v1.3 (×0.075)** | **0.075** | **31** | **110** |

### 4.3 Lógica de reset al upgrade

```js
const XP_ECONOMY_VERSION = 3;
if(localStorage.tnsvt_xp_version < XP_ECONOMY_VERSION){
  localStorage.removeItem('tnsvt_xp');
  STATE.xp = 0;
  STATE.rank = 'NOVICIO';
  localStorage.setItem('tnsvt_xp_version', String(XP_ECONOMY_VERSION));
  showToast('🔄 Economía de XP recalibrada — empezás de cero');
}
```

### 4.4 Anti-bot / Anti-cheat

- `lastPricesFetch` validado: si tiene < 35s, los precios cripto son LIVE
- `STATE.marketData.updatedAt` previene manipulación
- `STATE.pricesLive` flag para auditoría
- Items comprados: persistencia con Set, no se duplican

---

## 5. Personalización

### 5.1 Temas (THEMES)

| ID | Nombre | XP | Atributos |
|---|---|---|---|
| th0 | T.N.S.V.T Original | free | Default |
| th1-th7 | Cyber Green, Blood Moon, etc. | 300-800 | Varios |
| th8 | 🌈 Rainbow | 1000 | `isRainbow` |
| th9 | 🌋 Lava | 1200 | `isLava` |
| th10 | 🌌 Aurora | 1500 | `isAurora` |
| th11 | 🌃 Neon City | 1800 | `isNeon` |
| th12 | 🌌 Galaxia Profunda | 2400 | `isGalaxy` |
| th13 | 💎 Diamante Negro | 2600 | `isDiamond` |
| th14 | 🚀 Cosmic Drift | 2800 | `isCosmic` |
| th15 | 🦄 Unicornio Pastel | 2300 | `isUnicorn` |
| th16 | 🌌 Aurora Boreal Pro | 3000 | `isAuroraBoreal` |

### 5.2 Marcos (FRAMES)

12 marcos, incluyendo:
- **fr1** Corona de Oro (+300 XP) — glow gold
- **fr2** Aura Violeta (+300 XP) — animación `aura-pulse`
- **fr3** Llama Viva (+300 XP) — `fire-flicker`
- **fr4** Diamante Prisma (+400 XP) — `spin-rainbow` con `@property --angle`
- **fr5** Plasma Verde (+500 XP) — `plasma-pulse`
- **fr6** Rojo Sangre (+600 XP) — `blood-pulse`
- **fr7** Galaxia (+800 XP) — gradient rotatorio
- **fr8** ⚡ Rayo Eléctrico (+1000 XP) — `lightning-frame` (parpadeo tipo descarga)
- **fr9** 🌊 Olas del Mercado (+1500 XP) — `wave-rotate` con gradient cyan→azul
- **fr10** 🔥 Infernal (+2000 XP) — `fire-pulse` agresivo (glow rojo-naranja)
- **fr11** 💎 Cristal Diamante (+2500 XP) — gradient multicolor rotatorio

### 5.3 Fondos (BACKGROUNDS_SHOP) — Novedad v1.3

4 fondos ambientales permanentes detrás de la UI:
- **bg0** Sin Fondo (free)
- **bg1** 🟢 Matrix Rain (+1200 XP) — columnas verdes cayendo con código BOS/LG
- **bg2** ✨ Star Rain (+900 XP) — estrellas doradas titilando
- **bg3** 🌌 Aurora Curtain (+1500 XP) — cortinas verde-violeta cubriendo pantalla
- **bg4** 🔵 Galaxy Particles (+1800 XP) — red neuronal con 60 partículas conectadas

Implementación:
- CSS `.bg-layer{position:absolute;inset:0;z-index:0;pointer-events:none}` insertado en `<style>` inicial
- `applyBackground(id)` inserta el wrapper en `#app` (no en `body`) para que aparezca detrás de los screens
- `body.classList.add('has-bg')` activa modo transparente en screens
- `backdrop-filter:blur(10px)` en cards para legibilidad

---

## 6. Stack técnico

### 6.1 Frontend

- **HTML5** single-file (`www/index.html`, ~9100 líneas)
- **CSS3** inline (~2000 líneas, con `@property`, keyframes custom)
- **JavaScript** vanilla ES2020+ (sin frameworks)
- **WebView** Android (Capacitor 6 wrapper)

### 6.2 Mobile (Capacitor 6)

- `@capacitor/cli` 6.x
- `@capacitor/browser` 6.0.5
- `@capacitor/push-notifications` 6.0.5
- `@capacitor/splash-screen` 6.0.4
- `@capacitor/status-bar` 6.0.3

### 6.3 APIs externas

- **CoinGecko**: `https://api.coingecko.com/api/v3/simple/price` para precios live
- **Backend TNSVT Symfony** (opcional): TNSVT Sync para enviar scores, leaderboards, torneos

### 6.4 Build

```
npx cap sync android           # Copia www/ a android/app/src/main/assets/public/
cd android && gradlew assembleDebug    # Build APK debug (~4-5 MB)
cd android && gradlew assembleRelease  # Build APK release firmado
adb install -r app-debug.apk    # Install en device
```

---

## 7. Build & deploy

### 7.1 Keystore

- `android/app/tnsvt-release.keystore` (RSA 2048, válido 10000 días)
- Password en `android/app/keystore.properties` (no commiteado)
- Alias: `tnsvt`

### 7.2 Build comandos

```bash
# Sync web assets
npx cap sync android

# Debug APK (sin firma)
cd android && .\gradlew.bat assembleDebug

# Release APK firmado
cd android && .\gradlew.bat assembleRelease

# Install en device
adb install -r app-release.apk

# Logcat
adb logcat | grep -i "chromium\|console\|tnsvt"
```

### 7.3 Versioning

| Version | versionCode | fecha | Highlights |
|---|---|---|---|
| 1.0.0 | 1 | (legacy) | Initial release |
| 1.2.0 | 7 | Jun 2026 | Temas premium (5 nuevos) |
| **1.3.0** | **8** | **Jun 2026** | **Versión final con XP recalibrado, Portfolio sync, Fondos, Splash** |

---

## 8. Roadmap (post-v1.3)

### Corto plazo (próximas 2 semanas)
- [ ] Investigar el crash del WebView al cargar (línea 1: `Cannot read properties of undefined (reading 'triggerEvent')`)
- [ ] Test E2E completo en device funcional
- [ ] Validar que los 4 fondos se ven correctamente con cards translúcidas

### Mediano plazo (1-2 meses)
- [ ] Notificaciones push para Daily Challenge disponible
- [ ] Soporte iOS (Capacitor iOS)
- [ ] Sincronización cloud del portfolio entre devices
- [ ] Leaderboard global en backend

### Largo plazo (3-6 meses)
- [ ] Marketplace para vender marcos/temas custom
- [ ] Modo cooperativo (2 traders vs mercado)
- [ ] Streaming de trades en vivo (Twitch integration)
- [ ] AI training mode: el rival aprende del usuario

---

## 9. Testing

### 9.1 Manual E2E (TEST_PLAN.md)
- 40+ casos de prueba cubriendo cada modo
- Smoke tests en `adb-smoke/`
- 20+ reportes de ejecución en `adb-smoke/results/`

### 9.2 Bugs conocidos (v1.3)
- **WebView crash al cargar**: `TypeError: Cannot read properties of undefined (reading 'triggerEvent')` en línea 1 — pre-existente, no causado por cambios v1.3. Requiere investigación del runtime de Capacitor.
- **WebView tap issues**: en algunas pantallas los `adb shell input tap` no penetran el WebView (limitación de la herramienta, no de la app)

---

## 10. Licencia y créditos

- **Desarrollado por**: TNSVT Team
- **Inspirado en**: Methodology T.N.S.V.T (BOS + LG + ZONAS + SETUP)
- **Eventos históricos**: basados en crónicas públicas de Bloomberg, FT, Wikipedia
- **Iconos**: emoji estándar Unicode
- **Tipografías**: Cinzel (logo) + Inter (UI) + JetBrains Mono (números)

---

**FIN del documento TNSVT-FINAL.md v1.3.0**

> Convertir a PDF: `pandoc TNSVT-FINAL.md -o TNSVT-PROYECTO-PLAN.pdf`