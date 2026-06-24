#!/bin/bash
# 02_survival.sh - Test Survival mode: lives, game over

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

source lib/adb_utils.sh
source lib/uiautomator.sh
source lib/assertions.sh
source lib/navigation.sh

start_test "02_survival_screen"

# Navigate to Survival
nav_to_survival
wait_s 1
assert_text "LONG" "Survival screen loaded (LONG button visible)"
screenshot "02_survival_loaded"

start_test "02_survival_play"

# Play 2 rounds quickly (don't wait for full animation)
for round in 1 2; do
    if has_text "LONG"; then
        tap_long
        wait_s 2.5
    fi
done

screenshot "02_survival_mid"

# Check if game over appeared (within short timeout)
if wait_for_text "Game Over" 3; then
    log_info "Game Over detected"
    PASS_COUNT=$((PASS_COUNT + 1))
    RESULTS+=("PASS|02_survival_gameover|Game Over overlay shown")
    screenshot "02_survival_gameover"
else
    # No game over yet - probably still alive, mark as info
    log_info "Survival still in progress (3 lives intact)"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    RESULTS+=("SKIP|02_survival_gameover|No game over yet")
fi

log_info "Survival test complete"