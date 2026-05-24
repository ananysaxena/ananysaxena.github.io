@echo off
title Anany Saxena Portfolio Sync & Deployer
echo ====================================================
echo      ANANY SAXENA PORTFOLIO AUTOMATED DEPLOYER      
echo ====================================================
echo.

echo [1/3] Automatically indexing projects...
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    python sync.py
) else (
    if exist "D:\Program Files\Side Effects Software\Houdini 21.0.440\python311\python.exe" (
        "D:\Program Files\Side Effects Software\Houdini 21.0.440\python311\python.exe" sync.py
    ) else (
        echo WARNING: Python executable not found. Please install Python to auto-index projects.
    )
)
echo.

echo [2/3] Preparing git commit...
set /p commit_msg="Enter your commit message [default: Update portfolio]: "
if "%commit_msg%"=="" set commit_msg=Update portfolio

echo.
echo [3/3] Deploying to GitHub Pages...
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "%commit_msg%"
"C:\Program Files\Git\cmd\git.exe" push origin main

echo.
echo ====================================================
echo DEPLOYMENT COMPLETE!
echo Your updates will be live in 1-2 minutes!
echo ====================================================
echo.
pause
