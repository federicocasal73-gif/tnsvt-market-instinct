# Test Plan - Market Instinct v1.2.0

## Device Info
- **Device ID**: RFCXA0HZXFZ
- **Package**: com.tnsvt.game
- **Build Date**: 2026-06-23
- **Tester**: TNSVT Team

---

## Test Matrix (40+ casos)

### CLASSIC MODE (7 casos)

| ID | Acción | Input | Esperado | Pass/Fail | Evidencia |
|----|--------|-------|----------|-----------|-----------|
| C-01 | Acierto Long | Tap LONG | Verde + "¡Correcto!" + +50 XP |  |  |
| C-02 | Acierto Short | Tap SHORT | Verde + "¡Correcto!" + +50 XP |  |  |
| C-03 | Fallo Long | Tap SHORT (mercado bullish) | Rojo + "El mercado fue alcista" |  |  |
| C-04 | Fallo Short | Tap LONG (mercado bearish) | Rojo + "El mercado fue bajista" |  |  |
| C-05 | Skip | Tap SKIP | Gris + "Saltado" |  |  |
| C-06 | Streak 3 | 3 aciertos consecutivos | ×1.5 multiplicador visual |  |  |
| C-07 | Streak 5 | 5 aciertos consecutivos | ×2 multiplicador + efectos extra |  |  |

### SURVIVAL MODE (5 casos)

| ID | Acción | Input | Esperado | Pass/Fail | Evidencia |
|----|--------|-------|----------|-----------|-----------|
| S-01 | Acierto | Tap LONG/SHORT | Verde + +pts + vida mantenida |  |  |
| S-02 | Fallo -1 vida | Tap incorrecto | Rojo + "-1 vida" + lives-- |  |  |
| S-03 | Game Over | 3 fallos | Overlay 💀 "Game Over" + stats |  |  |
| S-04 | Racha recupera vida | 5+ aciertos | "+1 ❤️" + vida++ |  |  |
| S-05 | Skip | Tap SKIP | Gris + racha reseteada |  |  |

### DAILY CHALLENGE (3 casos)

| ID | Acción | Input | Esperado | Pass/Fail | Evidencia |
|----|--------|-------|----------|-----------|-----------|
| D-01 | Acierto | Tap LONG/SHORT | Overlay 🏆 + +150 XP |  |  |
| D-02 | Fallo | Tap incorrecto | Overlay 📊 + +25 XP |  |  |
| D-03 | Skip | Tap SKIP | Overlay — + 0 XP |  |  |

### FRACTAL MODE (3 casos)

| ID | Acción | Input | Esperado | Pass/Fail | Evidencia |
|----|--------|-------|----------|-----------|-----------|
| F-01 | Precisión ≥80% | 5 rondas excelentes | Overlay 🎯 "¡Ojo de Fractal!" + fxWin |  |  |
| F-02 | Precisión 50-79% | 5 rondas medias | Overlay 📊 "Buen análisis" + playCorrect |  |  |
| F-03 | Precisión <50% | 5 rondas malas | Overlay 📈 "Seguí practicando" + playWrong |  |  |

### ARENA 1VS1 (2 casos)

| ID | Acción | Input | Esperado | Pass/Fail | Evidencia |
|----|--------|-------|----------|-----------|-----------|
| A-01 | Victoria | Ganar 3/5 rondas | Overlay 🏆 "¡Victoria!" + +150 XP |  |  |
| A-02 | Derrota | Perder 3/5 rondas | Overlay 💀 + +37 XP |  |  |

### TORNEO (3 casos)

| ID | Acción | Input | Esperado | Pass/Fail | Evidencia |
|----|--------|-------|----------|-----------|-----------|
| T-01 | Trade ganador | LONG/SHORT correcto | playCorrect + portfolio sube |  |  |
| T-02 | Trade perdedor | LONG/SHORT incorrecto | playWrong + portfolio baja |  |  |
| T-03 | Finish | Completar torneo | Overlay 🏆 con stats (PnL, Win Rate, XP) |  |  |

### PORTFOLIO (4 casos)

| ID | Acción | Input | Esperado | Pass/Fail | Evidencia |
|----|--------|-------|----------|-----------|-----------|
| P-01 | Abrir posición LONG | Buy BTC | Toast + playCorrect |  |  |
| P-02 | Cerrar con ganancia | Close + | Overlay 🎯 con PnL + |  |  |
| P-03 | Cerrar con pérdida | Close - | Overlay 📉 con PnL - |  |  |
| P-04 | Margen insuficiente | Tamaño > balance | Toast warning + playWrong |  |  |

### PERFIL / XP (4 casos)

| ID | Acción | Input | Esperado | Pass/Fail | Evidencia |
|----|--------|-------|----------|-----------|-----------|
| XP-01 | XP live update | Ganar ronda | Label XP actualiza en tiempo real |  |  |
| XP-02 | Barra progreso | XP cambia | Barra se mueve según % |  |  |
| XP-03 | Subir rango | Cruzar threshold | Toast "¡Nuevo rango!" + confetti |  |  |
| XP-04 | XP 50% aplicado | Verificar ganancia | XP ganado = pts/2 |  |  |

### TIENDA / TEMAS (3 casos)

| ID | Acción | Input | Esperado | Pass/Fail | Evidencia |
|----|--------|-------|----------|-----------|-----------|
| SH-01 | Frames cargan | Tab Frames | 12 items visibles |  |  |
| SH-02 | Temas cargan | Tab Temas | 12 items visibles (no error) |  |  |
| SH-03 | Auto-unlock | Toggle ON | 48 items desbloqueados |  |  |

---

## Bug Template

```markdown
### BUG-XXX: [Título corto]

**Severidad**: P0 / P1 / P2

**Pasos para reproducir**:
1. 
2. 
3. 

**Esperado**: 

**Actual**: 

**Screenshot**: 

**Logs**: 

**Notas**: 
```

### Severity Levels
- **P0**: Crash, data loss, bloquea flujo principal
- **P1**: Feature broken, UX severely degraded
- **P2**: Minor visual, edge case, polish

---

## Sign-off

| Campo | Valor |
|-------|-------|
| Fecha |  |
| Tester |  |
| Versión | 1.2.0 (code 7) |
| Total casos | 40 |
| Passed |  |
| Failed |  |
| % Pass |  |
| Bugs P0 |  |
| Bugs P1 |  |
| Bugs P2 |  |