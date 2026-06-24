# adb-smoke - Smoke Tests for Market Instinct

Automated UI smoke tests for Market Instinct Android app using ADB + UIAutomator.

## Prerequisites

- **ADB** in PATH (`adb --version`)
- **Device connected** via USB with USB debugging enabled
- **App installed**: `com.tnsvt.game`
- **Bash** (Git Bash on Windows or WSL)

## Structure

```
adb-smoke/
├── run_smoke.sh           # Main orchestrator
├── lib/
│   ├── adb_utils.sh       # Core ADB wrappers (tap, swipe, input)
│   ├── uiautomator.sh     # Robust element finding via UIAutomator
│   ├── assertions.sh      # Test assertions + result tracking
│   └── navigation.sh      # High-level screen navigation
├── tests/
│   ├── 00_setup.sh        # Fresh install + onboarding
│   ├── 01_classic.sh      # Classic mode (win/lose/streak)
│   ├── 02_survival.sh     # Survival mode (lives/game over)
│   ├── 03_daily.sh        # Daily challenge
│   ├── 04_fractal.sh      # Fractal mode (precision results)
│   ├── 05_arena.sh        # Arena 1vs1
│   ├── 06_torneo.sh       # Tournament
│   ├── 07_portfolio.sh    # Portfolio (open/close)
│   ├── 08_profile_xp.sh   # XP live update verification
│   └── 09_shop_themes.sh  # Shop themes loading
├── results/
│   ├── report_<ts>.json   # Machine-readable results
│   ├── report_<ts>.md     # Human-readable report
│   └── screenshots/       # Visual evidence
└── README.md
```

## Usage

### Run all tests
```bash
cd "C:/Users/HP 240 inch G9/tnsvt-market-instinct"
bash adb-smoke/run_smoke.sh
# or
bash adb-smoke/run_smoke.sh all
```

### Run specific test
```bash
bash adb-smoke/run_smoke.sh 1    # only classic
bash adb-smoke/run_smoke.sh 8    # only XP live update
```

### Check device connection
```bash
adb devices
```

## How It Works

1. **UIAutomator dump** → Reads current screen hierarchy as XML
2. **Find by text** → Parses XML to find elements containing text
3. **Parse bounds** → Extracts `[x1,y1][x2,y2]` and computes center
4. **Tap center** → Sends `input tap x y` to device
5. **Assert** → Dumps again and checks for expected text

## Adding a New Test

Create `tests/XX_name.sh`:

```bash
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

source lib/adb_utils.sh
source lib/uiautomator.sh
source lib/assertions.sh
source lib/navigation.sh

start_test "XX_my_test"
nav_to_my_screen
wait_s 2
assert_text "Expected" "Description"
screenshot "my_test_done"
```

## Limitations

- **No color/pixel assertions**: Can't verify green vs red flash directly
- **Timing dependent**: May need adjustments for slow devices
- **Text-only**: Works best with apps that have stable Spanish/English text
- **No API mocking**: Can't test sync with backend without backend

## Manual Testing

For complete coverage, see `../TEST_PLAN.md` for manual test matrix.