@echo off
setlocal
cd /d "%~dp0"

where python >nul 2>nul
if %errorlevel%==0 (
  python main.py
  exit /b
)

where py >nul 2>nul
if %errorlevel%==0 (
  py main.py
  exit /b
)

where node >nul 2>nul
if %errorlevel%==0 (
  node server.js
  exit /b
)

echo Python was not found on PATH.
echo Opening the EMI Calculator directly in your browser instead.
start "" "%~dp0web\index.html"
