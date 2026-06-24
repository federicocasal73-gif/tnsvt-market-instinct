#!/bin/bash
# navigation.sh - High-level navigation helpers

# Get the lib directory regardless of where this is sourced from
LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$LIB_DIR/adb_utils.sh"
source "$LIB_DIR/uiautomator.sh"

# Dismiss onboarding if present (overlay that blocks tests)
dismiss_onboarding() {
    # Onboarding shows "Saltar tutorial" or "Comenzar" buttons
    if has_text "Saltar tutorial"; then
        tap_text "Saltar tutorial"
        wait_s 1.5
    fi
    # If somehow still on onboarding, tap through
    for i in 1 2 3 4 5; do
        if has_text "Comenzar"; then
            tap_text "Comenzar"
            wait_s 0.5
        elif has_text "Entendido"; then
            tap_text "Entendido"
            wait_s 0.5
        elif has_text "Siguiente"; then
            tap_text "Siguiente"
            wait_s 0.5
        elif has_text "Casi listo"; then
            tap_text "Casi listo"
            wait_s 0.5
        elif has_text "Empezar a jugar"; then
            tap_text "Empezar a jugar"
            wait_s 1
        else
            break
        fi
    done
}

# Dismiss VIP paywall if present (overlay that blocks tests)
dismiss_vip_paywall() {
    if has_text "T.N.S.V.T VIP" || has_text "vipPaywall"; then
        # Tap X close button at bounds [795,467][882,554]
        tap_xy 838 510
        wait_s 1
    fi
}

# Quick nav: go to inicio first (works from any screen)
nav_to_inicio() {
    # ALWAYS dismiss overlays first
    dismiss_onboarding
    dismiss_vip_paywall
    # Check if INICIO nav button is visible
    if has_text "INICIO"; then
        tap_text "INICIO"
        wait_s 0.8
    else
        # Try going back
        press_back
        wait_s 0.5
        if has_text "INICIO"; then
            tap_text "INICIO"
            wait_s 0.8
        fi
    fi
    # Dismiss overlays again after navigation
    dismiss_onboarding
    dismiss_vip_paywall
}

# Reset state before a test (cheap, no app data clear)
reset_to_inicio() {
    nav_to_inicio
    wait_s 0.5
}

# Bottom nav tabs (uppercase, resource-id based for reliability)
nav_to_perfil() {
    nav_to_inicio
    dismiss_vip_paywall
    # PERFIL button is at the bottom nav: [771,2179][968,2337]
    tap_xy 870 2258
    wait_s 1
}

nav_to_modos() {
    nav_to_inicio
    dismiss_vip_paywall
    # MODOS button is at the bottom nav: [191,2179][388,2337]
    tap_xy 290 2258
    wait_s 1
}

nav_to_jugar() {
    nav_to_inicio
    dismiss_vip_paywall
    # JUGAR button is at the bottom nav: [385,2179][582,2337]
    tap_xy 484 2258
    wait_s 1
}

nav_to_liga() {
    nav_to_inicio
    dismiss_vip_paywall
    # LIGA button is at the bottom nav: [577,2179][777,2337]
    tap_xy 677 2258
    wait_s 1
}

nav_to_tienda() {
    nav_to_perfil
    # Click Tienda tab in perfil
    if has_text "Tienda"; then
        tap_text "Tienda"
        wait_s 1
    fi
}

# Navigate to mode card from inicio (faster, no extra nav)
nav_to_classic() {
    nav_to_inicio
    # The "Classic" text is inside a non-clickable div with onclick handler.
    # The WebView processes the click. Tap the "›" arrow on the right side
    # of the card which is the last visible element.
    # Classic card bounds: y=1313-1549, › at [855,1404][876,1457]
    if has_text "Classic"; then
        # Try tapping the arrow indicator first
        tap_xy 865 1430
        wait_s 1.5
    fi
    # If still on inicio, try tapping the card body
    if has_text "Classic" && ! has_text "LONG"; then
        tap_xy 200 1430
        wait_s 1.5
    fi
}

nav_to_survival() {
    nav_to_inicio
    # Survival card y=1567-1803, › at [855,1656][876,1712]
    if has_text "Survival"; then
        tap_xy 865 1685
        wait_s 1.5
    fi
    if has_text "Survival" && ! has_text "LONG"; then
        tap_xy 200 1685
        wait_s 1.5
    fi
}

nav_to_daily() {
    nav_to_inicio
    # Daily Challenge card y=835-1179, large area
    if has_text "Daily Challenge"; then
        tap_xy 480 1000
        wait_s 1.5
    fi
}

nav_to_fractal() {
    nav_to_inicio
    # Fractal card y=2074-2337, › at [824,2184][876,2239]
    if has_text "Modo Fractal"; then
        tap_xy 480 2200
        wait_s 1.5
    fi
}

nav_to_arena() {
    nav_to_inicio
    # Arena card y=1819-2058, › at [855,1911][876,1966]
    if has_text "Arena 1vs1"; then
        tap_xy 865 1940
        wait_s 1.5
    fi
    if has_text "Arena 1vs1" && ! has_text "Rival"; then
        tap_xy 200 1940
        wait_s 1.5
    fi
}

nav_to_torneo() {
    # Torneo is in MODOS screen
    nav_to_inicio
    tap_text "MODOS"
    wait_s 1
    if has_text "Torneo"; then
        tap_text "Torneo"
        wait_s 1.5
    fi
}

nav_to_portfolio() {
    # Portfolio is in MODOS screen
    nav_to_inicio
    tap_text "MODOS"
    wait_s 1
    if has_text "Portfolio"; then
        tap_text "Portfolio"
        wait_s 1.5
    fi
}

# Wait for screen to load
wait_screen_loaded() {
    local screen="$1"
    local timeout="${2:-5}"
    wait_for_text "$screen" "$timeout"
}

# Check current screen
current_screen() {
    dump_ui
    for screen in "LONG" "Survival" "Daily" "BOS" "Arena" "Torneo" "Portfolio"; do
        if has_text "$screen"; then
            echo "$screen"
            return
        fi
    done
    echo "unknown"
}

# Tap LONG button (used in classic/survival/daily)
tap_long() {
    tap_text "LONG"
    wait_s 0.3
}

# Tap SHORT button
tap_short() {
    tap_text "SHORT"
    wait_s 0.3
}

# Tap SKIP button
tap_skip() {
    tap_text "Skip"
    wait_s 0.3
}