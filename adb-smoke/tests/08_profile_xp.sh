#!/bin/bash
# 08_profile_xp.sh - Test Profile XP live updates

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

source lib/adb_utils.sh
source lib/uiautomator.sh
source lib/assertions.sh
source lib/navigation.sh

start_test "08_profile_xp_before"

# Navigate to Perfil
nav_to_perfil
wait_s 1
screenshot "08_profile_xp_before"

# Get current XP value from dump
dump_ui
initial_xp=$(grep -oE 'text="2,340 XP"|text="[0-9,]+ XP"' .ui_dump.xml | head -1 | grep -oE '[0-9,]+')
log_info "Initial XP: $initial_xp"

if [ -n "$initial_xp" ]; then
    PASS_COUNT=$((PASS_COUNT + 1))
    RESULTS+=("PASS|08_profile_xp|Initial XP detected: $initial_xp")
else
    log_warn "Could not read initial XP"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    RESULTS+=("SKIP|08_profile_xp|No XP found")
    return 0
fi

start_test "08_profile_xp_after_round"

# Go back to inicio and play a classic round
nav_to_inicio
wait_s 1

# Tap Classic card
if has_text "Classic"; then
    tap_text "Classic"
    wait_s 1.5
fi

# Play 2 quick rounds
for i in 1 2; do
    if has_text "LONG"; then
        tap_long
        wait_s 2.5
    fi
done

# Go back to perfil
nav_to_perfil
wait_s 1
screenshot "08_profile_xp_after"

# Re-read XP
dump_ui
new_xp=$(grep -oE 'text="[0-9,]+ XP"' .ui_dump.xml | head -1 | grep -oE '[0-9,]+')
log_info "New XP: $new_xp"

# Compare
if [ -n "$new_xp" ] && [ "$new_xp" != "$initial_xp" ]; then
    log_info "XP changed: $initial_xp -> $new_xp"
    PASS_COUNT=$((PASS_COUNT + 1))
    RESULTS+=("PASS|08_profile_xp_update|XP updated live ($initial_xp -> $new_xp)")
else
    log_warn "XP did not change ($initial_xp -> $new_xp)"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    RESULTS+=("FAIL|08_profile_xp_update|XP did not update")
fi

log_info "Profile XP test complete"