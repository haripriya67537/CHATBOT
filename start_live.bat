@echo off
echo ====================================================
echo Starting Chatbot Server and Public HTTPS Tunnel
echo ====================================================

REM Start backend server
start "Chatbot Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\python.exe run.py"

REM Wait 3 seconds for server to start
timeout /t 3 /nobreak >nul

REM Start cloudflared tunnel
echo Starting Cloudflare Tunnel...
%~dp0cloudflared.exe tunnel --url http://127.0.0.1:8000
pause
