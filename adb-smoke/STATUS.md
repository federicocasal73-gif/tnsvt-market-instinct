# Smoke Test Status

**Last Run:** 2026-06-24
**Device:** RFCXA0HZXFZ
**Package:** com.tnsvt.game v1.2.0

---

## Summary

| Mode | Status | Notes |
|------|--------|-------|
| **00_setup** | ✅ PASS | Fresh install + onboarding skip + verify on inicio |
| **01_classic** | ❌ FAIL | Taps on WebView cards not navigating to Classic screen |
| **02_survival** | ❌ FAIL | Same WebView tap issue |
| **03_daily** | ⚠️ SKIP | LONG button check fails (same issue) |
| **04_fractal** | ⚠️ FALSE PASS | "Fractal" text exists on inicio (not actual lobby) |
| **05_arena** | ⚠️ FALSE PASS | "Arena" text exists on inicio |
| **06_torneo** | ⚠️ SKIP | Torneo not on inicio cards |
| **07_portfolio** | ⚠️ SKIP | Portfolio not on inicio cards |
| **08_profile_xp** | ⚠️ SKIP | XP detection issue |
| **09_shop_themes** | ⚠️ SKIP | Tienda tab not found |

**Overall:** 4 passed / 3 failed / 7 skipped (some false positives)

---

## What's Working

✅ **Infrastructure (100% complete):**
- `adb-smoke/` directory structure
- `lib/adb_utils.sh` - ADB wrappers (tap, swipe, input, screenshot)
- `lib/uiautomator.sh` - UIAutomator-based element finding
- `lib/assertions.sh` - Test assertions + JSON/Markdown reports
- `lib/navigation.sh` - High-level navigation helpers
- `run_smoke.sh` - Orchestrator
- `tests/*.sh` - 10 test scripts (00_setup + 9 modes)
- Onboarding skip via "Saltar tutorial" button
- VIP paywall dismiss via X button
- Screenshots + JSON/Markdown reports

✅ **UIAutomator connectivity verified** on device

✅ **Setup test (00_setup) PASSES** consistently

---

## Known Issues

### Issue #1: WebView tap not triggering onclick handlers
**Severity:** CRITICAL (blocks all mode navigation tests)

**Description:**
The cards in `s-inicio` (Classic, Survival, Arena, etc.) use HTML `onclick` handlers (e.g., `onclick="startClassic()"`). However, `adb shell input tap` on these elements does NOT trigger the WebView's onclick event. The tap event reaches the WebView but the JavaScript handler doesn't fire.

**Affected tests:** 01_classic, 02_survival, 03_daily, 06_torneo, 07_portfolio

**Workarounds attempted (all failed):**
1. Tapping on the text element directly - no navigation
2. Tapping on the parent View (mode-card div) - no navigation
3. Tapping on the mode-icon emoji - no navigation
4. Tapping on the `›` arrow - no navigation
5. Using `input swipe` with same start/end coords - no navigation
6. Using `input touchscreen tap` explicitly - no navigation

**Real Android buttons (nav-inicio, nav-play, etc.) also don't navigate** when tapped.

**Hypothesis:** The WebView is not receiving touch events properly. Possible causes:
- WebView's `setOnTouchListener` is intercepting events
- CSS `pointer-events: none` somewhere
- WebView not focused
- Hardware acceleration issue

**Recommended fixes:**
1. Add `webView.requestFocus()` in MainActivity.java
2. Check `MainActivity.java` for `setOnTouchListener` that might be blocking
3. Use `adb shell input tap` with longer delay (300ms+)
4. Try `input swipe` with very short duration
5. Use Appium/Selendroid instead of raw ADB for better WebView support

### Issue #2: False positives on text-based assertions
**Severity:** MEDIUM

**Description:**
Tests 04_fractal and 05_arena "pass" because the mode names exist on the inicio screen (as card titles), but the tests are NOT actually in the Fractal/Arena lobbies.

**Fix:** Tests should verify URL/state changes, not just text presence. For example:
- Check for unique elements only in the target screen
- Verify `s-classic`, `s-fractal`, `s-arena` div is active
- Look for elements that DON'T exist on inicio

### Issue #3: Long-running tests hang
**Severity:** LOW

**Description:**
When the test runs all 10 tests, the process sometimes hangs at 08_profile_xp or similar. The run_smoke.sh has no global timeout, and individual tests don't have a max duration.

**Fix:** Add `timeout 60` to each test execution in run_smoke.sh

---

## Test Results - Detailed

```
00_setup: PASS - Onboarding skipped, on inicio screen
01_classic: FAIL - WebView tap not triggering startClassic()
02_survival: FAIL - Same WebView issue
03_daily: SKIP - LONG button not found
04_fractal: PASS (false) - "Fractal" text on inicio
05_arena: PASS (false) - "Arena" text on inicio
06_torneo: SKIP - "Torneo" not in MODOS tab
07_portfolio: SKIP - "Portfolio" not in MODOS tab
08_profile_xp: SKIP - "✦ 2,340 XP" pattern not detected
09_shop_themes: SKIP - "Tienda" tab not found
```

---

## Next Steps

1. **Fix WebView tap issue** (PRIORITY #1)
   - Investigate `MainActivity.java` for touch event handling
   - Try `requestFocus()` or other WebView settings
   - Consider using Appium for better WebView support

2. **Strengthen assertions**
   - Add "is on target screen" check (e.g., `s-classic` has class `active`)
   - Verify unique elements per screen (e.g., LONG button only on classic)
   - Add negative assertions (element NOT present on wrong screen)

3. **Add timeouts to test execution**
   - `timeout 60` per test
   - `timeout 300` per full run

4. **CI/CD integration**
   - Add to GitHub Actions or similar
   - Run on every PR
   - Slack/email notifications on failures

---

## How to Run

```bash
# All tests
"C:/Program Files/Git/bin/bash.exe" ./adb-smoke/run_smoke.sh all

# Single test (0=setup, 1=classic, etc.)
"C:/Program Files/Git/bin/bash.exe" ./adb-smoke/run_smoke.sh 0
"C:/Program Files/Git/bin/bash.exe" ./adb-smoke/run_smoke.sh 1

# Results in:
# - adb-smoke/results/report_<timestamp>.json
# - adb-smoke/results/report_<timestamp>.md
# - adb-smoke/results/screenshots/<test>_<desc>.png
```
