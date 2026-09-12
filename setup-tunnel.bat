@echo off
title TourReady Operator - Quick Tunnel
cd /d "%~dp0"

echo This opens a Cloudflare quick tunnel to the web app on port 3000.
echo Start the app first (npm run dev / npm run start in tourready-operator)
echo or use go-live.bat, which builds, serves, and tunnels in one step.
echo.

cloudflared tunnel --url http://localhost:3000
pause
