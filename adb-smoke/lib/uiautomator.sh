#!/bin/bash
# uiautomator.sh - UIAutomator-based element finding (robust)

# Set dump path to be relative to where script is run
DUMP_FILE="$(pwd)/.ui_dump.xml"

# Dump current UI to local temp file
dump_ui() {
    # First dump on device
    adb -s "RFCXA0HZXFZ" shell uiautomator dump /sdcard/window_dump.xml >/dev/null 2>&1
    # Then pull to local (pull doesn't have path translation issues)
    adb -s "RFCXA0HZXFZ" pull /sdcard/window_dump.xml "$DUMP_FILE" >/dev/null 2>&1
}

# Find element by text and return its bounds (x1,y1,x2,y2)
find_by_text() {
    local text="$1"
    dump_ui
    # Parse bounds for text="..."
    grep -o "text=\"[^\"]*${text}[^\"]*\"[^>]*bounds=\"\[[0-9,]*\]\[[0-9,]*\]\"" "$DUMP_FILE" | \
        grep -o 'bounds="\[[0-9,]*\]\[[0-9,]*\]"' | head -1
}

# Find element by content-desc
find_by_desc() {
    local desc="$1"
    dump_ui
    grep -o "content-desc=\"[^\"]*${desc}[^\"]*\"[^>]*bounds=\"\[[0-9,]*\]\[[0-9,]*\]\"" "$DUMP_FILE" | \
        grep -o 'bounds="\[[0-9,]*\]\[[0-9,]*\]"' | head -1
}

# Find element by resource-id
find_by_id() {
    local rid="$1"
    dump_ui
    grep -o "resource-id=\"[^\"]*${rid}[^\"]*\"[^>]*bounds=\"\[[0-9,]*\]\[[0-9,]*\]\"" "$DUMP_FILE" | \
        grep -o 'bounds="\[[0-9,]*\]\[[0-9,]*\]"' | head -1
}

# Parse bounds string "[x1,y1][x2,y2]" → center x,y
parse_bounds() {
    local bounds="$1"
    # Extract numbers
    local nums=$(echo "$bounds" | grep -o '[0-9]\+' )
    local x1=$(echo "$nums" | sed -n '1p')
    local y1=$(echo "$nums" | sed -n '2p')
    local x2=$(echo "$nums" | sed -n '3p')
    local y2=$(echo "$nums" | sed -n '4p')
    local cx=$(( (x1 + x2) / 2 ))
    local cy=$(( (y1 + y2) / 2 ))
    echo "$cx $cy"
}

# Tap by text (most robust)
tap_text() {
    local text="$1"
    local bounds=$(find_by_text "$text")
    if [ -z "$bounds" ]; then
        echo "[WARN] Text not found: $text"
        return 1
    fi
    local coords=$(parse_bounds "$bounds")
    adb -s "RFCXA0HZXFZ" shell input tap $coords
    sleep 0.3
    return 0
}

# Tap by content-desc
tap_desc() {
    local desc="$1"
    local bounds=$(find_by_desc "$desc")
    if [ -z "$bounds" ]; then
        echo "[WARN] Desc not found: $desc"
        return 1
    fi
    local coords=$(parse_bounds "$bounds")
    adb -s "RFCXA0HZXFZ" shell input tap $coords
    sleep 0.3
    return 0
}

# Wait for text to appear (timeout in seconds)
wait_for_text() {
    local text="$1"
    local timeout="${2:-10}"
    local elapsed=0
    while [ $elapsed -lt $timeout ]; do
        dump_ui
        if grep -q "text=\"[^\"]*${text}[^\"]*\"" "$DUMP_FILE"; then
            return 0
        fi
        sleep 1
        elapsed=$((elapsed + 1))
    done
    echo "[WARN] Timeout waiting for text: $text"
    return 1
}

# Check if text exists (no wait)
has_text() {
    local text="$1"
    dump_ui
    grep -q "text=\"[^\"]*${text}[^\"]*\"" "$DUMP_FILE"
    return $?
}

# Wait for element to disappear
wait_text_gone() {
    local text="$1"
    local timeout="${2:-10}"
    local elapsed=0
    while [ $elapsed -lt $timeout ]; do
        dump_ui
        if ! grep -q "text=\"[^\"]*${text}[^\"]*\"" "$DUMP_FILE"; then
            return 0
        fi
        sleep 1
        elapsed=$((elapsed + 1))
    done
    return 1
}