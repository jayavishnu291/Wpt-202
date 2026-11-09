WPT202 SPRINT 1 - FRESH EXPO PROJECT (UI DEMO)
================================================

This is a NEW project folder. Do not mix files with your old WPT202-Mobile folder.

WINDOWS STEPS:
1. Extract the ZIP using Right-click > Extract All.
2. Open the extracted WPT202-Mobile-New folder.
3. Double-click SETUP_WINDOWS.bat (requires Node.js + internet).
   Wait until SETUP COMPLETED appears. This can take several minutes.
4. Double-click START_APP.bat.
5. Scan the QR code using Expo Go on your iPhone/iPad.
6. If LAN QR scan times out, stop Expo with Ctrl+C and run:
   npx expo start --tunnel
7. If the terminal says port 8081 is in use, stop old Expo servers or answer Y.

FEATURES:
- Time picker, label, repeat days, save and edit
- Delete confirmation, ON/OFF toggle, AsyncStorage persistence
- Duplicate alarm prevention, time sorting
- Search, clear search, All/ON/OFF filters, counts, empty states
- Clear All confirmation

IMPORTANT:
- Demo alarm records only. It does NOT schedule actual iOS AlarmKit alarms.
- No Mac/Xcode required for this Expo Go UI demo.
- Do not run old and new Expo projects at the same time.
- Requires Node.js installed on Windows.
