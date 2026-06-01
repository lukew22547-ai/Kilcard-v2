@echo off
title KilCard V2 Server
color 0A
cls

echo ============================================
echo   KILCARD V2 - Starting Server
echo ============================================
echo.

:: Kill anything already on port 8080
echo [1/3] Clearing port 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080 " ^| findstr "LISTENING" 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)

:: Kill any existing cloudflared tunnels
taskkill /IM cloudflared.exe /F >nul 2>&1
timeout /t 2 /nobreak >nul

:: Start the dev server in a minimized background window
echo [2/3] Starting dev server...
start "KilCard Dev Server" /min cmd /k "cd /d "C:\Users\lkilc\Desktop\KilCard V2" && npm run dev -- --host --port 8080"
echo     Waiting for server to be ready...
timeout /t 7 /nobreak >nul

:: Start Cloudflare tunnel and capture the URL
echo [3/3] Opening Cloudflare tunnel...
set CF_LOG="%TEMP%\cf-kilcard-err.log"
del %CF_LOG% >nul 2>&1
start "KilCard Tunnel" /min cmd /k "cloudflared tunnel --url http://localhost:8080 2> %CF_LOG%"
echo     Waiting for tunnel URL...
timeout /t 10 /nobreak >nul

:: Extract and display the URL
set PUBLIC_URL=
for /f "tokens=*" %%a in ('findstr /i "trycloudflare" %CF_LOG% 2^>nul') do set RAW_LINE=%%a
for /f "tokens=3 delims=| " %%a in ('findstr /i "trycloudflare" %CF_LOG% 2^>nul') do set PUBLIC_URL=%%a

cls
echo ============================================
echo   KILCARD V2 - Server Running!
echo ============================================
echo.
echo   Local:   http://localhost:8080
echo   Network: http://192.168.86.28:8080
echo.
if "%PUBLIC_URL%"=="" (
    echo   PUBLIC URL: Check the "KilCard Tunnel" window
    echo   (look for a line with trycloudflare.com)
) else (
    echo   PUBLIC:  %PUBLIC_URL%
    echo.
    echo   *** Share this link with anyone: ***
    echo   %PUBLIC_URL%
)
echo.
echo   Note: The public URL changes each restart.
echo   Close this window to keep servers running.
echo   Close the minimized "KilCard" windows to stop.
echo ============================================
pause
