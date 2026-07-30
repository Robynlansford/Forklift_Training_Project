@echo off
cd /d "%~dp0"
echo ===== DIAGNOSTIC ===== > diag-log.txt
echo Folder: %CD% >> diag-log.txt
echo. >> diag-log.txt

echo --- node --- >> diag-log.txt
where node >> diag-log.txt 2>&1
node --version >> diag-log.txt 2>&1

echo --- npm --- >> diag-log.txt
where npm >> diag-log.txt 2>&1
npm --version >> diag-log.txt 2>&1

echo --- cloudflared --- >> diag-log.txt
where cloudflared >> diag-log.txt 2>&1
cloudflared --version >> diag-log.txt 2>&1

echo --- app folder --- >> diag-log.txt
dir "%~dp0tourready-operator" >> diag-log.txt 2>&1

echo. >> diag-log.txt
echo Done. >> diag-log.txt

echo Diagnostic complete. Wrote diag-log.txt
pause
