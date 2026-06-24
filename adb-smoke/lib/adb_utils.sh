#!/bin/bash
# adb_utils.sh - Core ADB wrappers

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Package info
PACKAGE="com.tnsvt.game"
ACTIVITY="com.tnsvt.game/.MainActivity"
DEVICE_SERIAL="RFCXA0HZXFZ"

# Log helpers
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Screenshot to results dir
screenshot() {
    local name="$1"
    local path="results/screenshots/${name}.png"
    adb -s "$DEVICE_SERIAL" exec-out screencap -p > "$path" 2>/dev/null
    log_info "Screenshot saved: $path"
}

# Tap by coordinates (fallback only)
tap_xy() {
    local x="$1"
    local y="$2"
    adb -s "$DEVICE_SERIAL" shell input tap "$x" "$y"
    sleep 0.3
}

# Swipe (for charts, scroll)
swipe() {
    local x1="$1" y1="$2" x2="$3" y2="$4" duration="${5:-300}"
    adb -s "$DEVICE_SERIAL" shell input swipe "$x1" "$y1" "$x2" "$y2" "$duration"
    sleep 0.3
}

# Input text
input_text() {
    local text="$1"
    # Replace spaces with %s for adb
    local escaped=$(echo "$text" | sed 's/ /%s/g')
    adb -s "$DEVICE_SERIAL" shell input text "$escaped"
    sleep 0.2
}

# Press back
press_back() {
    adb -s "$DEVICE_SERIAL" shell input keyevent KEYCODE_BACK
    sleep 0.3
}

# Press home
press_home() {
    adb -s "$DEVICE_SERIAL" shell input keyevent KEYCODE_HOME
    sleep 0.5
}

# Kill app
kill_app() {
    adb -s "$DEVICE_SERIAL" shell am force-stop "$PACKAGE"
    sleep 0.5
}

# Start app
start_app() {
    adb -s "$DEVICE_SERIAL" shell am start -n "$ACTIVITY" 2>/dev/null
    sleep 2
}

# Clear app data (fresh state)
reset_app() {
    log_info "Resetting app data..."
    adb -s "$DEVICE_SERIAL" shell pm clear "$PACKAGE"
    sleep 1
    start_app
}

# Wait helper
wait_s() {
    local seconds="$1"
    sleep "$seconds"
}