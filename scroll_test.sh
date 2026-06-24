#!/bin/bash
# Scroll to find Rainbow
cd "C:/Users/HP 240 inch G9/tnsvt-market-instinct"
for i in 1 2 3 4; do
    adb -s RFCXA0HZXFZ shell input swipe 500 1500 500 300 300
    sleep 0.5
done
adb -s RFCXA0HZXFZ shell uiautomator dump /sdcard/dump.xml
adb -s RFCXA0HZXFZ pull /sdcard/dump.xml ./temas_scrolled2.xml
echo "Done"