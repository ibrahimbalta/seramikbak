@echo off
setlocal enabledelayedexpansion

echo ======================================================================
echo             Floor Tile Visualizer - Startup Script
echo ======================================================================
echo.

:: Check for Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    where py >nul 2>nul
    if %errorlevel% neq 0 (
        echo [ERROR] Python was not found on your system PATH.
        echo Please install Python 3.10+ and check "Add Python to PATH" during setup.
        echo.
        pause
        exit /b 1
    ) else (
        set PYTHON_CMD=py
    )
) else (
    set PYTHON_CMD=python
)

echo [*] Using python command: !PYTHON_CMD!
!PYTHON_CMD! --version
echo.

:: Setup Virtual Environment
if not exist .venv (
    echo [*] Creating a virtual environment .venv ...
    !PYTHON_CMD! -m venv .venv
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
    echo [OK] Virtual environment created successfully.
    echo.
)

:: Activate Virtual Environment
echo [*] Activating virtual environment ...
call .venv\Scripts\activate.bat
if !errorlevel! neq 0 (
    echo [ERROR] Failed to activate virtual environment.
    pause
    exit /b 1
)
if exist "D:\floor_tile_env\hf_cache" (
    set "HF_HOME=D:\floor_tile_env\hf_cache"
)
echo.

:: Install / Update Dependencies
echo [*] Checking and installing dependencies from backend/requirements.txt ...
python -m pip install --upgrade pip
pip install -r backend\requirements.txt
if !errorlevel! neq 0 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)
echo [OK] Dependencies successfully verified.
echo.

:: Launch FastAPI Server
echo ======================================================================
echo   Starting the Floor Tile Visualizer Server...
echo   Open your browser at: http://localhost:8000
echo   (Note: The first floor detection will download the AI model ~47MB)
echo ======================================================================
echo.

cd backend
uvicorn app:app --host 127.0.0.1 --port 8000

pause

