@echo off
rem Living Pages dev server for TourReady Operator (random high port, never 3000).
cd /d C:\AI_Projects\Web_Design\Forklift_Training_Project\tourready-operator
if "%PORT%"=="" set PORT=38617
npx next dev -p %PORT% -H 127.0.0.1
