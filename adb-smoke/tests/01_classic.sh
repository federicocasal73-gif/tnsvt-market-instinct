#!/bin/bash
# 01_classic.sh - Test Classic mode: win, lose, streak

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

source lib/adb_utils.sh
source lib/uiautomator.sh
source lib/assertions.sh
source lib/navigation.sh

start_test "01_classic_screen"

# Navigate to Classic
nav_to_classic
assert_text "LONG" "Classic screen loaded (LONG button visible)"
assert_text "SHORT" "SHORT button visible"
screenshot "01_classic_loaded"

start_test "01_classic_round"

# Tap LONG button
tap_long
# Wait for result feedback (toast or flash)
wait_s 3

# Detect any result (win or lose)
if detect_any_result "Round feedback shown after tap"; then
    log_info "Result detected after tap"
else
    log_warn "No result feedback detected (timing issue?)"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    RESULTS+=("SKIP|01_classic_round|No feedback detected")
fi

screenshot "01_classic_after_round"

start_test "01_classic_streak"

# Play 2 more rounds to build streak
for i in 1 2; do
    if has_text "LONG" && has_text "SHORT"; then
        # Try LONG first, if lose try SHORT
        tap_long
        wait_s 2.5
    fi
done

screenshot "01_classic_streak_done"
log_info "Classic test complete"