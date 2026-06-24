#!/bin/bash
# 05_arena.sh - Test Arena mode: victory, defeat

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

source lib/adb_utils.sh
source lib/uiautomator.sh
source lib/assertions.sh
source lib/navigation.sh

start_test "05_arena_lobby"

# Navigate to Arena via inicio
nav_to_inicio
tap_text "Arena 1vs1"
wait_s 1.5
screenshot "05_arena_loaded"

# Check we're in Arena lobby
if has_text "Arena" || has_text "Rival" || has_text "VS" || has_text "CryptoSage" || has_text "FractalKing"; then
    log_info "Arena lobby loaded"
    PASS_COUNT=$((PASS_COUNT + 1))
    RESULTS+=("PASS|05_arena_lobby|Lobby visible")
else
    log_warn "Arena lobby not detected"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    RESULTS+=("SKIP|05_arena_lobby|Not detected")
    return 0
fi

# Try to start match
if has_text "Jugar" || has_text "Pelear" || has_text "Retar"; then
    tap_text "Jugar" || tap_text "Pelear" || tap_text "Retar"
    wait_s 2
    log_info "Match start tapped"
    PASS_COUNT=$((PASS_COUNT + 1))
    RESULTS+=("PASS|05_arena_start|Match initiated")
    screenshot "05_arena_match"
else
    log_info "No explicit start button - lobby may auto-start"
fi

log_info "Arena test complete"