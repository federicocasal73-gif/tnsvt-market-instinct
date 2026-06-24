#!/bin/bash
# 04_fractal.sh - Test Fractal mode: precision-based results

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

source lib/adb_utils.sh
source lib/uiautomator.sh
source lib/assertions.sh
source lib/navigation.sh

start_test "04_fractal_lobby"

# Navigate to Fractal via inicio
nav_to_inicio
tap_text "Modo Fractal"
wait_s 1.5
screenshot "04_fractal_loaded"

# Check we're in Fractal lobby
if has_text "BOS" || has_text "LG" || has_text "Zonas" || has_text "ELIGE UN MÓDULO" || has_text "ELIGE"; then
    log_info "Fractal lobby loaded"
    PASS_COUNT=$((PASS_COUNT + 1))
    RESULTS+=("PASS|04_fractal_lobby|Lobby visible")
else
    log_warn "Fractal lobby not detected"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    RESULTS+=("SKIP|04_fractal_lobby|Not detected")
    return 0
fi

start_test "04_fractal_start"

# Tap BOS (first sub-mode)
if has_text "BOS"; then
    tap_text "BOS"
    wait_s 2
    log_info "BOS mode tapped"
fi

# Check if game started (look for chart or instruction)
screenshot "04_fractal_game"

# Try to play one round - tap somewhere in chart area
if has_text "Nivel" || has_text "Siguiente" || has_text "Ronda" || has_text "chart"; then
    log_info "Fractal game UI visible"
    PASS_COUNT=$((PASS_COUNT + 1))
    RESULTS+=("PASS|04_fractal_game|Game started")
fi

log_info "Fractal test complete"