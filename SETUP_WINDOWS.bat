@echo off
cd /d "%~dp0"
echo Installing Expo and compatible React Native dependencies...
call npm install expo@latest
if errorlevel 1 goto fail
call npx expo install react react-native expo-status-bar @react-native-async-storage/async-storage @react-native-community/datetimepicker
if errorlevel 1 goto fail
echo.
echo SETUP COMPLETED. Double-click START_APP.bat next.
pause
exit /b 0
:fail
echo Setup failed. Please send a screenshot of this window.
pause
exit /b 1
