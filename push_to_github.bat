@echo off
title Push VoiceGPT to GitHub
echo =======================================================
echo               Push VoiceGPT to GitHub
echo =======================================================
echo.
set "PATH=%LOCALAPPDATA%\Programs\MinGit\cmd;%LOCALAPPDATA%\Programs\gh;%PATH%"

echo Checking GitHub login...
gh auth status >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Opening browser to log in to GitHub...
    echo (If a one-time code is displayed, press Enter to open the browser)
    echo.
    gh auth login --web -p https
)

echo.
echo Creating repository on GitHub and pushing code...
gh repo create VOICEGPT --public --source="%~dp0." --remote=origin --push

echo.
echo =======================================================
echo   Success! Your project is live on GitHub:
echo   https://github.com/haripriya67537/VOICEGPT
echo =======================================================
echo.
pause
