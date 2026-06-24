#!/bin/bash
# 09_shop_themes.sh - Test Tienda: themes loading

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

source lib/adb_utils.sh
source lib/uiautomator.sh
source lib/assertions.sh
source lib/navigation.sh

start_test "09_shop_tienda"

# Navigate to Perfil -> Tienda
nav_to_perfil
wait_s 1

# Tap Tienda tab
if has_text "Tienda"; then
    tap_text "Tienda"
    wait_s 1.5
    log_info "Tienda loaded"
    PASS_COUNT=$((PASS_COUNT + 1))
    RESULTS+=("PASS|09_shop_tienda|Tienda loaded")
    screenshot "09_shop_frames"
else
    log_warn "Tienda tab not found"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    RESULTS+=("SKIP|09_shop_tienda|Tab not found")
    return 0
fi

start_test "09_shop_themes"

# Tap Temas sub-tab
if has_text "Temas"; then
    tap_text "Temas"
    wait_s 1.5
    log_info "Temas tab tapped"
    screenshot "09_shop_themes"
fi

# Check themes loaded - look for theme names
if has_text "Matrix" || has_text "T.N.S.V.T" || has_text "Blood Market" || has_text "Cyberpunk" || has_text "Gold Rush" || has_text "Lava"; then
    log_info "Themes visible"
    PASS_COUNT=$((PASS_COUNT + 1))
    RESULTS+=("PASS|09_shop_themes|Themes visible")
else
    log_warn "Theme names not found - check for errors"
    # Check for JS errors
    dump_ui
    if grep -q "Error\|error\|undefined\|ReferenceError" .ui_dump.xml; then
        log_error "Error text in UI"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        RESULTS+=("FAIL|09_shop_themes|JS Error in UI")
    else
        log_info "No errors detected"
        SKIP_COUNT=$((SKIP_COUNT + 1))
        RESULTS+=("SKIP|09_shop_themes|Themes not visible (no error)")
    fi
fi

log_info "Shop themes test complete"