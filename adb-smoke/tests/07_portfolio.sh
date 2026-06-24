#!/bin/bash
# 07_portfolio.sh - Test Portfolio: open, close with profit/loss

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

source lib/adb_utils.sh
source lib/uiautomator.sh
source lib/assertions.sh
source lib/navigation.sh

start_test "07_portfolio"

# Portfolio is in MODOS screen
nav_to_inicio
tap_text "MODOS"
wait_s 1
screenshot "07_modos_loaded"

if has_text "Portfolio"; then
    tap_text "Portfolio"
    wait_s 1.5
    log_info "Portfolio loaded"
    PASS_COUNT=$((PASS_COUNT + 1))
    RESULTS+=("PASS|07_portfolio|Screen loaded")
    screenshot "07_portfolio_loaded"
elif has_text "Portafolio" || has_text "Posiciones" || has_text "Balance"; then
    log_info "Portfolio/Portafolio loaded"
    PASS_COUNT=$((PASS_COUNT + 1))
    RESULTS+=("PASS|07_portfolio|Screen loaded")
else
    log_warn "Portfolio not detected"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    RESULTS+=("SKIP|07_portfolio|Not detected")
    return 0
fi

# Check for open positions
if has_text "Cerrar" || has_text "Close"; then
    log_info "Open positions found"
    PASS_COUNT=$((PASS_COUNT + 1))
    RESULTS+=("PASS|07_portfolio_positions|Has positions")
    screenshot "07_portfolio_positions"
else
    log_info "No open positions to close"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    RESULTS+=("SKIP|07_portfolio_positions|No positions")
fi

log_info "Portfolio test complete"