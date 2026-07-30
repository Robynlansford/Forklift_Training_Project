@echo off
echo Creating cloudflared tunnel...
cloudflared tunnel create forklift
echo.
echo Setting up DNS route...
cloudflared tunnel route dns forklift localhost:8000
echo.
echo Starting tunnel - it will display your public URL below:
echo.
cloudflared tunnel run forklift
pause
