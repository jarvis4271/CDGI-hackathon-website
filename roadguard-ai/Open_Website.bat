@echo off
title RoadGuard AI - Live GPS Server
echo ============================================================
echo   RoadGuard AI - Civic Pothole Detection Platform
echo ============================================================
echo.
echo Starting secure local server to enable Real Live GPS permissions...
echo Opening http://localhost:8080 in your default browser...
echo.
echo (Keep this window open while using the website)
echo ============================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
