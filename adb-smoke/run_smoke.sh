#!/bin/bash
# run_smoke.sh - Main orchestrator for all smoke tests
# Usage: ./run_smoke.sh [test_number]
# Example: ./run_smoke.sh 1     (runs only 01_classic)
# Example: ./run_smoke.sh all  (runs all)

# Disable MSYS path translation for Windows (Git Bash)
export MSYS_NO_PATHCONV=1

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Load all libs
source lib/adb_utils.sh
source lib/uiautomator.sh
source lib/assertions.sh
source lib/navigation.sh

# Determine which tests to run
TEST_FILTER="${1:-all}"

echo "=========================================="
echo "  MARKET INSTINCT - ADB SMOKE TEST SUITE"
echo "=========================================="
echo "  Device: RFCXA0HZXFZ"
echo "  Package: com.tnsvt.game"
echo "  Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "  Filter: $TEST_FILTER"
echo "=========================================="
echo ""

# Verify device connection
log_info "Verifying ADB connection..."
if ! adb devices | grep -q "RFCXA0HZXFZ.*device"; then
    log_error "Device RFCXA0HZXFZ not connected"
    exit 1
fi

# Verify UIAutomator works
log_info "Testing UIAutomator..."
adb -s "RFCXA0HZXFZ" shell uiautomator dump /sdcard/test_dump.xml >/dev/null 2>&1
if [ $? -ne 0 ]; then
    log_error "UIAutomator not working on device"
    exit 1
fi
log_info "UIAutomator OK"

echo ""

# Run tests in order
declare -a TESTS=(
    "tests/00_setup.sh"
    "tests/01_classic.sh"
    "tests/02_survival.sh"
    "tests/03_daily.sh"
    "tests/04_fractal.sh"
    "tests/05_arena.sh"
    "tests/06_torneo.sh"
    "tests/07_portfolio.sh"
    "tests/08_profile_xp.sh"
    "tests/09_shop_themes.sh"
)

# Filter if needed
if [ "$TEST_FILTER" != "all" ]; then
    FILTER_NUM=$(printf "%02d" "$TEST_FILTER")
    TESTS=("tests/${FILTER_NUM}_"*.sh)
fi

# Execute (source instead of bash to share variables)
for test_file in "${TESTS[@]}"; do
    if [ -f "$test_file" ]; then
        log_info "Running $(basename $test_file)..."
        source "$test_file"
        sleep 0.5
    else
        log_warn "Test not found: $test_file"
    fi
done

# Final summary
print_summary

# Save results
save_results_json
save_results_md

# Exit with failure if any test failed
if [ $FAIL_COUNT -gt 0 ]; then
    echo ""
    log_error "Some tests FAILED ($FAIL_COUNT failures)"
    exit 1
fi

log_info "All tests PASSED (or skipped)!"
exit 0