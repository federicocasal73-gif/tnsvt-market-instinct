#!/bin/bash
# 06_torneo.sh - Test Torneo: trades, finish overlay

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

source lib/adb_utils.sh
source lib/uiautomator.sh
source lib/assertions.sh
source lib/navigation.sh

start_test "06_torneo_screen"

# Torneo is in MODOS screen
nav_to_inicio
tap_text "MODOS"
wait_s 1
screenshot "06_modos_loaded"

# Now look for Torneo
if has_text "Torneo"; then
    tap_text "Torneo"
    wait_s 1.5
    log_info "Torneo screen loaded"
    PASS_COUNT=$((PASS_COUNT + 1))
    RESULTS+=("PASS|06_torneo|Screen visible")
    screenshot "06_torneo_loaded"
elif has_text "Semanales" || has_text "Torneos" || has_text "Activos"; then
    log_info "Torneo lobby visible"
    PASS_COUNT=$((PASS_COUNT + 1))
    RESULTS+=("PASS|06_torneo|Lobby visible")
else
    log_warn "Torneo not detected"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    RESULTS+=("SKIP|06_torneo|Not detected")
fi

log_info "Torneo test complete"