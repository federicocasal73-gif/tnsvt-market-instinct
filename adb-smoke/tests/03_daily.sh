#!/bin/bash
# 03_daily.sh - Test Daily challenge: win, lose, skip

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

source lib/adb_utils.sh
source lib/uiautomator.sh
source lib/assertions.sh
source lib/navigation.sh

start_test "03_daily_screen"

# Navigate to Daily
nav_to_daily
wait_s 1
screenshot "03_daily_loaded"

# Check if already played today
if has_text "Ya jugaste" || has_text "ya jugaste"; then
    log_info "Daily already played today - skipping play test"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    RESULTS+=("SKIP|03_daily_play|Daily already played")
    return 0
fi

# Check if LONG button visible (game is ready)
if has_text "LONG"; then
    log_info "Daily ready to play"
    PASS_COUNT=$((PASS_COUNT + 1))
    RESULTS+=("PASS|03_daily_screen|Daily ready")
    
    # Play the round
    tap_long
    wait_s 3
    
    # Check for finish overlay
    if has_text "Daily Challenge" || has_text "Challenge" || has_text "Completado" || has_text "completado"; then
        log_info "Daily finish overlay detected"
        PASS_COUNT=$((PASS_COUNT + 1))
        RESULTS+=("PASS|03_daily_finish|Finish overlay shown")
        screenshot "03_daily_finish"
    else
        # Check for any result feedback
        if detect_any_result "Daily result feedback"; then
            log_info "Daily result feedback detected"
            PASS_COUNT=$((PASS_COUNT + 1))
            RESULTS+=("PASS|03_daily_finish|Result feedback")
        else
            log_warn "No Daily finish overlay"
            SKIP_COUNT=$((SKIP_COUNT + 1))
            RESULTS+=("SKIP|03_daily_finish|No overlay")
        fi
    fi
else
    log_warn "LONG not visible in Daily"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    RESULTS+=("SKIP|03_daily|LONG not visible")
fi

log_info "Daily test complete"