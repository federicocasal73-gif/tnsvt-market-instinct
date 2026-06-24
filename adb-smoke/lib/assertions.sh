#!/bin/bash
# assertions.sh - Test assertions with detailed reporting

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test result tracking (only reset if not already set)
if [ -z "$PASS_COUNT" ]; then
    PASS_COUNT=0
    FAIL_COUNT=0
    SKIP_COUNT=0
    TEST_NAME=""
    RESULTS=()
fi

# Start a test
start_test() {
    TEST_NAME="$1"
    echo ""
    echo -e "${YELLOW}━━━ TEST: $TEST_NAME ━━━${NC}"
}

# Assert that text exists in current UI
assert_text() {
    local text="$1"
    local desc="${2:-Text exists: $text}"
    if has_text "$text"; then
        echo -e "  ${GREEN}PASS${NC}: $desc"
        PASS_COUNT=$((PASS_COUNT + 1))
        RESULTS+=("PASS|$TEST_NAME|$desc")
        return 0
    else
        echo -e "  ${RED}FAIL${NC}: $desc (text not found)"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        RESULTS+=("FAIL|$TEST_NAME|$desc")
        screenshot "fail_${TEST_NAME// /_}_$(echo $desc | tr ' ' '_' | head -c 30)"
        return 1
    fi
}

# Assert text NOT exists
assert_no_text() {
    local text="$1"
    local desc="${2:-Text absent: $text}"
    if ! has_text "$text"; then
        echo -e "  ${GREEN}PASS${NC}: $desc"
        PASS_COUNT=$((PASS_COUNT + 1))
        RESULTS+=("PASS|$TEST_NAME|$desc")
        return 0
    else
        echo -e "  ${RED}FAIL${NC}: $desc (text found but should be absent)"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        RESULTS+=("FAIL|$TEST_NAME|$desc")
        return 1
    fi
}

# Assert text appears after waiting (with timeout)
assert_text_after_wait() {
    local text="$1"
    local timeout="${2:-5}"
    local desc="${3:-Text appears: $text}"
    if wait_for_text "$text" "$timeout"; then
        echo -e "  ${GREEN}PASS${NC}: $desc"
        PASS_COUNT=$((PASS_COUNT + 1))
        RESULTS+=("PASS|$TEST_NAME|$desc")
        return 0
    else
        echo -e "  ${RED}FAIL${NC}: $desc (timeout ${timeout}s)"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        RESULTS+=("FAIL|$TEST_NAME|$desc")
        screenshot "fail_wait_${TEST_NAME// /_}_$(echo $desc | tr ' ' '_' | head -c 30)"
        return 1
    fi
}

# Detect if a WIN feedback happened (look for any positive text)
detect_win() {
    local desc="${1:-Win feedback detected}"
    if has_text "Correcto" || has_text "correcto" || has_text "✓" || has_text "RACHA DE FUEGO" || has_text "Racha activa" || has_text "Bien leído" || has_text "Buen análisis" || has_text "IMPARABLE"; then
        echo -e "  ${GREEN}PASS${NC}: $desc (win text found)"
        PASS_COUNT=$((PASS_COUNT + 1))
        RESULTS+=("PASS|$TEST_NAME|$desc")
        return 0
    fi
    return 1
}

# Detect if a LOSE feedback happened
detect_lose() {
    local desc="${1:-Lose feedback detected}"
    if has_text "Incorrecto" || has_text "incorrecto" || has_text "✗" || has_text "El mercado fue" || has_text "incorrecta"; then
        echo -e "  ${GREEN}PASS${NC}: $desc (lose text found)"
        PASS_COUNT=$((PASS_COUNT + 1))
        RESULTS+=("PASS|$TEST_NAME|$desc")
        return 0
    fi
    return 1
}

# Detect any round result (either win or lose)
detect_any_result() {
    local desc="${1:-Round result detected}"
    if detect_win "$desc" || detect_lose "$desc"; then
        return 0
    fi
    return 1
}

# Skip a test
skip_test() {
    local reason="$1"
    echo -e "  ${YELLOW}SKIP${NC}: $reason"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    RESULTS+=("SKIP|$TEST_NAME|$reason")
}

# Print final summary
print_summary() {
    local total=$((PASS_COUNT + FAIL_COUNT + SKIP_COUNT))
    echo ""
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}  TEST SUMMARY${NC}"
    echo -e "${YELLOW}========================================${NC}"
    echo -e "  ${GREEN}Passed${NC}: $PASS_COUNT"
    echo -e "  ${RED}Failed${NC}: $FAIL_COUNT"
    echo -e "  ${YELLOW}Skipped${NC}: $SKIP_COUNT"
    echo -e "  Total : $total"
    if [ $total -gt 0 ]; then
        local pct=$(( PASS_COUNT * 100 / total ))
        echo -e "  Pass rate: ${pct}%"
    fi
    echo -e "${YELLOW}========================================${NC}"
}

# Save results to JSON
save_results_json() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local file="results/report_${timestamp}.json"
    mkdir -p results

    {
        echo "{"
        echo "  \"timestamp\": \"$(date -Iseconds)\","
        echo "  \"passed\": $PASS_COUNT,"
        echo "  \"failed\": $FAIL_COUNT,"
        echo "  \"skipped\": $SKIP_COUNT,"
        echo "  \"results\": ["
        local first=1
        for r in "${RESULTS[@]}"; do
            IFS='|' read -r status test desc <<< "$r"
            if [ $first -eq 0 ]; then echo ","; fi
            first=0
            echo -n "    {\"status\":\"$status\",\"test\":\"$test\",\"desc\":\"$desc\"}"
        done
        echo ""
        echo "  ]"
        echo "}"
    } > "$file"
    echo ""
    echo -e "Results saved: ${GREEN}$file${NC}"
}

# Save results to markdown
save_results_md() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local file="results/report_${timestamp}.md"
    mkdir -p results

    {
        echo "# Smoke Test Report - $timestamp"
        echo ""
        echo "## Summary"
        echo "- Passed: $PASS_COUNT"
        echo "- Failed: $FAIL_COUNT"
        echo "- Skipped: $SKIP_COUNT"
        echo ""
        echo "## Results"
        echo ""
        echo "| Status | Test | Description |"
        echo "|--------|------|-------------|"
        for r in "${RESULTS[@]}"; do
            IFS='|' read -r status test desc <<< "$r"
            local icon="PASS"
            [ "$status" = "FAIL" ] && icon="FAIL"
            [ "$status" = "SKIP" ] && icon="SKIP"
            echo "| $icon | $test | $desc |"
        done
    } > "$file"
    echo -e "Markdown report: ${GREEN}$file${NC}"
}