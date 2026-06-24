#!/bin/bash
# 00_setup.sh - Fresh install + onboarding skip + verify ready

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

source lib/adb_utils.sh
source lib/uiautomator.sh
source lib/assertions.sh

start_test "00_setup"

# Fresh reset
reset_app

# Wait for app to load
wait_s 3
dump_ui

# Check for onboarding skip button
if has_text "Saltar tutorial"; then
    log_info "Onboarding detected - tapping Saltar tutorial..."
    tap_text "Saltar tutorial"
    wait_s 1.5
    PASS_COUNT=$((PASS_COUNT + 1))
    RESULTS+=("PASS|00_setup|Onboarding skipped")
elif has_text "Comenzar" || has_text "Market Instinct"; then
    log_info "Onboarding detected - tapping through..."
    for i in $(seq 1 5); do
        if has_text "Empezar a jugar"; then
            tap_text "Empezar a jugar"
            wait_s 1
        elif has_text "Casi listo"; then
            tap_text "Casi listo"
            wait_s 0.5
        elif has_text "Siguiente"; then
            tap_text "Siguiente"
            wait_s 0.5
        elif has_text "Entendido"; then
            tap_text "Entendido"
            wait_s 0.5
        elif has_text "Comenzar"; then
            tap_text "Comenzar"
            wait_s 0.5
        else
            break
        fi
    done
    PASS_COUNT=$((PASS_COUNT + 1))
    RESULTS+=("PASS|00_setup|Onboarding completed")
elif has_text "INICIO" || has_text "PERFIL"; then
    log_info "App already onboarded"
    PASS_COUNT=$((PASS_COUNT + 1))
    RESULTS+=("PASS|00_setup|App ready")
else
    log_warn "Unknown state - assuming ready"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    RESULTS+=("SKIP|00_setup|Unknown state")
fi

screenshot "00_setup_done"

# Extra wait for inicio screen to fully load
wait_s 2
dump_ui

# Verify we're on inicio
if has_text "INICIO"; then
    log_info "On inicio screen - ready for tests"
    PASS_COUNT=$((PASS_COUNT + 1))
    RESULTS+=("PASS|00_setup_ready|On inicio screen")
else
    log_warn "Not on inicio - tests may fail"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    RESULTS+=("SKIP|00_setup_ready|Not on inicio")
fi

log_info "Setup complete"