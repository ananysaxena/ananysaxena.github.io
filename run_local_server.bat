@echo off
title Anany Saxena Portfolio Local Host
echo ====================================================
echo      ANANY SAXENA PORTFOLIO LOCAL HOST DEVELOPER      
echo ====================================================
echo.
echo Launching default browser to http://localhost:8000...
start http://localhost:8000
echo.
echo Starting local server. Press Ctrl+C in this window to stop.
echo.

where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    python server.py
) else (
    if exist "D:\Program Files\Side Effects Software\Houdini 21.0.440\python311\python.exe" (
        "D:\Program Files\Side Effects Software\Houdini 21.0.440\python311\python.exe" server.py
    ) else (
        echo ERROR: Python executable not found. Please install Python to run locally.
        pause
    )
)
